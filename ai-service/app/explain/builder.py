from app.explain.models import BankInquiry, EasyTerm, ExplanationRequest, ExplanationResponse
from app.guardrail.answer_builder import DISCLAIMERS

GUARDRAILS = [
    "ELIGIBILITY_RESULT_IMMUTABLE",
    "NO_APPROVAL_GUARANTEE",
    "STRUCTURED_NUMBERS_ONLY",
    "STRUCTURED_VISA_CODE_ONLY",
    "UNKNOWN_REQUIRES_CONFIRMATION",
    "LLM_HAS_NO_ELIGIBILITY_DECISION_AUTHORITY",
    "NO_FOREIGNER_INELIGIBILITY_INFERENCE",
    "NO_REAL_NAME_FOREIGNER_ACCESS_INFERENCE",
    "NO_UNSOURCED_VISA_RULE",
    "NO_UNSOURCED_CHANNEL_AVAILABILITY",
    "NO_APPROVAL_PROBABILITY",
    "NO_CREDIT_SCORE_INFERENCE",
    "NO_INTERNAL_REVIEW_INFERENCE",
]

TEMPLATE_LANGUAGES = ("ko", "en", "vi", "zh", "ja", "th")


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
        "zh": (
            "체류자격",
            "停留资格",
            "规定您在韩国停留的目的和可从事活动范围的法律资格。",
        ),
        "ja": (
            "체류자격",
            "在留資格",
            "韓国に滞在する目的と許可される活動の範囲を定めた法的資格です。",
        ),
        "th": (
            "체류자격",
            "สถานะการพำนัก",
            "สถานะทางกฎหมายที่กำหนดวัตถุประสงค์ในการพำนักและกิจกรรมที่ได้รับอนุญาตในเกาหลี",
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
        "zh": (
            "소득증빙",
            "收入证明",
            "工资单或所得金额证明等能够确认实际收入的资料。",
        ),
        "ja": (
            "소득증빙",
            "所得証明",
            "給与明細や所得金額証明など、実際の所得を確認する書類です。",
        ),
        "th": (
            "소득증빙",
            "หลักฐานแสดงรายได้",
            "เอกสารเช่น สลิปเงินเดือน หรือหนังสือรับรองรายได้ ที่ใช้ยืนยันรายได้จริง",
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
        "zh": (
            "보증보험증권",
            "保证保险凭证",
            "为借款人无法偿还贷款的情况，由保证机构提供一定担保的手续。",
        ),
        "ja": (
            "보증보험증권",
            "保証保険証券",
            "借入金を返済できない場合に備えて、保証機関が一定の保証を提供する手続きです。",
        ),
        "th": (
            "보증보험증권",
            "กรมธรรม์ประกันค้ำประกัน",
            "ขั้นตอนที่สถาบันค้ำประกันรับความเสี่ยงบางส่วน หากผู้กู้ไม่สามารถชำระคืนได้",
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
        "zh": (
            "은행 내부 신용평가",
            "银行内部信用评估",
            "银行按自身标准审核收入、交易信息和偿还能力的过程。",
        ),
        "ja": (
            "은행 내부 신용평가",
            "銀行内部の信用評価",
            "銀行が所得・取引情報・返済能力などを独自の基準で確認する審査です。",
        ),
        "th": (
            "은행 내부 신용평가",
            "การประเมินเครดิตภายในของธนาคาร",
            "การที่ธนาคารตรวจสอบรายได้ ข้อมูลธุรกรรม และความสามารถในการชำระคืนตามเกณฑ์ของตนเอง",
        ),
    },
}


NEXT_ACTIONS = {
    "ko": {
        "failed": "충족하지 못한 공개조건과 공식 근거를 먼저 확인하세요.",
        "insufficient": "부족한 프로필 정보 또는 검수되지 않은 공식 자료를 확인하세요.",
        "confirm": "추가 확인 조건을 공식 채널을 통해 금융기관에 문의하세요.",
        "met": "공식 신청 채널과 준비서류를 확인한 뒤 신청을 준비하세요.",
        "branch": "외국인 이용이 확인된 영업점 채널을 우선 확인하세요.",
        "online": "모바일·온라인 이용 가능 여부는 공식 채널에서 다시 확인하세요.",
    },
    "en": {
        "failed": "Review the unmet public conditions and their official evidence first.",
        "insufficient": "Complete missing profile information or wait for official-source review.",
        "confirm": "Ask the financial institution about the additional confirmation items.",
        "met": "Check the official application channel and required documents before applying.",
        "branch": "Use the branch channel whose foreign-customer access has been confirmed.",
        "online": "Confirm mobile or online access through an official channel.",
    },
    "vi": {
        "failed": "Trước tiên, hãy kiểm tra điều kiện công khai chưa đạt và căn cứ chính thức.",
        "insufficient": "Hãy bổ sung thông tin hồ sơ còn thiếu hoặc chờ xác minh nguồn chính thức.",
        "confirm": "Hãy hỏi tổ chức tài chính về các nội dung cần xác nhận thêm.",
        "met": "Hãy kiểm tra kênh đăng ký chính thức và giấy tờ cần thiết trước khi đăng ký.",
        "branch": "Ưu tiên kiểm tra kênh tại quầy đã xác nhận hỗ trợ khách hàng nước ngoài.",
        "online": "Hãy xác nhận lại khả năng sử dụng trên ứng dụng hoặc trực tuyến qua kênh chính thức.",
    },
    "zh": {
        "failed": "请先确认未满足的公开条件及其官方依据。",
        "insufficient": "请补充缺失的资料信息，或等待官方来源完成审核。",
        "confirm": "请通过官方渠道向金融机构咨询需要额外确认的事项。",
        "met": "请确认官方申请渠道和所需材料后再准备申请。",
        "branch": "请优先确认已确认可接待外国客户的网点渠道。",
        "online": "请通过官方渠道再次确认手机或网上是否可以办理。",
    },
    "ja": {
        "failed": "満たしていない公開条件と公式根拠をまず確認してください。",
        "insufficient": "不足しているプロフィール情報を補うか、公式資料の検証をお待ちください。",
        "confirm": "追加で確認が必要な条件について、公式チャネルで金融機関にお問い合わせください。",
        "met": "公式の申込チャネルと必要書類を確認してから申込を準備してください。",
        "branch": "外国人の利用が確認されている店頭チャネルを優先して確認してください。",
        "online": "モバイル・オンラインの利用可否を公式チャネルで再度確認してください。",
    },
    "th": {
        "failed": "โปรดตรวจสอบเงื่อนไขสาธารณะที่ยังไม่ผ่านและหลักฐานอย่างเป็นทางการก่อน",
        "insufficient": "โปรดกรอกข้อมูลโปรไฟล์ที่ขาดหายไป หรือรอการตรวจสอบแหล่งข้อมูลอย่างเป็นทางการ",
        "confirm": "โปรดสอบถามสถาบันการเงินเกี่ยวกับรายการที่ต้องยืนยันเพิ่มเติมผ่านช่องทางอย่างเป็นทางการ",
        "met": "โปรดตรวจสอบช่องทางการสมัครอย่างเป็นทางการและเอกสารที่ต้องใช้ก่อนเตรียมสมัคร",
        "branch": "โปรดตรวจสอบช่องทางสาขาที่ยืนยันแล้วว่ารองรับลูกค้าชาวต่างชาติเป็นอันดับแรก",
        "online": "โปรดยืนยันความสามารถในการใช้งานผ่านมือถือหรือออนไลน์ผ่านช่องทางอย่างเป็นทางการอีกครั้ง",
    },
}


EXPLANATIONS = {
    "ko": {
        "PUBLIC_CONDITIONS_MET": "입력하신 정보 기준으로 확인 가능한 공개조건 {passed}개를 모두 충족했습니다. 다만 실제 신청 시 은행 내부심사와 추가 확인 절차에 따라 결과가 달라질 수 있습니다.",
        "NEED_BANK_CONFIRMATION": "확인 가능한 공개조건에서 명시적인 미충족은 없고 {passed}개 조건을 충족했습니다. 다만 일부 조건은 {institution}의 확인이 필요합니다.",
        "PUBLIC_CONDITIONS_NOT_MET": "입력하신 정보 기준으로 공개조건 중 {failed}개를 충족하지 못했습니다. 신청 전 각 조건과 공식 출처를 확인해 주세요.",
        "INSUFFICIENT_INFORMATION": "현재 검수된 공개정보만으로는 사전 판단에 필요한 정보가 충분하지 않습니다. 프로필 입력 또는 Rule과 Source의 추가 검수가 필요합니다.",
    },
    "en": {
        "PUBLIC_CONDITIONS_MET": "Based on your information, all {passed} evaluated public conditions were met. The result may still change after the bank's internal review and additional checks.",
        "NEED_BANK_CONFIRMATION": "No evaluated public condition failed, and {passed} conditions were met. However, some conditions require confirmation by {institution}.",
        "PUBLIC_CONDITIONS_NOT_MET": "Based on your information, {failed} evaluated public conditions were not met. Review each condition and the official source before applying.",
        "INSUFFICIENT_INFORMATION": "There is not enough reviewed public information to make a preliminary determination. Additional profile, Rule, or Source verification is required.",
    },
    "vi": {
        "PUBLIC_CONDITIONS_MET": "Theo thông tin đã nhập, bạn đáp ứng toàn bộ {passed} điều kiện công khai đã được đánh giá. Kết quả vẫn có thể thay đổi sau thẩm định nội bộ và xác nhận bổ sung của ngân hàng.",
        "NEED_BANK_CONFIRMATION": "Không có điều kiện công khai nào bị đánh giá là không đạt và đã đáp ứng {passed} điều kiện. Tuy nhiên, một số điều kiện cần được {institution} xác nhận.",
        "PUBLIC_CONDITIONS_NOT_MET": "Theo thông tin đã nhập, có {failed} điều kiện công khai chưa được đáp ứng. Hãy kiểm tra từng điều kiện và nguồn chính thức trước khi đăng ký.",
        "INSUFFICIENT_INFORMATION": "Chưa có đủ thông tin công khai đã kiểm duyệt để đưa ra kết quả sơ bộ. Cần bổ sung hồ sơ hoặc kiểm tra thêm Rule và Source.",
    },
    "zh": {
        "PUBLIC_CONDITIONS_MET": "根据您输入的信息，已评估的 {passed} 项公开条件全部满足。但实际申请时，结果仍可能因银行内部审核和额外确认程序而有所不同。",
        "NEED_BANK_CONFIRMATION": "在已评估的公开条件中没有明确不满足的项目，共满足 {passed} 项条件。但部分条件需要 {institution} 确认。",
        "PUBLIC_CONDITIONS_NOT_MET": "根据您输入的信息，已评估的公开条件中有 {failed} 项未满足。申请前请确认各项条件和官方来源。",
        "INSUFFICIENT_INFORMATION": "仅凭现有已审核的公开信息，不足以做出初步判断。需要补充资料信息，或对 Rule 与 Source 进行进一步审核。",
    },
    "ja": {
        "PUBLIC_CONDITIONS_MET": "入力された情報を基準に、確認可能な公開条件 {passed} 件をすべて満たしています。ただし実際の申込時には、銀行の内部審査や追加確認により結果が変わる場合があります。",
        "NEED_BANK_CONFIRMATION": "確認可能な公開条件で明示的な不適合はなく、{passed} 件の条件を満たしています。ただし一部の条件は {institution} の確認が必要です。",
        "PUBLIC_CONDITIONS_NOT_MET": "入力された情報を基準に、公開条件のうち {failed} 件を満たしていません。申込前に各条件と公式情報をご確認ください。",
        "INSUFFICIENT_INFORMATION": "現在検証済みの公開情報だけでは、事前判断に必要な情報が十分ではありません。プロフィールの入力、または Rule と Source の追加検証が必要です。",
    },
    "th": {
        "PUBLIC_CONDITIONS_MET": "จากข้อมูลที่คุณกรอก คุณผ่านเงื่อนไขสาธารณะที่ประเมินได้ทั้งหมด {passed} ข้อ อย่างไรก็ตาม ผลลัพธ์อาจเปลี่ยนแปลงได้หลังการพิจารณาภายในและการตรวจสอบเพิ่มเติมของธนาคาร",
        "NEED_BANK_CONFIRMATION": "ไม่มีเงื่อนไขสาธารณะใดที่ประเมินแล้วไม่ผ่าน และผ่านเงื่อนไข {passed} ข้อ แต่บางเงื่อนไขต้องได้รับการยืนยันจาก {institution}",
        "PUBLIC_CONDITIONS_NOT_MET": "จากข้อมูลที่คุณกรอก มีเงื่อนไขสาธารณะ {failed} ข้อที่ยังไม่ผ่าน โปรดตรวจสอบแต่ละเงื่อนไขและแหล่งข้อมูลอย่างเป็นทางการก่อนสมัคร",
        "INSUFFICIENT_INFORMATION": "ข้อมูลสาธารณะที่ผ่านการตรวจสอบในขณะนี้ยังไม่เพียงพอสำหรับการประเมินเบื้องต้น จำเป็นต้องกรอกข้อมูลเพิ่มเติม หรือตรวจสอบ Rule และ Source เพิ่มเติม",
    },
}


# The inquiry is what a customer reads out at a bank counter, so every template only states
# profile facts the customer entered and then asks. It never claims that a condition is met.
INQUIRY_TEMPLATES = {
    "ko": "안녕하세요.{profile} {product} 상품의 {keys} 조건에 대해 공개정보만으로 확인하기 어려운 부분이 있습니다. 신청 가능 여부와 공식적으로 확인할 추가 조건 및 필요한 서류를 확인 부탁드립니다.",
    "en": "Hello.{profile} Some {keys} conditions for {product} are not fully available in the public information. Please confirm whether I may apply, the official additional conditions to check, and the required documents.",
    "vi": "Xin chào.{profile} Một số điều kiện {keys} của sản phẩm {product} chưa được công khai đầy đủ. Vui lòng xác nhận tôi có thể đăng ký hay không, các điều kiện chính thức cần kiểm tra thêm và giấy tờ cần thiết.",
    "zh": "您好。{profile}关于{product}的{keys}条件，仅凭公开信息难以完全确认。请帮我确认是否可以申请、需要正式确认的附加条件以及所需材料。",
    "ja": "こんにちは。{profile}{product}の{keys}の条件について、公開情報だけでは確認が難しい部分があります。申込の可否と、公式に確認すべき追加条件および必要書類をご確認いただけますでしょうか。",
    "th": "สวัสดีค่ะ/ครับ{profile} เงื่อนไข{keys}ของ{product} ไม่สามารถยืนยันได้ครบถ้วนจากข้อมูลสาธารณะ กรุณาช่วยยืนยันว่าฉันสามารถสมัครได้หรือไม่ เงื่อนไขเพิ่มเติมที่ต้องตรวจสอบอย่างเป็นทางการ และเอกสารที่ต้องใช้",
}


PROFILE_FACTS = {
    "visa_type": {
        "ko": "현재 체류자격은 {value}입니다",
        "en": "My current status of stay is {value}",
        "vi": "Tư cách lưu trú hiện tại của tôi là {value}",
        "zh": "我目前的停留资格是 {value}",
        "ja": "現在の在留資格は {value} です",
        "th": "สถานะการพำนักปัจจุบันของฉันคือ {value}",
    },
    "visa_remaining_months": {
        "ko": "비자 잔여기간은 {value}개월입니다",
        "en": "I have {value} months remaining on my visa",
        "vi": "Thời hạn visa của tôi còn {value} tháng",
        "zh": "我的签证剩余期限为 {value} 个月",
        "ja": "ビザの残り期間は {value} か月です",
        "th": "วีซ่าของฉันเหลืออีก {value} เดือน",
    },
    "residency_months": {
        "ko": "국내 체류기간은 {value}개월입니다",
        "en": "I have resided in Korea for {value} months",
        "vi": "Tôi đã cư trú tại Hàn Quốc trong {value} tháng",
        "zh": "我在韩国居住了 {value} 个月",
        "ja": "韓国での滞在期間は {value} か月です",
        "th": "ฉันพำนักในเกาหลีมาแล้ว {value} เดือน",
    },
}

FACT_SEPARATORS = {"ko": ". ", "en": "; ", "vi": "; ", "zh": "，", "ja": "、", "th": " "}
FACT_TERMINATORS = {"ko": ".", "en": ".", "vi": ".", "zh": "。", "ja": "。", "th": ""}
# Chinese and Japanese sentences run on without a space after the closing mark.
FACT_PREFIXES = {"ko": " ", "en": " ", "vi": " ", "zh": "", "ja": "", "th": " "}
LIST_SEPARATORS = {"ko": ", ", "en": ", ", "vi": ", ", "zh": "、", "ja": "、", "th": ", "}


CONDITION_LABELS = {
    "GUARANTEE": {
        "ko": "보증보험 발급 가능 여부",
        "en": "guarantee insurance eligibility",
        "vi": "khả năng cấp bảo hiểm bảo lãnh",
        "zh": "保证保险可否办理",
        "ja": "保証保険の発行可否",
        "th": "ความเป็นไปได้ในการออกประกันค้ำประกัน",
    },
    "VISA_DETAIL": {
        "ko": "허용 비자 세부목록",
        "en": "detailed list of accepted visa types",
        "vi": "danh sách chi tiết các loại visa được chấp nhận",
        "zh": "可接受签证的详细清单",
        "ja": "受け入れ可能なビザの詳細リスト",
        "th": "รายการวีซ่าที่รับรองโดยละเอียด",
    },
    "BANK_CREDIT_REVIEW": {
        "ko": "은행 내부 신용평가",
        "en": "bank internal credit review",
        "vi": "đánh giá tín dụng nội bộ của ngân hàng",
        "zh": "银行内部信用评估",
        "ja": "銀行内部の信用評価",
        "th": "การประเมินเครดิตภายในของธนาคาร",
    },
    "REAL_NAME_VERIFICATION": {
        "ko": "실명확인 가능 여부",
        "en": "real-name verification availability",
        "vi": "khả năng xác minh danh tính thực",
        "zh": "实名确认可否办理",
        "ja": "実名確認の可否",
        "th": "ความเป็นไปได้ในการยืนยันตัวตนแบบชื่อจริง",
    },
    "FX_BANK_AND_E9_ENTRY_CHECK": {
        "ko": "외국환은행 지정 및 E-9 입국 확인",
        "en": "foreign-exchange bank designation and E-9 entry verification",
        "vi": "xác nhận ngân hàng ngoại hối được chỉ định và nhập cảnh E-9",
        "zh": "外汇银行指定及 E-9 入境确认",
        "ja": "外国為替銀行の指定およびE-9入国確認",
        "th": "การกำหนดธนาคารแลกเปลี่ยนเงินตราต่างประเทศและการยืนยันการเข้าประเทศ E-9",
    },
}


class ExplanationBuilder:
    def build(self, request: ExplanationRequest) -> ExplanationResponse:
        return ExplanationResponse(
            explanation=self._explanation(request),
            nextActions=self._next_actions(request),
            disclaimer=self._disclaimer(request.language),
            easyTerms=self._terms(request),
            inquiry=self._inquiry(request),
            guardrailsApplied=GUARDRAILS,
        )

    def _next_actions(self, request: ExplanationRequest) -> list[str]:
        access = request.access_result
        actions = NEXT_ACTIONS[self._template_language(request.language)]
        primary = {
            "PUBLIC_CONDITIONS_NOT_MET": actions["failed"],
            "INSUFFICIENT_INFORMATION": actions["insufficient"],
            "NEED_BANK_CONFIRMATION": actions["confirm"],
            "PUBLIC_CONDITIONS_MET": actions["met"],
        }[request.eligibility_status]
        result = [primary]
        if access.branch == "AVAILABLE" and access.online != "AVAILABLE":
            result.append(actions["branch"])
        elif access.online in {"UNKNOWN", "NEED_CONFIRMATION"}:
            result.append(actions["online"])
        return result

    def _explanation(self, request: ExplanationRequest) -> str:
        language = self._template_language(request.language)
        return EXPLANATIONS[language][request.eligibility_status].format(
            passed=request.passed_count,
            failed=request.failed_count,
            institution=request.institution,
        )

    def _terms(self, request: ExplanationRequest) -> list[EasyTerm]:
        language = self._template_language(request.language)
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
        template_language = self._template_language(request.language)
        korean_keys = LIST_SEPARATORS["ko"].join(
            dict.fromkeys(self._condition_label(condition.key, "ko") for condition in conditions)
        )
        localized_keys = LIST_SEPARATORS[template_language].join(
            dict.fromkeys(
                self._condition_label(condition.key, template_language) for condition in conditions
            )
        )
        korean = INQUIRY_TEMPLATES["ko"].format(
            profile=self._profile_sentence(request, "ko"),
            product=request.product_name,
            keys=korean_keys,
        )
        localized = (
            korean
            if template_language == "ko"
            else INQUIRY_TEMPLATES[template_language].format(
                profile=self._profile_sentence(request, template_language),
                product=request.product_name,
                keys=localized_keys,
            )
        )
        confirmation_items = list(
            dict.fromkeys(
                self._condition_label(condition.key, template_language) for condition in conditions
            )
        )
        return BankInquiry(
            korean=korean,
            localized=localized,
            language=request.language,
            confirmationItems=confirmation_items,
        )

    def _profile_sentence(self, request: ExplanationRequest, language: str) -> str:
        values = {
            "visa_type": request.visa_type,
            "visa_remaining_months": request.visa_remaining_months,
            "residency_months": request.residency_months,
        }
        facts = [
            PROFILE_FACTS[field][language].format(value=value)
            for field, value in values.items()
            if value is not None
        ]
        if not facts:
            return ""
        return (
            FACT_PREFIXES[language]
            + FACT_SEPARATORS[language].join(facts)
            + FACT_TERMINATORS[language]
        )

    def _condition_label(self, key: str, language: str) -> str:
        normalized_language = language if language in TEMPLATE_LANGUAGES else "ko"
        return CONDITION_LABELS.get(key, {}).get(normalized_language, key)

    def _disclaimer(self, language: str) -> str:
        return DISCLAIMERS.get(self._template_language(language), DISCLAIMERS["en"])

    def _template_language(self, language: str) -> str:
        return language if language in TEMPLATE_LANGUAGES else "en"
