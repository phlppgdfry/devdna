import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === "http://127.0.0.1:3120"
      ? route.continue()
      : route.abort(),
  );
});

test("search normalizes profile URLs and remembers visits", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByLabel("Language / Taal")).toHaveValue("en");
  await page
    .getByLabel("GitHub username", { exact: true })
    .fill("https://github.com/test-alice");
  await page
    .getByRole("button", { name: "Decode my DNA ↗", exact: true })
    .click();
  await expect(page).toHaveURL("/test-alice");
  await expect(
    page.getByRole("heading", { name: "Alice Example", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "✳ devdna", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "@test-alice ↗", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear history", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Back to your discoveries",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("invalid input and missing profiles have useful recovery", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("GitHub username", { exact: true })
    .fill("https://example.com/user");
  await page
    .getByRole("button", { name: "Decode my DNA ↗", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Enter a username or GitHub profile URL",
  );
  await page.goto("/test-missing");
  await expect(
    page.getByRole("heading", {
      name: "That profile is still a mystery.",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Back to the lab", exact: true })
    .click();
  await expect(
    page.getByLabel("GitHub username", { exact: true }),
  ).toBeVisible();
});

test("comparison shows real differences and normalized rhythm overlap", async ({
  page,
}) => {
  await page.goto("/compare");
  await page.getByLabel("First profile", { exact: true }).fill("@test-alice");
  await page.getByLabel("Second profile", { exact: true }).fill("test-bob");
  await page
    .getByRole("button", { name: "Compare DNA ↗", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Alice Example", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Bob Example", exact: true }),
  ).toBeVisible();
  const summary = page.locator(".comparison-insights");
  await expect(summary).toContainText("Python");
  await expect(summary).toContainText("Hourly rhythm overlap: 50%");
  await expect(summary).toContainText("Night Owl");
});

test("comparison preserves a good profile when the other hits a rate limit", async ({
  page,
}) => {
  await page.goto("/compare?left=test-alice&right=test-limited");
  await expect(
    page.getByRole("heading", { name: "Alice Example", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "GitHub’s request limit was reached. Please try again later.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator(".comparison-insights")).toHaveCount(0);
});

test("PNG export produces a usable image with the selected theme", async ({
  page,
}) => {
  await page.goto("/test-alice");
  await page.getByLabel("Card theme", { exact: true }).selectOption("light");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe("devdna-test-alice-light.png");
  const file = await download.path();
  expect(file).not.toBeNull();
  const png = await readFile(file!);
  expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(png.readUInt32BE(16)).toBe(1600);
  expect(png.readUInt32BE(20)).toBe(1280);
  expect(png.length).toBeGreaterThan(5000);
  await expect(
    page.getByText("PNG card downloaded (1600 × 1280).", { exact: true }),
  ).toBeVisible();
});

test("snapshots survive reload, flag incompatible settings, and can be removed", async ({
  page,
}) => {
  await page.goto("/test-alice");
  await page
    .getByRole("button", { name: "Save snapshot", exact: true })
    .click();
  await expect(
    page.getByText("Snapshot saved in this browser.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByLabel("Compare current report with", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Language share change (percentage points):", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByLabel("Activity timezone", { exact: true })
    .selectOption("Europe/Brussels");
  await expect(
    page.getByText(
      "Language and star comparisons need the same timezone, analysis method and repository limit, with a complete byte scan. Match those settings to compare.",
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete selected", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByLabel("Compare current report with", { exact: true }),
  ).toHaveCount(0);
});

test("storage failure never reports snapshot success", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "QuotaExceededError");
    };
  });
  await page.goto("/test-alice");
  await page
    .getByRole("button", { name: "Save snapshot", exact: true })
    .click();
  await expect(
    page.getByText("Could not save. Browser storage is unavailable or full.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Snapshot saved in this browser.", { exact: true }),
  ).toHaveCount(0);
});

test("language, timezone and repository drilldown update the report", async ({
  page,
}) => {
  await page.goto("/test-alice");
  await page
    .getByLabel("Activity timezone", { exact: true })
    .selectOption("Europe/Brussels");
  await expect(page.locator(".heatmap").locator("..")).toContainText(
    "Europe/Brussels",
  );
  await page.getByRole("button", { name: /TypeScript.*1 repos.*50%/ }).click();
  await expect(page.locator(".drilldown")).toContainText("project-1");
  await page.getByLabel("Language / Taal", { exact: true }).selectOption("nl");
  await expect(
    page.getByRole("heading", { name: "Jouw DNA, jouw stijl", exact: true }),
  ).toBeVisible();
  await page.reload();
  // Next streams hidden server markup during hydration; target the active navigation.
  await expect(
    page.getByRole("navigation").getByLabel("Language / Taal"),
  ).toHaveValue("nl");
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
});

test("codebase bytes include secondary languages and enable complete snapshots", async ({
  page,
}) => {
  await page.goto("/test-alice?extended=1");
  await expect(page.locator(".controls")).toContainText("1000");
  await page
    .getByLabel("Language analysis", { exact: true })
    .selectOption("bytes");
  await expect(
    page.getByRole("button", { name: "Save snapshot", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Analyze codebases", exact: true })
    .click();
  await expect(page.locator(".scan")).toContainText("2 / 2 codebases analyzed");
  await expect(page.locator(".scan")).toContainText("Complete for this sample");
  await expect(
    page.getByRole("button", { name: /HTML.*1 repos.*5%/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save snapshot", exact: true }),
  ).toBeEnabled();
});

test("limited byte scans expose retry guidance and keep snapshots disabled", async ({
  page,
}) => {
  await page.goto("/test-scan");
  await page
    .getByLabel("Language analysis", { exact: true })
    .selectOption("bytes");
  await page
    .getByRole("button", { name: "Analyze codebases", exact: true })
    .click();
  await expect(page.locator(".scan")).toContainText(
    "GitHub’s request limit was reached. Resume after",
  );
  await expect(
    page.getByRole("button", { name: "Save snapshot", exact: true }),
  ).toBeDisabled();
});

test("empty profiles stay honest and layouts fit the viewport", async ({
  page,
}) => {
  await page.goto("/test-empty");
  await expect(
    page.getByText("No language data available yet.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "No public push timestamps in this sample. Private and older work is not visible.",
      { exact: true },
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.goto("/compare?left=test-alice&right=test-bob");
  await expect(page.locator(".comparison-insights")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
