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
    ['html', { open: 'never', outputFolder: 'tests/visual/diff-artifacts/report' }],
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
      // Map snapshot names directly into baselines/ without test-file subdirs.
      // When tests call toHaveScreenshot('line-single--light--960x600.png'),
      // Playwright resolves the path to:
      //   {snapshotDir}/line-single--light--960x600.png
      // which maps to tests/visual/baselines/line-single--light--960x600.png
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
  outputDir: 'tests/visual/diff-artifacts',
});
