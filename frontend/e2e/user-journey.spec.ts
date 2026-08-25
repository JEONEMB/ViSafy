import { expect, test, type Page, type Route } from "@playwright/test";

const sourceUrl = "https://www.kbstar.com/official-product";
const access = { status: "ACCESS_READY_BRANCH_ONLY", identification: "AVAILABLE", branch: "AVAILABLE", online: "UNKNOWN", details: [], realNameGuardrailApplied: false };
const rule = { id: 101, productId: 10, ruleKey: "VISA_TYPE", operator: "IN", ruleValue: '["E-9"]', ruleLevel: "HARD", ruleNature: "HARD_ELIGIBILITY", mandatory: true, sourceDocumentId: 12, sourceLocator: "p.3", pageNumber: 3, sectionName: "Eligibility", validFrom: "2026-01-01", validTo: null, reviewStatus: "APPROVED", verifiedAt: "2026-08-20T00:00:00Z", description: "E-9 condition", sourceExcerpt: "Eligible status: E-9", evidence: { ruleId: 101, sourceDocumentId: 12, sourceExcerpt: "Eligible status: E-9", sourceLocator: "p.3", pageNumber: 3, sectionName: "Eligibility", verifiedAt: "2026-08-20T00:00:00Z" } };
const dataPackage = { productPage: true, termsOrDescription: true, hardRuleEvidence: true, identityEvidence: true, channelEvidence: true, documentEvidence: true, applicationStepEvidence: true, informationBaseDate: true, missingItems: [], complete: true };
const product = { id: 10, productCode: "E2E-LOAN", institution: "KB Bank", productName: "Foreign Resident Housing Loan", productType: "LOAN", financialPurpose: "LOAN", productAudience: "FOREIGNER_SPECIALIZED", productCategory: "HOUSING_LOAN", description: "Official-source test product", targetSummary: "Housing finance", active: true, foreignerTarget: true, informationBaseDate: "2026-08-20", publicConditions: "E-9", additionalConditions: "Guarantee", requiredDocuments: "Passport and proof of income", applicationMethod: "Official branch", diagnosisStatus: "READY", sourceDocumentId: 12, sourceTitle: "KB Official Guide", sourceUrl, updatedAt: "2026-08-20T00:00:00Z", rules: [rule], requiredFields: ["visaType", "hasExistingProductAccount", "desiredMonthlyAmount"], dataPackage, diagnosisReasonCode: "APPROVED_HARD_RULES_AVAILABLE" };
const eligibility = { status: "NEED_BANK_CONFIRMATION", productId: 10, passedRules: [{ ruleId: 101, key: "VISA_TYPE", messageCode: "RULE_PASSED", message: "Visa condition met", actualValue: "E-9", expectedValue: '["E-9"]', mandatory: true, blocking: false, sourceExcerpt: "Eligible status: E-9", sourceLocator: "p.3", sourceUrl }], failedRules: [], externalChecks: [], unknownRules: [], insufficientReasons: [], requiredFields: product.requiredFields, accessAssessment: access, disclaimer: "This is not final approval." };
const guidance = { productId: 10, personalized: true, officialRequired: [], conditional: [], bankConfirmation: [], applicationSteps: [], excludedConditionalCount: 0, disclaimer: "Official sources only." };
const recommendation = { productId: 10, institution: product.institution, productName: product.productName, productType: product.productType, financialPurpose: product.financialPurpose, productAudience: product.productAudience, productCategory: product.productCategory, targetSummary: product.targetSummary, requiredDocuments: product.requiredDocuments, applicationMethod: product.applicationMethod, informationBaseDate: product.informationBaseDate, eligibilityStatus: eligibility.status, confirmedPublicConditions: 1, totalPublicConditions: 1, additionalCheckCount: 1, unknownCount: 0, purposeMatched: true, preferredConditionMatches: 0, eligibility };
const journey = { purpose: "GET_LOAN", currentStep: 2, headline: "My financial journey in Korea", nextAction: "Open an account first.", profile: { nationality: "VN", hasResidenceCard: true, hasPassport: false, hasDomesticPhone: true, canDomesticPhoneVerify: true, hasKoreanBankAccount: false, hasKoreanCreditHistory: false, remittanceCountry: null }, steps: [
  { step: 1, code: "IDENTITY_PREPARATION", status: "COMPLETED", title: "Prepare identification", description: "Review identification." },
  { step: 2, code: "DEMAND_DEPOSIT_ACCOUNT", status: "CURRENT", title: "Demand deposit account", description: "Review account preparation." },
  { step: 8, code: "LOAN_AND_HOUSING", status: "UPCOMING", title: "Loans & housing", description: "Review loan preparation." },
] };

async function json(route: Route, body: unknown, status = 200) { await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }); }
async function mockApi(page: Page, captured: Record<string, unknown>) {
  let profile: Record<string, unknown> | null = null;
  await page.route("http://localhost:8080/api/**", async (route) => {
    const request = route.request(); const path = new URL(request.url()).pathname;
    if (path === "/api/profiles" && request.method() === "POST") { const body = request.postDataJSON(); Object.assign(captured, body); profile = { ...body, id: 1, sessionId: "e2e-session", expiresAt: "2026-08-25T00:00:00Z" }; return json(route, profile, 201); }
    if (path === "/api/profiles/1" && request.method() === "GET") return json(route, profile);
    if (path === "/api/profiles/1" && request.method() === "PUT") { const body = request.postDataJSON(); profile = { ...body, id: 1, sessionId: "e2e-session", expiresAt: "2026-08-25T00:00:00Z" }; return json(route, profile); }
    if (path === "/api/products") return json(route, [product]);
    if (path === "/api/products/10") return json(route, product);
    if (path === "/api/products/10/guidance") return json(route, guidance);
    if (path === "/api/recommendations") return json(route, { recommended: [recommendation], additionalInformationNeeded: [], excludedCount: 0 });
    if (path === "/api/financial-journey") return json(route, journey);
    if (path === "/api/eligibility/pre-check") return json(route, eligibility);
    if (path === "/api/ai/explanation") return json(route, { eligibilityStatus: "NEED_BANK_CONFIRMATION", accessStatus: "ACCESS_UNKNOWN", facts: { visaType: "E-9", visaRemainingMonths: 12, residencyMonths: 24, passedCount: 1, failedCount: 0, externalCheckCount: 0, unknownCount: 0 }, explanation: "Official conditions checked.", nextActions: ["Ask the bank."], disclaimer: "Not final approval.", easyTerms: [], inquiry: null, guardrailsApplied: [] });
    return json(route, { message: `Unhandled ${request.method()} ${path}` }, 500);
  });
}

test("Season 3 language, purpose, readiness, dynamic fields, and access flow", async ({ page }) => {
  const captured: Record<string, unknown> = {}; await mockApi(page, captured); await page.goto("/");
  await page.getByRole("button", { name: /English/ }).click();
  await page.getByRole("button", { name: "I need a loan" }).click();
  await page.getByRole("button", { name: "Start my financial life" }).click();
  await expect(page.getByRole("heading", { name: "Language", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Nationality + goal", exact: true })).toBeVisible();
  await expect(page.locator('select[name="financialPurpose"]')).toHaveValue("GET_LOAN");
  await page.locator('select[name="nationality"]').selectOption("VN");
  const next = page.locator('button[data-profile-next="1"]');
  await expect(next).toBeEnabled(); await next.click();
  await expect(page.locator('section[data-step="2"]')).toBeVisible();
  await page.locator('select[name="hasResidenceCard"]').selectOption("true");
  await page.locator('select[name="hasKoreanBankAccount"]').selectOption("false");
  await page.getByRole("button", { name: "Show financial services for me" }).click();
  await expect(page).toHaveURL(/\/products$/); expect(captured.birthDate).toBeNull(); expect(captured.financialPurpose).toBe("GET_LOAN");
  await expect(page.getByText("My financial journey in Korea")).toBeVisible();
  await page.getByRole("button", { name: /Prepare in my financial journey/ }).click();
  await expect(page.locator("#financial-journey")).toBeInViewport();
  await expect(page.locator("#financial-journey section[aria-live='polite']").getByRole("heading", { name: "Loans & housing" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Official institution information/ })).toHaveAttribute("href", sourceUrl);
  await page.getByRole("link", { name: /View details/ }).click();
  await page.getByRole("button", { name: "Check eligibility with my profile", exact: true }).click();
  await page.getByLabel("Visa Type").selectOption("E-9");
  await page.getByLabel("Has Existing Product Account").selectOption("false");
  await page.getByLabel("Desired Monthly Amount").fill("200000");
  await page.getByRole("button", { name: "Save and run pre-check" }).click();
  await expect(page.getByText("How you can access this service")).toBeVisible();
  await expect(page.getByText("Branch access confirmed")).toBeVisible();
  await expect(page.getByText("ACCESS_READY_BRANCH_ONLY")).toHaveCount(0);
});

test("Season 3 mobile landing and profile have no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await mockApi(page, {}); await page.goto("/");
  await page.getByRole("button", { name: /English/ }).click(); await page.getByRole("button", { name: "I want to save money" }).click(); await page.getByRole("button", { name: "Start my financial life" }).click();
  const overflow = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(overflow.content).toBeLessThanOrEqual(overflow.viewport); await expect(page.getByRole("heading", { name: "Nationality + goal", exact: true })).toBeVisible();
});
