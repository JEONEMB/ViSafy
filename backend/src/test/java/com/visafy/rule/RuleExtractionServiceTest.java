package com.visafy.rule;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visafy.common.domain.ReviewStatus;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceDocumentService;
import com.visafy.source.SourceType;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RuleExtractionServiceTest {
    private static final String SNAPSHOT = """
            가입대상
            F-2, F-5 체류자격을 보유한 실명의 개인 고객이 가입할 수 있습니다.

            심사
            대출 실행 여부는 은행 내부 심사 결과에 따릅니다.
            """;

    @Mock
    private SourceDocumentService sourceService;
    @Mock
    private RuleCandidateService candidateService;
    @Mock
    private RuleCandidateRepository repository;
    @Mock
    private RuleExtractionAiClient client;

    private RuleExtractionService service;
    private SourceDocument source;

    @BeforeEach
    void setUp() {
        service = new RuleExtractionService(sourceService, candidateService, repository, client,
                new ObjectMapper());
        source = new SourceDocument("KB국민은행", SourceType.PRODUCT_DESCRIPTION, "상품설명서",
                "https://obank.kbstar.com/", SNAPSHOT, "d".repeat(64), null, null, "ko");
        source.review(ReviewStatus.APPROVED);
        ReflectionTestUtils.setField(source, "id", 1L);
        when(sourceService.get(1L)).thenReturn(source);
    }

    @Test
    void discardsCandidatesWhoseExcerptIsNotInTheOfficialSnapshot() {
        when(client.extract(any())).thenReturn(new RuleExtractionAiClient.ExtractionResponse(
                List.of(candidate("VISA_TYPE", "IN", "[\"F-2\", \"F-5\"]",
                                "F-2, F-5 체류자격을 보유한 실명의 개인 고객이 가입할 수 있습니다."),
                        candidate("AGE", "GTE", "19", "만 19세 이상만 가입할 수 있습니다.")),
                List.of(), true, 2, 1));
        when(repository.findByProductCodeOrderByCreatedAtDesc("DEMO")).thenReturn(List.of());
        when(candidateService.create(eq(1L), eq("DEMO"), anyString(), any(), anyString(), any(), any(),
                anyBoolean(), anyString(), anyString(), isNull(), any(), isNull(), isNull(), anyString(), any()))
                .thenReturn(stored());

        RuleExtractionService.ExtractionOutcome outcome = service.extractFromSource(1L, "DEMO");

        assertThat(outcome.proposedCandidates()).isEqualTo(2);
        assertThat(outcome.savedCandidates()).hasSize(1);
        assertThat(outcome.rejectedUngrounded()).isEqualTo(1);
        ArgumentCaptor<String> ruleKey = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> ruleValue = ArgumentCaptor.forClass(String.class);
        verify(candidateService).create(eq(1L), eq("DEMO"), ruleKey.capture(), any(), ruleValue.capture(), any(),
                any(), anyBoolean(), anyString(), anyString(), isNull(), any(), isNull(), isNull(), anyString(), any());
        assertThat(ruleKey.getValue()).isEqualTo("VISA_TYPE");
        // Stored in the compact form reviewers already use, so approval does not report a false conflict.
        assertThat(ruleValue.getValue()).isEqualTo("[\"F-2\",\"F-5\"]");
    }

    @Test
    void doesNotStoreACandidateThatAlreadyExistsForTheSameSource() {
        when(client.extract(any())).thenReturn(new RuleExtractionAiClient.ExtractionResponse(
                List.of(candidate("VISA_TYPE", "IN", "[\"F-2\", \"F-5\"]",
                        "F-2, F-5 체류자격을 보유한 실명의 개인 고객이 가입할 수 있습니다.")),
                List.of(), true, 1, 0));
        when(repository.findByProductCodeOrderByCreatedAtDesc("DEMO")).thenReturn(List.of(stored()));

        RuleExtractionService.ExtractionOutcome outcome = service.extractFromSource(1L, "DEMO");

        assertThat(outcome.savedCandidates()).isEmpty();
        assertThat(outcome.skippedDuplicates()).isEqualTo(1);
        verify(candidateService, never()).create(any(), anyString(), anyString(), any(), anyString(), any(), any(),
                anyBoolean(), anyString(), anyString(), any(), any(), any(), any(), anyString(), any());
    }

    @Test
    void keepsSectionHeadingsSoReviewersSeeWhereAnExcerptCameFrom() {
        when(client.extract(any())).thenReturn(
                new RuleExtractionAiClient.ExtractionResponse(List.of(), List.of(), false, 0, 0));
        when(repository.findByProductCodeOrderByCreatedAtDesc("DEMO")).thenReturn(List.of());

        service.extractFromSource(1L, "DEMO");

        ArgumentCaptor<RuleExtractionAiClient.ExtractionRequest> request =
                ArgumentCaptor.forClass(RuleExtractionAiClient.ExtractionRequest.class);
        verify(client).extract(request.capture());
        assertThat(request.getValue().pages()).extracting(RuleExtractionAiClient.Page::sectionName)
                .containsExactly("가입대상", "심사");
    }

    @Test
    void labelsAModelProposedCandidateSoReviewersSeeWhereItCameFrom() {
        when(client.extract(any())).thenReturn(new RuleExtractionAiClient.ExtractionResponse(
                List.of(candidate("AGE", "GTE", "19",
                        "F-2, F-5 체류자격을 보유한 실명의 개인 고객이 가입할 수 있습니다.", "LLM_VERIFIED")),
                List.of(), true, 1, 3));
        when(repository.findByProductCodeOrderByCreatedAtDesc("DEMO")).thenReturn(List.of());
        when(candidateService.create(eq(1L), eq("DEMO"), anyString(), any(), anyString(), any(), any(),
                anyBoolean(), anyString(), anyString(), isNull(), any(), isNull(), isNull(), anyString(), any()))
                .thenReturn(stored());

        RuleExtractionService.ExtractionOutcome outcome = service.extractFromSource(1L, "DEMO");

        assertThat(outcome.modelAttempted()).isTrue();
        assertThat(outcome.savedByModel()).isEqualTo(1);
        assertThat(outcome.rejectedByVerifier()).isEqualTo(3);
        ArgumentCaptor<String> description = ArgumentCaptor.forClass(String.class);
        verify(candidateService).create(eq(1L), eq("DEMO"), anyString(), any(), anyString(), any(), any(),
                anyBoolean(), anyString(), anyString(), isNull(), any(), isNull(), isNull(),
                description.capture(), any());
        assertThat(description.getValue()).contains("AI 문서 분석");
    }

    private RuleExtractionAiClient.ExtractedCandidate candidate(String ruleKey, String operator, String value,
                                                               String excerpt) {
        return candidate(ruleKey, operator, value, excerpt, "RULE_BASED");
    }

    private RuleExtractionAiClient.ExtractedCandidate candidate(String ruleKey, String operator, String value,
                                                               String excerpt, String extractor) {
        return new RuleExtractionAiClient.ExtractedCandidate(1L, "DEMO", ruleKey, operator, value, "HARD",
                "HARD_ELIGIBILITY", true, excerpt, "가입대상", null, "가입대상", 0.88, "PENDING", extractor);
    }

    private RuleCandidate stored() {
        return new RuleCandidate(source, "DEMO", "VISA_TYPE", RuleOperator.IN, "[\"F-2\",\"F-5\"]",
                RuleLevel.HARD, true, "F-2, F-5 체류자격을 보유한 실명의 개인 고객이 가입할 수 있습니다.",
                "가입대상", null, null, "허용 체류자격", new BigDecimal("0.8800"));
    }
}
