package com.visafy.access;

import com.visafy.access.AccessAssessment.AccessAvailability;
import com.visafy.access.AccessAssessment.AccessDetail;
import com.visafy.common.domain.ReviewStatus;
import com.visafy.product.FinancialProduct;
import com.visafy.profile.TempProfile;
import com.visafy.rule.RuleCandidate;
import com.visafy.rule.RuleCandidateRepository;
import com.visafy.rule.RuleNature;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class AccessAssessmentService {
    private final RuleCandidateRepository repository;

    public AccessAssessmentService(RuleCandidateRepository repository) {
        this.repository = repository;
    }

    public AccessAssessment assess(TempProfile profile, FinancialProduct product) {
        LocalDate today = LocalDate.now();
        List<RuleCandidate> approved = repository.findByProductCodeOrderByCreatedAtDesc(product.getProductCode())
                .stream().filter(candidate -> candidate.getReviewStatus() == ReviewStatus.APPROVED)
                .filter(candidate -> candidate.getSourceDocument().isEffective(today))
                .filter(candidate -> within(candidate, today)).toList();

        boolean realNameOnly = approved.stream().anyMatch(this::mentionsRealNameIndividual)
                && approved.stream().noneMatch(this::explicitlySupportsForeignerAccess);
        List<AccessDetail> details = new ArrayList<>();
        AccessAvailability identification = availability(approved, RuleNature.IDENTIFICATION_METHOD);
        AccessAvailability branch = channelAvailability(approved, true);
        AccessAvailability online = channelAvailability(approved, false);

        approved.stream().filter(candidate -> !candidate.getRuleNature().affectsEligibility())
                .forEach(candidate -> details.add(detail(candidate, profile.getLanguage())));

        if (realNameOnly) {
            details.add(new AccessDetail("GUARDRAIL", "REAL_NAME_INDIVIDUAL",
                    "REAL_NAME_INDIVIDUAL_NOT_FOREIGNER_PROOF",
                    message(profile.getLanguage(),
                            "'실명의 개인' 문구만으로 외국인 이용 가능 여부를 확정할 수 없습니다.",
                            "The phrase 'real-name individual' alone does not prove access for foreign customers.",
                            "Chỉ cụm từ 'cá nhân có danh tính thực' không đủ để xác nhận người nước ngoài có thể sử dụng.",
                            "仅凭“实名个人”这一表述，无法确定外国人是否可以使用。",
                            "「実名の個人」という表現だけでは、外国人が利用できるかどうかを確定できません。",
                            "เพียงข้อความว่า 'บุคคลที่ยืนยันตัวตนจริง' ไม่สามารถยืนยันได้ว่าชาวต่างชาติใช้บริการได้หรือไม่"),
                    null, null, product.getSourceDocument().getSourceUrl()));
            return new AccessAssessment(AccessStatus.ACCESS_UNKNOWN, AccessAvailability.NEED_CONFIRMATION,
                    branch, online, List.copyOf(details), true);
        }

        boolean confirmation = approved.stream().anyMatch(candidate ->
                candidate.getRuleNature() == RuleNature.EXTERNAL_CHECK
                        && concernsAccess(candidate));
        boolean documents = approved.stream().anyMatch(candidate ->
                candidate.getRuleNature() == RuleNature.REQUIRED_DOCUMENT);
        boolean branchOnly = branch == AccessAvailability.AVAILABLE
                && approved.stream().anyMatch(this::explicitlyBranchOnly);

        AccessStatus status;
        if (confirmation) status = AccessStatus.ACCESS_NEED_CONFIRMATION;
        else if (documents) status = AccessStatus.ACCESS_ADDITIONAL_DOCUMENTS;
        else if (online == AccessAvailability.AVAILABLE) status = AccessStatus.ACCESS_READY_ONLINE;
        else if (branchOnly) status = AccessStatus.ACCESS_READY_BRANCH_ONLY;
        else if (identification == AccessAvailability.AVAILABLE || branch == AccessAvailability.AVAILABLE)
            status = AccessStatus.ACCESS_READY;
        else status = AccessStatus.ACCESS_UNKNOWN;
        return new AccessAssessment(status, identification, branch, online, List.copyOf(details), false);
    }

    private boolean within(RuleCandidate candidate, LocalDate today) {
        return (candidate.getValidFrom() == null || !candidate.getValidFrom().isAfter(today))
                && (candidate.getValidTo() == null || !candidate.getValidTo().isBefore(today));
    }

    private AccessAvailability availability(List<RuleCandidate> candidates, RuleNature nature) {
        return candidates.stream().anyMatch(candidate -> candidate.getRuleNature() == nature)
                ? AccessAvailability.AVAILABLE : AccessAvailability.UNKNOWN;
    }

    private AccessAvailability channelAvailability(List<RuleCandidate> candidates, boolean branch) {
        boolean found = candidates.stream().filter(candidate -> candidate.getRuleNature() == RuleNature.CHANNEL_REQUIREMENT)
                .anyMatch(candidate -> branch ? concernsBranch(candidate)
                        : concernsOnline(candidate) && explicitlySupportsForeignerAccess(candidate));
        return found ? AccessAvailability.AVAILABLE : AccessAvailability.UNKNOWN;
    }

    private boolean mentionsRealNameIndividual(RuleCandidate candidate) {
        return combined(candidate).contains("실명의 개인") || combined(candidate).contains("REAL-NAME INDIVIDUAL");
    }

    private boolean explicitlySupportsForeignerAccess(RuleCandidate candidate) {
        String key = candidate.getRuleKey().toUpperCase(Locale.ROOT);
        String evidence = combined(candidate);
        if (containsUnconfirmedOrNegativeAccess(evidence)) return false;
        return key.equals("NATIONALITY") || key.equals("IS_FOREIGNER") || key.equals("FOREIGNER_ALLOWED")
                || evidence.contains("외국인") || evidence.contains("FOREIGNER");
    }

    private boolean containsUnconfirmedOrNegativeAccess(String evidence) {
        return evidence.contains("UNKNOWN") || evidence.contains("UNVERIFIED")
                || evidence.contains("NOT CONFIRMED") || evidence.contains("NEED_CONFIRMATION")
                || evidence.contains("확인 필요") || evidence.contains("미확인")
                || evidence.contains("확정하지 않") || evidence.contains("어렵습니다")
                || evidence.contains("이용 불가") || evidence.contains("가입 불가");
    }

    private boolean concernsAccess(RuleCandidate candidate) {
        String value = combined(candidate);
        return value.contains("IDENT") || value.contains("신분") || value.contains("CHANNEL")
                || value.contains("영업점") || value.contains("ONLINE") || value.contains("MOBILE") || value.contains("비대면");
    }

    private boolean concernsBranch(RuleCandidate candidate) {
        String value = combined(candidate);
        return value.contains("BRANCH") || value.contains("영업점") || value.contains("방문");
    }

    private boolean concernsOnline(RuleCandidate candidate) {
        String value = combined(candidate);
        return value.contains("ONLINE") || value.contains("MOBILE") || value.contains("APP") || value.contains("비대면");
    }

    private boolean explicitlyBranchOnly(RuleCandidate candidate) {
        if (candidate.getRuleNature() != RuleNature.CHANNEL_REQUIREMENT) return false;
        String value = combined(candidate);
        return value.contains("BRANCH_ONLY") || value.contains("BRANCH_REQUIRED")
                || value.contains("영업점 전용") || value.contains("영업점에서만") || value.contains("방문 필수");
    }

    private String combined(RuleCandidate candidate) {
        return (candidate.getRuleKey() + " " + candidate.getRuleValue() + " "
                + candidate.getSourceExcerpt() + " " + candidate.getDescription()).toUpperCase(Locale.ROOT);
    }

    private AccessDetail detail(RuleCandidate candidate, String language) {
        String category = candidate.getRuleNature().name();
        return new AccessDetail(category, candidate.getRuleKey(), "OFFICIAL_ACCESS_EVIDENCE",
                message(language, "공식 자료에 확인된 이용 방법입니다.",
                        "This access method is confirmed by an official source.",
                        "Cách sử dụng này được xác nhận trong nguồn chính thức.",
                        "这是官方资料中已确认的使用方法。",
                        "公式資料で確認された利用方法です。",
                        "เป็นวิธีการใช้บริการที่ยืนยันจากเอกสารอย่างเป็นทางการ"),
                candidate.getSourceExcerpt(), candidate.getSourceLocator(),
                candidate.getSourceDocument().getSourceUrl());
    }

    private String message(String language, String ko, String en, String vi, String zh, String ja, String th) {
        return switch (language == null ? "ko" : language.toLowerCase(Locale.ROOT)) {
            case "en" -> en;
            case "vi" -> vi;
            case "zh" -> zh;
            case "ja" -> ja;
            case "th" -> th;
            default -> ko;
        };
    }
}
