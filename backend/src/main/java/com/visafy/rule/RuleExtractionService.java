package com.visafy.rule;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visafy.common.domain.ReviewStatus;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceDocumentService;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Turns an approved official Snapshot into PENDING rule candidates.
 *
 * <p>The AI service proposes candidates; this service keeps the safety boundary. Every proposal is
 * re-checked against the stored Snapshot text, so a candidate whose excerpt is not literally present
 * in the official document is discarded instead of stored. Nothing here approves a rule: candidates
 * are always persisted as PENDING and still require Human Verification before the Rule Engine uses
 * them.
 */
@Service
public class RuleExtractionService {
    private static final int MAX_PAGES = 200;
    private static final int MAX_PAGE_CHARS = 4000;
    private static final int MAX_HEADING_CHARS = 60;
    private static final String LLM_EXTRACTOR = "LLM_VERIFIED";

    private static final Map<String, String> RULE_KEY_LABELS = Map.of(
            "VISA_TYPE", "허용 체류자격",
            "AGE", "가입 가능 연령",
            "VISA_REMAINING_MONTH", "필요한 비자 잔여기간(개월)",
            "EMPLOYMENT_DURATION_MONTHS", "필요한 재직기간(개월)",
            "BANK_INTERNAL_REVIEW", "금융기관 내부 심사 항목",
            "VISA_DETAIL", "세부 기준이 공개되지 않은 비자 조건");

    private final SourceDocumentService sourceService;
    private final RuleCandidateService candidateService;
    private final RuleCandidateRepository repository;
    private final RuleExtractionAiClient client;
    private final ObjectMapper objectMapper;

    public RuleExtractionService(SourceDocumentService sourceService, RuleCandidateService candidateService,
                                 RuleCandidateRepository repository, RuleExtractionAiClient client,
                                 ObjectMapper objectMapper) {
        this.sourceService = sourceService;
        this.candidateService = candidateService;
        this.repository = repository;
        this.client = client;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ExtractionOutcome extractFromSource(Long sourceDocumentId, String productCode) {
        SourceDocument source = sourceService.get(sourceDocumentId);
        if (source.getReviewStatus() == ReviewStatus.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expired sources cannot create candidates");
        }
        String snapshot = source.getSnapshotText();
        if (snapshot == null || snapshot.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This source has no stored snapshot text to extract from");
        }
        String normalizedProductCode = productCode.strip();
        List<RuleExtractionAiClient.Page> pages = splitPages(snapshot);
        if (pages.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This source has no stored snapshot text to extract from");
        }

        RuleExtractionAiClient.ExtractionResponse response = client.extract(
                new RuleExtractionAiClient.ExtractionRequest(normalizedProductCode, sourceDocumentId, pages));
        List<RuleExtractionAiClient.ExtractedCandidate> proposals =
                response.candidates() == null ? List.of() : response.candidates();

        String normalizedSnapshot = normalize(snapshot);
        Set<String> existing = existingFingerprints(sourceDocumentId, normalizedProductCode);
        List<RuleCandidate> saved = new ArrayList<>();
        int ungrounded = 0;
        int duplicates = 0;
        int savedByModel = 0;

        for (RuleExtractionAiClient.ExtractedCandidate proposal : proposals) {
            if (!isGrounded(normalizedSnapshot, proposal.sourceExcerpt())) {
                ungrounded++;
                continue;
            }
            String fingerprint = fingerprint(proposal.ruleKey(), proposal.operator(),
                    canonicalValue(proposal.value()));
            if (!existing.add(fingerprint)) {
                duplicates++;
                continue;
            }
            saved.add(persist(sourceDocumentId, normalizedProductCode, proposal));
            if (isModelProposed(proposal)) savedByModel++;
        }

        List<String> warnings = new ArrayList<>(response.warnings() == null ? List.of() : response.warnings());
        warnings.add("Every stored candidate is PENDING and is not used by the Rule Engine until it is approved.");
        return new ExtractionOutcome(proposals.size(), saved, ungrounded, duplicates, warnings,
                response.llmAttempted(), savedByModel, response.llmRejected());
    }

    private boolean isModelProposed(RuleExtractionAiClient.ExtractedCandidate proposal) {
        return LLM_EXTRACTOR.equalsIgnoreCase(proposal.extractor());
    }

    private RuleCandidate persist(Long sourceDocumentId, String productCode,
                                  RuleExtractionAiClient.ExtractedCandidate proposal) {
        RuleLevel ruleLevel = parse(RuleLevel.class, proposal.ruleLevel(), "ruleLevel");
        RuleNature ruleNature = proposal.ruleNature() == null || proposal.ruleNature().isBlank()
                ? RuleNature.defaultFor(ruleLevel)
                : parse(RuleNature.class, proposal.ruleNature(), "ruleNature");
        return candidateService.create(sourceDocumentId, productCode, proposal.ruleKey(),
                parse(RuleOperator.class, proposal.operator(), "operator"), canonicalValue(proposal.value()), ruleLevel,
                ruleNature, proposal.mandatory(), proposal.sourceExcerpt(), proposal.sourceLocator(),
                proposal.pageNumber(), proposal.sectionName(), null, null,
                describe(proposal.ruleKey(), isModelProposed(proposal)), confidence(proposal.confidence()));
    }

    private <T extends Enum<T>> T parse(Class<T> type, String value, String field) {
        try {
            return Enum.valueOf(type, value.strip().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException | NullPointerException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "AI rule extraction returned an unsupported " + field, exception);
        }
    }

    /**
     * Rewrites a JSON list value into the compact form reviewers already use. Without this an
     * extracted {@code ["E-7", "E-9"]} would read as a different value from an approved
     * {@code ["E-7","E-9"]} and would be reported as a source conflict on approval.
     */
    private String canonicalValue(String value) {
        if (value == null) return null;
        String trimmed = value.strip();
        if (!trimmed.startsWith("[")) return trimmed;
        try {
            return objectMapper.writeValueAsString(objectMapper.readTree(trimmed));
        } catch (JsonProcessingException exception) {
            return trimmed;
        }
    }

    private BigDecimal confidence(double value) {
        double bounded = Math.max(0d, Math.min(1d, value));
        return BigDecimal.valueOf(bounded).setScale(4, RoundingMode.HALF_UP);
    }

    private String describe(String ruleKey, boolean modelProposed) {
        String key = ruleKey == null ? "" : ruleKey.strip().toUpperCase(Locale.ROOT);
        String label = RULE_KEY_LABELS.getOrDefault(key, key.isBlank() ? "조건 후보" : key);
        return label + (modelProposed ? " (AI 문서 분석 · 원문 대조 완료 · 검수 전)" : " (규칙 기반 추출 · 검수 전)");
    }

    private Set<String> existingFingerprints(Long sourceDocumentId, String productCode) {
        Set<String> fingerprints = new LinkedHashSet<>();
        for (RuleCandidate candidate : repository.findByProductCodeOrderByCreatedAtDesc(productCode)) {
            if (!Objects.equals(candidate.getSourceDocument().getId(), sourceDocumentId)) continue;
            fingerprints.add(fingerprint(candidate.getRuleKey(), candidate.getOperator().name(),
                    candidate.getRuleValue()));
        }
        return fingerprints;
    }

    private String fingerprint(String ruleKey, String operator, String value) {
        return String.join(" ",
                ruleKey == null ? "" : ruleKey.strip().toUpperCase(Locale.ROOT),
                operator == null ? "" : operator.strip().toUpperCase(Locale.ROOT),
                value == null ? "" : value.strip());
    }

    /**
     * A candidate only survives when its excerpt is literally present in the stored official snapshot.
     */
    private boolean isGrounded(String normalizedSnapshot, String excerpt) {
        if (excerpt == null || excerpt.isBlank()) return false;
        return normalizedSnapshot.contains(normalize(excerpt));
    }

    private String normalize(String value) {
        return value.replaceAll("\\s+", " ").strip();
    }

    /**
     * Splits the snapshot into reviewable blocks and keeps a short leading line as the section name so
     * the reviewer sees where the excerpt came from.
     */
    private List<RuleExtractionAiClient.Page> splitPages(String snapshot) {
        List<RuleExtractionAiClient.Page> pages = new ArrayList<>();
        for (String block : snapshot.split("\\r?\\n\\s*\\r?\\n")) {
            if (block.isBlank()) continue;
            String[] lines = block.strip().split("\\r?\\n", 2);
            String heading = lines[0].strip();
            boolean hasHeading = lines.length == 2 && !lines[1].isBlank()
                    && heading.length() <= MAX_HEADING_CHARS && !heading.endsWith(".");
            String sectionName = hasHeading ? heading : null;
            String text = hasHeading ? lines[1].strip() : block.strip();
            for (String slice : slice(text)) {
                if (pages.size() >= MAX_PAGES) return pages;
                pages.add(new RuleExtractionAiClient.Page(null, sectionName, slice));
            }
        }
        return pages;
    }

    private List<String> slice(String text) {
        List<String> slices = new ArrayList<>();
        for (int start = 0; start < text.length(); start += MAX_PAGE_CHARS) {
            String slice = text.substring(start, Math.min(text.length(), start + MAX_PAGE_CHARS)).strip();
            if (!slice.isBlank()) slices.add(slice);
        }
        return slices;
    }

    public record ExtractionOutcome(int proposedCandidates, List<RuleCandidate> savedCandidates,
                                    int rejectedUngrounded, int skippedDuplicates, List<String> warnings,
                                    boolean modelAttempted, int savedByModel, int rejectedByVerifier) {
    }
}
