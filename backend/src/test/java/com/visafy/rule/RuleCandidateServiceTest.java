package com.visafy.rule;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.rule.RuleCandidateService.ReviewAction;
import com.visafy.product.ProductRuleService;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceDocumentService;
import com.visafy.source.SourceType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RuleCandidateServiceTest {
    @Mock
    private RuleCandidateRepository repository;
    @Mock
    private SourceDocumentService sourceService;
    @Mock
    private ProductRuleService productRuleService;

    @Test
    void marksConflictingApprovedRulesForReview() {
        SourceDocument source = new SourceDocument("금융감독원", SourceType.PUBLIC_GUIDE, "공식 가이드",
                "https://www.fss.or.kr/", "snapshot", "a".repeat(64), null, null);
        source.review(ReviewStatus.APPROVED);
        RuleCandidate existing = candidate(source, "6");
        existing.approve();
        RuleCandidate incoming = candidate(source, "12");

        when(repository.findById(2L)).thenReturn(Optional.of(incoming));
        when(repository.findByProductCodeAndRuleKeyAndReviewStatusAndIdNot(
                eq("DEMO"), eq("RESIDENCY_MONTHS"), eq(ReviewStatus.APPROVED), isNull()))
                .thenReturn(List.of(existing));

        RuleCandidateService service = new RuleCandidateService(repository, sourceService, productRuleService);
        service.review(2L, ReviewAction.APPROVE, null, null, null);

        assertThat(incoming.getReviewStatus()).isEqualTo(ReviewStatus.NEED_REVIEW);
        assertThat(existing.getReviewStatus()).isEqualTo(ReviewStatus.NEED_REVIEW);
    }

    private RuleCandidate candidate(SourceDocument source, String value) {
        return new RuleCandidate(source, "DEMO", "RESIDENCY_MONTHS", "GTE", value,
                RuleLevel.HARD, "official excerpt", new BigDecimal("0.90"));
    }
}
