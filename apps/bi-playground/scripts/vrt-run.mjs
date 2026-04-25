// ============================================================================
// vrt-run.mjs — VRT wrapper: ensures single run directory per invocation
// ============================================================================
//
// Usage: node scripts/vrt-run.mjs [--grep <pattern>]
//
// Sets VRT_RUN_ID env var so playwright.config.ts uses a stable directory
// instead of generating a new timestamp on every config re-import.
// After Playwright finishes, generates viewer.html in the run directory.
// ============================================================================

import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const runsDir = resolve(projectRoot, 'tests/visual/.runs');

// ---------------------------------------------------------------------------
// Generate stable run ID
// ---------------------------------------------------------------------------

function generateRunId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const runId = generateRunId();
const runDir = resolve(runsDir, runId);

process.env.VRT_RUN_ID = runId;
mkdirSync(runDir, { recursive: true });

console.log(`\n  VRT Run: ${runId}`);
console.log(`  Directory: tests/visual/.runs/${runId}\n`);

// Build playwright args, forwarding any extra args.
// Strip leading bare "--" that pnpm may inject.
const args = process.argv.slice(2).filter((a, i, arr) => !(i === 0 && a === '--'));
const playwrightCmd = `npx playwright test ${args.join(' ')}`;

try {
  execSync(playwrightCmd, {
    stdio: 'inherit',
    cwd: projectRoot,
    env: { ...process.env },
  });
} catch {
  // Playwright exits non-zero on test failures — that's expected.
}

// Generate viewer report
try {
  execSync(`node "${resolve(__dirname, 'generate-vrt-report.mjs')}"`, {
    stdio: 'inherit',
    cwd: projectRoot,
    env: { ...process.env, VRT_RUN_ID: runId },
  });
} catch (e) {
  console.error('Failed to generate VRT report:', e.message);
}

console.log(`\n  Viewer: tests/visual/vrt-viewer.html`);
console.log(`  Open with: npx serve tests/visual -l 8099\n`);

// Exit with Playwright's original exit code is not needed here;
// the script already forwarded stdio so the caller sees the result.
