import type { Locale } from "@/i18n/config";

/**
 * Display translations for product data that is stored in Korean.
 *
 * Product names, institution names, and target summaries come from the official Korean
 * sources, so the database keeps them in Korean. These maps translate them for display only;
 * the Korean original is still shown next to a translated product name so a user can match it
 * against the bank's own page. Anything without an entry falls back to the stored Korean text,
 * which is what the screens showed before, so a newly registered product can never break.
 */

const institutions: Record<string, Partial<Record<Locale, string>>> = {
  KB국민은행: { en: "KB Kookmin Bank", vi: "Ngân hàng KB Kookmin", zh: "KB国民银行", ja: "KB国民銀行", th: "ธนาคารเคบีกุกมิน" },
  신한은행: { en: "Shinhan Bank", vi: "Ngân hàng Shinhan", zh: "新韩银行", ja: "新韓銀行", th: "ธนาคารชินฮัน" },
  하나은행: { en: "Hana Bank", vi: "Ngân hàng Hana", zh: "韩亚银行", ja: "ハナ銀行", th: "ธนาคารฮานา" },
  KB증권: { en: "KB Securities", vi: "Chứng khoán KB", zh: "KB证券", ja: "KB証券", th: "เคบีซีเคียวริตี้ส์" },
};

const productNames: Record<string, Partial<Record<Locale, string>>> = {
  "KB-MY-SAVINGS": { en: "KB My Own Savings", vi: "Tiết kiệm KB My Own", zh: "KB我的专属零存整取", ja: "KB マイ積立預金", th: "บัญชีออมทรัพย์ KB My Own" },
  "KB-STAR-TIME-DEPOSIT": { en: "KB Star Time Deposit", vi: "Tiền gửi kỳ hạn KB Star", zh: "KB Star 定期存款", ja: "KB Star 定期預金", th: "เงินฝากประจำ KB Star" },
  "KB-LIVELIHOOD-ACCOUNT": { en: "KB Livelihood Account", vi: "Tài khoản sinh hoạt phí KB", zh: "KB生计费账户", ja: "KB 生活費口座", th: "บัญชีค่าครองชีพ KB" },
  "SHINHAN-LIVELIHOOD-ACCOUNT": { en: "Shinhan Livelihood Account", vi: "Tài khoản sinh hoạt phí Shinhan", zh: "新韩生计费账户", ja: "新韓 生活費口座", th: "บัญชีค่าครองชีพชินฮัน" },
  "HANA-SALARY-COMPOUND-SAVINGS": { en: "Salary Hana Monthly Compound Savings", vi: "Tiết kiệm lãi kép hàng tháng Salary Hana", zh: "薪资韩亚月复利零存整取", ja: "給与ハナ 月複利積立預金", th: "บัญชีออมทรัพย์ดอกเบี้ยทบต้นรายเดือน Salary Hana" },
  "HANA-EASY-SAVINGS-2025": { en: "Hana The Easy Savings", vi: "Tiết kiệm Hana The Easy", zh: "韩亚更轻松零存整取", ja: "ハナ・ジ・イージー積立預金", th: "บัญชีออมทรัพย์ Hana The Easy" },
  "HANA-EASY-ONE-ACCOUNT": { en: "Easy-One Pack Account", vi: "Tài khoản Easy-One Pack", zh: "Easy-One Pack 存折账户", ja: "Easy-One Pack 通帳", th: "บัญชี Easy-One Pack" },
  "HANA-EZ-LOAN": { en: "Hana Foreigner EZ Loan", vi: "Hana EZ Loan cho người nước ngoài", zh: "韩亚外国人 EZ Loan", ja: "ハナ外国人 EZ Loan", th: "สินเชื่อ Hana EZ Loan สำหรับชาวต่างชาติ" },
  "SHINHAN-SOL-GLOBAL-SAVINGS-2025": { en: "SOL Global Savings", vi: "Tiết kiệm SOL Global", zh: "SOL 全球零存整取", ja: "SOLグローバル積立預金", th: "บัญชีออมทรัพย์ SOL Global" },
  "SHINHAN-SOL-GLOBAL-JEONSE": { en: "SOL Global Jeonse Loan (SGI, foreign customers)", vi: "Vay Jeonse SOL Global (SGI, người nước ngoài)", zh: "SOL 全球全租房贷款（首尔保证・外国人）", ja: "SOLグローバル チョンセ融資（ソウル保証・外国人）", th: "สินเชื่อชอนเซ SOL Global (SGI สำหรับชาวต่างชาติ)" },
  "KBSEC-FOREIGN-STOCK": { en: "Overseas Stock Trading for Foreign Residents", vi: "Giao dịch cổ phiếu nước ngoài cho người nước ngoài", zh: "外国人海外股票交易", ja: "外国人向け海外株式取引", th: "การซื้อขายหุ้นต่างประเทศสำหรับชาวต่างชาติ" },
};

const targetSummaries: Record<string, Partial<Record<Locale, string>>> = {
  "KB-MY-SAVINGS": {
    en: "Customers saving between KRW 10,000 and 1,000,000 a month",
    vi: "Khách hàng gửi từ 10.000 đến 1.000.000 KRW mỗi tháng",
    zh: "每月希望存入 1 万至 100 万韩元的客户",
    ja: "毎月1万ウォン以上100万ウォン以下を積み立てるお客様",
    th: "ลูกค้าที่ต้องการฝากเดือนละ 10,000 ถึง 1,000,000 วอน",
  },
  "KB-STAR-TIME-DEPOSIT": {
    en: "Customers depositing KRW 1,000,000 or more",
    vi: "Khách hàng gửi từ 1.000.000 KRW trở lên",
    zh: "存入 100 万韩元以上的客户",
    ja: "100万ウォン以上を預け入れるお客様",
    th: "ลูกค้าที่ฝากตั้งแต่ 1,000,000 วอนขึ้นไป",
  },
  "KB-LIVELIHOOD-ACCOUNT": {
    en: "Real-name individuals, including foreign customers who present an official identity document",
    vi: "Cá nhân có danh tính thật, gồm khách hàng nước ngoài xuất trình giấy tờ tùy thân chính thức",
    zh: "实名个人，包括提交实名确认证件的外国客户",
    ja: "実名の個人（実名確認書類を提出した外国人のお客様を含む）",
    th: "บุคคลที่ยืนยันตัวตนจริง รวมถึงลูกค้าต่างชาติที่แสดงเอกสารยืนยันตัวตนอย่างเป็นทางการ",
  },
  "SHINHAN-LIVELIHOOD-ACCOUNT": {
    en: "Real-name individuals and sole proprietors, including foreign customers with an official identity document",
    vi: "Cá nhân và hộ kinh doanh có danh tính thật, gồm khách hàng nước ngoài có giấy tờ tùy thân chính thức",
    zh: "实名个人与个体经营者，包括持有实名确认证件的外国客户",
    ja: "実名の個人・個人事業者（実名確認書類をお持ちの外国人のお客様を含む）",
    th: "บุคคลและผู้ประกอบการรายย่อยที่ยืนยันตัวตนจริง รวมถึงลูกค้าต่างชาติที่มีเอกสารยืนยันตัวตน",
  },
  "HANA-SALARY-COMPOUND-SAVINGS": {
    en: "Customers who fit the one-account-per-person rule and the monthly deposit limit",
    vi: "Khách hàng phù hợp quy định một tài khoản mỗi người và hạn mức gửi hàng tháng",
    zh: "符合 1 人 1 账户及每月存款限额的客户",
    ja: "1人1口座と毎月の積立限度に該当するお客様",
    th: "ลูกค้าที่เข้าเงื่อนไข 1 คน 1 บัญชี และวงเงินฝากรายเดือน",
  },
  "HANA-EASY-SAVINGS-2025": {
    en: "Real-name foreign residents who do not already hold this product",
    vi: "Người nước ngoài cư trú có danh tính thật và chưa có tài khoản sản phẩm này",
    zh: "尚未持有该产品账户的实名居住外国人",
    ja: "同一商品の口座をお持ちでない実名の居住外国人のお客様",
    th: "ชาวต่างชาติที่พำนักและยืนยันตัวตนจริง ซึ่งยังไม่มีบัญชีผลิตภัณฑ์นี้",
  },
  "HANA-EASY-ONE-ACCOUNT": {
    en: "Real-name foreign individuals or foreign sole proprietors",
    vi: "Cá nhân người nước ngoài hoặc hộ kinh doanh người nước ngoài có danh tính thật",
    zh: "实名外国个人或外国个体经营者",
    ja: "実名の外国人個人または外国人個人事業者",
    th: "บุคคลต่างชาติหรือผู้ประกอบการรายย่อยต่างชาติที่ยืนยันตัวตนจริง",
  },
  "HANA-EZ-LOAN": {
    en: "Foreign workers on an E-7 or E-9 visa who meet the residency and salary-income periods",
    vi: "Người lao động nước ngoài có visa E-7 hoặc E-9 đáp ứng thời gian cư trú và thu nhập lương",
    zh: "持 E-7 或 E-9 停留资格并满足在韩居留与薪资收入期间条件的外籍劳动者",
    ja: "E-7またはE-9の在留資格で、国内居住期間と給与所得期間の条件を満たす外国人労働者",
    th: "แรงงานต่างชาติวีซ่า E-7 หรือ E-9 ที่มีคุณสมบัติด้านระยะเวลาพำนักและรายได้เงินเดือน",
  },
  "SHINHAN-SOL-GLOBAL-SAVINGS-2025": {
    en: "Real-name foreign residents who do not already hold this product",
    vi: "Người nước ngoài cư trú có danh tính thật và chưa có tài khoản sản phẩm này",
    zh: "尚未持有该产品账户的实名居住外国人",
    ja: "同一商品の口座をお持ちでない実名の居住外国人のお客様",
    th: "ชาวต่างชาติที่พำนักและยืนยันตัวตนจริง ซึ่งยังไม่มีบัญชีผลิตภัณฑ์นี้",
  },
  "SHINHAN-SOL-GLOBAL-JEONSE": {
    en: "The direct product manual and official eligibility sources still need to be collected",
    vi: "Cần thu thập thêm bản mô tả sản phẩm trực tiếp và nguồn điều kiện chính thức",
    zh: "仍需补充直接的产品说明书与官方加入条件来源",
    ja: "直接の商品説明書と公式の加入条件ソースを追加で収集する必要があります",
    th: "ยังต้องรวบรวมเอกสารอธิบายผลิตภัณฑ์โดยตรงและแหล่งข้อมูลเงื่อนไขอย่างเป็นทางการเพิ่มเติม",
  },
  "KBSEC-FOREIGN-STOCK": {
    en: "Foreign residents of Korea who are not US or Canadian nationals",
    vi: "Người nước ngoài cư trú tại Hàn Quốc không mang quốc tịch Mỹ hoặc Canada",
    zh: "非美国・加拿大国籍的在韩居住外国人",
    ja: "米国・カナダ国籍ではない、韓国に居住する外国人のお客様",
    th: "ชาวต่างชาติที่พำนักในเกาหลีซึ่งไม่ได้ถือสัญชาติสหรัฐฯ หรือแคนาดา",
  },
};

export function institutionLabel(locale: Locale, institution: string): string {
  if (locale === "ko") return institution;
  return institutions[institution]?.[locale] ?? institution;
}

/**
 * A translated product name plus the Korean original to show beside it. The original is what a
 * user types into the bank's own site or says at a branch, so it is never dropped.
 */
export function productNameLabel(locale: Locale, productCode: string, storedName: string): { name: string; original: string | null } {
  if (locale === "ko") return { name: storedName, original: null };
  const translated = productNames[productCode]?.[locale];
  return translated ? { name: translated, original: storedName } : { name: storedName, original: null };
}

export function targetSummaryLabel(locale: Locale, productCode: string, storedSummary: string): string {
  if (locale === "ko") return storedSummary;
  return targetSummaries[productCode]?.[locale] ?? storedSummary;
}
