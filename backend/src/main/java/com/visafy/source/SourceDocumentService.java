package com.visafy.source;

import jakarta.transaction.Transactional;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.server.ResponseStatusException;
import com.visafy.common.domain.ReviewStatus;
import com.visafy.rag.RagIndexRefreshRequested;

@Service
public class SourceDocumentService {
    private final SourceDocumentRepository repository;
    private final List<String> allowedDomains;
    private final ApplicationEventPublisher eventPublisher;

    public SourceDocumentService(SourceDocumentRepository repository,
                                 @Value("${app.source.allowed-domains}") String allowedDomains,
                                 ApplicationEventPublisher eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
        this.allowedDomains = Arrays.stream(allowedDomains.split(","))
                .map(String::trim).map(String::toLowerCase).filter(value -> !value.isBlank()).toList();
    }

    @Transactional
    public SourceDocument create(String institution, SourceType sourceType, String title, String sourceUrl,
                                 String snapshotText, LocalDate validFrom, LocalDate validTo, String language) {
        return create(institution, sourceType, title, sourceUrl, snapshotText, null, null,
                LocalDate.now(), validFrom, validTo, language);
    }

    @Transactional
    public SourceDocument create(String institution, SourceType sourceType, String title, String sourceUrl,
                                 String snapshotText, String snapshotPath, String suppliedContentHash,
                                 LocalDate informationBaseDate, LocalDate validFrom, LocalDate validTo,
                                 String language) {
        validateOfficialUrl(sourceUrl);
        validateDates(validFrom, validTo);
        String normalizedSnapshot = normalizeOptional(snapshotText);
        String normalizedPath = normalizeOptional(snapshotPath);
        if (normalizedSnapshot == null && normalizedPath == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Either snapshotText or snapshotPath is required");
        }
        String hash = normalizedSnapshot != null ? sha256(normalizedSnapshot)
                : normalizeHash(suppliedContentHash);
        if (repository.existsByContentHash(hash)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The same source snapshot is already registered");
        }
        repository.findFirstBySourceUrlOrderByRetrievedAtDesc(sourceUrl.strip())
                .filter(previous -> !previous.getContentHash().equalsIgnoreCase(hash))
                .filter(previous -> previous.getReviewStatus() == ReviewStatus.APPROVED)
                .ifPresent(previous ->
                        previous.review(ReviewStatus.NEED_REVIEW, SourceDocument.CONTENT_CHANGE_REVIEWER));
        return repository.save(new SourceDocument(
                institution.strip(), sourceType, title.strip(), sourceUrl.strip(), normalizedSnapshot,
                normalizedPath, hash, informationBaseDate, validFrom, validTo, language));
    }

    @Transactional
    public List<SourceDocument> findAll() {
        List<SourceDocument> sources = repository.findAllByOrderByCreatedAtDesc();
        sources.forEach(source -> source.expireIfNeeded(LocalDate.now()));
        return sources;
    }

    public SourceDocument get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Source not found"));
    }

    @Transactional
    public SourceDocument review(Long id, ReviewStatus status) {
        return review(id, status, "system");
    }

    @Transactional
    public SourceDocument review(Long id, ReviewStatus status, String reviewer) {
        SourceDocument source = get(id);
        source.expireIfNeeded(LocalDate.now());
        if (source.getReviewStatus() == ReviewStatus.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expired sources cannot be reviewed");
        }
        try {
            source.review(status, reviewer);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
        eventPublisher.publishEvent(new RagIndexRefreshRequested("source-review-" + id));
        return source;
    }

    @Transactional
    public SourceDocument update(Long id, String institution, SourceType sourceType, String title, String sourceUrl,
                                 LocalDate informationBaseDate, LocalDate validFrom, LocalDate validTo,
                                 String language) {
        validateOfficialUrl(sourceUrl);
        validateDates(validFrom, validTo);
        SourceDocument source = get(id);
        source.updateMetadata(institution.strip(), sourceType, title.strip(), sourceUrl.strip(),
                informationBaseDate, validFrom, validTo, language);
        eventPublisher.publishEvent(new RagIndexRefreshRequested("source-update-" + id));
        return source;
    }

    @Transactional
    public SourceDocument changeLifecycle(Long id, SourceLifecycleStatus status) {
        SourceDocument source = get(id);
        if (status == SourceLifecycleStatus.EXPIRED) {
            source.markExpired();
            eventPublisher.publishEvent(new RagIndexRefreshRequested("source-lifecycle-" + id));
            return source;
        }
        if (source.getValidTo() != null && source.getValidTo().isBefore(LocalDate.now())) {
            source.markExpired();
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expired sources cannot become active");
        }
        if (status == SourceLifecycleStatus.ACTIVE) source.review(ReviewStatus.APPROVED);
        else if (status == SourceLifecycleStatus.NEED_REVIEW) source.review(ReviewStatus.NEED_REVIEW);
        else if (status == SourceLifecycleStatus.SUPERSEDED) source.review(ReviewStatus.SUPERSEDED);
        else if (status == SourceLifecycleStatus.UNKNOWN) source.review(ReviewStatus.UNKNOWN);
        else throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported source lifecycle status");
        eventPublisher.publishEvent(new RagIndexRefreshRequested("source-lifecycle-" + id));
        return source;
    }

    private void validateDates(LocalDate validFrom, LocalDate validTo) {
        if (validFrom != null && validTo != null && validTo.isBefore(validFrom)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "validTo must not be before validFrom");
        }
    }

    public void validateOfficialUrl(String sourceUrl) {
        try {
            URI uri = URI.create(sourceUrl.strip());
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
            boolean allowed = "https".equalsIgnoreCase(uri.getScheme()) && allowedDomains.stream()
                    .anyMatch(domain -> host.equals(domain) || host.endsWith("." + domain));
            if (!allowed) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Only HTTPS URLs from the configured official-domain allowlist are accepted");
            }
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sourceUrl is invalid");
        }
    }

    private String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }

    private String normalizeHash(String value) {
        String normalized = normalizeOptional(value);
        if (normalized == null || !normalized.matches("(?i)[0-9a-f]{64}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A 64-character SHA-256 contentHash is required for snapshotPath");
        }
        return normalized.toLowerCase();
    }
}
