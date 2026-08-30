import { expect, test, type Page } from "@playwright/test";

/**
 * Runs against the deployed URL, not the mocked local app. Excluded from the default run;
 * invoke with E2E_BASE_URL=https://<domain> npx playwright test e2e/live-check.spec.ts
 */
const failures: string[] = [];

function watchConsole(page: Page, label: string) {
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`${label}: ${message.text()}`);
  });
  page.on("pageerror", (error) => failures.push(`${label}: ${error.message}`));
}

test("the landing page loads over HTTPS and offers every language", async ({ page }) => {
  watchConsole(page, "landing");
  await page.goto("/");

  for (const language of ["한국어", "English", "Tiếng Việt", "简体中文", "日本語", "ไทย"]) {
    await expect(page.getByRole("button", { name: new RegExp(language) })).toBeVisible();
  }
  expect(failures, failures.join("\n")).toHaveLength(0);
});

test("the product list renders live catalogue data", async ({ page }) => {
  watchConsole(page, "products");
  await page.goto("/products");

  await expect(page.locator("a[href^='/products/']").first()).toBeVisible({ timeout: 30_000 });
  const count = await page.locator("a[href^='/products/']").count();
  console.log(`live products linked: ${count}`);
  expect(count).toBeGreaterThan(0);
  expect(failures, failures.join("\n")).toHaveLength(0);
});

test("every product detail page opens and shows the packet entry", async ({ page, request }) => {
  watchConsole(page, "detail");
  const products = await (await request.get("/api/products")).json();
  console.log(`catalogue size: ${products.length}`);

  for (const product of products) {
    await page.goto(`/products/${product.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("link", { name: /패킷 열기|Open packet/ })).toBeVisible();
  }
  expect(failures, failures.join("\n")).toHaveLength(0);
});

test("every official source and application URL is reachable", async ({ request }) => {
  const products = await (await request.get("/api/products")).json();
  const urls = new Set<string>();
  for (const product of products) {
    if (product.sourceUrl) urls.add(product.sourceUrl);
    if (product.officialApplicationUrl) urls.add(product.officialApplicationUrl);
  }

  const broken: string[] = [];
  for (const url of urls) {
    try {
      const response = await request.get(url, { timeout: 30_000, maxRedirects: 5 });
      if (response.status() >= 400) broken.push(`${response.status()} ${url}`);
    } catch (error) {
      broken.push(`ERROR ${url} (${(error as Error).message.split("\n")[0]})`);
    }
  }
  console.log(`checked ${urls.size} official URLs`);
  expect(broken, broken.join("\n")).toHaveLength(0);
});

test("no live product still shows untranslated Korean official text", async ({ request }) => {
  const { officialText } = await import("../lib/official-text-localization");
  const hangul = /[가-힣]/;
  const products = await (await request.get("/api/products")).json();
  const untranslated = new Set<string>();

  const collect = (value: string | null | undefined) => {
    if (value && hangul.test(value) && officialText("en", value) === value) untranslated.add(value);
  };

  for (const product of products) {
    for (const rule of product.rules ?? []) collect(rule.description);
    const guidance = await (await request.get(`/api/products/${product.id}/guidance?language=ko`)).json();
    for (const group of ["officialRequired", "conditional", "bankConfirmation"] as const) {
      for (const item of guidance[group] ?? []) {
        collect(item.documentName);
        collect(item.description);
      }
    }
    for (const step of guidance.applicationSteps ?? []) {
      collect(step.title);
      collect(step.description);
      collect(step.channel);
    }
  }
  console.log(`untranslated official strings: ${untranslated.size}`);
  expect([...untranslated], [...untranslated].join("\n")).toHaveLength(0);
});

test("the mobile layout never scrolls sideways", async ({ page }) => {
  watchConsole(page, "mobile");
  await page.setViewportSize({ width: 360, height: 780 });
  const products = await (await page.request.get("/api/products")).json();

  for (const path of ["/", "/products", "/profile", `/products/${products[0].id}`, `/products/${products[0].id}/packet`]) {
    await page.goto(path);
    await page.waitForTimeout(1200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(`${path} horizontal overflow: ${overflow}px`);
    expect(overflow, `${path} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(1);
  }
  expect(failures, failures.join("\n")).toHaveLength(0);
});
