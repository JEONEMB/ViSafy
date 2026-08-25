package com.visafy.rag;

import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialProductRepository;
import com.visafy.product.ProductRule;
import com.visafy.product.ProductRuleRepository;
import com.visafy.guidance.ProductApplicationStep;
import com.visafy.guidance.ProductApplicationStepRepository;
import com.visafy.guidance.ProductDocumentRequirement;
import com.visafy.guidance.ProductDocumentRequirementRepository;
import com.visafy.rag.RagAiClient.IndexDocument;
import com.visafy.rag.RagAiClient.SyncResponse;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceDocumentService;
import com.visafy.rule.RuleCandidate;
import com.visafy.rule.RuleCandidateRepository;
import com.visafy.common.domain.ReviewStatus;
import java.time.LocalDate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import com.visafy.rule.RuleLevel;
import org.springframework.stereotype.Service;

@Service
public class RagIndexService {
    private final SourceDocumentService sourceService;
    private final FinancialProductRepository productRepository;
    private final ProductRuleRepository ruleRepository;
    private final RuleCandidateRepository candidateRepository;
    private final ProductDocumentRequirementRepository documentRepository;
    private final ProductApplicationStepRepository stepRepository;
    private final RagAiClient aiClient;
    private volatile Instant lastIndexedAt;
    private volatile ReindexResult lastReindexResult;

    public RagIndexService(SourceDocumentService sourceService, FinancialProductRepository productRepository,
                           ProductRuleRepository ruleRepository, RuleCandidateRepository candidateRepository,
                           ProductDocumentRequirementRepository documentRepository,
                           ProductApplicationStepRepository stepRepository, RagAiClient aiClient) {
        this.sourceService = sourceService;
        this.productRepository = productRepository;
        this.ruleRepository = ruleRepository;
        this.candidateRepository = candidateRepository;
        this.documentRepository = documentRepository;
        this.stepRepository = stepRepository;
        this.aiClient = aiClient;
    }

    public ReindexResult reindex() {
        LocalDate today = LocalDate.now();
        List<SourceDocument> sources = sourceService.findAll();
        Map<Long, Map<Long, Set<String>>> associations = new LinkedHashMap<>();
        List<FinancialProduct> activeProducts = productRepository.findByActiveTrueOrderByCreatedAtDesc();
        Map<String, FinancialProduct> productsByCode = new LinkedHashMap<>();
        for (FinancialProduct product : activeProducts) {
            productsByCode.put(product.getProductCode(), product);
            associations.computeIfAbsent(product.getSourceDocument().getId(), ignored -> new LinkedHashMap<>())
                    .computeIfAbsent(product.getId(), ignored -> new LinkedHashSet<>());
        }
        List<ProductRule> effectiveRules = ruleRepository.findAllByActiveTrue().stream()
                .filter(rule -> rule.getProduct().isActive() && rule.isEffective(today)).toList();
        for (ProductRule rule : effectiveRules) {
            associate(associations, rule.getSourceDocument().getId(), rule.getProduct().getId(), rule.getRuleKey());
        }
        List<RuleCandidate> effectiveCandidates = candidateRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(candidate -> isEffective(candidate, today))
                .filter(candidate -> productsByCode.containsKey(candidate.getProductCode())).toList();
        effectiveCandidates.forEach(candidate -> associate(associations,
                candidate.getSourceDocument().getId(), productsByCode.get(candidate.getProductCode()).getId(),
                candidate.getRuleKey()));
        List<ProductDocumentRequirement> documents = documentRepository.findAllByActiveTrue().stream()
                .filter(document -> document.getProduct().isActive()
                        && document.getSourceDocument().isEffective(today)).toList();
        documents.forEach(document -> associate(associations, document.getSourceDocument().getId(),
                document.getProduct().getId(), "REQUIRED_DOCUMENT"));
        List<ProductApplicationStep> steps = stepRepository.findAllByActiveTrue().stream()
                .filter(step -> step.getProduct().isActive() && step.getSourceDocument().isEffective(today)).toList();
        steps.forEach(step -> associate(associations, step.getSourceDocument().getId(),
                step.getProduct().getId(), "APPLICATION_STEP"));

        List<IndexDocument> indexDocuments = new ArrayList<>();
        int skippedUnlinked = 0;
        int skippedUnavailableSnapshot = 0;
        for (SourceDocument source : sources) {
            if (!source.isEffective(today)) continue;
            Map<Long, Set<String>> products = associations.get(source.getId());
            if (products == null || products.isEmpty()) {
                skippedUnlinked++;
                continue;
            }
            for (Map.Entry<Long, Set<String>> productEntry : products.entrySet()) {
                Long productId = productEntry.getKey();
                String content = source.getSnapshotText();
                if (content == null || content.isBlank()) {
                    content = effectiveRules.stream()
                            .filter(rule -> rule.getSourceDocument().getId().equals(source.getId()))
                            .filter(rule -> rule.getProduct().getId().equals(productId))
                            .map(ProductRule::getSourceExcerpt)
                            .filter(excerpt -> excerpt != null && !excerpt.isBlank())
                            .distinct().reduce((left, right) -> left + "\n\n" + right).orElse(null);
                }
                if (content == null || content.isBlank()) {
                    content = effectiveCandidates.stream()
                            .filter(candidate -> candidate.getSourceDocument().getId().equals(source.getId()))
                            .filter(candidate -> productsByCode.get(candidate.getProductCode()).getId().equals(productId))
                            .map(RuleCandidate::getSourceExcerpt)
                            .filter(excerpt -> excerpt != null && !excerpt.isBlank())
                            .distinct().reduce((left, right) -> left + "\n\n" + right).orElse(null);
                }
                if (content == null || content.isBlank()) {
                    skippedUnavailableSnapshot++;
                    continue;
                }
                indexDocuments.add(new IndexDocument(
                        source.getId(), source.getInstitution(), source.getTitle(), source.getSourceType().name(),
                        source.getSourceUrl(), source.getRetrievedAt(), source.getValidFrom(), source.getValidTo(),
                        productId, source.getLanguage(), source.getReviewStatus().name(), source.getContentHash(),
                        content, List.copyOf(productEntry.getValue())));
            }
        }
        SyncResponse response = aiClient.sync(indexDocuments);
        ReindexResult result = new ReindexResult(response.indexedDocuments(), response.indexedChunks(),
                skippedUnlinked, skippedUnavailableSnapshot);
        lastIndexedAt = Instant.now();
        lastReindexResult = result;
        return result;
    }

    public QualityMetrics quality() {
        LocalDate today = LocalDate.now();
        List<SourceDocument> effectiveSources = sourceService.findAll().stream()
                .filter(source -> source.isEffective(today)).toList();
        List<FinancialProduct> products = productRepository.findByActiveTrueOrderByCreatedAtDesc();
        List<ProductRule> rules = ruleRepository.findAllByActiveTrue().stream()
                .filter(rule -> rule.getProduct().isActive() && rule.isEffective(today)).toList();

        Set<Long> associatedSourceIds = new HashSet<>();
        products.forEach(product -> associatedSourceIds.add(product.getSourceDocument().getId()));
        rules.forEach(rule -> associatedSourceIds.add(rule.getSourceDocument().getId()));
        Map<String, FinancialProduct> productsByCode = new LinkedHashMap<>();
        products.forEach(product -> productsByCode.put(product.getProductCode(), product));
        candidateRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(candidate -> isEffective(candidate, today))
                .filter(candidate -> productsByCode.containsKey(candidate.getProductCode()))
                .forEach(candidate -> associatedSourceIds.add(candidate.getSourceDocument().getId()));
        documentRepository.findAllByActiveTrue().stream()
                .filter(document -> document.getProduct().isActive()
                        && document.getSourceDocument().isEffective(today))
                .forEach(document -> associatedSourceIds.add(document.getSourceDocument().getId()));
        stepRepository.findAllByActiveTrue().stream()
                .filter(step -> step.getProduct().isActive() && step.getSourceDocument().isEffective(today))
                .forEach(step -> associatedSourceIds.add(step.getSourceDocument().getId()));

        long diagnosableProducts = products.stream().filter(product -> rules.stream()
                .anyMatch(rule -> rule.getProduct().getId().equals(product.getId())
                        && rule.getRuleLevel() == RuleLevel.HARD)).count();
        long evidenceCompleteRules = rules.stream().filter(rule -> rule.getSourceExcerpt() != null
                && !rule.getSourceExcerpt().isBlank() && rule.getSourceLocator() != null
                && !rule.getSourceLocator().isBlank() && rule.getSourceDocument().getSourceUrl() != null).count();
        double coverage = rules.isEmpty() ? 0.0 : Math.round(evidenceCompleteRules * 1000.0 / rules.size()) / 10.0;
        long indexedEligibleSources = effectiveSources.stream()
                .filter(source -> associatedSourceIds.contains(source.getId())).count();
        long orphanedSources = effectiveSources.size() - indexedEligibleSources;

        return new QualityMetrics(effectiveSources.size(), indexedEligibleSources, orphanedSources,
                products.size(), diagnosableProducts, rules.size(), evidenceCompleteRules, coverage,
                lastIndexedAt, lastReindexResult);
    }

    public record ReindexResult(int indexedDocuments, int indexedChunks, int skippedUnlinkedSources,
                                int skippedUnavailableSnapshots) {}
    public record QualityMetrics(
            long approvedEffectiveSources,
            long indexedEligibleSources,
            long orphanedApprovedSources,
            long activeProducts,
            long diagnosableProducts,
            long activeEffectiveRules,
            long evidenceCompleteRules,
            double evidenceCoveragePercent,
            Instant lastIndexedAt,
            ReindexResult lastReindexResult
    ) {}

    private void associate(Map<Long, Map<Long, Set<String>>> associations, Long sourceId,
                           Long productId, String key) {
        associations.computeIfAbsent(sourceId, ignored -> new LinkedHashMap<>())
                .computeIfAbsent(productId, ignored -> new LinkedHashSet<>()).add(key);
    }

    private boolean isEffective(RuleCandidate candidate, LocalDate today) {
        return candidate.getReviewStatus() == ReviewStatus.APPROVED
                && candidate.getSourceDocument().isEffective(today)
                && (candidate.getValidFrom() == null || !candidate.getValidFrom().isAfter(today))
                && (candidate.getValidTo() == null || !candidate.getValidTo().isBefore(today));
    }
}
