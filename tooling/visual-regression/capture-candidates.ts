// ============================================================================
// capture-candidates.ts
// ============================================================================
//
// Uses Playwright to capture candidate screenshots via the dedicated VRT
// render page (/vrt-render?fixture=X&theme=Y&viewport=Z).
//
// Usage:
//   pnpm --filter @bi-engine2/visual-regression capture
//   pnpm --filter @bi-engine2/visual-regression capture -- --filter line-single
//   pnpm --filter @bi-engine2/visual-regression capture -- --viewport 640x480
//   pnpm --filter @bi-engine2/visual-regression capture -- --theme light
//
// ============================================================================

import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { argv } from 'node:process';

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

const RENDERER = 'echarts';
const PLAYGROUND_URL = 'http://localhost:5173';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const CANDIDATES_DIR = join(
  PROJECT_ROOT,
  'apps',
  'bi-playground',
  'tests',
  'visual',
  'candidates',
);

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

interface CaptureOptions {
  readonly filterFixture: string | null;
  readonly filterViewport: string | null;
  readonly filterTheme: string | null;
}

function parseArgs(args: string[]): CaptureOptions {
  let filterFixture: string | null = null;
  let filterViewport: string | null = null;
  let filterTheme: string | null = null;

  const filtered = args.filter((a) => a !== '--');

  for (let i = 0; i < filtered.length; i++) {
    const arg = filtered[i];
    if (arg === '--filter' && i + 1 < filtered.length) {
      filterFixture = filtered[i + 1];
      i++;
    } else if (arg === '--viewport' && i + 1 < filtered.length) {
      filterViewport = filtered[i + 1];
      i++;
    } else if (arg === '--theme' && i + 1 < filtered.length) {
      filterTheme = filtered[i + 1];
      i++;
    }
  }

  return { filterFixture, filterViewport, filterTheme };
}

// ---------------------------------------------------------------------------
// Candidate metadata
// ---------------------------------------------------------------------------

interface CandidateMetadata {
  readonly fixtureId: string;
  readonly theme: string;
  readonly viewport: string;
  readonly renderer: string;
  readonly capturedAt: string;
  readonly fileName: string;
}

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

function getTargetFixtures(filter: string | null): readonly string[] {
  if (filter === null) return FIXTURE_IDS;
  return FIXTURE_IDS.filter((id) => id === filter);
}

function getTargetThemes(filter: string | null): readonly string[] {
  if (filter === null) return THEMES;
  return THEMES.filter((t) => t === filter);
}

function getTargetViewports(filter: string | null): readonly ViewportPreset[] {
  if (filter === null) return VIEWPORT_PRESETS;
  return VIEWPORT_PRESETS.filter(
    (vp) => `${vp.width}x${vp.height}` === filter || vp.label === filter,
  );
}

// ---------------------------------------------------------------------------
// File naming
// ---------------------------------------------------------------------------

/**
 * Returns the file name for a candidate screenshot.
 * Format: `{fixtureId}--{theme}--{viewport}.png`
 */
function buildCandidateFileName(
  fixtureId: string,
  theme: string,
  viewport: string,
): string {
  return `${fixtureId}--${theme}--${viewport}.png`;
}

// ---------------------------------------------------------------------------
// Capture logic
// ---------------------------------------------------------------------------

async function captureSingleCandidate(
  page: Page,
  fixtureId: string,
  theme: string,
  viewport: ViewportPreset,
): Promise<CandidateMetadata> {
  const viewportLabel = `${viewport.width}x${viewport.height}`;

  // Navigate to the dedicated VRT render page
  const url = `${PLAYGROUND_URL}/vrt-render?fixture=${encodeURIComponent(fixtureId)}&theme=${theme}&viewport=${viewportLabel}`;
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for the VRT container to render
  const container = page.locator('[data-testid="vrt-render-container"]');
  await container.waitFor({ state: 'visible', timeout: 15_000 });

  // Wait for ECharts to initialize and render
  const chartElement = page.locator('canvas, svg, [_echarts_instance_]').first();
  await chartElement.waitFor({ state: 'visible', timeout: 10_000 });

  // Additional stabilization wait for rendering completion
  await page.waitForTimeout(800);

  const fileName = buildCandidateFileName(fixtureId, theme, viewportLabel);
  const filePath = join(CANDIDATES_DIR, fileName);

  await container.screenshot({ path: filePath, type: 'png' });

  return {
    fixtureId,
    theme,
    viewport: viewportLabel,
    renderer: RENDERER,
    capturedAt: new Date().toISOString(),
    fileName,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const options = parseArgs(argv.slice(2));

  const targetFixtures = getTargetFixtures(options.filterFixture);
  const targetThemes = getTargetThemes(options.filterTheme);
  const targetViewports = getTargetViewports(options.filterViewport);

  if (targetFixtures.length === 0) {
    console.error(`No fixtures match filter: ${options.filterFixture}`);
    process.exit(1);
  }
  if (targetThemes.length === 0) {
    console.error(`No themes match filter: ${options.filterTheme}`);
    process.exit(1);
  }
  if (targetViewports.length === 0) {
    console.error(`No viewports match filter: ${options.filterViewport}`);
    process.exit(1);
  }

  if (!existsSync(CANDIDATES_DIR)) {
    mkdirSync(CANDIDATES_DIR, { recursive: true });
  }

  const totalCombinations =
    targetFixtures.length * targetThemes.length * targetViewports.length;

  console.log('Starting candidate capture...');
  console.log(`  Fixtures:  ${targetFixtures.join(', ')}`);
  console.log(`  Themes:    ${targetThemes.join(', ')}`);
  console.log(`  Viewports: ${targetViewports.map((v) => `${v.width}x${v.height}`).join(', ')}`);
  console.log(`  Total screenshots to capture: ${totalCombinations}`);

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    const page = await context.newPage();

    const metadata: CandidateMetadata[] = [];
    let captured = 0;

    for (const fixtureId of targetFixtures) {
      for (const theme of targetThemes) {
        for (const viewport of targetViewports) {
          captured++;
          console.log(
            `  [${captured}/${totalCombinations}] Capturing: ${fixtureId} / ${theme} / ${viewport.width}x${viewport.height}`,
          );

          try {
            const record = await captureSingleCandidate(page, fixtureId, theme, viewport);
            metadata.push(record);
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(
              `    FAILED to capture ${fixtureId} / ${theme} / ${viewport.width}x${viewport.height}: ${message}`,
            );
          }
        }
      }
    }

    const manifestPath = join(CANDIDATES_DIR, 'capture-manifest.json');
    writeFileSync(manifestPath, JSON.stringify(metadata, null, 2), 'utf-8');

    console.log(
      `\nCapture complete. ${metadata.length}/${totalCombinations} screenshots saved to: ${CANDIDATES_DIR}`,
    );
    console.log(`Metadata written to: ${manifestPath}`);

    if (metadata.length < totalCombinations) {
      console.warn(
        `WARNING: ${totalCombinations - metadata.length} capture(s) failed.`,
      );
    }
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Fatal error during candidate capture:', message);
  process.exit(1);
});
