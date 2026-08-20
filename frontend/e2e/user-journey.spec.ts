import { expect, test, type Page, type Route } from "@playwright/test";

type SubmittedProfile = {
  financialPurpose?: string;
  nationality?: string;
  language?: string;
  additionalUpdated?: boolean;
  hasExistingProductAccount?: boolean;
  desiredMonthlyAmount?: number;
};

const sourceUrl = "https://www.kbstar.com/official-product";
const rule = {
  id: 101,
  productId: 10,
  ruleKey: "VISA_TYPE",
  operator: "IN",
  ruleValue: '["E-9"]',
  ruleLevel: "HARD",
  ruleNature: "HARD_ELIGIBILITY",
  mandatory: true,
  sourceDocumentId: 12,
  sourceLocator: "Product guide p.3",
  validFrom: "2026-01-01",
  validTo: null,
  reviewStatus: "APPROVED",
  verifiedAt: "2026-08-20T00:00:00Z",
  description: "E-9 status is included in the reviewed public condition.",
  sourceExcerpt: "Eligible status of stay: E-9",
};
const product = {
  id: 10,
  productCode: "E2E-LOAN",
  institution: "KB Bank",
  productName: "Foreign Resident Housing Loan",
  productType: "LOAN",
  financialPurpose: "LOAN",
  description: "A test product backed by an official source.",
  targetSummary: "Foreign residents seeking housing finance",
  active: true,
  foreignerTarget: true,
  informationBaseDate: "2026-08-20",
  publicConditions: "E-9 status and age requirements",
  additionalConditions: "Guarantee review required",
  requiredDocuments: "Passport and proof of income",
  applicationMethod: "Apply through an official branch",
  diagnosisStatus: "READY",
  sourceDocumentId: 12,
  sourceTitle: "KB Official Product Guide",
  sourceUrl,
  updatedAt: "2026-08-20T00:00:00Z",
  rules: [rule],
  requiredFields: ["visaType", "hasExistingProductAccount", "desiredMonthlyAmount"],
  diagnosisReasonCode: "APPROVED_HARD_RULES_AVAILABLE",
};
const passedRule = {
  ruleId: 101,
  key: "VISA_TYPE",
  messageCode: "RULE_PASSED",
  message: "Visa type condition met (current: E-9, required: E-9).",
  actualValue: "E-9",
  expectedValue: '["E-9"]',
  mandatory: true,
  blocking: false,
  sourceExcerpt: "Eligible status of stay: E-9",
  sourceLocator: "Product guide p.3",
  sourceUrl,
};
const externalRule = {
  ruleId: 102,
  key: "GUARANTEE",
  messageCode: "EXTERNAL_CHECK",
  message: "Guarantee eligibility must be confirmed by the bank.",
  actualValue: null,
  expectedValue: "true",
  mandatory: true,
  blocking: true,
  sourceExcerpt: "Subject to guarantee review",
  sourceLocator: "Product guide p.5",
  sourceUrl,
};
const eligibility = {
  status: "NEED_BANK_CONFIRMATION",
  productId: 10,
  passedRules: [passedRule],
  failedRules: [],
  externalChecks: [externalRule],
  unknownRules: [],
  insufficientReasons: [],
  requiredFields: ["visaType", "hasExistingProductAccount", "desiredMonthlyAmount"],
  disclaimer: "This is a preliminary check and not final approval.",
};
const guidance = {
  productId: 10,
  personalized: true,
  officialRequired: [{ id: 1, documentName: "Passport", description: "Valid passport", requirementType: "OFFICIAL_REQUIRED", conditionRuleKey: null, sourceTitle: product.sourceTitle, sourceUrl, sourceLocator: "p.7", verifiedAt: "2026-08-20T00:00:00Z" }],
  conditional: [{ id: 2, documentName: "Proof of income", description: "Required for employed applicants", requirementType: "CONDITIONAL", conditionRuleKey: "EMPLOYMENT_TYPE", sourceTitle: product.sourceTitle, sourceUrl, sourceLocator: "p.8", verifiedAt: "2026-08-20T00:00:00Z" }],
  bankConfirmation: [{ id: 3, documentName: "Additional credit-review documents", description: "Confirm with the bank", requirementType: "BANK_CONFIRMATION", conditionRuleKey: null, sourceTitle: product.sourceTitle, sourceUrl, sourceLocator: "p.9", verifiedAt: "2026-08-20T00:00:00Z" }],
  applicationSteps: [{ id: 4, stepOrder: 1, title: "Check documents", description: "Prepare the official checklist.", channel: "Branch", sourceTitle: product.sourceTitle, sourceUrl, sourceLocator: "p.10" }],
  excludedConditionalCount: 0,
  disclaimer: "Only documents confirmed by approved official Sources are shown.",
};

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

async function mockApi(page: Page, submittedProfile: SubmittedProfile) {
  let storedProfile: Record<string, unknown> | null = null;
  await page.route("http://localhost:8080/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path === "/api/visas") return json(route, [{ visaCode: "E-9", visaName: "Non-professional employment", visaCategory: "WORK", description: "E-9", active: true }]);
    if (path === "/api/profiles" && request.method() === "POST") {
      const body = request.postDataJSON();
      submittedProfile.financialPurpose = body.financialPurpose;
      submittedProfile.nationality = body.nationality;
      submittedProfile.language = body.language;
      storedProfile = { ...body, id: 1, sessionId: "e2e-profile-session", expiresAt: "2026-08-21T00:00:00Z" };
      return json(route, storedProfile, 201);
    }
    if (path === "/api/profiles/1" && request.method() === "GET") return json(route, storedProfile);
    if (path === "/api/profiles/1" && request.method() === "PUT") {
      const body = request.postDataJSON();
      submittedProfile.additionalUpdated = true;
      submittedProfile.hasExistingProductAccount = body.hasExistingProductAccount;
      submittedProfile.desiredMonthlyAmount = body.desiredMonthlyAmount;
      storedProfile = { ...body, id: 1, sessionId: "e2e-profile-session", expiresAt: "2026-08-21T00:00:00Z" };
      return json(route, storedProfile);
    }
    if (path === "/api/recommendations") return json(route, { recommended: [], additionalInformationNeeded: [], excludedCount: 0 });
    if (path === "/api/products" && request.method() === "GET") return json(route, [product]);
    if (path === "/api/products/10" && request.method() === "GET") return json(route, product);
    if (path === "/api/products/10/guidance") return json(route, guidance);
    if (path === "/api/eligibility/pre-check") return json(route, eligibility);
    if (path === "/api/ai/explanation") return json(route, {
      eligibilityStatus: "NEED_BANK_CONFIRMATION",
      facts: { visaType: "E-9", visaRemainingMonths: 16, residencyMonths: 31, passedCount: 1, failedCount: 0, externalCheckCount: 1, unknownCount: 0 },
      explanation: "The public visa condition is met, but guarantee review is required.",
      disclaimer: "This is not final approval.",
      easyTerms: [],
      inquiry: { korean: "안녕하세요. E-9 체류자격으로 신청 가능한지 확인 부탁드립니다.", localized: "Hello. Please confirm whether I may apply with E-9 status.", language: "en" },
      guardrailsApplied: ["ELIGIBILITY_RESULT_IMMUTABLE"],
    });
    return json(route, { message: `Unhandled E2E API: ${request.method()} ${path}` }, 500);
  });
}

test("TEST-106 foreign user completes the eligibility journey", async ({ page }) => {
  const submittedProfile: SubmittedProfile = {};
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await mockApi(page, submittedProfile);

  await page.goto("/");
  const start = page.getByRole("button", { name: /내 조건 확인하기|Check my situation/ });
  await expect(start).toBeDisabled();
  await page.getByRole("button", { name: "English 선택" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Korean finance is not just about translation.")).toBeVisible();
  await expect(start).toBeEnabled();
  await start.click();
  await expect(page).toHaveURL(/\/profile$/);

  const nationality = page.locator('select[name="nationality"]');
  await nationality.selectOption("VN");
  await page.getByRole("button", { name: /Tiếng Việt/ }).click();
  await expect(nationality).toHaveValue("VN");
  await page.getByRole("button", { name: /English/ }).click();
  await expect(nationality).toHaveValue("VN");
  await page.locator('input[name="birthDate"]').fill("1995-01-31");
  await page.getByRole("button", { name: /Next step/ }).click();
  await expect(page.locator('section[data-step="1"]')).toBeVisible();
  await page.locator('select[name="visaType"]').selectOption("E-9");
  await page.locator('select[name="residentStatus"]').selectOption("RESIDENT");
  await page.locator('input[name="visaExpiry"]').fill("2027-12-31");
  await page.locator('input[name="residencyStartDate"]').fill("2024-01-01");
  await page.getByRole("button", { name: /Next step/ }).click();
  await expect(page.locator('section[data-step="2"]')).toBeVisible();
  await page.locator('input[name="occupation"]').fill("Software developer");
  await page.getByLabel("Monthly income (KRW)").fill("3000000");
  await expect(page.getByLabel("Monthly income (KRW)")).toHaveValue("3,000,000");
  await page.locator('input[name="employmentDurationMonths"]').fill("24");
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.locator('section[data-step="2"]')).toBeVisible();
  await page.getByRole("button", { name: /Next step/ }).click();
  await expect(page).toHaveURL(/\/profile$/);
  expect(pageErrors).toEqual([]);
  await expect(page.locator('section[data-step="3"]')).toBeVisible();
  await page.locator('section[data-step="3"] select[name="financialPurpose"]').selectOption("LOAN");
  await page.getByRole("button", { name: /Save and browse products/ }).click();

  await expect(page).toHaveURL(/\/products$/);
  expect(submittedProfile.financialPurpose).toBe("LOAN");
  expect(submittedProfile.nationality).toBe("VN");
  expect(submittedProfile.language).toBe("en");
  await page.getByRole("link", { name: /View details/ }).click();
  await expect(page).toHaveURL(/\/products\/10$/);
  await page.getByRole("button", { name: "Check eligibility with my profile", exact: true }).click();
  await expect(page.getByText("More information is needed for this product")).toBeVisible();
  await page.getByLabel("Do you already hold this product account?").selectOption("false");
  await page.getByLabel("Desired monthly amount (KRW)").fill("200000");
  await page.getByRole("button", { name: "Save and run pre-check" }).click();
  await expect(page.getByText("Bank confirmation needed")).toBeVisible();
  expect(submittedProfile.additionalUpdated).toBe(true);
  expect(submittedProfile.hasExistingProductAccount).toBe(false);
  expect(submittedProfile.desiredMonthlyAmount).toBe(200000);
  await expect(page.getByText("Ask the bank with this message")).toBeVisible();
  await expect(page.getByText(/Please confirm whether I may apply with E-9 status/)).toBeVisible();

  await page.getByRole("tab", { name: "Evidence" }).click();
  await expect(page.getByText("Reviewed product conditions")).toBeVisible();
  await expect(page.getByText("KB Official Product Guide")).toBeVisible();
  await page.getByRole("tab", { name: "Documents" }).click();
  await expect(page.getByText("Passport", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Application steps" }).click();
  await expect(page.getByText("Check documents")).toBeVisible();
});

test("Season 2 mobile profile has no forced horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApi(page, {});
  await page.goto("/");
  await page.getByRole("button", { name: "English 선택" }).click();
  await page.getByRole("button", { name: "Check my situation" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.locator('select[name="nationality"]').selectOption("VN");

  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(overflow.content).toBeLessThanOrEqual(overflow.viewport);
  await expect(page.getByRole("heading", { name: "Basic information", exact: true })).toBeVisible();
});
