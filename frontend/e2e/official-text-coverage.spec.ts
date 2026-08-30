import { expect, test } from "@playwright/test";
import { localeOptions, type Locale } from "../i18n/config";
import { officialText } from "../lib/official-text-localization";

/**
 * Reviewer-authored Korean reaches the UI from the database, so a new product or step can
 * silently reintroduce Korean into a translated page. This guards the strings the catalogue
 * is expected to cover; `live-check.spec.ts` checks the deployed catalogue against live data.
 */
const covered = [
  "허용 체류자격",
  "외국인등록증",
  "최소 예치금액",
  "공식 상품설명서 확인",
  "지점 또는 KB스타뱅킹",
  "하나은행 영업점에서 상품 조건과 필요서류를 확인하고 신청합니다.",
];

const otherLocales = localeOptions.map((option) => option.locale).filter((locale) => locale !== "ko");

test("official text is translated into every non-Korean locale", () => {
  const hangul = /[가-힣]/;
  for (const korean of covered) {
    for (const locale of otherLocales) {
      const translated = officialText(locale as Locale, korean);
      expect(translated, `${korean} → ${locale} was not translated`).not.toBe(korean);
      expect(hangul.test(translated), `${locale}: ${translated} still contains Korean`).toBe(false);
    }
  }
});

test("Korean is returned unchanged and unknown text falls back", () => {
  expect(officialText("ko", "허용 체류자격")).toBe("허용 체류자격");
  expect(officialText("en", "관리자가 나중에 쓴 문구")).toBe("관리자가 나중에 쓴 문구");
  expect(officialText("en", null)).toBe("");
});
