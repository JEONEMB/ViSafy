import type { Locale } from "@/i18n/config";

export type NationalityOption = {
  code: string;
  flag: string;
  names: Record<Locale, string>;
};

export const nationalityOptions: NationalityOption[] = [
  { code: "VN", flag: "🇻🇳", names: { ko: "베트남", en: "Vietnam", vi: "Việt Nam" } },
  { code: "CN", flag: "🇨🇳", names: { ko: "중국", en: "China", vi: "Trung Quốc" } },
  { code: "JP", flag: "🇯🇵", names: { ko: "일본", en: "Japan", vi: "Nhật Bản" } },
  { code: "TH", flag: "🇹🇭", names: { ko: "태국", en: "Thailand", vi: "Thái Lan" } },
  { code: "US", flag: "🇺🇸", names: { ko: "미국", en: "United States", vi: "Hoa Kỳ" } },
  { code: "CA", flag: "🇨🇦", names: { ko: "캐나다", en: "Canada", vi: "Canada" } },
  { code: "MN", flag: "🇲🇳", names: { ko: "몽골", en: "Mongolia", vi: "Mông Cổ" } },
  { code: "PH", flag: "🇵🇭", names: { ko: "필리핀", en: "Philippines", vi: "Philippines" } },
  { code: "ID", flag: "🇮🇩", names: { ko: "인도네시아", en: "Indonesia", vi: "Indonesia" } },
  { code: "UZ", flag: "🇺🇿", names: { ko: "우즈베키스탄", en: "Uzbekistan", vi: "Uzbekistan" } },
  { code: "NP", flag: "🇳🇵", names: { ko: "네팔", en: "Nepal", vi: "Nepal" } },
  { code: "KH", flag: "🇰🇭", names: { ko: "캄보디아", en: "Cambodia", vi: "Campuchia" } },
];

export function nationalityName(code: string, locale: Locale) {
  return nationalityOptions.find((option) => option.code === code)?.names[locale] ?? code;
}
