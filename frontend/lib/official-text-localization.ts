import type { Locale } from "@/i18n/config";

/**
 * Display translations for reviewer-authored Korean text: rule descriptions, document names,
 * and application steps.
 *
 * Unlike the product catalogs this is keyed by the Korean string itself rather than by product
 * code, because the same phrasing is reused across products and because a rule key is not
 * unique within a product (a minimum and a maximum amount share DESIRED_MONTHLY_AMOUNT).
 * Text with no entry is returned unchanged, so anything an administrator writes later still
 * renders exactly as it does today.
 *
 * Covers the fixed Demo A~E products. Other products fall back to Korean for these fields.
 */

const officialTexts: Record<string, Partial<Record<Locale, string>>> = {
  // --- Rule descriptions ---
  "허용 체류자격": { en: "Eligible status of stay", vi: "Tư cách lưu trú được chấp nhận", zh: "允许的停留资格", ja: "許可される在留資格", th: "สถานะการพำนักที่ได้รับอนุญาต" },
  "국내 거주 최소기간": { en: "Minimum residency period in Korea", vi: "Thời gian cư trú tối thiểu tại Hàn Quốc", zh: "在韩最短居留期间", ja: "国内居住の最低期間", th: "ระยะเวลาพำนักขั้นต่ำในเกาหลี" },
  "현 직장 급여소득 최소기간": { en: "Minimum salary-income period at the current job", vi: "Thời gian thu nhập lương tối thiểu tại công việc hiện tại", zh: "现职薪资收入最短期间", ja: "現在の勤務先での給与所得の最低期間", th: "ระยะเวลารายได้เงินเดือนขั้นต่ำจากงานปัจจุบัน" },
  "외국인 가입대상": { en: "Foreign customers are the eligible group", vi: "Đối tượng đăng ký là người nước ngoài", zh: "加入对象为外国人", ja: "外国人が加入対象です", th: "กลุ่มผู้มีสิทธิ์คือชาวต่างชาติ" },
  "비거주자 제외": { en: "Non-residents are excluded", vi: "Loại trừ người không cư trú", zh: "排除非居住者", ja: "非居住者は除きます", th: "ไม่รวมผู้ไม่มีถิ่นที่อยู่" },
  "동일 상품 1인 1계좌": { en: "One account per person for this product", vi: "Mỗi người một tài khoản cho sản phẩm này", zh: "同一产品 1 人 1 账户", ja: "同一商品につき1人1口座", th: "1 คน 1 บัญชี สำหรับผลิตภัณฑ์นี้" },
  "동일 상품 계좌를 보유하지 않아야 함": { en: "You must not already hold an account for this product", vi: "Bạn chưa được có tài khoản của sản phẩm này", zh: "不得已持有同一产品账户", ja: "同一商品の口座を保有していないことが必要です", th: "ต้องไม่มีบัญชีของผลิตภัณฑ์นี้อยู่แล้ว" },
  "월 납입 최소금액": { en: "Minimum monthly deposit", vi: "Số tiền gửi tối thiểu hàng tháng", zh: "每月最低存入金额", ja: "毎月の最低積立額", th: "ยอดฝากรายเดือนขั้นต่ำ" },
  "월 납입 최대금액": { en: "Maximum monthly deposit", vi: "Số tiền gửi tối đa hàng tháng", zh: "每月最高存入金额", ja: "毎月の最高積立額", th: "ยอดฝากรายเดือนสูงสุด" },
  "월 최소 납입액": { en: "Minimum monthly deposit", vi: "Số tiền gửi tối thiểu hàng tháng", zh: "每月最低存入金额", ja: "毎月の最低積立額", th: "ยอดฝากรายเดือนขั้นต่ำ" },
  "월 최대 납입액": { en: "Maximum monthly deposit", vi: "Số tiền gửi tối đa hàng tháng", zh: "每月最高存入金额", ja: "毎月の最高積立額", th: "ยอดฝากรายเดือนสูงสุด" },
  "공식 신분확인증표": { en: "Official identity document", vi: "Giấy tờ xác minh danh tính chính thức", zh: "官方实名确认证件", ja: "公式の実名確認書類", th: "เอกสารยืนยันตัวตนอย่างเป็นทางการ" },
  "신분확인 단계 준비서류": { en: "Documents to prepare for the identity-verification step", vi: "Giấy tờ cần chuẩn bị cho bước xác minh danh tính", zh: "身份确认阶段需准备的材料", ja: "本人確認の段階で準備する書類", th: "เอกสารที่ต้องเตรียมสำหรับขั้นตอนยืนยันตัวตน" },
  "하나 외국인 EZ Loan의 공식 신분확인·보유 증표": { en: "Official identity and holding document for Hana Foreigner EZ Loan", vi: "Giấy tờ xác minh danh tính và sở hữu chính thức cho Hana Foreigner EZ Loan", zh: "韩亚外国人 EZ Loan 的官方身份及持有证件", ja: "ハナ外国人 EZ Loan の公式な本人確認・保有証明書類", th: "เอกสารยืนยันตัวตนและการถือครองอย่างเป็นทางการสำหรับ Hana Foreigner EZ Loan" },
  "상품 가입 허용 Rule이 아닌 신분확인 방법": { en: "An identity-verification method, not a rule that permits enrolment", vi: "Phương thức xác minh danh tính, không phải quy tắc cho phép đăng ký", zh: "这是本人确认方式，并非允许加入的规则", ja: "加入を許可するルールではなく、本人確認の方法です", th: "เป็นวิธียืนยันตัวตน ไม่ใช่กฎที่อนุญาตให้สมัคร" },
  "상품 가입 가능이 아닌 공통 신분확인 방법": { en: "A shared identity-verification method, not proof that enrolment is possible", vi: "Phương thức xác minh danh tính dùng chung, không phải bằng chứng có thể đăng ký", zh: "这是通用的本人确认方式，并不代表可以加入", ja: "加入可能を意味しない、共通の本人確認方法です", th: "เป็นวิธียืนยันตัวตนร่วม ไม่ได้แปลว่าสมัครได้" },
  "은행이 추가서류를 요청할 수 있음": { en: "The bank may request additional documents", vi: "Ngân hàng có thể yêu cầu giấy tờ bổ sung", zh: "银行可能要求补充材料", ja: "銀行が追加書類を求める場合があります", th: "ธนาคารอาจขอเอกสารเพิ่มเติม" },
  "필요시 은행이 추가 서류를 요청할 수 있음": { en: "The bank may request additional documents if needed", vi: "Khi cần, ngân hàng có thể yêu cầu giấy tờ bổ sung", zh: "必要时银行可能要求补充材料", ja: "必要に応じて銀行が追加書類を求める場合があります", th: "หากจำเป็น ธนาคารอาจขอเอกสารเพิ่มเติม" },
  "거래외국환 지정과 E-9 최초 입국 조건은 은행 확인 필요": { en: "Designated foreign-exchange bank registration and the E-9 first-entry condition need bank confirmation", vi: "Việc đăng ký ngân hàng ngoại hối chỉ định và điều kiện nhập cảnh lần đầu của E-9 cần ngân hàng xác nhận", zh: "外汇指定银行登记与 E-9 首次入境条件需银行确认", ja: "外国為替指定銀行の登録とE-9の初回入国条件は銀行の確認が必要です", th: "การลงทะเบียนธนาคารแลกเปลี่ยนเงินตราที่กำหนดและเงื่อนไขการเข้าประเทศครั้งแรกของ E-9 ต้องให้ธนาคารยืนยัน" },
  "공식 상품페이지에서 영업점 상품으로 표시하며 모바일 신청 가능 근거는 없음": { en: "The official product page lists this as a branch product, and there is no evidence that mobile application is possible", vi: "Trang sản phẩm chính thức ghi đây là sản phẩm tại chi nhánh, và không có căn cứ cho việc đăng ký qua di động", zh: "官方产品页标示为网点产品，且无手机申请可行的依据", ja: "公式商品ページでは店舗商品と表示され、モバイル申請が可能とする根拠はありません", th: "หน้าผลิตภัณฑ์อย่างเป็นทางการระบุว่าเป็นผลิตภัณฑ์ที่สาขา และไม่มีหลักฐานว่าสมัครผ่านมือถือได้" },
  "BRANCH AVAILABLE": { en: "Branch access confirmed", vi: "Đã xác nhận có thể dùng tại chi nhánh", zh: "已确认可在网点办理", ja: "店舗での利用を確認", th: "ยืนยันการใช้บริการที่สาขาแล้ว" },
  "BRANCH AVAILABLE; 상품 수준 스마트폰 채널은 표시하되 외국인 모바일 이용 판정은 보수적으로 분리": { en: "Branch access confirmed. The product-level smartphone channel is shown, but whether foreign customers can use mobile is kept separate and conservative.", vi: "Đã xác nhận tại chi nhánh. Kênh điện thoại ở mức sản phẩm được hiển thị, nhưng việc người nước ngoài dùng di động được tách riêng và đánh giá thận trọng.", zh: "已确认可在网点办理。产品层面的手机渠道会显示，但外国人能否使用手机仍保守地单独判断。", ja: "店舗での利用を確認。商品レベルのスマートフォンチャネルは表示しますが、外国人のモバイル利用可否は保守的に分けて判断します。", th: "ยืนยันการใช้บริการที่สาขาแล้ว แสดงช่องทางสมาร์ตโฟนระดับผลิตภัณฑ์ แต่แยกประเมินอย่างระมัดระวังว่าชาวต่างชาติใช้มือถือได้หรือไม่" },
  "PRODUCT MOBILE AVAILABLE; CUSTOMER-SPECIFIC SUPPORT UNVERIFIED": { en: "Mobile is available at product level; support for individual customers is unverified", vi: "Di động khả dụng ở mức sản phẩm; hỗ trợ cho từng khách hàng chưa được xác minh", zh: "产品层面支持手机办理；面向具体客户的支持尚未验证", ja: "商品レベルではモバイル利用可能ですが、個々の顧客への対応は未確認です", th: "ระดับผลิตภัณฑ์ใช้มือถือได้ แต่ยังไม่ยืนยันการรองรับลูกค้าแต่ละราย" },
  "상품 수준 MOBILE APP AVAILABLE; 외국인 이용 가능 여부 UNKNOWN": { en: "The mobile app is available at product level; whether foreign customers can use it is unknown", vi: "Ứng dụng di động khả dụng ở mức sản phẩm; chưa rõ người nước ngoài có dùng được không", zh: "产品层面支持手机 App；外国人能否使用尚不明确", ja: "商品レベルではモバイルアプリを利用できますが、外国人の利用可否は不明です", th: "ระดับผลิตภัณฑ์ใช้แอปมือถือได้ แต่ยังไม่ทราบว่าชาวต่างชาติใช้ได้หรือไม่" },
  "상품 수준 ONLINE AVAILABLE; 외국인 이용 가능 여부 UNKNOWN": { en: "Online is available at product level; whether foreign customers can use it is unknown", vi: "Trực tuyến khả dụng ở mức sản phẩm; chưa rõ người nước ngoài có dùng được không", zh: "产品层面支持线上办理；外国人能否使用尚不明确", ja: "商品レベルではオンライン利用が可能ですが、外国人の利用可否は不明です", th: "ระดับผลิตภัณฑ์ใช้ออนไลน์ได้ แต่ยังไม่ทราบว่าชาวต่างชาติใช้ได้หรือไม่" },
  "상품 존재만 확인하며 가입조건·신분확인·채널·필요서류의 근거로 사용하지 않음": { en: "This only confirms that the product exists; it is not used as evidence for eligibility, identity verification, channels, or required documents", vi: "Chỉ xác nhận sản phẩm tồn tại; không dùng làm căn cứ cho điều kiện đăng ký, xác minh danh tính, kênh hay giấy tờ", zh: "仅确认产品存在，不作为加入条件、实名确认、渠道或所需材料的依据", ja: "商品の存在のみを確認するもので、加入条件・本人確認・チャネル・必要書類の根拠には使用しません", th: "ยืนยันเพียงว่ามีผลิตภัณฑ์อยู่ ไม่ได้ใช้เป็นหลักฐานสำหรับเงื่อนไขการสมัคร การยืนยันตัวตน ช่องทาง หรือเอกสารที่ต้องใช้" },

  // --- Document names and notes ---
  "외국인등록증": { en: "Residence card", vi: "Thẻ cư trú", zh: "外国人登录证", ja: "外国人登録証", th: "บัตรประจำตัวคนต่างด้าว" },
  "여권": { en: "Passport", vi: "Hộ chiếu", zh: "护照", ja: "パスポート", th: "หนังสือเดินทาง" },
  "고용허가서 또는 표준근로계약서": { en: "Employment permit or standard labour contract", vi: "Giấy phép lao động hoặc hợp đồng lao động chuẩn", zh: "雇佣许可书或标准劳动合同", ja: "雇用許可書または標準労働契約書", th: "ใบอนุญาตจ้างงานหรือสัญญาจ้างมาตรฐาน" },
  "건강보험득실확인서": { en: "Health insurance enrolment certificate", vi: "Giấy xác nhận tham gia bảo hiểm y tế", zh: "健康保险得失确认书", ja: "健康保険得喪確認書", th: "หนังสือรับรองการเป็นสมาชิกประกันสุขภาพ" },
  "재직 및 연소득 증빙서류": { en: "Proof of employment and annual income", vi: "Giấy tờ chứng minh việc làm và thu nhập năm", zh: "在职及年收入证明材料", ja: "在職および年収の証明書類", th: "หลักฐานการทำงานและรายได้ต่อปี" },
  "추가 요청 서류": { en: "Additional requested documents", vi: "Giấy tờ được yêu cầu thêm", zh: "追加要求的材料", ja: "追加で求められる書類", th: "เอกสารที่ขอเพิ่มเติม" },
  "외국인등록증 보유가 대출대상에 포함됩니다.": { en: "Holding a residence card is part of the loan eligibility.", vi: "Việc có thẻ cư trú thuộc điều kiện vay.", zh: "持有外国人登录证属于贷款对象条件。", ja: "外国人登録証の保有が融資対象に含まれます。", th: "การมีบัตรประจำตัวคนต่างด้าวเป็นส่วนหนึ่งของคุณสมบัติสินเชื่อ" },
  "공식 필요서류 목록에 명시되어 있습니다.": { en: "Listed in the official required-document list.", vi: "Được nêu trong danh sách giấy tờ bắt buộc chính thức.", zh: "已在官方必备材料清单中载明。", ja: "公式の必要書類一覧に明記されています。", th: "ระบุไว้ในรายการเอกสารที่ต้องใช้อย่างเป็นทางการ" },
  "두 문서 중 해당 문서를 준비합니다.": { en: "Prepare whichever of the two documents applies to you.", vi: "Chuẩn bị giấy tờ phù hợp trong hai loại.", zh: "在两种文件中准备适用的一种。", ja: "2つの書類のうち該当するものを準備します。", th: "เตรียมเอกสารที่ตรงกับกรณีของคุณจากสองรายการนี้" },
  "재직과 연소득을 증빙하는 서류입니다.": { en: "Documents proving employment and annual income.", vi: "Giấy tờ chứng minh việc làm và thu nhập năm.", zh: "证明在职与年收入的材料。", ja: "在職と年収を証明する書類です。", th: "เอกสารที่พิสูจน์การทำงานและรายได้ต่อปี" },
  "필요시 은행이 추가 서류를 요청할 수 있습니다.": { en: "The bank may request additional documents if needed.", vi: "Khi cần, ngân hàng có thể yêu cầu giấy tờ bổ sung.", zh: "必要时银行可能要求补充材料。", ja: "必要に応じて銀行が追加書類を求める場合があります。", th: "หากจำเป็น ธนาคารอาจขอเอกสารเพิ่มเติม" },

  // --- Application steps ---
  "필요서류 준비": { en: "Prepare the required documents", vi: "Chuẩn bị giấy tờ cần thiết", zh: "准备所需材料", ja: "必要書類の準備", th: "เตรียมเอกสารที่ต้องใช้" },
  "공식 상세페이지에 명시된 필요서류를 준비합니다.": { en: "Prepare the documents listed on the official detail page.", vi: "Chuẩn bị các giấy tờ nêu trên trang chi tiết chính thức.", zh: "准备官方详情页中载明的所需材料。", ja: "公式詳細ページに明記された必要書類を準備します。", th: "เตรียมเอกสารที่ระบุไว้ในหน้ารายละเอียดอย่างเป็นทางการ" },
  "영업점 상담 및 신청": { en: "Consult and apply at a branch", vi: "Tư vấn và đăng ký tại chi nhánh", zh: "网点咨询并申请", ja: "店舗での相談および申し込み", th: "ปรึกษาและสมัครที่สาขา" },
  "하나은행 영업점에서 추가 조건을 확인하고 신청합니다.": { en: "Confirm the additional conditions at a Hana Bank branch and apply.", vi: "Xác nhận các điều kiện bổ sung tại chi nhánh Ngân hàng Hana và đăng ký.", zh: "在韩亚银行营业网点确认附加条件后申请。", ja: "ハナ銀行の店舗で追加条件を確認して申し込みます。", th: "ยืนยันเงื่อนไขเพิ่มเติมที่สาขาธนาคารฮานาแล้วจึงสมัคร" },
  "공식 채널에서 가입": { en: "Sign up through an official channel", vi: "Đăng ký qua kênh chính thức", zh: "通过官方渠道加入", ja: "公式チャネルで加入", th: "สมัครผ่านช่องทางอย่างเป็นทางการ" },
  "하나은행 공식 상품페이지가 안내하는 영업점 또는 스마트폰 채널에서 가입을 진행합니다.": { en: "Sign up through the branch or smartphone channel that the official Hana Bank product page describes.", vi: "Đăng ký qua chi nhánh hoặc kênh điện thoại mà trang sản phẩm chính thức của Ngân hàng Hana hướng dẫn.", zh: "通过韩亚银行官方产品页指引的营业网点或手机渠道办理加入。", ja: "ハナ銀行の公式商品ページが案内する店舗またはスマートフォンチャネルで加入します。", th: "สมัครผ่านสาขาหรือช่องทางสมาร์ตโฟนตามที่หน้าผลิตภัณฑ์อย่างเป็นทางการของธนาคารฮานาระบุ" },
  "계좌 보유와 납입액 확인": { en: "Check existing accounts and the deposit amount", vi: "Kiểm tra tài khoản hiện có và số tiền gửi", zh: "确认账户持有情况与存入金额", ja: "口座の保有状況と積立額の確認", th: "ตรวจสอบบัญชีที่มีอยู่และยอดเงินฝาก" },
  "동일 상품 계좌 보유 여부와 월 납입 희망액을 확인합니다.": { en: "Check whether you already hold an account for this product and the monthly amount you want to deposit.", vi: "Kiểm tra bạn đã có tài khoản sản phẩm này chưa và số tiền muốn gửi hàng tháng.", zh: "确认是否已持有同一产品账户，以及每月希望存入的金额。", ja: "同一商品の口座保有の有無と、毎月の希望積立額を確認します。", th: "ตรวจสอบว่ามีบัญชีผลิตภัณฑ์นี้อยู่แล้วหรือไม่ และยอดที่ต้องการฝากรายเดือน" },
  "납입액과 가입채널 확인": { en: "Check the deposit amount and the sign-up channel", vi: "Kiểm tra số tiền gửi và kênh đăng ký", zh: "确认存入金额与加入渠道", ja: "積立額と加入チャネルの確認", th: "ตรวจสอบยอดเงินฝากและช่องทางการสมัคร" },
  "월 납입 희망액과 영업점 또는 앱 채널을 확인합니다.": { en: "Check the monthly amount you want to deposit and whether you will use a branch or the app.", vi: "Kiểm tra số tiền muốn gửi hàng tháng và việc bạn sẽ dùng chi nhánh hay ứng dụng.", zh: "确认每月希望存入的金额，以及使用营业网点还是 App。", ja: "毎月の希望積立額と、店舗またはアプリのどちらを利用するかを確認します。", th: "ตรวจสอบยอดที่ต้องการฝากรายเดือน และว่าจะใช้สาขาหรือแอป" },

  // --- Channel labels ---
  "영업점": { en: "Branch", vi: "Chi nhánh", zh: "营业网点", ja: "店舗", th: "สาขา" },
  "영업점·스마트폰": { en: "Branch / smartphone", vi: "Chi nhánh / điện thoại", zh: "营业网点／手机", ja: "店舗・スマートフォン", th: "สาขา / สมาร์ตโฟน" },
  "영업점·인터넷·스마트폰": { en: "Branch / internet / smartphone", vi: "Chi nhánh / internet / điện thoại", zh: "营业网点／网上银行／手机", ja: "店舗・インターネット・スマートフォン", th: "สาขา / อินเทอร์เน็ต / สมาร์ตโฟน" },
  "KB스타뱅킹 또는 영업점": { en: "KB Star Banking or a branch", vi: "KB Star Banking hoặc chi nhánh", zh: "KB 星银行或营业网点", ja: "KBスターバンキングまたは店舗", th: "KB Star Banking หรือที่สาขา" },

  // --- Non-demo products: rules, application steps and channels ---
  "다른 금융기관을 포함해 생계비계좌를 보유하지 않아야 함": { en: "You must not hold a livelihood account at any financial institution, including other banks", vi: "Bạn không được có tài khoản sinh hoạt phí tại bất kỳ tổ chức tài chính nào, kể cả ngân hàng khác", zh: "包括其他金融机构在内，不得已持有生计费账户", ja: "他の金融機関を含め、生計費口座を保有していないことが必要です", th: "ต้องไม่มีบัญชีค่าครองชีพที่สถาบันการเงินใด รวมถึงธนาคารอื่น" },
  "실명확인은 신한은행 절차에서 확인 필요": { en: "Real-name verification must be confirmed through Shinhan Bank's own procedure", vi: "Việc xác minh danh tính thực cần được xác nhận theo quy trình của Ngân hàng Shinhan", zh: "实名确认需按新韩银行的流程确认", ja: "実名確認は新韓銀行の手続きで確認が必要です", th: "การยืนยันตัวตนแบบชื่อจริงต้องผ่านขั้นตอนของธนาคารชินฮัน" },
  "최소 예치금액": { en: "Minimum deposit amount", vi: "Số tiền gửi tối thiểu", zh: "最低存入金额", ja: "最低預入金額", th: "ยอดเงินฝากขั้นต่ำ" },
  "공식 상품설명서 확인": { en: "Check the official product brochure", vi: "Kiểm tra bản thuyết minh sản phẩm chính thức", zh: "确认官方产品说明书", ja: "公式の商品説明書を確認", th: "ตรวจสอบเอกสารอธิบายผลิตภัณฑ์อย่างเป็นทางการ" },
  "신분증과 중복계좌 여부 확인": { en: "Check your identification and whether you already hold such an account", vi: "Kiểm tra giấy tờ tùy thân và việc đã có tài khoản trùng hay chưa", zh: "确认身份证件及是否存在重复账户", ja: "本人確認書類と重複口座の有無を確認", th: "ตรวจสอบเอกสารยืนยันตัวตนและบัญชีซ้ำ" },
  "예치액과 온라인 채널 확인": { en: "Check the deposit amount and the online channel", vi: "Kiểm tra số tiền gửi và kênh trực tuyến", zh: "确认存入金额与线上渠道", ja: "預入金額とオンラインチャネルを確認", th: "ตรวจสอบยอดเงินฝากและช่องทางออนไลน์" },
  "가입 전 상품설명서의 거래조건과 실제 계약내용을 확인합니다.": { en: "Before applying, check the transaction terms in the product brochure against the actual contract.", vi: "Trước khi đăng ký, hãy đối chiếu điều kiện giao dịch trong bản thuyết minh sản phẩm với nội dung hợp đồng thực tế.", zh: "加入前请核对产品说明书的交易条件与实际合同内容。", ja: "加入前に商品説明書の取引条件と実際の契約内容を確認します。", th: "ก่อนสมัคร ตรวจสอบเงื่อนไขการทำธุรกรรมในเอกสารอธิบายผลิตภัณฑ์เทียบกับสัญญาจริง" },
  "공식 가입대상과 사용할 실명확인증표를 확인합니다.": { en: "Check the official eligible group and the identification document you will use.", vi: "Kiểm tra đối tượng đăng ký chính thức và giấy tờ tùy thân bạn sẽ dùng.", zh: "确认官方加入对象以及将使用的实名确认证件。", ja: "公式の加入対象と使用する実名確認書類を確認します。", th: "ตรวจสอบกลุ่มผู้มีสิทธิ์อย่างเป็นทางการและเอกสารยืนยันตัวตนที่จะใช้" },
  "예치 희망액을 확인하고 외국인 온라인 신규 가능 여부는 은행에 문의합니다.": { en: "Decide the amount you want to deposit, and ask the bank whether foreign customers can open this online.", vi: "Xác định số tiền muốn gửi và hỏi ngân hàng liệu người nước ngoài có thể mở trực tuyến không.", zh: "确认希望存入的金额，并向银行咨询外国人是否可在线开户。", ja: "預入希望額を確認し、外国人のオンライン新規開設が可能かは銀行に問い合わせます。", th: "กำหนดยอดเงินที่ต้องการฝาก และสอบถามธนาคารว่าชาวต่างชาติเปิดบัญชีออนไลน์ได้หรือไม่" },
  "하나은행 영업점에서 상품 조건과 필요서류를 확인하고 신청합니다.": { en: "Check the product conditions and required documents at a Hana Bank branch, then apply.", vi: "Kiểm tra điều kiện sản phẩm và giấy tờ cần thiết tại chi nhánh Ngân hàng Hana rồi đăng ký.", zh: "在韩亚银行营业网点确认产品条件和所需材料后申请。", ja: "ハナ銀行の店舗で商品条件と必要書類を確認して申し込みます。", th: "ตรวจสอบเงื่อนไขผลิตภัณฑ์และเอกสารที่ต้องใช้ที่สาขาธนาคารฮานา แล้วจึงสมัคร" },
  "신한은행 공식 채널": { en: "Shinhan Bank official channels", vi: "Kênh chính thức của Ngân hàng Shinhan", zh: "新韩银行官方渠道", ja: "新韓銀行の公式チャネル", th: "ช่องทางอย่างเป็นทางการของธนาคารชินฮัน" },
  "영업점 또는 신한SOL뱅크": { en: "A branch or Shinhan SOL Bank", vi: "Chi nhánh hoặc Shinhan SOL Bank", zh: "营业网点或新韩 SOL 银行", ja: "店舗または新韓SOLバンク", th: "สาขา หรือ Shinhan SOL Bank" },
  "인터넷뱅킹 또는 KB스타뱅킹": { en: "Internet banking or KB Star Banking", vi: "Internet banking hoặc KB Star Banking", zh: "网上银行或 KB 星银行", ja: "インターネットバンキングまたはKBスターバンキング", th: "อินเทอร์เน็ตแบงก์กิ้ง หรือ KB Star Banking" },
  "지점 또는 KB스타뱅킹": { en: "A branch or KB Star Banking", vi: "Chi nhánh hoặc KB Star Banking", zh: "分行或 KB 星银行", ja: "支店またはKBスターバンキング", th: "สาขา หรือ KB Star Banking" },
};

/** Returns the translated official text, or the stored Korean when there is no entry. */
export function officialText(locale: Locale, korean: string | null | undefined): string {
  if (!korean) return korean ?? "";
  if (locale === "ko") return korean;
  return officialTexts[korean.trim()]?.[locale] ?? korean;
}
