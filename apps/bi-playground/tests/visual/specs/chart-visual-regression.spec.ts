// ============================================================================
// chart-visual-regression.spec.ts
// ============================================================================
//
// Playwright visual regression tests for all chart fixtures.
//
// Uses the dedicated VRT render page (/vrt-render?fixture=X&theme=Y&viewport=Z)
// for clean, deterministic screenshots without UI chrome.
//
// ============================================================================

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const THEMES: readonly string[] = ['light', 'dark'] as const;

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

const DEFAULT_THRESHOLD = 0.2;
const DEFAULT_MAX_DIFF_PIXEL_RATIO = 0.005;

const FIXTURE_THRESHOLD_OVERRIDES: Readonly<
  Record<string, { threshold?: number; maxDiffPixelRatio?: number }>
> = {};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildSnapshotName(
  fixtureId: string,
  theme: string,
  viewport: string,
): string {
  return `${fixtureId}--${theme}--${viewport}.png`;
}

function buildTestName(
  fixtureId: string,
  theme: string,
  viewport: string,
): string {
  return `${fixtureId} | ${theme} | ${viewport}`;
}

function buildScreenshotOptions(fixtureId: string): Record<string, unknown> {
  const override = FIXTURE_THRESHOLD_OVERRIDES[fixtureId];
  const threshold = override?.threshold ?? DEFAULT_THRESHOLD;
  const maxDiffPixelRatio = override?.maxDiffPixelRatio ?? DEFAULT_MAX_DIFF_PIXEL_RATIO;
  return { threshold, maxDiffPixelRatio };
}

// ---------------------------------------------------------------------------
// Visual regression test suite
// ---------------------------------------------------------------------------

test.describe('Chart visual regression', () => {
  for (const fixtureId of FIXTURE_IDS) {
    test.describe(`fixture: ${fixtureId}`, () => {
      for (const theme of THEMES) {
        for (const viewport of VIEWPORT_PRESETS) {
          const viewportLabel = `${viewport.width}x${viewport.height}`;
          const testName = buildTestName(fixtureId, theme, viewportLabel);

          test(testName, async ({ page }) => {
            // Navigate to the dedicated VRT render page
            const url = `/vrt-render?fixture=${encodeURIComponent(fixtureId)}&theme=${theme}&viewport=${viewportLabel}`;
            await page.goto(url, { waitUntil: 'networkidle' });

            // Set browser viewport to accommodate the chart
            await page.setViewportSize({
              width: viewport.width + 40,
              height: viewport.height + 40,
            });

            // Wait for VRT container and chart to render
            const container = page.locator('[data-testid="vrt-render-container"]');
            await container.waitFor({ state: 'visible', timeout: 15_000 });

            const chartElement = page.locator('canvas, svg, [_echarts_instance_]').first();
            await chartElement.waitFor({ state: 'visible', timeout: 10_000 });
            await page.waitForTimeout(800);

            // Take screenshot and compare against baseline
            const snapshotName = buildSnapshotName(fixtureId, theme, viewportLabel);
            const screenshotOptions = buildScreenshotOptions(fixtureId);

            await expect(container).toHaveScreenshot(
              snapshotName,
              screenshotOptions,
            );
          });
        }
      }
    });
  }
});
