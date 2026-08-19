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
                request.sourceUrl(), request.snapshotText(), request.validFrom(), request.validTo(),
                request.language()));
    }

    @GetMapping
    public List<SourceResponse> findAll() {
        return service.findAll().stream().map(SourceResponse::from).toList();
    }

    @PutMapping("/{id}/review")
    public SourceResponse review(@PathVariable Long id, @Valid @RequestBody ReviewSourceRequest request) {
        return SourceResponse.from(service.review(id, request.reviewStatus()));
    }

    public record ReviewSourceRequest(@NotNull ReviewStatus reviewStatus) {
    }

    public record CreateSourceRequest(
            @NotBlank String institution,
            @NotNull SourceType sourceType,
            @NotBlank String title,
            @NotBlank @URL(protocol = "https") String sourceUrl,
            @NotBlank String snapshotText,
            LocalDate validFrom,
            LocalDate validTo,
            @NotBlank @Pattern(regexp = "ko|en|vi") String language
    ) {
    }

    public record SourceResponse(
            Long id, String institution, SourceType sourceType, String title, String sourceUrl,
            String snapshotText, String snapshotPath, String contentHash, Instant retrievedAt, LocalDate validFrom,
            LocalDate validTo, String language, ReviewStatus reviewStatus, Instant lastVerifiedAt
    ) {
        static SourceResponse from(SourceDocument source) {
            return new SourceResponse(source.getId(), source.getInstitution(), source.getSourceType(),
                    source.getTitle(), source.getSourceUrl(), source.getSnapshotText(), source.getSnapshotPath(), source.getContentHash(),
                    source.getRetrievedAt(), source.getValidFrom(), source.getValidTo(), source.getLanguage(),
                    source.getReviewStatus(), source.getLastVerifiedAt());
        }
    }
}
