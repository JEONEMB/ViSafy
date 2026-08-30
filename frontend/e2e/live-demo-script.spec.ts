import { expect, test } from "@playwright/test";

/**
 * Walks the 3-minute demo script (docs/season3-demo-script-3min.md) as a presenter would, on the
 * deployed site, so a rehearsal failure shows up before the stage does. Opt-in:
 *   E2E_BASE_URL=https://<domain> npx playwright test e2e/live-demo-script.spec.ts
 */
test("the 3-minute demo runs end to end in English", async ({ page }) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  // 0:00 Landing — pick English, then the loan goal.
  await page.goto("/");
  await page.getByRole("button", { name: /English/ }).click();
  await page.getByRole("button", { name: "I need a loan" }).click();
  await page.getByRole("button", { name: "Start my financial life" }).click();

  // 0:18 Profile — nationality, then the readiness answers.
  await expect(page.locator('select[name="financialPurpose"]')).toHaveValue("GET_LOAN");
  await page.locator('select[name="nationality"]').selectOption("VN");
  await page.locator('button[data-profile-next="1"]').click();
  await expect(page.locator('section[data-step="2"]')).toBeVisible();

  // The packet is what the demo builds to, so prove the deep link a presenter can fall back on.
  await page.goto("/products/3");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("link", { name: /Open packet/ })).toBeVisible();

  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("the packet the demo opens carries all five sections and the teller view", async ({ page, request }) => {
  test.setTimeout(300_000);
  const profile = await (await request.post("/api/profiles", {
    data: {
      nationality: "VN", visaType: "E-9", visaExpiry: "2027-10-30", residencyStartDate: "2024-08-30",
      financialPurpose: "GET_LOAN", language: "en", residentStatus: "RESIDENT", monthlyIncome: 2800000,
      employmentDurationMonths: 10, hasResidenceCard: true, hasPassport: true, hasDomesticPhone: true,
      canDomesticPhoneVerify: true, hasKoreanBankAccount: true, hasKoreanCreditHistory: false,
      hasExistingProductAccount: false, desiredMonthlyAmount: 300000, preferredChannel: "BRANCH",
    },
  })).json();
  await page.addInitScript(([id, sessionId]) => {
    localStorage.setItem("visafyProfileId", String(id));
    localStorage.setItem("visafyProfileSessionId", String(sessionId));
    localStorage.setItem("visafyLocale", "en");
  }, [profile.id, profile.sessionId]);

  await page.goto("/products/3/packet");
  for (const heading of ["1. Documents to bring", "2. What to show at the counter",
    "3. Talking with the teller", "4. Official application steps", "5. Official evidence"]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible({ timeout: 120_000 });
  }

  // The counter sentence stays Korean while the page around it is English.
  const script = page.locator("section").filter({ has: page.getByRole("heading", { name: "2. What to show at the counter" }) }).last();
  await expect(script.getByText(/[가-힣]/).first()).toBeVisible();
  await expect(page.getByText("외국인등록증 있으세요?")).toBeVisible();
  await expect(page.getByText("Do you have your residence card?")).toBeVisible();

  await page.getByRole("button", { name: "Show to the teller" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("the demo E product is presented as needing more information", async ({ request }) => {
  const profile = await (await request.post("/api/profiles", {
    data: {
      nationality: "VN", visaType: "E-9", visaExpiry: "2027-10-30", residencyStartDate: "2024-08-30",
      financialPurpose: "GET_LOAN", language: "en", residentStatus: "RESIDENT", monthlyIncome: 2800000,
      employmentDurationMonths: 10, hasResidenceCard: true, hasPassport: true, hasDomesticPhone: true,
      canDomesticPhoneVerify: true, hasKoreanBankAccount: true, hasKoreanCreditHistory: false,
      hasExistingProductAccount: false, desiredMonthlyAmount: 300000, preferredChannel: "BRANCH",
    },
  })).json();
  const recommendations = await (await request.post("/api/recommendations", {
    data: { profileSessionId: profile.sessionId },
  })).json();

  const audiences = new Set(recommendations.recommended.map((r: { productAudience: string }) => r.productAudience));
  expect(audiences.size, "the demo needs both audiences in one list").toBeGreaterThan(1);
  expect(recommendations.recommended.some((r: { productId: number }) => r.productId === 3)).toBe(true);

  const needMore = recommendations.additionalInformationNeeded.map((r: { productId: number }) => r.productId);
  expect(needMore, "Demo E must appear as needing more information").toContain(4);
});
