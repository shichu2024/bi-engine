// ============================================================================
// playwright.config.ts
// ============================================================================
//
// Playwright configuration for visual regression tests on bi-playground.
//
// Key design decisions:
// - Chromium only: eliminates cross-browser rendering variance
// - Fixed viewport + deviceScaleFactor: deterministic screenshot dimensions
// - Animations disabled via contextOptions: prevents timing-dependent variance
// - SVG renderer preferred (to be configured via T-014 test-mode support)
//
// ============================================================================

import { defineConfig, devices } from '@playwright/test';

// ---------------------------------------------------------------------------
// Run directory — stable across Playwright config re-imports
// ---------------------------------------------------------------------------

// VRT_RUN_ID is set by scripts/vrt-run.mjs to ensure a single directory
// per invocation. Fallback to timestamp for direct `playwright test` usage.
const runDir = `tests/visual/.runs/${process.env.VRT_RUN_ID ?? (() => {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}T${p(now.getHours())}-${p(now.getMinutes())}-${p(now.getSeconds())}`;
})()}`;

// ---------------------------------------------------------------------------
// Tolerance defaults
// ---------------------------------------------------------------------------

/**
 * Default screenshot comparison tolerance.
 *
 * These values are intentionally permissive enough to tolerate minor
 * anti-aliasing and sub-pixel differences while still catching meaningful
 * visual regressions.
 *
 * Individual fixtures can override these via options passed to
 * toHaveScreenshot() in the test spec.
 */
const DEFAULT_THRESHOLD = 0.2;
const DEFAULT_MAX_DIFF_PIXEL_RATIO = 0.005;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export default defineConfig({
  // -- Test discovery -------------------------------------------------------
  testDir: 'tests/visual/specs',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,

  // -- Reporting ------------------------------------------------------------
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: `${runDir}/report` }],
  ],

  // -- Browser context ------------------------------------------------------
  projects: [
    {
      name: 'visual-regression',
      use: {
        ...devices['Desktop Chrome'],
        // Fixed viewport for deterministic screenshots.
        // Individual tests may override this via page.setViewportSize().
        viewport: { width: 960, height: 600 },
        // Fixed device scale factor to avoid DPI-dependent rendering
        deviceScaleFactor: 1,
        // Disable animations via context options for deterministic screenshots
        contextOptions: {
          reducedMotion: 'reduce' as const,
        },
        // Font rendering flags for consistent text rasterization
        launchOptions: {
          args: [
            '--font-render-hinting=none',
            '--disable-font-subpixel-positioning',
          ],
        },
      },
      // Baseline snapshots are read from the baselines directory.
      // The default snapshotDir resolves to {testDir}, but we want
      // baselines stored in a sibling directory.
      snapshotDir: 'tests/visual/baselines',
    },
  ],

  // -- Screenshot comparison ------------------------------------------------
  expect: {
    toHaveScreenshot: {
      threshold: DEFAULT_THRESHOLD,
      maxDiffPixelRatio: DEFAULT_MAX_DIFF_PIXEL_RATIO,
      // Map snapshot names into fixture-level subdirectories.
      // When tests call toHaveScreenshot(['line-single', 'line-single--light--960x600']),
      // Playwright joins the array into: line-single/line-single--light--960x600
      // The pathTemplate then resolves to:
      // Map snapshot names directly into baselines/ without test-file subdirs.
      pathTemplate: '{snapshotDir}/{arg}{ext}',
    },
    timeout: 30_000,
  },

  // -- Web server -----------------------------------------------------------
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 60_000,
  },

  // -- Timeouts -------------------------------------------------------------
  timeout: 60_000,
  retries: 0,

  // -- Output ---------------------------------------------------------------
  outputDir: `${runDir}/artifacts`,
});
