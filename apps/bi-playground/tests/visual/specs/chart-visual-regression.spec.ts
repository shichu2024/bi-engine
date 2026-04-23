// ============================================================================
// chart-visual-regression.spec.ts
// ============================================================================
//
// Playwright visual regression tests for all chart fixtures.
//
// Strategy:
// - For each fixture/theme/viewport combination, take a screenshot of the
//   chart rendering area and compare against an approved baseline.
// - If no baseline exists, the test is skipped with a clear message directing
//   the user to run capture + approve first.
// - Diff artifacts are written to tests/visual/diff-artifacts/ on failure.
// - Per-fixture tolerance overrides are supported via FIXTURE_THRESHOLD_OVERRIDES.
//
// ============================================================================

import { test, expect, type Page, type Locator } from '@playwright/test';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * All fixture IDs from bi-engine/testing FIXTURE_REGISTRY.
 *
 * This must be kept in sync with the fixture registry. The canonical source
 * is packages/bi-engine/src/testing/fixture-registry.ts.
 */
const FIXTURE_IDS: readonly string[] = [
  'line-single',
  'line-multi',
  'line-area',
  'bar-single',
  'bar-multi',
  'bar-horizontal',
  'pie-single',
  'pie-ring',
  'line-with-options',
] as const;

/**
 * Theme modes to test per fixture.
 */
const THEMES: readonly string[] = ['light', 'dark'] as const;

/**
 * Viewport presets to test per fixture.
 */
interface ViewportPreset {
  readonly label: string;
  readonly width: number;
  readonly height: number;
}

const VIEWPORT_PRESETS: readonly ViewportPreset[] = [
  { label: '375x300', width: 375, height: 300 },
  { label: '640x480', width: 640, height: 480 },
  { label: '960x600', width: 960, height: 600 },
] as const;

// ---------------------------------------------------------------------------
// Tolerance configuration
// ---------------------------------------------------------------------------

/** Default screenshot comparison threshold. */
const DEFAULT_THRESHOLD = 0.2;

/** Default max ratio of pixels that may differ. */
const DEFAULT_MAX_DIFF_PIXEL_RATIO = 0.005;

/**
 * Per-fixture tolerance overrides.
 *
 * Keys are fixture IDs. Values override the default threshold and/or
 * maxDiffPixelRatio for specific fixtures that inherently produce more
 * visual variance (e.g. charts with gradients, shadows, or complex
 * intersections).
 */
const FIXTURE_THRESHOLD_OVERRIDES: Readonly<
  Record<string, { threshold?: number; maxDiffPixelRatio?: number }>
> = {
  // Example: if a fixture is known to have sub-pixel variance:
  // 'line-area': { maxDiffPixelRatio: 0.01 },
};

// ---------------------------------------------------------------------------
// Naming conventions
// ---------------------------------------------------------------------------

/**
 * Baseline file naming convention (must match capture-candidates.ts):
 *   {fixtureId}--{theme}--{viewport}.png
 */
function buildBaselineFileName(
  fixtureId: string,
  theme: string,
  viewport: string,
): string {
  return `${fixtureId}--${theme}--${viewport}.png`;
}

/**
 * Builds a unique test name for a fixture/theme/viewport combination.
 */
function buildTestName(
  fixtureId: string,
  theme: string,
  viewport: string,
): string {
  return `${fixtureId} | ${theme} | ${viewport}`;
}

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..', '..');
const BASELINES_DIR = join(PROJECT_ROOT, 'tests', 'visual', 'baselines');

/**
 * Gets the baseline file path for a given combination.
 */
function getBaselinePath(
  fixtureId: string,
  theme: string,
  viewport: string,
): string {
  const fileName = buildBaselineFileName(fixtureId, theme, viewport);
  return join(BASELINES_DIR, fileName);
}

/**
 * Builds the screenshot comparison options, merging fixture-specific overrides.
 */
function buildScreenshotOptions(fixtureId: string): Record<string, unknown> {
  const override = FIXTURE_THRESHOLD_OVERRIDES[fixtureId];
  const threshold = override?.threshold ?? DEFAULT_THRESHOLD;
  const maxDiffPixelRatio = override?.maxDiffPixelRatio ?? DEFAULT_MAX_DIFF_PIXEL_RATIO;

  return {
    threshold,
    maxDiffPixelRatio,
  };
}

// ---------------------------------------------------------------------------
// Playground UI interaction helpers
// ---------------------------------------------------------------------------

async function selectFixture(page: Page, fixtureId: string): Promise<void> {
  const fixtureSelect = page.locator('select').first();
  await fixtureSelect.selectOption(fixtureId);
}

async function selectTheme(page: Page, theme: string): Promise<void> {
  const themeButton = page.locator(
    'button',
    { hasText: theme === 'light' ? 'Light' : 'Dark' },
  );
  await themeButton.click();
}

async function selectViewport(page: Page, viewportLabel: string): Promise<void> {
  const viewportSelect = page.locator('select').nth(1);
  await viewportSelect.selectOption({ label: viewportLabel });
}

async function getChartContainer(page: Page): Promise<Locator> {
  // The chart renders inside a div with position: relative and contains
  // the description overlay. We target the inner chart container.
  const chartArea = page.locator('div').filter({ hasText: 'Chart Preview' }).nth(1);
  const container = chartArea.locator('..').locator('div').nth(1);
  return container;
}

async function waitForChartStable(page: Page): Promise<void> {
  // Wait for ECharts to initialize and render
  const chartContainer = page.locator('[_echarts_instance_], canvas, svg').first();
  await chartContainer.waitFor({ state: 'visible', timeout: 10_000 });
  // Additional stabilization wait for rendering completion
  await page.waitForTimeout(800);
}

// ---------------------------------------------------------------------------
// Visual regression test suite
// ---------------------------------------------------------------------------

test.describe('Chart visual regression', () => {
  // Iterate over all fixture/theme/viewport combinations
  for (const fixtureId of FIXTURE_IDS) {
    test.describe(`fixture: ${fixtureId}`, () => {
      for (const theme of THEMES) {
        for (const viewport of VIEWPORT_PRESETS) {
          const viewportLabel = `${viewport.width}x${viewport.height}`;
          const testName = buildTestName(fixtureId, theme, viewportLabel);
          const baselinePath = getBaselinePath(fixtureId, theme, viewportLabel);

          test(testName, async ({ page }) => {
            // ---------------------------------------------------------------
            // Step 1: Check if baseline exists
            // ---------------------------------------------------------------
            const baselineExists = existsSync(baselinePath);

            if (!baselineExists) {
              test.info().annotations.push({
                type: 'skip-reason',
                description:
                  `No baseline found for ${fixtureId}/${theme}/${viewportLabel}. ` +
                  `Run 'pnpm test:visual:capture' then 'pnpm test:visual:approve' first.`,
              });
              test.skip();
              return;
            }

            // ---------------------------------------------------------------
            // Step 2: Navigate to playground and configure
            // ---------------------------------------------------------------
            await page.goto('/', { waitUntil: 'networkidle' });
            await page.waitForTimeout(500);

            // Set browser viewport to accommodate the chart container
            await page.setViewportSize({
              width: viewport.width + 200,
              height: viewport.height + 250,
            });

            await selectFixture(page, fixtureId);
            await selectTheme(page, theme);
            await selectViewport(page, viewportLabel);

            // ---------------------------------------------------------------
            // Step 3: Wait for chart rendering to stabilize
            // ---------------------------------------------------------------
            await waitForChartStable(page);

            // ---------------------------------------------------------------
            // Step 4: Take screenshot and compare against baseline
            // ---------------------------------------------------------------
            const chartContainer = await getChartContainer(page);
            const screenshotName = buildBaselineFileName(fixtureId, theme, viewportLabel);
            const screenshotOptions = buildScreenshotOptions(fixtureId);

            await expect(chartContainer).toHaveScreenshot(
              screenshotName,
              screenshotOptions,
            );
          });
        }
      }
    });
  }
});
