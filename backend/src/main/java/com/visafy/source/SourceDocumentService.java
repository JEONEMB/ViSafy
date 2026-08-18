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
import org.springframework.web.server.ResponseStatusException;
import com.visafy.common.domain.ReviewStatus;

@Service
public class SourceDocumentService {
    private final SourceDocumentRepository repository;
    private final List<String> allowedDomains;

    public SourceDocumentService(SourceDocumentRepository repository,
                                 @Value("${app.source.allowed-domains}") String allowedDomains) {
        this.repository = repository;
        this.allowedDomains = Arrays.stream(allowedDomains.split(","))
                .map(String::trim).map(String::toLowerCase).filter(value -> !value.isBlank()).toList();
    }

    @Transactional
    public SourceDocument create(String institution, SourceType sourceType, String title, String sourceUrl,
                                 String snapshotText, LocalDate validFrom, LocalDate validTo) {
        validateOfficialUrl(sourceUrl);
        if (validFrom != null && validTo != null && validTo.isBefore(validFrom)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "validTo must not be before validFrom");
        }
        String normalizedSnapshot = snapshotText.strip();
        String hash = sha256(normalizedSnapshot);
        if (repository.existsByContentHash(hash)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The same source snapshot is already registered");
        }
        return repository.save(new SourceDocument(
                institution.strip(), sourceType, title.strip(), sourceUrl.strip(), normalizedSnapshot,
                hash, validFrom, validTo));
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
        SourceDocument source = get(id);
        source.expireIfNeeded(LocalDate.now());
        if (source.getReviewStatus() == ReviewStatus.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expired sources cannot be reviewed");
        }
        try {
            source.review(status);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
        return source;
    }

    private void validateOfficialUrl(String sourceUrl) {
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
}
