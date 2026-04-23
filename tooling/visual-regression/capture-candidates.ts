// ============================================================================
// capture-candidates.ts
// ============================================================================
//
// 使用 Playwright 打开 bi-playground，遍历 fixture/主题/视口组合，
// 等待图表渲染稳定后，将截图保存为"候选"到 candidates/ 目录。
//
// 候选截图不会自动提升为基线。请使用 approve-baselines.ts 进行提升。
//
// 用法：
//   pnpm --filter @bi-engine2/visual-regression capture
//   pnpm --filter @bi-engine2/visual-regression capture -- --filter line-single
//   pnpm --filter @bi-engine2/visual-regression capture -- --viewport 640x480
//   pnpm --filter @bi-engine2/visual-regression capture -- --theme light
//
// ============================================================================

import { chromium, type Browser, type Page, type BrowserContext } from '@playwright/test';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { argv } from 'node:process';

// ---------------------------------------------------------------------------
// 常量定义
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
// 命令行参数解析
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

  // 过滤掉 pnpm 可能传递的 '--' 字面量
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
// 候选元数据记录
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
// 筛选辅助函数
// ---------------------------------------------------------------------------

function getTargetFixtures(filter: string | null): readonly string[] {
  if (filter === null) {
    return FIXTURE_IDS;
  }
  return FIXTURE_IDS.filter((id) => id === filter);
}

function getTargetThemes(filter: string | null): readonly string[] {
  if (filter === null) {
    return THEMES;
  }
  return THEMES.filter((t) => t === filter);
}

function getTargetViewports(filter: string | null): readonly ViewportPreset[] {
  if (filter === null) {
    return VIEWPORT_PRESETS;
  }
  return VIEWPORT_PRESETS.filter(
    (vp) => `${vp.width}x${vp.height}` === filter || vp.label === filter,
  );
}

// ---------------------------------------------------------------------------
// 候选文件命名
// ---------------------------------------------------------------------------

function buildCandidateFileName(
  fixtureId: string,
  theme: string,
  viewport: string,
): string {
  return `${fixtureId}--${theme}--${viewport}.png`;
}

// ---------------------------------------------------------------------------
// Playground UI 交互辅助函数
// ---------------------------------------------------------------------------

async function selectFixture(page: Page, fixtureId: string): Promise<void> {
  const fixtureSelect = page.locator('select').first();
  await fixtureSelect.selectOption(fixtureId);
}

async function selectTheme(page: Page, theme: string): Promise<void> {
  const themeButton = page.locator('button', { hasText: theme === 'light' ? 'Light' : 'Dark' });
  await themeButton.click();
}

async function selectViewport(page: Page, viewportLabel: string): Promise<void> {
  // 视口选择器是页面上的第二个 select 元素
  const viewportSelect = page.locator('select').nth(1);
  await viewportSelect.selectOption({ label: viewportLabel });
}

async function waitForChartStable(page: Page, timeoutMs: number = 5000): Promise<void> {
  // 等待图表容器出现
  const chartContainer = page.locator('[class*="chart"], canvas, [_echarts_instance_]').first();
  await chartContainer.waitFor({ state: 'visible', timeout: timeoutMs });

  // 额外等待渲染和动画完成以稳定截图
  await page.waitForTimeout(800);
}

// ---------------------------------------------------------------------------
// 主截图逻辑
// ---------------------------------------------------------------------------

async function captureSingleCandidate(
  page: Page,
  fixtureId: string,
  theme: string,
  viewport: ViewportPreset,
): Promise<CandidateMetadata> {
  // 设置浏览器视口尺寸
  await page.setViewportSize({ width: viewport.width, height: viewport.height + 200 });

  // 配置 Playground UI
  await selectFixture(page, fixtureId);
  await selectTheme(page, theme);

  const viewportLabel = `${viewport.width}x${viewport.height}`;
  await selectViewport(page, viewportLabel);

  // 等待图表渲染并稳定
  await waitForChartStable(page);

  // 对图表预览区域截图
  const chartPreview = page.locator('div').filter({ hasText: 'Chart Preview' }).nth(1);
  const screenshotTarget = chartPreview.locator('..').locator('div').nth(1);

  const fileName = buildCandidateFileName(fixtureId, theme, viewportLabel);
  const filePath = join(CANDIDATES_DIR, fileName);

  // 尝试对图表容器截图；失败时回退到整页截图
  try {
    await screenshotTarget.screenshot({ path: filePath, type: 'png' });
  } catch {
    await page.screenshot({ path: filePath, type: 'png', fullPage: false });
  }

  return {
    fixtureId,
    theme,
    viewport: viewportLabel,
    renderer: RENDERER,
    capturedAt: new Date().toISOString(),
    fileName,
  };
}

async function main(): Promise<void> {
  const options = parseArgs(argv.slice(2));

  // 尽早验证筛选条件
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

  // 确保候选目录存在
  if (!existsSync(CANDIDATES_DIR)) {
    mkdirSync(CANDIDATES_DIR, { recursive: true });
  }

  console.log('Starting candidate capture...');
  console.log(`  Fixtures:  ${targetFixtures.join(', ')}`);
  console.log(`  Themes:    ${targetThemes.join(', ')}`);
  console.log(`  Viewports: ${targetViewports.map((v) => `${v.width}x${v.height}`).join(', ')}`);

  const totalCombinations =
    targetFixtures.length * targetThemes.length * targetViewports.length;
  console.log(`  Total screenshots to capture: ${totalCombinations}`);

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    const page = await context.newPage();

    // 导航到 Playground 页面
    await page.goto(PLAYGROUND_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

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
            const record = await captureSingleCandidate(
              page,
              fixtureId,
              theme,
              viewport,
            );
            metadata.push(record);
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : String(error);
            console.error(
              `    FAILED to capture ${fixtureId} / ${theme} / ${viewport.width}x${viewport.height}: ${message}`,
            );
          }
        }
      }
    }

    // 将元数据清单写入截图目录
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
    if (context) {
      await context.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Fatal error during candidate capture:', message);
  process.exit(1);
});
