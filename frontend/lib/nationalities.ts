import type { Locale } from "@/i18n/config";

export type NationalityOption = {
  code: string;
  flag: string;
  names: Record<Locale, string>;
};

export const nationalityOptions: NationalityOption[] = [
  { code: "VN", flag: "🇻🇳", names: { ko: "베트남", en: "Vietnam", vi: "Việt Nam", zh: "越南", ja: "ベトナム", th: "เวียดนาม" } },
  { code: "CN", flag: "🇨🇳", names: { ko: "중국", en: "China", vi: "Trung Quốc", zh: "中国", ja: "中国", th: "จีน" } },
  { code: "JP", flag: "🇯🇵", names: { ko: "일본", en: "Japan", vi: "Nhật Bản", zh: "日本", ja: "日本", th: "ญี่ปุ่น" } },
  { code: "TH", flag: "🇹🇭", names: { ko: "태국", en: "Thailand", vi: "Thái Lan", zh: "泰国", ja: "タイ", th: "ไทย" } },
  { code: "US", flag: "🇺🇸", names: { ko: "미국", en: "United States", vi: "Hoa Kỳ", zh: "美国", ja: "アメリカ", th: "สหรัฐอเมริกา" } },
  { code: "CA", flag: "🇨🇦", names: { ko: "캐나다", en: "Canada", vi: "Canada", zh: "加拿大", ja: "カナダ", th: "แคนาดา" } },
  { code: "MN", flag: "🇲🇳", names: { ko: "몽골", en: "Mongolia", vi: "Mông Cổ", zh: "蒙古", ja: "モンゴル", th: "มองโกเลีย" } },
  { code: "PH", flag: "🇵🇭", names: { ko: "필리핀", en: "Philippines", vi: "Philippines", zh: "菲律宾", ja: "フィリピン", th: "ฟิลิปปินส์" } },
  { code: "ID", flag: "🇮🇩", names: { ko: "인도네시아", en: "Indonesia", vi: "Indonesia", zh: "印度尼西亚", ja: "インドネシア", th: "อินโดนีเซีย" } },
  { code: "UZ", flag: "🇺🇿", names: { ko: "우즈베키스탄", en: "Uzbekistan", vi: "Uzbekistan", zh: "乌兹别克斯坦", ja: "ウズベキスタン", th: "อุซเบกิสถาน" } },
  { code: "NP", flag: "🇳🇵", names: { ko: "네팔", en: "Nepal", vi: "Nepal", zh: "尼泊尔", ja: "ネパール", th: "เนปาล" } },
  { code: "KH", flag: "🇰🇭", names: { ko: "캄보디아", en: "Cambodia", vi: "Campuchia", zh: "柬埔寨", ja: "カンボジア", th: "กัมพูชา" } },
];

export function nationalityName(code: string, locale: Locale) {
  return nationalityOptions.find((option) => option.code === code)?.names[locale] ?? code;
}
