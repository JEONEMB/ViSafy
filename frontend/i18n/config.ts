export type Locale = "ko" | "en" | "vi" | "zh" | "ja" | "th";

export const localeOptions: Array<{ locale: Locale; flag: string; language: string }> = [
  { locale: "ko", flag: "🇰🇷", language: "한국어" },
  { locale: "en", flag: "🇺🇸", language: "English" },
  { locale: "vi", flag: "🇻🇳", language: "Tiếng Việt" },
  { locale: "zh", flag: "🇨🇳", language: "简体中文" },
  { locale: "ja", flag: "🇯🇵", language: "日本語" },
  { locale: "th", flag: "🇹🇭", language: "ไทย" },
];

export function isLocale(value: string | null): value is Locale {
  return localeOptions.some((option) => option.locale === value);
}

const sharedEnglish = {
  nav: { products: "Products", profile: "Profile", productAdmin: "Product admin", admin: "Source · Rule review", adminLogin: "Admin", logout: "Sign out", health: "Health" },
  landing: { eyebrow: "Financial settlement agent", title: "Official-source financial guidance", description: "Check public conditions and preparation steps.", choose: "Choose your language", hint: "Your selection is kept throughout the service." },
  profile: {
    eyebrow: "Temporary profile · stored for 24 hours", title: "Temporary financial profile", description: "Enter only the minimum information needed for a preliminary check.", privacy: "Do not enter an ID, passport, account, or card number. This profile expires after 24 hours.", required: "Required information", optional: "Optional information", nationality: "Nationality", nationalityExample: "e.g. Vietnamese", birthDate: "Date of birth", visaType: "Visa type", chooseVisa: "Select a visa", visaExpiry: "Visa expiry date", residencyStartDate: "Date residency in Korea began", occupation: "Occupation", occupationExample: "e.g. Software developer", employmentType: "Employment type", monthlyIncome: "Monthly income (KRW)", employmentDuration: "Employment duration (months)", financialPurpose: "Financial purpose", hasBankAccount: "I have a Korean bank account", housingType: "Housing type", housingExample: "e.g. Monthly rent", desiredAmount: "Desired amount (KRW)", preferredBank: "Preferred bank", residentStatus: "Resident status", resident: "Resident", nonResident: "Non-resident", yes: "Yes", no: "No", hasExistingProductAccount: "I already hold this product", desiredMonthlyAmount: "Desired monthly savings amount (KRW)", submit: "Save and browse products", submitting: "Saving...", saved: "Your profile has been saved.", dateParts: { year: "Year", month: "Month", day: "Day" }, dateInputHint: "Enter a date in YYYY-MM-DD format.", invalidDate: "Enter a valid date in YYYY-MM-DD format.", monthlyIncomeWords: "Amount entered", saveError: "Could not save the profile. Please check your entries.", employment: { regular: "Permanent employee", contract: "Contract employee", partTime: "Part-time", selfEmployed: "Self-employed", student: "Student" }, purpose: { account: "Checking account", savings: "Savings or deposit", loan: "Loan", card: "Card", investment: "Investment" }, visaNames: { "D-2": "Student", "D-4": "General trainee", "E-7": "Specially designated activities", "E-9": "Non-professional employment", "F-2": "Resident", "F-5": "Permanent resident", "F-6": "Marriage migrant" },
  },
};

export const messages = {
  ko: { ...sharedEnglish, nav: { products: "금융상품", profile: "프로필", productAdmin: "상품 관리", admin: "Source · Rule 검수", adminLogin: "관리자", logout: "로그아웃", health: "상태" } },
  en: sharedEnglish,
  vi: { ...sharedEnglish, nav: { products: "Sản phẩm", profile: "Hồ sơ", productAdmin: "Quản lý sản phẩm", admin: "Kiểm duyệt Source · Rule", adminLogin: "Quản trị", logout: "Đăng xuất", health: "Trạng thái" } },
  zh: { ...sharedEnglish, nav: { products: "金融产品", profile: "个人资料", productAdmin: "产品管理", admin: "来源与规则审核", adminLogin: "管理员", logout: "退出", health: "状态" } },
  ja: { ...sharedEnglish, nav: { products: "金融商品", profile: "プロフィール", productAdmin: "商品管理", admin: "情報源・ルール審査", adminLogin: "管理者", logout: "ログアウト", health: "状態" } },
  th: { ...sharedEnglish, nav: { products: "ผลิตภัณฑ์การเงิน", profile: "โปรไฟล์", productAdmin: "จัดการผลิตภัณฑ์", admin: "ตรวจสอบแหล่งข้อมูลและกฎ", adminLogin: "ผู้ดูแล", logout: "ออกจากระบบ", health: "สถานะ" } },
} as const;
