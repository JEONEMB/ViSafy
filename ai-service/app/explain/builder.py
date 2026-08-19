from app.explain.models import BankInquiry, EasyTerm, ExplanationRequest, ExplanationResponse

GUARDRAILS = [
    "ELIGIBILITY_RESULT_IMMUTABLE",
    "NO_APPROVAL_GUARANTEE",
    "STRUCTURED_NUMBERS_ONLY",
    "STRUCTURED_VISA_CODE_ONLY",
    "UNKNOWN_REQUIRES_CONFIRMATION",
]


GLOSSARY = {
    "STATUS_OF_STAY": {
        "ko": (
            "체류자격",
            "체류자격",
            "대한민국에 머물 수 있는 목적과 활동 범위를 정한 자격입니다.",
        ),
        "en": (
            "체류자격",
            "Status of Stay",
            "The legal category that defines why you may stay in Korea and which activities are allowed.",
        ),
        "vi": (
            "체류자격",
            "Tư cách lưu trú",
            "Loại tư cách pháp lý quy định mục đích lưu trú và hoạt động được phép tại Hàn Quốc.",
        ),
    },
    "PROOF_OF_INCOME": {
        "ko": (
            "소득증빙",
            "소득증빙",
            "급여명세서나 소득금액증명처럼 실제 소득을 확인하는 자료입니다.",
        ),
        "en": (
            "소득증빙",
            "Proof of Income",
            "Documents such as payslips or income certificates that show your actual income.",
        ),
        "vi": (
            "소득증빙",
            "Chứng minh thu nhập",
            "Tài liệu như phiếu lương hoặc giấy xác nhận thu nhập để chứng minh thu nhập thực tế.",
        ),
    },
    "GUARANTEE_INSURANCE_CERTIFICATE": {
        "ko": (
            "보증보험증권",
            "보증보험증권",
            "대출금을 갚지 못하는 상황에 대비해 보증기관이 일정한 보증을 제공하는 절차입니다.",
        ),
        "en": (
            "보증보험증권",
            "Guarantee Insurance Certificate",
            "A guarantee agency provides coverage for part of the risk if a borrower cannot repay.",
        ),
        "vi": (
            "보증보험증권",
            "Chứng thư bảo hiểm bảo lãnh",
            "Tổ chức bảo lãnh bảo đảm một phần rủi ro trong trường hợp người vay không thể hoàn trả.",
        ),
    },
    "INTERNAL_CREDIT_REVIEW": {
        "ko": (
            "은행 내부 신용평가",
            "은행 내부 신용평가",
            "은행이 소득, 거래정보와 상환 가능성 등을 자체 기준으로 확인하는 심사입니다.",
        ),
        "en": (
            "은행 내부 신용평가",
            "Bank Internal Credit Review",
            "The bank checks income, transaction information, and repayment ability using its own criteria.",
        ),
        "vi": (
            "은행 내부 신용평가",
            "Đánh giá tín dụng nội bộ của ngân hàng",
            "Ngân hàng đánh giá thu nhập, giao dịch và khả năng hoàn trả theo tiêu chí nội bộ.",
        ),
    },
}


class ExplanationBuilder:
    def build(self, request: ExplanationRequest) -> ExplanationResponse:
        return ExplanationResponse(
            explanation=self._explanation(request),
            disclaimer=self._disclaimer(request.language),
            easyTerms=self._terms(request),
            inquiry=self._inquiry(request),
            guardrailsApplied=GUARDRAILS,
        )

    def _explanation(self, request: ExplanationRequest) -> str:
        status = request.eligibility_status
        language = request.language
        if language == "en":
            messages = {
                "PUBLIC_CONDITIONS_MET": f"Based on your information, all {request.passed_count} evaluated public conditions were met. The result may still change after the bank's internal review and additional checks.",
                "NEED_BANK_CONFIRMATION": f"No evaluated public condition failed, and {request.passed_count} conditions were met. However, some conditions require confirmation by {request.institution}.",
                "PUBLIC_CONDITIONS_NOT_MET": f"Based on your information, {request.failed_count} evaluated public conditions were not met. Review each condition and the official source before applying.",
                "INSUFFICIENT_INFORMATION": "There is not enough reviewed public information to make a preliminary determination. Additional profile, Rule, or Source verification is required.",
            }
            return messages[status]
        if language == "vi":
            messages = {
                "PUBLIC_CONDITIONS_MET": f"Theo thông tin đã nhập, bạn đáp ứng toàn bộ {request.passed_count} điều kiện công khai đã được đánh giá. Kết quả vẫn có thể thay đổi sau thẩm định nội bộ và xác nhận bổ sung của ngân hàng.",
                "NEED_BANK_CONFIRMATION": f"Không có điều kiện công khai nào bị đánh giá là không đạt và đã đáp ứng {request.passed_count} điều kiện. Tuy nhiên, một số điều kiện cần được {request.institution} xác nhận.",
                "PUBLIC_CONDITIONS_NOT_MET": f"Theo thông tin đã nhập, có {request.failed_count} điều kiện công khai chưa được đáp ứng. Hãy kiểm tra từng điều kiện và nguồn chính thức trước khi đăng ký.",
                "INSUFFICIENT_INFORMATION": "Chưa có đủ thông tin công khai đã kiểm duyệt để đưa ra kết quả sơ bộ. Cần bổ sung hồ sơ hoặc kiểm tra thêm Rule và Source.",
            }
            return messages[status]
        messages = {
            "PUBLIC_CONDITIONS_MET": f"입력하신 정보 기준으로 확인 가능한 공개조건 {request.passed_count}개를 모두 충족했습니다. 다만 실제 신청 시 은행 내부심사와 추가 확인 절차에 따라 결과가 달라질 수 있습니다.",
            "NEED_BANK_CONFIRMATION": f"확인 가능한 공개조건에서 명시적인 미충족은 없고 {request.passed_count}개 조건을 충족했습니다. 다만 일부 조건은 {request.institution}의 확인이 필요합니다.",
            "PUBLIC_CONDITIONS_NOT_MET": f"입력하신 정보 기준으로 공개조건 중 {request.failed_count}개를 충족하지 못했습니다. 신청 전 각 조건과 공식 출처를 확인해 주세요.",
            "INSUFFICIENT_INFORMATION": "현재 검수된 공개정보만으로는 사전 판단에 필요한 정보가 충분하지 않습니다. 프로필 입력 또는 Rule과 Source의 추가 검수가 필요합니다.",
        }
        return messages[status]

    def _terms(self, request: ExplanationRequest) -> list[EasyTerm]:
        language = request.language
        result: list[EasyTerm] = []
        for key in dict.fromkeys(request.term_keys):
            translations = GLOSSARY.get(key)
            if not translations:
                continue
            korean, localized, explanation = translations[language]
            result.append(
                EasyTerm(
                    key=key,
                    koreanTerm=korean,
                    localizedTerm=localized,
                    explanation=explanation,
                )
            )
        return result

    def _inquiry(self, request: ExplanationRequest) -> BankInquiry | None:
        conditions = request.external_conditions + request.unknown_conditions
        if not conditions:
            return None
        korean_keys = ", ".join(
            dict.fromkeys(self._condition_label(condition.key, "ko") for condition in conditions)
        )
        localized_keys = ", ".join(
            dict.fromkeys(
                self._condition_label(condition.key, request.language) for condition in conditions
            )
        )
        korean = (
            f"안녕하세요. 현재 {request.visa_type} 체류자격이며 비자 잔여기간은 "
            f"{request.visa_remaining_months}개월, 국내 체류기간은 {request.residency_months}개월입니다. "
            f"{request.product_name} 상품의 {korean_keys} 조건에 대해 공개정보만으로 확인하기 어려운 부분이 있습니다. "
            "현재 체류자격으로 신청할 수 있는지와 추가 심사 조건 및 필요한 서류를 확인 부탁드립니다."
        )
        if request.language == "en":
            localized = (
                f"Hello. My current status of stay is {request.visa_type}. I have "
                f"{request.visa_remaining_months} months remaining on my visa and have resided in Korea for "
                f"{request.residency_months} months. Some {localized_keys} conditions for {request.product_name} are not "
                "fully available in the public information. Please confirm whether I may apply with my current "
                "status of stay, any additional review conditions, and the required documents."
            )
        elif request.language == "vi":
            localized = (
                f"Xin chào. Tư cách lưu trú hiện tại của tôi là {request.visa_type}, thời hạn visa còn "
                f"{request.visa_remaining_months} tháng và tôi đã cư trú tại Hàn Quốc trong "
                f"{request.residency_months} tháng. Một số điều kiện {localized_keys} của sản phẩm {request.product_name} "
                "chưa được công khai đầy đủ. Vui lòng xác nhận tôi có thể đăng ký với tư cách lưu trú hiện tại hay "
                "không, các điều kiện thẩm định bổ sung và giấy tờ cần thiết."
            )
        else:
            localized = korean
        return BankInquiry(korean=korean, localized=localized, language=request.language)

    def _condition_label(self, key: str, language: str) -> str:
        labels = {
            "GUARANTEE": {
                "ko": "보증보험 발급 가능 여부",
                "en": "guarantee insurance eligibility",
                "vi": "khả năng cấp bảo hiểm bảo lãnh",
            },
            "VISA_DETAIL": {
                "ko": "허용 비자 세부목록",
                "en": "detailed list of accepted visa types",
                "vi": "danh sách chi tiết các loại visa được chấp nhận",
            },
            "BANK_CREDIT_REVIEW": {
                "ko": "은행 내부 신용평가",
                "en": "bank internal credit review",
                "vi": "đánh giá tín dụng nội bộ của ngân hàng",
            },
        }
        normalized_language = language if language in {"ko", "en", "vi"} else "ko"
        return labels.get(key, {}).get(normalized_language, key)

    def _disclaimer(self, language: str) -> str:
        if language == "en":
            return "This explanation is a preliminary guide based on public conditions and does not guarantee enrollment or approval."
        if language == "vi":
            return "Giải thích này chỉ là hướng dẫn sơ bộ dựa trên điều kiện công khai và không bảo đảm đăng ký hoặc phê duyệt."
        return (
            "이 설명은 공개조건을 기반으로 한 사전 안내이며 상품 가입이나 승인을 보장하지 않습니다."
        )
