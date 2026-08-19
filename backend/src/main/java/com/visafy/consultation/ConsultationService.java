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
        RagAnswerResponse response = ragService.answer(profileSessionId, productId, ruleKey, question, topK);
        Instant now = Instant.now(); String id = UUID.randomUUID().toString();
        repository.save(new Consultation(id, ApiExecutionHistoryService.hashSessionId(profileSessionId),
                productId, ruleKey.strip().toUpperCase(), question.strip(), response.answer(),
                profile.getLanguage(), now, profile.getExpiresAt()));
        return new ConsultationResponse(id, response.answer(), response.eligibilityStatus(), response.ruleResult(),
                response.documents(), response.guardrailsApplied(), profile.getLanguage(), now);
    }

    public record ConsultationResponse(
            String id, String answer, String eligibilityStatus, String ruleResult,
            List<RetrievedDocument> documents, List<String> guardrailsApplied,
            String language, Instant createdAt
    ) {}
}
