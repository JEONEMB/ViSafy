import type { Locale } from "@/i18n/config";
import type { TempProfile, TempProfileInput } from "@/types/profile";

const fieldLabels: Record<string, Record<Locale, string>> = {
  visaType: { ko: "체류자격은 무엇인가요?", en: "What is your status of stay?", vi: "Tư cách lưu trú của bạn là gì?", zh: "您的停留资格是什么？", ja: "在留資格は何ですか？", th: "สถานะการพำนักของคุณคืออะไร?" },
  visaExpiry: { ko: "비자 만료일은 언제인가요?", en: "When does your visa expire?", vi: "Visa của bạn hết hạn khi nào?", zh: "您的签证何时到期？", ja: "ビザの有効期限はいつですか？", th: "วีซ่าของคุณหมดอายุเมื่อใด?" },
  birthDate: { ko: "생년월일은 언제인가요?", en: "What is your date of birth?", vi: "Ngày sinh của bạn là gì?", zh: "您的出生日期是？", ja: "生年月日はいつですか？", th: "วันเกิดของคุณคือวันใด?" },
  residencyStartDate: { ko: "한국 체류 시작일은 언제인가요?", en: "When did you start residing in Korea?", vi: "Bạn bắt đầu cư trú tại Hàn Quốc khi nào?", zh: "您从何时开始在韩国居留？", ja: "韓国での滞在開始日はいつですか？", th: "คุณเริ่มพำนักในเกาหลีเมื่อใด?" },
  monthlyIncome: { ko: "월 소득은 얼마인가요?", en: "What is your monthly income in KRW?", vi: "Thu nhập hàng tháng của bạn là bao nhiêu KRW?", zh: "您的月收入是多少韩元？", ja: "月収はいくらですか（ウォン）？", th: "รายได้ต่อเดือนของคุณกี่วอน?" },
  employmentDurationMonths: { ko: "현재 근속기간은 몇 개월인가요?", en: "How many months have you worked at your current job?", vi: "Bạn đã làm công việc hiện tại bao nhiêu tháng?", zh: "您在现职工作了几个月？", ja: "現在の勤続期間は何か月ですか？", th: "คุณทำงานที่ปัจจุบันมากี่เดือนแล้ว?" },
  desiredAmount: { ko: "희망 금액은 얼마인가요?", en: "What amount do you want in KRW?", vi: "Số tiền mong muốn là bao nhiêu KRW?", zh: "您希望的金额是多少韩元？", ja: "希望金額はいくらですか（ウォン）？", th: "จำนวนเงินที่คุณต้องการกี่วอน?" },
  desiredMonthlyAmount: { ko: "월 납입 희망금액은 얼마인가요?", en: "What monthly amount do you want in KRW?", vi: "Số tiền gửi hàng tháng mong muốn là bao nhiêu KRW?", zh: "您希望每月存入多少韩元？", ja: "月々の希望積立額はいくらですか（ウォン）？", th: "คุณต้องการฝากรายเดือนกี่วอน?" },
  residentStatus: { ko: "한국 세법·은행 기준의 거주자 상태를 알고 있나요?", en: "What is your resident status for this financial service?", vi: "Tình trạng cư trú của bạn đối với dịch vụ này là gì?", zh: "按韩国税法与银行标准，您的居住者身份是？", ja: "韓国の税法・銀行基準での居住者区分はどれですか？", th: "สถานะผู้พำนักของคุณตามเกณฑ์ภาษีและธนาคารเกาหลีคืออะไร?" },
  occupation: { ko: "현재 직업은 무엇인가요?", en: "What is your occupation?", vi: "Nghề nghiệp hiện tại của bạn là gì?", zh: "您目前的职业是什么？", ja: "現在の職業は何ですか？", th: "อาชีพปัจจุบันของคุณคืออะไร?" },
  employmentType: { ko: "현재 고용형태는 무엇인가요?", en: "What is your employment type?", vi: "Hình thức việc làm của bạn là gì?", zh: "您目前的雇佣形式是什么？", ja: "現在の雇用形態は何ですか？", th: "รูปแบบการจ้างงานของคุณคืออะไร?" },
  hasExistingProductAccount: { ko: "이 상품 계좌를 이미 보유하고 있나요?", en: "Do you already have this product account?", vi: "Bạn đã có tài khoản sản phẩm này chưa?", zh: "您是否已持有该产品账户？", ja: "この商品の口座をすでにお持ちですか？", th: "คุณมีบัญชีผลิตภัณฑ์นี้อยู่แล้วหรือไม่?" },
  hasResidenceCard: { ko: "외국인등록증·체류카드를 보유하고 있나요?", en: "Do you have a residence card?", vi: "Bạn có thẻ cư trú không?", zh: "您是否持有外国人登录证／居留卡？", ja: "外国人登録証・在留カードをお持ちですか？", th: "คุณมีบัตรประจำตัวคนต่างด้าว/บัตรพำนักหรือไม่?" },
  hasPassport: { ko: "여권을 보유하고 있나요?", en: "Do you have a passport?", vi: "Bạn có hộ chiếu không?", zh: "您是否持有护照？", ja: "パスポートをお持ちですか？", th: "คุณมีหนังสือเดินทางหรือไม่?" },
  hasDomesticPhone: { ko: "국내 휴대전화를 보유하고 있나요?", en: "Do you have a Korean mobile phone?", vi: "Bạn có điện thoại Hàn Quốc không?", zh: "您是否有韩国手机号？", ja: "韓国の携帯電話をお持ちですか？", th: "คุณมีโทรศัพท์มือถือของเกาหลีหรือไม่?" },
  canDomesticPhoneVerify: { ko: "국내 휴대전화로 본인인증할 수 있나요?", en: "Can you verify your identity with a Korean phone?", vi: "Bạn có thể xác minh bằng điện thoại Hàn Quốc không?", zh: "您能用韩国手机进行本人认证吗？", ja: "韓国の携帯電話で本人認証できますか？", th: "คุณยืนยันตัวตนด้วยโทรศัพท์เกาหลีได้หรือไม่?" },
  hasKoreanBankAccount: { ko: "국내 입출금계좌를 보유하고 있나요?", en: "Do you have a Korean demand-deposit account?", vi: "Bạn có tài khoản thanh toán Hàn Quốc không?", zh: "您是否持有韩国的活期存款账户？", ja: "韓国の普通預金口座をお持ちですか？", th: "คุณมีบัญชีเงินฝากกระแสรายวันของเกาหลีหรือไม่?" },
  hasKoreanCreditHistory: { ko: "국내 신용이력이 있나요?", en: "Do you have Korean credit history?", vi: "Bạn có lịch sử tín dụng tại Hàn Quốc không?", zh: "您在韩国是否有信用记录？", ja: "韓国での信用履歴はありますか？", th: "คุณมีประวัติเครดิตในเกาหลีหรือไม่?" },
  preferredChannel: { ko: "선호하는 신청 채널은 무엇인가요?", en: "Which application channel do you prefer?", vi: "Bạn ưu tiên kênh đăng ký nào?", zh: "您偏好哪种申请渠道？", ja: "希望する申請チャネルはどれですか？", th: "คุณต้องการสมัครผ่านช่องทางใด?" },
  remittanceCountry: { ko: "송금할 국가는 어디인가요?", en: "Which country will receive the remittance?", vi: "Bạn muốn chuyển tiền đến quốc gia nào?", zh: "您要汇款到哪个国家？", ja: "送金先の国はどこですか？", th: "คุณต้องการโอนเงินไปประเทศใด?" },
};

const optionLabels: Record<Locale, { yes: string; no: string; resident: string; nonResident: string; unknown: string; branch: string; online: string }> = {
  ko: { yes: "예", no: "아니오", resident: "거주자", nonResident: "비거주자", unknown: "모름", branch: "영업점 방문", online: "모바일·온라인" },
  en: { yes: "Yes", no: "No", resident: "Resident", nonResident: "Non-resident", unknown: "Not sure", branch: "Branch visit", online: "Mobile / online" },
  vi: { yes: "Có", no: "Không", resident: "Người cư trú", nonResident: "Người không cư trú", unknown: "Không rõ", branch: "Đến chi nhánh", online: "Di động / trực tuyến" },
  zh: { yes: "是", no: "否", resident: "居住者", nonResident: "非居住者", unknown: "不清楚", branch: "前往营业网点", online: "手机／线上" },
  ja: { yes: "はい", no: "いいえ", resident: "居住者", nonResident: "非居住者", unknown: "わからない", branch: "店舗を訪問", online: "モバイル・オンライン" },
  th: { yes: "ใช่", no: "ไม่ใช่", resident: "ผู้มีถิ่นที่อยู่", nonResident: "ผู้ไม่มีถิ่นที่อยู่", unknown: "ไม่ทราบ", branch: "ไปที่สาขา", online: "มือถือ / ออนไลน์" },
};

export function profileInput(profile: TempProfile): TempProfileInput {
  const { id: _id, sessionId: _session, expiresAt: _expiry, ...input } = profile;
  return input;
}

export function parseProfileAnswer(field: string, value: string): unknown {
  if (["monthlyIncome", "employmentDurationMonths", "desiredAmount", "desiredMonthlyAmount"].includes(field)) return Number(value);
  if (field.startsWith("has") || field.startsWith("can")) return value === "true";
  return value;
}

export function ProfileFieldInput({ field, value, locale, onChange }: { field: string; value: string; locale: Locale; onChange: (value: string) => void }) {
  const options = optionLabels[locale];
  if (field.startsWith("has") || field.startsWith("can")) return <select className="ui-input" value={value} onChange={(event) => onChange(event.target.value)}><option value="">-</option><option value="true">{options.yes}</option><option value="false">{options.no}</option></select>;
  if (field === "residentStatus") return <select className="ui-input" value={value} onChange={(event) => onChange(event.target.value)}><option value="">-</option><option value="RESIDENT">{options.resident}</option><option value="NON_RESIDENT">{options.nonResident}</option><option value="UNKNOWN">{options.unknown}</option></select>;
  if (field === "preferredChannel") return <select className="ui-input" value={value} onChange={(event) => onChange(event.target.value)}><option value="">-</option><option value="BRANCH">{options.branch}</option><option value="ONLINE">{options.online}</option></select>;
  if (field === "visaType") return <select className="ui-input" value={value} onChange={(event) => onChange(event.target.value)}><option value="">-</option>{["D-2", "D-4", "E-7", "E-9", "F-2", "F-5", "F-6"].map((code) => <option key={code} value={code}>{code}</option>)}</select>;
  const type = field.toLowerCase().includes("date") || field === "visaExpiry" ? "date" : ["monthlyIncome", "employmentDurationMonths", "desiredAmount", "desiredMonthlyAmount"].includes(field) ? "number" : "text";
  return <input className="ui-input" min={type === "number" ? 0 : undefined} type={type} value={value} onChange={(event) => onChange(event.target.value)} />;
}

export function profileFieldLabel(language: Locale, field: string) {
  return fieldLabels[field]?.[language] ?? (language === "ko" ? `${field} 정보를 알려주세요.` : `Please provide ${field}.`);
}
