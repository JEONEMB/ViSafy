package com.visafy.source;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
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
        service = new SourceDocumentService(repository, "fss.or.kr,kbstar.com");
    }

    @Test
    void storesAnOfficialSnapshotWithSha256() {
        when(repository.save(any(SourceDocument.class))).thenAnswer(invocation -> invocation.getArgument(0));
        SourceDocument source = service.create("금융감독원", SourceType.PUBLIC_GUIDE, "공식 가이드",
                "https://www.fss.or.kr/guide", "  official snapshot  ",
                LocalDate.of(2026, 1, 1), LocalDate.of(2027, 1, 1));

        assertThat(source.getSnapshotText()).isEqualTo("official snapshot");
        assertThat(source.getContentHash()).hasSize(64);
    }

    @Test
    void rejectsThirdPartyDomains() {
        assertThatThrownBy(() -> service.create("블로그", SourceType.FAQ, "비공식 글",
                "https://example.com/post", "snapshot", null, null))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("official-domain allowlist");
    }
}
