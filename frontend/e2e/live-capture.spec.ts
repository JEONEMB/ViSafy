import { test, type APIRequestContext, type Page } from "@playwright/test";

/**
 * Captures submission evidence from the deployed site. Excluded from the default run; invoke with
 * E2E_BASE_URL=https://<domain> npx playwright test e2e/live-capture.spec.ts
 */
const outputDirectory = "../docs/evidence";

const loanProfile = {
  nationality: "VN", visaType: "E-9", visaExpiry: "2027-10-30", residencyStartDate: "2024-08-30",
  financialPurpose: "GET_LOAN", language: "ko", residentStatus: "RESIDENT", monthlyIncome: 2800000,
  employmentDurationMonths: 10, hasResidenceCard: true, hasPassport: true, hasDomesticPhone: true,
  canDomesticPhoneVerify: true, hasKoreanBankAccount: true, hasKoreanCreditHistory: false,
  hasExistingProductAccount: false, desiredMonthlyAmount: 300000, preferredChannel: "BRANCH",
};

async function seedProfile(request: APIRequestContext, page: Page, overrides: Record<string, unknown> = {}) {
  const response = await request.post("/api/profiles", { data: { ...loanProfile, ...overrides } });
  const profile = await response.json();
  await page.addInitScript(([id, sessionId, locale]) => {
    localStorage.setItem("visafyProfileId", String(id));
    localStorage.setItem("visafyProfileSessionId", String(sessionId));
    localStorage.setItem("visafyLocale", String(locale));
  }, [profile.id, profile.sessionId, (overrides.language as string) ?? "ko"]);
  return profile;
}

async function productIds(request: APIRequestContext) {
  const products = await (await request.get("/api/products")).json();
  return Object.fromEntries(products.map((product: { productCode: string; id: number }) => [product.productCode, product.id]));
}

test("capture the demo screens from the deployed site", async ({ page, request }) => {
  test.setTimeout(300_000);
  const ids = await productIds(request);
  await seedProfile(request, page);
  await page.setViewportSize({ width: 1280, height: 1000 });

  const screens: Array<[string, string]> = [
    ["01-landing", "/"],
    ["02-products", "/products"],
    ["03-demo-a-general-product", `/products/${ids["KB-MY-SAVINGS"]}`],
    ["04-demo-c-channel-separation", `/products/${ids["HANA-SALARY-COMPOUND-SAVINGS"]}`],
    ["05-demo-d-loan", `/products/${ids["HANA-EZ-LOAN"]}`],
    ["06-demo-e-insufficient-source", `/products/${ids["SHINHAN-SOL-GLOBAL-JEONSE"]}`],
    ["07-bank-visit-packet", `/products/${ids["HANA-EZ-LOAN"]}/packet`],
  ];

  for (const [name, path] of screens) {
    await page.goto(path);
    // The packet waits on a live OpenAI call, so settle on its content rather than a fixed delay.
    if (path.endsWith("/packet")) await page.getByRole("heading", { name: /5\./ }).waitFor({ timeout: 120_000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${outputDirectory}/${name}.png`, fullPage: true });
    console.log(`captured ${name}`);
  }
});

test("capture the packet on a phone-sized screen", async ({ page, request }) => {
  test.setTimeout(180_000);
  const ids = await productIds(request);
  await seedProfile(request, page);
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto(`/products/${ids["HANA-EZ-LOAN"]}/packet`);
  await page.getByRole("heading", { name: /5\./ }).waitFor({ timeout: 120_000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${outputDirectory}/08-packet-mobile.png`, fullPage: true });

  await page.getByRole("button", { name: /은행원에게 보여주기|Show to the teller/ }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${outputDirectory}/09-teller-view-mobile.png` });
  console.log("captured mobile packet and teller view");
});
