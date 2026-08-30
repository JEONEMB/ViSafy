import { expect, test } from "@playwright/test";
import { localeOptions, type Locale } from "../i18n/config";
import { baselineTellerExchanges, conditionAsks, ruleTellerExchanges, tellerExchangesFor, type Phrase } from "../lib/teller-questions";

const locales = localeOptions.map((option) => option.locale);
const allExchanges = [...baselineTellerExchanges, ...Object.values(ruleTellerExchanges)];
const allPhrases: Phrase[] = [
  ...allExchanges.flatMap((exchange) => [exchange.question, ...exchange.answers]),
  ...Object.values(conditionAsks),
];

test("every counter phrase is translated into all supported languages", () => {
  for (const phrase of allPhrases) {
    for (const locale of locales) {
      expect(phrase[locale as Locale], `${phrase.ko} → ${locale}`).toBeTruthy();
    }
  }
});

test("no answer lets the customer claim they meet a condition", () => {
  // Only the bank decides eligibility, so an answer may state a fact or ask — never assert.
  const claims = ["충족", "자격이 있습니다", "가입 가능", "승인", "대상입니다"];
  for (const exchange of allExchanges) {
    for (const answer of exchange.answers) {
      for (const claim of claims) {
        expect(answer.ko, `${exchange.id}: ${answer.ko}`).not.toContain(claim);
      }
    }
  }
});

test("no translation leaks Korean text", () => {
  const hangul = /[가-힣]/;
  for (const phrase of allPhrases) {
    for (const locale of locales.filter((value) => value !== "ko")) {
      expect(hangul.test(phrase[locale as Locale]), `${locale}: ${phrase[locale as Locale]}`).toBe(false);
    }
  }
});

test("a product's own conditions are added after the baseline questions", () => {
  const withVisa = tellerExchangesFor(["VISA_TYPE", "VISA_TYPE", "NOT_IN_CATALOGUE"]);

  expect(withVisa.slice(0, baselineTellerExchanges.length)).toEqual(baselineTellerExchanges);
  expect(withVisa.filter((exchange) => exchange.id === "VISA_TYPE")).toHaveLength(1);
  expect(withVisa).toHaveLength(baselineTellerExchanges.length + 1);
});
