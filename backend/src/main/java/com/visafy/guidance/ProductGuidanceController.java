package com.visafy.guidance;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProductGuidanceController {
    private final ProductGuidanceService service;

    public ProductGuidanceController(ProductGuidanceService service) {
        this.service = service;
    }

    @GetMapping("/products/{productId}/guidance")
    public ProductGuidanceService.GuidanceResult getGeneral(
            @PathVariable Long productId, @RequestParam(defaultValue = "ko") String language) {
        return service.getGeneral(productId, language);
    }

    @PostMapping("/products/{productId}/guidance")
    public ProductGuidanceService.GuidanceResult getPersonalized(
            @PathVariable Long productId, @Valid @RequestBody PersonalizedRequest request) {
        return service.getPersonalized(productId, request.profileSessionId());
    }

    @GetMapping("/admin/products/{productId}/guidance")
    public ProductGuidanceService.GuidanceResult getAdmin(@PathVariable Long productId) {
        return service.getAdmin(productId);
    }

    @PostMapping("/admin/products/{productId}/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductGuidanceService.DocumentView createDocument(
            @PathVariable Long productId, @Valid @RequestBody CreateDocumentRequest request) {
        return ProductGuidanceService.DocumentView.from(service.createDocument(productId,
                request.documentName(), request.description(), request.requirementType(),
                request.conditionRuleKey(), request.sourceDocumentId(), request.sourceLocator(),
                request.validFrom(), request.validTo(), request.active()));
    }

    @PostMapping("/admin/products/{productId}/steps")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductGuidanceService.StepView createStep(
            @PathVariable Long productId, @Valid @RequestBody CreateStepRequest request) {
        return ProductGuidanceService.StepView.from(service.createStep(productId, request.stepOrder(),
                request.title(), request.description(), request.channel(), request.sourceDocumentId(),
                request.sourceLocator(), request.validFrom(), request.validTo(), request.active()));
    }

    public record PersonalizedRequest(@NotBlank String profileSessionId) {}
    public record CreateDocumentRequest(
            @NotBlank @Size(max = 255) String documentName,
            @Size(max = 4000) String description,
            @NotNull DocumentRequirementType requirementType,
            @Size(max = 120) String conditionRuleKey,
            @NotNull Long sourceDocumentId,
            @NotBlank @Size(max = 500) String sourceLocator,
            LocalDate validFrom,
            LocalDate validTo,
            boolean active
    ) {}
    public record CreateStepRequest(
            @Min(1) int stepOrder,
            @NotBlank @Size(max = 255) String title,
            @NotBlank @Size(max = 4000) String description,
            @Size(max = 120) String channel,
            @NotNull Long sourceDocumentId,
            @NotBlank @Size(max = 500) String sourceLocator,
            LocalDate validFrom,
            LocalDate validTo,
            boolean active
    ) {}
}
