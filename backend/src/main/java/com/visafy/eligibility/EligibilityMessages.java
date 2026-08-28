package com.visafy.eligibility;

import java.util.Locale;

final class EligibilityMessages {
    private final String language;

    EligibilityMessages(String language) {
        this.language = switch (language == null ? "ko" : language.toLowerCase(Locale.ROOT)) {
            case "en", "vi", "zh", "ja", "th" -> language.toLowerCase(Locale.ROOT);
            default -> "ko";
        };
    }

    String passed(String key, String actual, String expected) {
        return switch (language) {
            case "en" -> "%s condition met (current: %s, required: %s).".formatted(label(key), actual, expected);
            case "vi" -> "Đã đáp ứng điều kiện %s (hiện tại: %s, yêu cầu: %s).".formatted(label(key), actual, expected);
            case "zh" -> "已满足%s条件。(当前值：%s，标准：%s)".formatted(label(key), actual, expected);
            case "ja" -> "%sの条件を満たしています。(現在の値：%s、基準：%s)".formatted(label(key), actual, expected);
            case "th" -> "ตรงตามเงื่อนไข %s แล้ว (ค่าปัจจุบัน: %s, เกณฑ์: %s)".formatted(label(key), actual, expected);
            default -> "%s 조건을 충족했습니다. (현재값: %s, 기준: %s)".formatted(label(key), actual, expected);
        };
    }

    String failed(String key, String actual, String expected) {
        return switch (language) {
            case "en" -> "%s condition not met (current: %s, required: %s).".formatted(label(key), actual, expected);
            case "vi" -> "Chưa đáp ứng điều kiện %s (hiện tại: %s, yêu cầu: %s).".formatted(label(key), actual, expected);
            case "zh" -> "未满足%s条件。(当前值：%s，标准：%s)".formatted(label(key), actual, expected);
            case "ja" -> "%sの条件を満たしていません。(現在の値：%s、基準：%s)".formatted(label(key), actual, expected);
            case "th" -> "ยังไม่ตรงตามเงื่อนไข %s (ค่าปัจจุบัน: %s, เกณฑ์: %s)".formatted(label(key), actual, expected);
            default -> "%s 조건을 충족하지 못했습니다. (현재값: %s, 기준: %s)".formatted(label(key), actual, expected);
        };
    }

    String external(String description) {
        return switch (language) {
            case "en" -> "%s This must be confirmed by the bank or an external institution.".formatted(description);
            case "vi" -> "%s Cần được ngân hàng hoặc tổ chức bên ngoài xác nhận.".formatted(description);
            case "zh" -> "%s 需要银行或外部机构确认。".formatted(description);
            case "ja" -> "%s 銀行または外部機関の確認が必要です。".formatted(description);
            case "th" -> "%s ต้องได้รับการยืนยันจากธนาคารหรือหน่วยงานภายนอก".formatted(description);
            default -> "%s 은행 또는 외부 기관의 확인이 필요합니다.".formatted(description);
        };
    }

    String unknown(String key, String excerpt, String visaType) {
        boolean visaRelated = key != null && key.toUpperCase(Locale.ROOT).contains("VISA");
        boolean hasVisa = visaType != null && !visaType.isBlank();
        if (!visaRelated || !hasVisa) {
            return switch (language) {
                case "en" -> "The official information states “%s”, but the detailed criteria are not public. The financial institution must confirm this condition."
                        .formatted(excerpt);
                case "vi" -> "Thông tin chính thức nêu “%s”, nhưng tiêu chí chi tiết không được công khai. Tổ chức tài chính cần xác nhận điều kiện này."
                        .formatted(excerpt);
                case "zh" -> "官方产品信息中载明“%s”，但未公开详细标准。该条件需要金融机构确认。"
                        .formatted(excerpt);
                case "ja" -> "公式の商品情報には「%s」と記載されていますが、詳細な基準は公開されていません。この条件は金融機関の確認が必要です。"
                        .formatted(excerpt);
                case "th" -> "ข้อมูลผลิตภัณฑ์อย่างเป็นทางการระบุว่า “%s” แต่ไม่ได้เปิดเผยเกณฑ์โดยละเอียด เงื่อนไขนี้ต้องได้รับการยืนยันจากสถาบันการเงิน"
                        .formatted(excerpt);
                default -> "공식 상품정보에는 “%s”가 명시되어 있으나 세부 기준이 공개되어 있지 않습니다. 해당 조건은 금융기관 확인이 필요합니다."
                        .formatted(excerpt);
            };
        }
        return switch (language) {
            case "en" -> "The official information states “%s”, but the detailed criteria are not public. The bank must confirm the result for visa %s."
                    .formatted(excerpt, visaType);
            case "vi" -> "Thông tin chính thức nêu “%s”, nhưng tiêu chí chi tiết không được công khai. Ngân hàng cần xác nhận kết quả cho visa %s."
                    .formatted(excerpt, visaType);
            case "zh" -> "官方产品信息中载明“%s”，但未公开详细标准。目前 %s 签证的最终判断需要银行确认。"
                    .formatted(excerpt, visaType);
            case "ja" -> "公式の商品情報には「%s」と記載されていますが、詳細な基準は公開されていません。現在の %s ビザについての最終判断は銀行の確認が必要です。"
                    .formatted(excerpt, visaType);
            case "th" -> "ข้อมูลผลิตภัณฑ์อย่างเป็นทางการระบุว่า “%s” แต่ไม่ได้เปิดเผยเกณฑ์โดยละเอียด การตัดสินขั้นสุดท้ายสำหรับวีซ่า %s ต้องได้รับการยืนยันจากธนาคาร"
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
            case "zh" -> switch (code) {
                case SOURCE_INSUFFICIENT -> "已确认产品存在，但已审核的官方加入条件来源不足，无法自动诊断。";
                case MISSING_REQUIRED_PROFILE_FIELD -> "缺少判断%s所需的必填资料。".formatted(label(key));
                case SOURCE_CONFLICT -> "%s 规则的官方来源条件相互冲突。".formatted(key);
                case RULE_REVIEW_INCOMPLETE -> "%s 规则的审核尚未完成。".formatted(key);
                case UNSUPPORTED_RULE_KEY -> "目前引擎无法评估 %s 规则。".formatted(key);
                case INVALID_RULE_VALUE -> "%s 规则设定的值格式不正确。".formatted(key);
                case EXPIRED_RULE -> "%s 规则已过期，需要重新审核。".formatted(key);
            };
            case "ja" -> switch (code) {
                case SOURCE_INSUFFICIENT -> "商品の存在は確認できましたが、承認済みの公式加入条件ソースが不足しているため自動診断できません。";
                case MISSING_REQUIRED_PROFILE_FIELD -> "%sの判定に必要な必須プロフィール入力がありません。".formatted(label(key));
                case SOURCE_CONFLICT -> "%sルールの公式ソース条件が互いに矛盾しています。".formatted(key);
                case RULE_REVIEW_INCOMPLETE -> "%sルールの審査が完了していません。".formatted(key);
                case UNSUPPORTED_RULE_KEY -> "%sルールは現在のエンジンでは評価できません。".formatted(key);
                case INVALID_RULE_VALUE -> "%sルールに設定された値の形式が正しくありません。".formatted(key);
                case EXPIRED_RULE -> "%sルールは有効期限が切れているため、再審査が必要です。".formatted(key);
            };
            case "th" -> switch (code) {
                case SOURCE_INSUFFICIENT -> "ยืนยันว่ามีผลิตภัณฑ์นี้อยู่ แต่แหล่งข้อมูลเงื่อนไขการสมัครอย่างเป็นทางการที่ผ่านการตรวจสอบยังไม่เพียงพอสำหรับการวินิจฉัยอัตโนมัติ";
                case MISSING_REQUIRED_PROFILE_FIELD -> "ไม่มีข้อมูลโปรไฟล์ที่จำเป็นสำหรับการประเมิน %s".formatted(label(key));
                case SOURCE_CONFLICT -> "เงื่อนไขจากแหล่งข้อมูลอย่างเป็นทางการของกฎ %s ขัดแย้งกัน".formatted(key);
                case RULE_REVIEW_INCOMPLETE -> "การตรวจสอบกฎ %s ยังไม่เสร็จสิ้น".formatted(key);
                case UNSUPPORTED_RULE_KEY -> "ระบบยังไม่สามารถประเมินกฎ %s ได้".formatted(key);
                case INVALID_RULE_VALUE -> "รูปแบบค่าที่ตั้งไว้สำหรับกฎ %s ไม่ถูกต้อง".formatted(key);
                case EXPIRED_RULE -> "กฎ %s หมดอายุแล้วและต้องได้รับการตรวจสอบใหม่".formatted(key);
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
            case "zh" -> "可选规则 %s 目前引擎不支持，未反映在最终状态中。".formatted(key);
            case "ja" -> "任意ルール %s は現在のエンジンでは対応しておらず、最終ステータスには反映していません。".formatted(key);
            case "th" -> "กฎเสริม %s ยังไม่รองรับในระบบ จึงไม่ถูกนำมาใช้ในสถานะสุดท้าย".formatted(key);
            default -> "선택 Rule %s은 현재 엔진에서 지원하지 않아 최종 상태에는 반영하지 않았습니다.".formatted(key);
        };
    }

    String sourceMissing(String key) {
        return switch (language) {
            case "en" -> "No approved official Source is registered for %s, so this condition remains UNKNOWN."
                    .formatted(label(key));
            case "vi" -> "Chưa đăng ký Source chính thức đã duyệt cho %s, vì vậy điều kiện này vẫn là UNKNOWN."
                    .formatted(label(key));
            case "zh" -> "%s 条件未登记已审核的官方来源，因此保持为 UNKNOWN。"
                    .formatted(label(key));
            case "ja" -> "%s の条件に承認済みの公式ソースが登録されていないため、UNKNOWN のままとします。"
                    .formatted(label(key));
            case "th" -> "เงื่อนไข %s ยังไม่มีการลงทะเบียนแหล่งข้อมูลอย่างเป็นทางการที่ผ่านการอนุมัติ จึงคงสถานะเป็น UNKNOWN"
                    .formatted(label(key));
            default -> "%s 조건에 승인된 공식 Source가 등록되지 않아 UNKNOWN으로 유지합니다."
                    .formatted(label(key));
        };
    }

    String disclaimer() {
        return switch (language) {
            case "en" -> "This is a preliminary check based only on public conditions, not final approval. The bank makes the final decision.";
            case "vi" -> "Đây chỉ là kiểm tra sơ bộ dựa trên điều kiện công khai, không phải phê duyệt cuối cùng. Ngân hàng đưa ra quyết định cuối cùng.";
            case "zh" -> "本结果是基于所填信息与公开的官方金融信息提供的资格预先指引，实际能否加入以及额度与利率将取决于金融机构的最终审核结果。";
            case "ja" -> "本結果は入力された情報と公開されている公式金融情報に基づく事前資格のご案内であり、実際の加入可否や限度額・金利は金融機関の最終審査結果によって異なる場合があります。";
            case "th" -> "ผลลัพธ์นี้เป็นการแนะนำคุณสมบัติเบื้องต้นจากข้อมูลที่กรอกและข้อมูลทางการเงินอย่างเป็นทางการที่เปิดเผย การสมัครได้จริง วงเงิน และอัตราดอกเบี้ย ขึ้นอยู่กับผลการพิจารณาขั้นสุดท้ายของสถาบันการเงิน";
            default -> "본 결과는 입력된 정보와 공개된 공식 금융정보를 기반으로 한 사전자격 안내이며 실제 가입 여부와 한도·금리는 금융기관의 최종 심사 결과에 따라 달라질 수 있습니다.";
        };
    }

    private String label(String key) {
        return switch (key) {
            case "AGE" -> switch (language) { case "en" -> "age"; case "vi" -> "tuổi"; case "zh" -> "年龄"; case "ja" -> "満年齢"; case "th" -> "อายุ"; default -> "만 나이"; };
            case "VISA_TYPE" -> switch (language) { case "en" -> "visa type"; case "vi" -> "loại visa"; case "zh" -> "签证类型"; case "ja" -> "ビザの種類"; case "th" -> "ประเภทวีซ่า"; default -> "비자 유형"; };
            case "VISA_REMAINING_MONTH" -> switch (language) { case "en" -> "remaining visa period"; case "vi" -> "thời hạn visa còn lại"; case "zh" -> "签证剩余期限"; case "ja" -> "ビザ残存期間"; case "th" -> "ระยะเวลาวีซ่าที่เหลือ"; default -> "비자 잔여기간"; };
            case "RESIDENCY_MONTH", "RESIDENCE_MONTHS" -> switch (language) { case "en" -> "residency period"; case "vi" -> "thời gian cư trú"; case "zh" -> "在韩居留期间"; case "ja" -> "韓国滞在期間"; case "th" -> "ระยะเวลาพำนักในเกาหลี"; default -> "국내 체류기간"; };
            case "DOMESTIC_INCOME_MONTH", "EMPLOYMENT_DURATION_MONTHS", "EMPLOYMENT_MONTHS" -> switch (language) { case "en" -> "employment period"; case "vi" -> "thời gian làm việc"; case "zh" -> "在职期间"; case "ja" -> "勤続期間"; case "th" -> "ระยะเวลาทำงาน"; default -> "근속기간"; };
            case "MONTHLY_INCOME" -> switch (language) { case "en" -> "monthly income"; case "vi" -> "thu nhập hàng tháng"; case "zh" -> "月收入"; case "ja" -> "月収"; case "th" -> "รายได้ต่อเดือน"; default -> "월 소득"; };
            case "IS_FOREIGNER" -> switch (language) { case "en" -> "foreign nationality"; case "vi" -> "quốc tịch nước ngoài"; case "zh" -> "是否为外国人"; case "ja" -> "外国人かどうか"; case "th" -> "สถานะชาวต่างชาติ"; default -> "외국인 여부"; };
            case "RESIDENT_STATUS" -> switch (language) { case "en" -> "resident status"; case "vi" -> "tình trạng cư trú"; case "zh" -> "居住者身份"; case "ja" -> "居住者区分"; case "th" -> "สถานะผู้พำนัก"; default -> "거주자 구분"; };
            case "HAS_EXISTING_PRODUCT_ACCOUNT" -> switch (language) { case "en" -> "existing account for this product"; case "vi" -> "tài khoản hiện có của sản phẩm này"; case "zh" -> "是否已持有同一产品账户"; case "ja" -> "同一商品の口座保有状況"; case "th" -> "การถือบัญชีผลิตภัณฑ์เดียวกัน"; default -> "동일 상품 계좌 보유 여부"; };
            case "DESIRED_MONTHLY_AMOUNT" -> switch (language) { case "en" -> "desired monthly amount"; case "vi" -> "số tiền mong muốn hàng tháng"; case "zh" -> "每月希望存入金额"; case "ja" -> "月々の希望積立額"; case "th" -> "จำนวนเงินฝากรายเดือนที่ต้องการ"; default -> "월 납입 희망액"; };
            default -> key;
        };
    }
}
