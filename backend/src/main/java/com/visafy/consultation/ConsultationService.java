package com.visafy.consultation;

import com.visafy.execution.ApiExecutionHistoryService;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfileService;
import com.visafy.rag.RagAiClient.RagAnswerResponse;
import com.visafy.rag.RagAiClient.RetrievedDocument;
import com.visafy.rag.RagService;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ConsultationService {
    private final RagService ragService;
    private final TempProfileService profileService;
    private final ConsultationRepository repository;

    public ConsultationService(RagService ragService, TempProfileService profileService,
                               ConsultationRepository repository) {
        this.ragService = ragService; this.profileService = profileService; this.repository = repository;
    }

    @Transactional
    public ConsultationResponse ask(String profileSessionId, Long productId, String ruleKey,
                                    String question, int topK) {
        TempProfile profile = profileService.getBySessionId(profileSessionId);
        String hash = ApiExecutionHistoryService.hashSessionId(profileSessionId);
        List<Consultation> recent = repository.findTop10ByProfileSessionHashAndProductIdOrderByCreatedAtDesc(hash, productId);
        String context = recent.stream().limit(3)
                .map(value -> "Q: " + clip(value.getQuestion(), 200) + "\nA: " + clip(value.getAnswer(), 500))
                .reduce((left, right) -> right + "\n\n" + left).orElse("");
        RagAnswerResponse response = ragService.answer(
                profileSessionId, productId, ruleKey, question.strip(), topK, context);
        Instant now = Instant.now(); String id = UUID.randomUUID().toString();
        repository.save(new Consultation(id, hash,
                productId, ruleKey.strip().toUpperCase(), question.strip(), response.answer(),
                response.responseLanguage(), now, profile.getExpiresAt()));
        return new ConsultationResponse(id, response.answer(), response.eligibilityStatus(), response.ruleResult(),
                response.documents(), response.guardrailsApplied(), response.responseLanguage(), now);
    }

    public List<ConsultationHistoryItem> history(String profileSessionId, Long productId) {
        profileService.getBySessionId(profileSessionId.strip());
        String hash = ApiExecutionHistoryService.hashSessionId(profileSessionId.strip());
        List<Consultation> rows = repository.findTop10ByProfileSessionHashAndProductIdOrderByCreatedAtDesc(hash, productId);
        return rows.reversed().stream().map(row -> new ConsultationHistoryItem(row.getId(), row.getQuestion(),
                row.getAnswer(), row.getRuleKey(), row.getLanguage(), row.getCreatedAt())).toList();
    }

    public record ConsultationResponse(
            String id, String answer, String eligibilityStatus, String ruleResult,
            List<RetrievedDocument> documents, List<String> guardrailsApplied,
            String language, Instant createdAt
    ) {}
    public record ConsultationHistoryItem(String id, String question, String answer, String ruleKey,
                                          String language, Instant createdAt) {}

    private static String clip(String value, int limit) {
        return value.length() <= limit ? value : value.substring(0, limit);
    }
}
