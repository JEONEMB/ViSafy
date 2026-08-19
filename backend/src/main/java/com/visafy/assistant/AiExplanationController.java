package com.visafy.assistant;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import com.visafy.consultation.ConsultationService;
import com.visafy.consultation.ConsultationService.ConsultationResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiExplanationController {
    private final AiExplanationService service;
    private final ConsultationService consultationService;

    public AiExplanationController(AiExplanationService service, ConsultationService consultationService) {
        this.service = service;
        this.consultationService = consultationService;
    }

    @PostMapping({"/explanation", "/explain"})
    public AiExplanationService.ExplanationResult explain(@Valid @RequestBody ExplanationRequest request) {
        return service.explain(request.profileSessionId(), request.productId());
    }

    @PostMapping("/inquiry-message")
    public InquiryMessageResponse inquiryMessage(@Valid @RequestBody ExplanationRequest request) {
        AiExplanationService.ExplanationResult result = service.explain(request.profileSessionId(), request.productId());
        return new InquiryMessageResponse(result.eligibilityStatus(), result.facts(), result.inquiry(),
                result.disclaimer());
    }

    @PostMapping("/chat")
    public ConsultationResponse chat(@Valid @RequestBody ChatRequest request) {
        return consultationService.ask(request.profileSessionId(), request.productId(), request.ruleKey(),
                request.query(), request.topK() == null ? 5 : request.topK());
    }

    public record ExplanationRequest(@NotBlank String profileSessionId, @NotNull Long productId) {}
    public record InquiryMessageResponse(
            String eligibilityStatus, AiExplanationService.StructuredFacts facts,
            AiExplanationClient.BankInquiry inquiry, String disclaimer
    ) {}
    public record ChatRequest(
            @NotBlank String profileSessionId,
            @NotNull Long productId,
            @NotBlank @Size(max = 120) String ruleKey,
            @NotBlank @Size(min = 2, max = 1000) String query,
            @Min(1) @Max(10) Integer topK
    ) {}
}
