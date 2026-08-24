package com.visafy.eligibility;

import java.util.Locale;

final class EligibilityMessages {
    private final String language;

    EligibilityMessages(String language) {
        this.language = switch (language == null ? "ko" : language.toLowerCase(Locale.ROOT)) {
            case "en", "vi" -> language.toLowerCase(Locale.ROOT);
            default -> "ko";
        };
    }

    String passed(String key, String actual, String expected) {
        return switch (language) {
            case "en" -> "%s condition met (current: %s, required: %s).".formatted(label(key), actual, expected);
            case "vi" -> "Đã đáp ứng điều kiện %s (hiện tại: %s, yêu cầu: %s).".formatted(label(key), actual, expected);
            default -> "%s 조건을 충족했습니다. (현재값: %s, 기준: %s)".formatted(label(key), actual, expected);
        };
    }

    String failed(String key, String actual, String expected) {
        return switch (language) {
            case "en" -> "%s condition not met (current: %s, required: %s).".formatted(label(key), actual, expected);
            case "vi" -> "Chưa đáp ứng điều kiện %s (hiện tại: %s, yêu cầu: %s).".formatted(label(key), actual, expected);
            default -> "%s 조건을 충족하지 못했습니다. (현재값: %s, 기준: %s)".formatted(label(key), actual, expected);
        };
    }

    String external(String description) {
        return switch (language) {
            case "en" -> "%s This must be confirmed by the bank or an external institution.".formatted(description);
            case "vi" -> "%s Cần được ngân hàng hoặc tổ chức bên ngoài xác nhận.".formatted(description);
            default -> "%s 은행 또는 외부 기관의 확인이 필요합니다.".formatted(description);
        };
    }

    String unknown(String excerpt, String visaType) {
        return switch (language) {
            case "en" -> "The official information states “%s”, but the detailed criteria are not public. The bank must confirm the result for visa %s."
                    .formatted(excerpt, visaType);
            case "vi" -> "Thông tin chính thức nêu “%s”, nhưng tiêu chí chi tiết không được công khai. Ngân hàng cần xác nhận kết quả cho visa %s."
                    .formatted(excerpt, visaType);
            default -> "공식 상품정보에는 “%s”가 명시되어 있으나 세부 기준이 공개되어 있지 않습니다. 현재 %s 비자에 대한 최종 판단은 은행 확인이 필요합니다."
                    .formatted(excerpt, visaType);
        };
    }

    String insufficient(InsufficientReasonCode code, String key) {
        return switch (language) {
            case "en" -> switch (code) {
                case SOURCE_INSUFFICIENT -> "The product exists, but approved official eligibility sources are insufficient for an automated pre-check.";
                case MISSING_REQUIRED_PROFILE_FIELD -> "Profile input required for %s is missing.".formatted(label(key));
                case SOURCE_CONFLICT -> "Official sources conflict for rule %s.".formatted(key);
                case RULE_REVIEW_INCOMPLETE -> "Rule review is not complete for %s.".formatted(key);
                case UNSUPPORTED_RULE_KEY -> "Rule %s cannot yet be evaluated by the engine.".formatted(key);
                case INVALID_RULE_VALUE -> "The configured value for rule %s is invalid.".formatted(key);
                case EXPIRED_RULE -> "Rule %s has expired and must be reviewed again.".formatted(key);
            };
            case "vi" -> switch (code) {
                case SOURCE_INSUFFICIENT -> "Sản phẩm có tồn tại, nhưng chưa đủ nguồn điều kiện chính thức đã duyệt để kiểm tra tự động.";
                case MISSING_REQUIRED_PROFILE_FIELD -> "Thiếu thông tin hồ sơ cần thiết cho %s.".formatted(label(key));
                case SOURCE_CONFLICT -> "Các nguồn chính thức mâu thuẫn đối với quy tắc %s.".formatted(key);
                case RULE_REVIEW_INCOMPLETE -> "Việc kiểm duyệt quy tắc %s chưa hoàn tất.".formatted(key);
                case UNSUPPORTED_RULE_KEY -> "Hệ thống chưa thể đánh giá quy tắc %s.".formatted(key);
                case INVALID_RULE_VALUE -> "Giá trị cấu hình của quy tắc %s không hợp lệ.".formatted(key);
                case EXPIRED_RULE -> "Quy tắc %s đã hết hiệu lực và cần được kiểm duyệt lại.".formatted(key);
            };
            default -> switch (code) {
                case SOURCE_INSUFFICIENT -> "상품 존재는 확인됐지만 승인된 공식 가입조건 Source가 부족하여 자동 진단할 수 없습니다.";
                case MISSING_REQUIRED_PROFILE_FIELD -> "%s 판정에 필요한 필수 프로필 입력이 없습니다.".formatted(label(key));
                case SOURCE_CONFLICT -> "%s Rule의 공식 Source 조건이 서로 충돌합니다.".formatted(key);
                case RULE_REVIEW_INCOMPLETE -> "%s Rule 검수가 완료되지 않았습니다.".formatted(key);
                case UNSUPPORTED_RULE_KEY -> "%s Rule은 현재 엔진에서 평가할 수 없습니다.".formatted(key);
                case INVALID_RULE_VALUE -> "%s Rule에 설정된 값의 형식이 올바르지 않습니다.".formatted(key);
                case EXPIRED_RULE -> "%s Rule이 만료되어 다시 검수해야 합니다.".formatted(key);
            };
        };
    }

    String optionalUnsupported(String key) {
        return switch (language) {
            case "en" -> "Optional rule %s is not supported by the engine and was not used in the final status.".formatted(key);
            case "vi" -> "Quy tắc tùy chọn %s chưa được hệ thống hỗ trợ và không ảnh hưởng đến trạng thái cuối cùng.".formatted(key);
            default -> "선택 Rule %s은 현재 엔진에서 지원하지 않아 최종 상태에는 반영하지 않았습니다.".formatted(key);
        };
    }

    String sourceMissing(String key) {
        return switch (language) {
            case "en" -> "No approved official Source is registered for %s, so this condition remains UNKNOWN."
                    .formatted(label(key));
            case "vi" -> "Chưa đăng ký Source chính thức đã duyệt cho %s, vì vậy điều kiện này vẫn là UNKNOWN."
                    .formatted(label(key));
            default -> "%s 조건에 승인된 공식 Source가 등록되지 않아 UNKNOWN으로 유지합니다."
                    .formatted(label(key));
        };
    }

    String disclaimer() {
        return switch (language) {
            case "en" -> "This is a preliminary check based only on public conditions, not final approval. The bank makes the final decision.";
            case "vi" -> "Đây chỉ là kiểm tra sơ bộ dựa trên điều kiện công khai, không phải phê duyệt cuối cùng. Ngân hàng đưa ra quyết định cuối cùng.";
            default -> "본 결과는 입력된 정보와 공개된 공식 금융정보를 기반으로 한 사전자격 안내이며 실제 가입 여부와 한도·금리는 금융기관의 최종 심사 결과에 따라 달라질 수 있습니다.";
        };
    }

    private String label(String key) {
        return switch (key) {
            case "AGE" -> switch (language) { case "en" -> "age"; case "vi" -> "tuổi"; default -> "만 나이"; };
            case "VISA_TYPE" -> switch (language) { case "en" -> "visa type"; case "vi" -> "loại visa"; default -> "비자 유형"; };
            case "VISA_REMAINING_MONTH" -> switch (language) { case "en" -> "remaining visa period"; case "vi" -> "thời hạn visa còn lại"; default -> "비자 잔여기간"; };
            case "RESIDENCY_MONTH", "RESIDENCE_MONTHS" -> switch (language) { case "en" -> "residency period"; case "vi" -> "thời gian cư trú"; default -> "국내 체류기간"; };
            case "DOMESTIC_INCOME_MONTH", "EMPLOYMENT_DURATION_MONTHS", "EMPLOYMENT_MONTHS" -> switch (language) { case "en" -> "employment period"; case "vi" -> "thời gian làm việc"; default -> "근속기간"; };
            case "MONTHLY_INCOME" -> switch (language) { case "en" -> "monthly income"; case "vi" -> "thu nhập hàng tháng"; default -> "월 소득"; };
            case "IS_FOREIGNER" -> switch (language) { case "en" -> "foreign nationality"; case "vi" -> "quốc tịch nước ngoài"; default -> "외국인 여부"; };
            case "RESIDENT_STATUS" -> switch (language) { case "en" -> "resident status"; case "vi" -> "tình trạng cư trú"; default -> "거주자 구분"; };
            case "HAS_EXISTING_PRODUCT_ACCOUNT" -> switch (language) { case "en" -> "existing account for this product"; case "vi" -> "tài khoản hiện có của sản phẩm này"; default -> "동일 상품 계좌 보유 여부"; };
            case "DESIRED_MONTHLY_AMOUNT" -> switch (language) { case "en" -> "desired monthly amount"; case "vi" -> "số tiền mong muốn hàng tháng"; default -> "월 납입 희망액"; };
            default -> key;
        };
    }
}
