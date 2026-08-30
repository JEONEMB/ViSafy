import { expect, test, type Page, type Route } from "@playwright/test";

const sourceUrl = "https://www.kbstar.com/official-product";
const dataPackage = { productPage: true, termsOrDescription: true, hardRuleEvidence: true, identityEvidence: true, channelEvidence: true, documentEvidence: true, applicationStepEvidence: true, informationBaseDate: true, missingItems: [], complete: true };
const product = { id: 10, productCode: "E2E-ACCOUNT", institution: "KB Bank", productName: "외국인 전용 입출금통장", productType: "DEPOSIT", financialPurpose: "OPEN_ACCOUNT", productAudience: "FOREIGNER_SPECIALIZED", productCategory: "DEMAND_DEPOSIT", description: "Official-source test product", targetSummary: "Everyday banking", active: true, foreignerTarget: true, informationBaseDate: "2026-08-20", publicConditions: "E-9", additionalConditions: "Real-name verification", requiredDocuments: "Residence card", applicationMethod: "Branch", officialApplicationUrl: "https://www.kbstar.com/apply", diagnosisStatus: "READY", sourceDocumentId: 12, sourceTitle: "KB Official Guide", sourceUrl, updatedAt: "2026-08-20T00:00:00Z", rules: [], requiredFields: [], dataPackage, diagnosisReasonCode: "APPROVED_HARD_RULES_AVAILABLE", sourceTrust: { freshnessStatus: "FRESH", lastVerifiedAt: "2026-08-20T00:00:00Z", validTo: null, evidenceCoveragePercent: 100, ragEligible: true, officialContentChanged: false, officialContentChangedAt: null } };

const guidance = {
  productId: 10,
  personalized: true,
  officialRequired: [{ id: 1, documentName: "외국인등록증", description: "체류지 정보가 최신이어야 합니다.", requirementType: "OFFICIAL_REQUIRED", conditionRuleKey: null, sourceTitle: "KB Official Guide", sourceUrl, sourceLocator: "p.2", verifiedAt: "2026-08-20T00:00:00Z" }],
  conditional: [{ id: 2, documentName: "재직증명서", description: null, requirementType: "CONDITIONAL", conditionRuleKey: "EMPLOYMENT", sourceTitle: "KB Official Guide", sourceUrl, sourceLocator: "p.4", verifiedAt: "2026-08-20T00:00:00Z" }],
  bankConfirmation: [{ id: 3, documentName: "실명확인 서류", description: null, requirementType: "BANK_CONFIRMATION", conditionRuleKey: null, sourceTitle: "KB Official Guide", sourceUrl, sourceLocator: "p.5", verifiedAt: "2026-08-20T00:00:00Z" }],
  applicationSteps: [{ id: 4, stepOrder: 1, title: "영업점 방문", description: "신분증을 지참해 영업점을 방문합니다.", channel: "영업점", sourceTitle: "KB Official Guide", sourceUrl, sourceLocator: "p.6" }],
  excludedConditionalCount: 0,
  disclaimer: "Official sources only.",
};

const eligibility = {
  status: "NEED_BANK_CONFIRMATION",
  productId: 10,
  passedRules: [],
  failedRules: [],
  externalChecks: [{ ruleId: 201, key: "REAL_NAME_VERIFICATION", messageCode: "EXTERNAL_CHECK", message: "Real-name verification must be confirmed by the bank.", mandatory: true, blocking: false, sourceExcerpt: "real-name", sourceLocator: "p.5", sourceUrl }],
  unknownRules: [{ ruleId: 202, key: "VISA_DETAIL", messageCode: "UNKNOWN", message: "The accepted visa list is not published.", mandatory: true, blocking: false, sourceExcerpt: null, sourceLocator: null, sourceUrl: null }],
  insufficientReasons: [],
  requiredFields: [],
  accessAssessment: { status: "ACCESS_READY_BRANCH_ONLY", identification: "AVAILABLE", branch: "AVAILABLE", online: "UNKNOWN", details: [], realNameGuardrailApplied: false },
  disclaimer: "This is not final approval.",
};

const inquiryKorean = "안녕하세요. 현재 체류자격은 E-9입니다. 외국인 전용 입출금통장 상품의 실명확인 가능 여부 조건을 확인 부탁드립니다.";
const explanation = { eligibilityStatus: "NEED_BANK_CONFIRMATION", accessStatus: "ACCESS_READY_BRANCH_ONLY", facts: { visaType: "E-9", visaRemainingMonths: 14, residencyMonths: 24, passedCount: 2, failedCount: 0, externalCheckCount: 1, unknownCount: 1 }, explanation: "Checked.", nextActions: ["Ask the bank."], disclaimer: "Not final approval.", easyTerms: [], inquiry: { korean: inquiryKorean, localized: "Hello. My current status of stay is E-9. Please confirm the real-name verification condition.", language: "en", confirmationItems: ["real-name verification availability"] }, guardrailsApplied: [] };

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

async function mockPacketApi(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("visafyProfileId", "1");
    localStorage.setItem("visafyProfileSessionId", "e2e-session");
    localStorage.setItem("visafyLocale", "en");
  });
  await page.route("http://localhost:8080/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/products/10") return json(route, product);
    if (path === "/api/products/10/guidance") return json(route, guidance);
    if (path === "/api/eligibility/pre-check") return json(route, eligibility);
    if (path === "/api/ai/explanation") return json(route, explanation);
    if (path === "/api/profiles/1") return json(route, { id: 1, sessionId: "e2e-session", nationality: "VN", language: "en" });
    return json(route, { message: `Unhandled ${path}` }, 500);
  });
}

test("the packet assembles documents, the counter script, and the items to confirm", async ({ page }) => {
  await mockPacketApi(page);
  await page.goto("/products/10/packet");

  await expect(page.getByText("Bank visit packet")).toBeVisible();
  // The product name stays Korean so a teller can read it, with the translation beneath.
  await expect(page.getByRole("heading", { level: 1, name: "외국인 전용 입출금통장" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "1. Documents to bring" })).toBeVisible();
  // Documents are named in the reader's language with the Korean kept, because they have to be
  // requested and handed over by their Korean name.
  await expect(page.getByText("Residence card")).toBeVisible();
  await expect(page.getByText("(외국인등록증)")).toBeVisible();
  await expect(page.getByText("재직증명서")).toBeVisible();
  await expect(page.getByText("실명확인 서류")).toBeVisible();

  await expect(page.getByRole("heading", { name: "2. What to show at the counter" })).toBeVisible();
  await expect(page.getByText(inquiryKorean)).toBeVisible();

  await expect(page.getByRole("heading", { name: "3. Items to ask the bank about" })).toBeVisible();
  await expect(page.getByText("Real-name verification must be confirmed by the bank.")).toBeVisible();
  await expect(page.getByText("The accepted visa list is not published.")).toBeVisible();

  await expect(page.getByRole("heading", { name: "4. Official application steps" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "5. Official evidence" })).toBeVisible();

  // The packet owns the whole screen, so the site navigation is not rendered.
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
});

test("the teller view shows the Korean sentence full screen", async ({ page }) => {
  await mockPacketApi(page);
  await page.goto("/products/10/packet");

  await page.getByRole("button", { name: "Show to the teller" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(inquiryKorean)).toBeVisible();

  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the packet asks for a profile before it is built", async ({ page }) => {
  // No stored locale, so the packet renders in the deployment default language.
  await page.route("http://localhost:8080/api/**", (route) => json(route, product));
  await page.goto("/products/10/packet");

  await expect(page.getByText("먼저 임시 금융 프로필을 입력해 주세요.")).toBeVisible();
  await expect(page.getByRole("link", { name: /프로필 입력/ })).toBeVisible();
});
