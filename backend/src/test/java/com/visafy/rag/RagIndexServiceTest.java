package com.visafy.rag;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.visafy.product.FinancialProductRepository;
import com.visafy.product.ProductRuleRepository;
import com.visafy.rag.RagAiClient.SyncResponse;
import com.visafy.source.SourceDocumentService;
import java.util.List;
import org.junit.jupiter.api.Test;

class RagIndexServiceTest {
    private final SourceDocumentService sourceService = mock(SourceDocumentService.class);
    private final FinancialProductRepository productRepository = mock(FinancialProductRepository.class);
    private final ProductRuleRepository ruleRepository = mock(ProductRuleRepository.class);
    private final RagAiClient aiClient = mock(RagAiClient.class);
    private final RagIndexService service = new RagIndexService(
            sourceService, productRepository, ruleRepository, aiClient);

    @Test
    void qualityDashboardReportsEmptyRepositoryWithoutInventingCoverage() {
        emptyRepositories();

        RagIndexService.QualityMetrics metrics = service.quality();

        assertThat(metrics.approvedEffectiveSources()).isZero();
        assertThat(metrics.activeProducts()).isZero();
        assertThat(metrics.diagnosableProducts()).isZero();
        assertThat(metrics.activeEffectiveRules()).isZero();
        assertThat(metrics.evidenceCoveragePercent()).isZero();
        assertThat(metrics.lastIndexedAt()).isNull();
    }

    @Test
    void successfulReindexIsVisibleInQualityDashboard() {
        emptyRepositories();
        when(aiClient.sync(anyList())).thenReturn(new SyncResponse(0, 0));

        service.reindex();
        RagIndexService.QualityMetrics metrics = service.quality();

        assertThat(metrics.lastIndexedAt()).isNotNull();
        assertThat(metrics.lastReindexResult()).isEqualTo(new RagIndexService.ReindexResult(0, 0, 0, 0));
    }

    private void emptyRepositories() {
        when(sourceService.findAll()).thenReturn(List.of());
        when(productRepository.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of());
        when(ruleRepository.findAllByActiveTrue()).thenReturn(List.of());
    }
}
