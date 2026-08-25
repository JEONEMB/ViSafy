package com.visafy.rag;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.visafy.product.FinancialProductRepository;
import com.visafy.product.ProductRuleRepository;
import com.visafy.rule.RuleCandidateRepository;
import com.visafy.guidance.ProductApplicationStepRepository;
import com.visafy.guidance.ProductDocumentRequirementRepository;
import com.visafy.rag.RagAiClient.SyncResponse;
import com.visafy.source.SourceDocumentService;
import java.util.List;
import org.junit.jupiter.api.Test;

class RagIndexServiceTest {
    private final SourceDocumentService sourceService = mock(SourceDocumentService.class);
    private final FinancialProductRepository productRepository = mock(FinancialProductRepository.class);
    private final ProductRuleRepository ruleRepository = mock(ProductRuleRepository.class);
    private final RuleCandidateRepository candidateRepository = mock(RuleCandidateRepository.class);
    private final ProductDocumentRequirementRepository documentRepository = mock(ProductDocumentRequirementRepository.class);
    private final ProductApplicationStepRepository stepRepository = mock(ProductApplicationStepRepository.class);
    private final RagAiClient aiClient = mock(RagAiClient.class);
    private final RagIndexService service = new RagIndexService(
            sourceService, productRepository, ruleRepository, candidateRepository,
            documentRepository, stepRepository, aiClient);

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
        when(candidateRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(documentRepository.findAllByActiveTrue()).thenReturn(List.of());
        when(stepRepository.findAllByActiveTrue()).thenReturn(List.of());
    }
}
