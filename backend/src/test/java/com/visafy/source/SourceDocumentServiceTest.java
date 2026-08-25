package com.visafy.source;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;

import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class SourceDocumentServiceTest {
    @Mock
    private SourceDocumentRepository repository;
    private SourceDocumentService service;

    @BeforeEach
    void setUp() {
        service = new SourceDocumentService(repository, "fss.or.kr,kbstar.com", mock(org.springframework.context.ApplicationEventPublisher.class));
    }

    @Test
    void storesAnOfficialSnapshotWithSha256() {
        when(repository.save(any(SourceDocument.class))).thenAnswer(invocation -> invocation.getArgument(0));
        SourceDocument source = service.create("금융감독원", SourceType.PUBLIC_GUIDE, "공식 가이드",
                "https://www.fss.or.kr/guide", "  official snapshot  ",
                LocalDate.of(2026, 1, 1), LocalDate.of(2027, 1, 1), "ko");

        assertThat(source.getSnapshotText()).isEqualTo("official snapshot");
        assertThat(source.getContentHash()).hasSize(64);
        assertThat(source.getInformationBaseDate()).isEqualTo(LocalDate.now());
    }

    @Test
    void storesAFileSnapshotReferenceWithSuppliedHash() {
        when(repository.save(any(SourceDocument.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SourceDocument source = service.create("Bank", SourceType.TERMS, "Official terms",
                "https://www.kbstar.com/terms", null, "snapshots/terms.pdf", "a".repeat(64),
                LocalDate.of(2026, 8, 20), null, null, "ko");

        assertThat(source.getSnapshotText()).isNull();
        assertThat(source.getSnapshotPath()).isEqualTo("snapshots/terms.pdf");
        assertThat(source.getContentHash()).isEqualTo("a".repeat(64));
        assertThat(source.getInformationBaseDate()).isEqualTo(LocalDate.of(2026, 8, 20));
    }

    @Test
    void rejectsSnapshotPathWithoutSha256() {
        assertThatThrownBy(() -> service.create("Bank", SourceType.TERMS, "Official terms",
                "https://www.kbstar.com/terms", null, "snapshots/terms.pdf", null,
                LocalDate.of(2026, 8, 20), null, null, "ko"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("SHA-256");
    }

    @Test
    void rejectsThirdPartyDomains() {
        assertThatThrownBy(() -> service.create("블로그", SourceType.FAQ, "비공식 글",
                "https://example.com/post", "snapshot", null, null, "ko"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("official-domain allowlist");
    }

    @Test
    void managesActiveReviewAndExpiredLifecycle() {
        SourceDocument source = new SourceDocument("은행", SourceType.PRODUCT_PAGE, "상품",
                "https://www.kbstar.com/product", "snapshot", "a".repeat(64),
                null, LocalDate.now().plusDays(30), "ko");
        when(repository.findById(1L)).thenReturn(Optional.of(source));
        service.changeLifecycle(1L, SourceLifecycleStatus.ACTIVE);
        assertThat(source.getLifecycleStatus()).isEqualTo(SourceLifecycleStatus.ACTIVE);
        service.changeLifecycle(1L, SourceLifecycleStatus.NEED_REVIEW);
        assertThat(source.getLifecycleStatus()).isEqualTo(SourceLifecycleStatus.NEED_REVIEW);
        service.changeLifecycle(1L, SourceLifecycleStatus.EXPIRED);
        assertThat(source.getLifecycleStatus()).isEqualTo(SourceLifecycleStatus.EXPIRED);
    }

    @Test
    void changedSnapshotMarksPreviouslyApprovedSourceForReview() {
        SourceDocument previous = new SourceDocument("Bank", SourceType.PRODUCT_PAGE, "Product",
                "https://www.kbstar.com/product", "old text", "a".repeat(64), null, null, "ko");
        previous.review(com.visafy.common.domain.ReviewStatus.APPROVED, "reviewer");
        when(repository.findFirstBySourceUrlOrderByRetrievedAtDesc("https://www.kbstar.com/product"))
                .thenReturn(Optional.of(previous));
        when(repository.save(any(SourceDocument.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SourceDocument replacement = service.create("Bank", SourceType.PRODUCT_PAGE, "Product",
                "https://www.kbstar.com/product", "changed text", null, null, "ko");

        assertThat(previous.getReviewStatus()).isEqualTo(com.visafy.common.domain.ReviewStatus.NEED_REVIEW);
        assertThat(previous.getReviewedBy()).isEqualTo("content-change-detector");
        assertThat(replacement.getReviewStatus()).isEqualTo(com.visafy.common.domain.ReviewStatus.PENDING);
    }
}
