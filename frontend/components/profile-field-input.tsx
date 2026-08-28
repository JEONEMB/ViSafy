import type { TempProfile, TempProfileInput } from "@/types/profile";

export type ProfileInputLocale = "ko" | "en" | "vi";

const fieldLabels: Record<string, Record<ProfileInputLocale, string>> = {
  visaType: { ko: "체류자격은 무엇인가요?", en: "What is your status of stay?", vi: "Tư cách lưu trú của bạn là gì?" },
  visaExpiry: { ko: "비자 만료일은 언제인가요?", en: "When does your visa expire?", vi: "Visa của bạn hết hạn khi nào?" },
  birthDate: { ko: "생년월일은 언제인가요?", en: "What is your date of birth?", vi: "Ngày sinh của bạn là gì?" },
  residencyStartDate: { ko: "한국 체류 시작일은 언제인가요?", en: "When did you start residing in Korea?", vi: "Bạn bắt đầu cư trú tại Hàn Quốc khi nào?" },
  monthlyIncome: { ko: "월 소득은 얼마인가요?", en: "What is your monthly income in KRW?", vi: "Thu nhập hàng tháng của bạn là bao nhiêu KRW?" },
  employmentDurationMonths: { ko: "현재 근속기간은 몇 개월인가요?", en: "How many months have you worked at your current job?", vi: "Bạn đã làm công việc hiện tại bao nhiêu tháng?" },
  desiredAmount: { ko: "희망 금액은 얼마인가요?", en: "What amount do you want in KRW?", vi: "Số tiền mong muốn là bao nhiêu KRW?" },
  desiredMonthlyAmount: { ko: "월 납입 희망금액은 얼마인가요?", en: "What monthly amount do you want in KRW?", vi: "Số tiền gửi hàng tháng mong muốn là bao nhiêu KRW?" },
  residentStatus: { ko: "한국 세법·은행 기준의 거주자 상태를 알고 있나요?", en: "What is your resident status for this financial service?", vi: "Tình trạng cư trú của bạn đối với dịch vụ này là gì?" },
  occupation: { ko: "현재 직업은 무엇인가요?", en: "What is your occupation?", vi: "Nghề nghiệp hiện tại của bạn là gì?" },
  employmentType: { ko: "현재 고용형태는 무엇인가요?", en: "What is your employment type?", vi: "Hình thức việc làm của bạn là gì?" },
  hasExistingProductAccount: { ko: "이 상품 계좌를 이미 보유하고 있나요?", en: "Do you already have this product account?", vi: "Bạn đã có tài khoản sản phẩm này chưa?" },
  hasResidenceCard: { ko: "외국인등록증·체류카드를 보유하고 있나요?", en: "Do you have a residence card?", vi: "Bạn có thẻ cư trú không?" },
  hasPassport: { ko: "여권을 보유하고 있나요?", en: "Do you have a passport?", vi: "Bạn có hộ chiếu không?" },
  hasDomesticPhone: { ko: "국내 휴대전화를 보유하고 있나요?", en: "Do you have a Korean mobile phone?", vi: "Bạn có điện thoại Hàn Quốc không?" },
  canDomesticPhoneVerify: { ko: "국내 휴대전화로 본인인증할 수 있나요?", en: "Can you verify your identity with a Korean phone?", vi: "Bạn có thể xác minh bằng điện thoại Hàn Quốc không?" },
  hasKoreanBankAccount: { ko: "국내 입출금계좌를 보유하고 있나요?", en: "Do you have a Korean demand-deposit account?", vi: "Bạn có tài khoản thanh toán Hàn Quốc không?" },
  hasKoreanCreditHistory: { ko: "국내 신용이력이 있나요?", en: "Do you have Korean credit history?", vi: "Bạn có lịch sử tín dụng tại Hàn Quốc không?" },
  preferredChannel: { ko: "선호하는 신청 채널은 무엇인가요?", en: "Which application channel do you prefer?", vi: "Bạn ưu tiên kênh đăng ký nào?" },
  remittanceCountry: { ko: "송금할 국가는 어디인가요?", en: "Which country will receive the remittance?", vi: "Bạn muốn chuyển tiền đến quốc gia nào?" },
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

export function ProfileFieldInput({ field, value, onChange }: { field: string; value: string; onChange: (value: string) => void }) {
  if (field.startsWith("has") || field.startsWith("can")) return <select className="ui-input" value={value} onChange={(event) => onChange(event.target.value)}><option value="">-</option><option value="true">Yes</option><option value="false">No</option></select>;
  if (field === "residentStatus") return <select className="ui-input" value={value} onChange={(event) => onChange(event.target.value)}><option value="">-</option><option value="RESIDENT">Resident</option><option value="NON_RESIDENT">Non-resident</option><option value="UNKNOWN">Unknown</option></select>;
  if (field === "preferredChannel") return <select className="ui-input" value={value} onChange={(event) => onChange(event.target.value)}><option value="">-</option><option value="BRANCH">Branch</option><option value="ONLINE">Online / Mobile</option></select>;
  if (field === "visaType") return <select className="ui-input" value={value} onChange={(event) => onChange(event.target.value)}><option value="">-</option>{["D-2", "D-4", "E-7", "E-9", "F-2", "F-5", "F-6"].map((code) => <option key={code} value={code}>{code}</option>)}</select>;
  const type = field.toLowerCase().includes("date") || field === "visaExpiry" ? "date" : ["monthlyIncome", "employmentDurationMonths", "desiredAmount", "desiredMonthlyAmount"].includes(field) ? "number" : "text";
  return <input className="ui-input" min={type === "number" ? 0 : undefined} type={type} value={value} onChange={(event) => onChange(event.target.value)} />;
}

export function profileFieldLabel(language: ProfileInputLocale, field: string) {
  return fieldLabels[field]?.[language] ?? (language === "ko" ? `${field} 정보를 알려주세요.` : `Please provide ${field}.`);
}
