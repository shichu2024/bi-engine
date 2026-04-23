// ============================================================================
// approve-baselines.ts
// ============================================================================
//
// 从 candidates/ 目录读取候选截图，将指定的 fixture 提升为基线。
// 更新 baseline-manifest.json 以记录哪些 fixture 已被批准、批准时间及批准人。
//
// 用法：
//   pnpm --filter @bi-engine2/visual-regression approve -- --all
//   pnpm --filter @bi-engine2/visual-regression approve -- --fixture line-single
//   pnpm --filter @bi-engine2/visual-regression approve -- --fixture line-single --approver "John Doe"
//
// ============================================================================

import {
  existsSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { argv } from 'node:process';

// ---------------------------------------------------------------------------
// 路径配置
// ---------------------------------------------------------------------------

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const CANDIDATES_DIR = join(
  PROJECT_ROOT,
  'apps',
  'bi-playground',
  'tests',
  'visual',
  'candidates',
);
const BASELINES_DIR = join(
  PROJECT_ROOT,
  'apps',
  'bi-playground',
  'tests',
  'visual',
  'baselines',
);
const MANIFEST_PATH = join(
  PROJECT_ROOT,
  'apps',
  'bi-playground',
  'tests',
  'visual',
  'baseline-manifest.json',
);

// ---------------------------------------------------------------------------
// 类型定义
// ---------------------------------------------------------------------------

interface BaselineEntry {
  readonly fixtureId: string;
  readonly theme: string;
  readonly viewport: string;
  readonly renderer: string;
  readonly fileName: string;
  readonly approvedAt: string;
  readonly approvedBy: string;
}

interface BaselineManifest {
  readonly version: number;
  readonly baselines: Record<string, BaselineEntry>;
}

// ---------------------------------------------------------------------------
// 命令行参数解析
// ---------------------------------------------------------------------------

interface ApproveOptions {
  readonly approveAll: boolean;
  readonly fixtureId: string | null;
  readonly approver: string;
}

function parseArgs(args: string[]): ApproveOptions {
  let approveAll = false;
  let fixtureId: string | null = null;
  let approver = 'manual';

  // 过滤掉 pnpm 可能传递的 '--' 字面量
  const filtered = args.filter((a) => a !== '--');

  for (let i = 0; i < filtered.length; i++) {
    const arg = filtered[i];
    if (arg === '--all') {
      approveAll = true;
    } else if (arg === '--fixture' && i + 1 < filtered.length) {
      fixtureId = filtered[i + 1];
      i++;
    } else if (arg === '--approver' && i + 1 < filtered.length) {
      approver = filtered[i + 1];
      i++;
    }
  }

  return { approveAll, fixtureId, approver };
}

// ---------------------------------------------------------------------------
// 清单文件读写
// ---------------------------------------------------------------------------

function loadManifest(): BaselineManifest {
  if (!existsSync(MANIFEST_PATH)) {
    return { version: 1, baselines: {} };
  }

  const raw = readFileSync(MANIFEST_PATH, 'utf-8');
  return JSON.parse(raw) as BaselineManifest;
}

function saveManifest(manifest: BaselineManifest): void {
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// 候选文件发现
// ---------------------------------------------------------------------------

interface CandidateFile {
  readonly fileName: string;
  readonly fixtureId: string;
  readonly theme: string;
  readonly viewport: string;
}

function parseCandidateFileName(fileName: string): CandidateFile | null {
  // 文件名格式：{fixtureId}--{theme}--{viewport}.png
  if (!fileName.endsWith('.png')) {
    return null;
  }

  const baseName = fileName.slice(0, -4); // 移除 .png 扩展名
  const parts = baseName.split('--');

  if (parts.length !== 3) {
    return null;
  }

  const [fixtureId, theme, viewport] = parts;

  if (!fixtureId || !theme || !viewport) {
    return null;
  }

  return { fileName, fixtureId, theme, viewport };
}

function discoverCandidates(): CandidateFile[] {
  if (!existsSync(CANDIDATES_DIR)) {
    return [];
  }

  const entries = readdirSync(CANDIDATES_DIR);
  const candidates: CandidateFile[] = [];

  for (const entry of entries) {
    const parsed = parseCandidateFileName(entry);
    if (parsed !== null) {
      candidates.push(parsed);
    }
  }

  return candidates;
}

// ---------------------------------------------------------------------------
// 基线提升
// ---------------------------------------------------------------------------

function promoteToBaseline(
  candidate: CandidateFile,
  approver: string,
): BaselineEntry {
  const srcPath = join(CANDIDATES_DIR, candidate.fileName);
  const dstPath = join(BASELINES_DIR, candidate.fileName);

  // 确保基线目录存在
  if (!existsSync(BASELINES_DIR)) {
    mkdirSync(BASELINES_DIR, { recursive: true });
  }

  // 将候选文件复制到基线目录
  copyFileSync(srcPath, dstPath);

  return {
    fixtureId: candidate.fixtureId,
    theme: candidate.theme,
    viewport: candidate.viewport,
    renderer: 'echarts',
    fileName: candidate.fileName,
    approvedAt: new Date().toISOString(),
    approvedBy: approver,
  };
}

// ---------------------------------------------------------------------------
// 主入口
// ---------------------------------------------------------------------------

function main(): void {
  const options = parseArgs(argv.slice(2));

  if (!options.approveAll && options.fixtureId === null) {
    console.error(
      'Error: Must specify either --all or --fixture <fixture-id>',
    );
    console.error('');
    console.error('Usage:');
    console.error('  approve-baselines --all');
    console.error('  approve-baselines --fixture line-single');
    console.error('  approve-baselines --fixture line-single --approver "Jane Doe"');
    process.exit(1);
  }

  const candidates = discoverCandidates();

  if (candidates.length === 0) {
    console.error('No candidate screenshots found in:', CANDIDATES_DIR);
    console.error('Run capture-candidates.ts first to generate candidates.');
    process.exit(1);
  }

  // 根据选项筛选候选文件
  const targetCandidates = options.approveAll
    ? candidates
    : candidates.filter((c) => c.fixtureId === options.fixtureId);

  if (targetCandidates.length === 0) {
    if (options.fixtureId !== null) {
      console.error(
        `No candidates found for fixture: ${options.fixtureId}`,
      );
    }
    process.exit(1);
  }

  // 加载当前清单
  const manifest = loadManifest();

  // 逐个提升目标候选文件
  const approvedEntries: BaselineEntry[] = [];

  for (const candidate of targetCandidates) {
    const entry = promoteToBaseline(candidate, options.approver);
    approvedEntries.push(entry);
  }

  // 使用新的基线更新清单（不可变更新模式）
  const updatedBaselines: Record<string, BaselineEntry> = {
    ...manifest.baselines,
  };

  for (const entry of approvedEntries) {
    // 使用复合键：fixtureId--theme--viewport
    const key = `${entry.fixtureId}--${entry.theme}--${entry.viewport}`;
    updatedBaselines[key] = entry;
  }

  const updatedManifest: BaselineManifest = {
    ...manifest,
    baselines: updatedBaselines,
  };

  saveManifest(updatedManifest);

  console.log('Baseline approval complete.');
  console.log(`  Approved: ${approvedEntries.length} screenshot(s)`);
  console.log(`  Approvers: ${options.approver}`);

  for (const entry of approvedEntries) {
    console.log(
      `    - ${entry.fixtureId} / ${entry.theme} / ${entry.viewport}`,
    );
  }

  console.log(`\nManifest updated: ${MANIFEST_PATH}`);
  console.log(`Baselines saved to: ${BASELINES_DIR}`);
}

main();
