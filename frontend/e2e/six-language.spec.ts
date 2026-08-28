import { expect, test } from "@playwright/test";

const locales = [
  { code: "ko", language: "한국어", title: "한국에서 처음 시작하는 금융생활,", purpose: "한국에서 지금 가장 필요한 금융서비스는 무엇인가요?", choice: "돈을 저축하고 싶어요", cta: "내 금융생활 시작하기" },
  { code: "en", language: "English", title: "Starting your financial life in Korea?", purpose: "What financial service do you need most in Korea?", choice: "I want to save money", cta: "Start my financial life" },
  { code: "vi", language: "Tiếng Việt", title: "Bắt đầu cuộc sống tài chính tại Hàn Quốc?", purpose: "Bạn cần dịch vụ tài chính nào nhất tại Hàn Quốc?", choice: "Tôi muốn tiết kiệm", cta: "Bắt đầu cuộc sống tài chính" },
  { code: "zh", language: "简体中文", title: "开始在韩国的金融生活？", purpose: "您目前在韩国最需要哪种金融服务？", choice: "我想存钱", cta: "开始我的金融生活" },
  { code: "ja", language: "日本語", title: "韓国で金融生活を始めますか？", purpose: "今、韓国で最も必要な金融サービスは何ですか？", choice: "貯蓄したい", cta: "金融生活を始める" },
  { code: "th", language: "ไทย", title: "กำลังเริ่มต้นชีวิตทางการเงินในเกาหลีใช่ไหม", purpose: "ตอนนี้คุณต้องการบริการทางการเงินใดมากที่สุดในเกาหลี", choice: "ฉันต้องการออมเงิน", cta: "เริ่มต้นชีวิตทางการเงินของฉัน" },
] as const;

for (const locale of locales) {
  test(`${locale.code} landing selection persists translated intent`, async ({ page }) => {
    await page.goto("/");

    const language = page.getByRole("button", { name: `Select ${locale.language}` });
    await language.click();
    await expect(language).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: locale.title })).toBeVisible();
    await expect(page.getByRole("heading", { name: locale.purpose })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", locale.code);

    const purpose = page.getByRole("button", { name: locale.choice });
    const start = page.getByRole("button", { name: new RegExp(locale.cta) });
    await expect(start).toBeDisabled();
    await purpose.click();
    await expect(purpose).toHaveAttribute("aria-pressed", "true");
    await expect(start).toBeEnabled();

    const stored = await page.evaluate(() => ({
      locale: localStorage.getItem("visafyLocale"),
      purpose: localStorage.getItem("visafyFinancialPurpose"),
    }));
    expect(stored).toEqual({ locale: locale.code, purpose: "SAVE_MONEY" });

    await purpose.click();
    await expect(purpose).toHaveAttribute("aria-pressed", "false");
    await expect(start).toBeDisabled();
  });
}

test("selecting the same language twice clears language and purpose confirmation", async ({ page }) => {
  await page.goto("/");
  const language = page.getByRole("button", { name: "Select English" });
  await language.click();
  await page.getByRole("button", { name: "I want to save money" }).click();
  await language.click();

  await expect(language).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("heading", { name: "What financial service do you need most in Korea?" })).toHaveCount(0);
  const stored = await page.evaluate(() => ({
    locale: localStorage.getItem("visafyLocale"),
    purpose: localStorage.getItem("visafyFinancialPurpose"),
  }));
  expect(stored).toEqual({ locale: null, purpose: null });
});
