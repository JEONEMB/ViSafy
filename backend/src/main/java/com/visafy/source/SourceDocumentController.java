package com.visafy.source;

import com.visafy.common.domain.ReviewStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.hibernate.validator.constraints.URL;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.security.Principal;

@RestController
@RequestMapping("/api/admin/sources")
public class SourceDocumentController {
    private final SourceDocumentService service;

    public SourceDocumentController(SourceDocumentService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SourceResponse create(@Valid @RequestBody CreateSourceRequest request) {
        return SourceResponse.from(service.create(request.institution(), request.sourceType(), request.title(),
                request.sourceUrl(), request.snapshotText(), request.snapshotPath(), request.contentHash(),
                request.informationBaseDate(), request.validFrom(), request.validTo(), request.language()));
    }

    @GetMapping
    public List<SourceResponse> findAll() {
        return service.findAll().stream().map(SourceResponse::from).toList();
    }

    @PutMapping("/{id}/review")
    public SourceResponse review(@PathVariable Long id, @Valid @RequestBody ReviewSourceRequest request,
                                 Principal principal) {
        return SourceResponse.from(service.review(id, request.reviewStatus(),
                principal == null ? "system" : principal.getName()));
    }

    @PutMapping("/{id}")
    public SourceResponse update(@PathVariable Long id, @Valid @RequestBody UpdateSourceRequest request) {
        return SourceResponse.from(service.update(id, request.institution(), request.sourceType(), request.title(),
                request.sourceUrl(), request.informationBaseDate(), request.validFrom(), request.validTo(),
                request.language()));
    }

    @PutMapping("/{id}/status")
    public SourceResponse changeStatus(@PathVariable Long id, @Valid @RequestBody SourceStatusRequest request) {
        return SourceResponse.from(service.changeLifecycle(id, request.status()));
    }

    public record ReviewSourceRequest(@NotNull ReviewStatus reviewStatus) {
    }
    public record SourceStatusRequest(@NotNull SourceLifecycleStatus status) {}
    public record UpdateSourceRequest(
            @NotBlank String institution, @NotNull SourceType sourceType, @NotBlank String title,
            @NotBlank @URL(protocol = "https") String sourceUrl, @NotNull LocalDate informationBaseDate,
            LocalDate validFrom, LocalDate validTo,
            @NotBlank @Pattern(regexp = "ko|en|vi") String language
    ) {}

    public record CreateSourceRequest(
            @NotBlank String institution,
            @NotNull SourceType sourceType,
            @NotBlank String title,
            @NotBlank @URL(protocol = "https") String sourceUrl,
            String snapshotText,
            String snapshotPath,
            @Pattern(regexp = "(?i)[0-9a-f]{64}") String contentHash,
            @NotNull LocalDate informationBaseDate,
            LocalDate validFrom,
            LocalDate validTo,
            @NotBlank @Pattern(regexp = "ko|en|vi") String language
    ) {
    }

    public record SourceResponse(
            Long id, String institution, SourceType sourceType, String title, String sourceUrl,
            String snapshotText, String snapshotPath, String contentHash, Instant retrievedAt,
            LocalDate informationBaseDate, LocalDate validFrom,
            LocalDate validTo, String language, ReviewStatus reviewStatus,
            SourceLifecycleStatus lifecycleStatus, Instant lastVerifiedAt, String reviewedBy
    ) {
        static SourceResponse from(SourceDocument source) {
            return new SourceResponse(source.getId(), source.getInstitution(), source.getSourceType(),
                    source.getTitle(), source.getSourceUrl(), source.getSnapshotText(), source.getSnapshotPath(), source.getContentHash(),
                    source.getRetrievedAt(), source.getInformationBaseDate(), source.getValidFrom(),
                    source.getValidTo(), source.getLanguage(),
                    source.getReviewStatus(), source.getLifecycleStatus(), source.getLastVerifiedAt(),
                    source.getReviewedBy());
        }
    }
}
