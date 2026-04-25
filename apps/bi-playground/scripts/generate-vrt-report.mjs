// ============================================================================
// generate-vrt-report.mjs — Post-run report generator
// ============================================================================
//
// After each VRT run, generates:
// 1. .runs/{runId}/manifest.json — per-run failure details with image paths
// 2. .runs/manifest.json — aggregated run list for the viewer
// 3. .runs/{runId}/viewer.html — standalone per-run viewer (optional)
//
// Cleans up runs beyond MAX_HISTORY.
// The committed viewer (vrt-viewer.html) loads manifests dynamically.
// ============================================================================

import {
  readFileSync, writeFileSync, readdirSync, existsSync,
  mkdirSync, copyFileSync, rmSync,
} from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const runId = process.env.VRT_RUN_ID;

if (!runId) {
  console.error('VRT_RUN_ID env var not set');
  process.exit(1);
}

const runsRoot = resolve(projectRoot, 'tests/visual/.runs');
const runDir = resolve(runsRoot, runId);
const artifactsDir = resolve(runDir, 'artifacts');
const baselinesDir = resolve(projectRoot, 'tests/visual/baselines');

const MAX_HISTORY = 20;

// ---------------------------------------------------------------------------
// Collect failures for a single run
// ---------------------------------------------------------------------------

function collectResults(runDirectory) {
  const tests = [];
  const artDir = resolve(runDirectory, 'artifacts');
  if (!existsSync(artDir)) return tests;

  const entries = readdirSync(artDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const testDir = resolve(artDir, entry.name);
    const files = readdirSync(testDir);

    const errorContextFile = files.find(f => f === 'error-context.md');
    let fixtureName = '', theme = '', viewport = '';

    if (errorContextFile) {
      const content = readFileSync(resolve(testDir, errorContextFile), 'utf-8');
      const nameMatch = content.match(/- Name:\s*(.+)/);
      if (nameMatch) {
        const parts = nameMatch[1].trim().split(' | ');
        if (parts.length >= 3) {
          fixtureName = parts[0].trim().split(' >> ').pop();
          theme = parts[1].trim();
          viewport = parts[2].trim();
        }
      }
    }

    const actualImg = files.find(f => f.endsWith('-actual.png'));
    const diffImg = files.find(f => f.endsWith('-diff.png'));

    let baselineImg = '';
    if (actualImg) {
      const snapshotName = actualImg.replace('-actual.png', '');
      const baselinePath = resolve(baselinesDir, `${snapshotName}.png`);
      if (existsSync(baselinePath)) {
        baselineImg = snapshotName;
        const runBaselinesDir = resolve(runDirectory, 'baselines');
        mkdirSync(runBaselinesDir, { recursive: true });
        const dest = resolve(runBaselinesDir, `${snapshotName}.png`);
        if (!existsSync(dest)) copyFileSync(baselinePath, dest);
      }
    }

    let pixelDiff = '', diffRatio = 0;
    if (errorContextFile) {
      const content = readFileSync(resolve(testDir, errorContextFile), 'utf-8');
      const ratioMatch = content.match(/(\d+)\s+pixels\s+\(ratio\s+([\d.]+)\)/);
      if (ratioMatch) {
        pixelDiff = ratioMatch[1];
        diffRatio = parseFloat(ratioMatch[2]);
      }
    }

    const relPrefix = relative(runDirectory, testDir).replace(/\\/g, '/');

    tests.push({
      fixtureName,
      theme,
      viewport,
      pixelDiff,
      diffRatio,
      actualSrc: actualImg ? `${relPrefix}/${actualImg}` : '',
      diffSrc: diffImg ? `${relPrefix}/${diffImg}` : '',
      baselineSrc: baselineImg ? `baselines/${baselineImg}.png` : '',
    });
  }
  return tests;
}

// ---------------------------------------------------------------------------
// Scan all run directories
// ---------------------------------------------------------------------------

function scanAllRuns() {
  if (!existsSync(runsRoot)) return [];

  return readdirSync(runsRoot, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^\d{4}-\d{2}-\d{2}T/.test(d.name))
    .map(d => d.name)
    .sort()
    .reverse();
}

// ---------------------------------------------------------------------------
// Format run ID to display date
// ---------------------------------------------------------------------------

function formatRunDate(id) {
  return id.replace('T', ' ').replace(/-(\d{2})-(\d{2})$/, ':$1:$2');
}

// ---------------------------------------------------------------------------
// Generate per-run manifest.json
// ---------------------------------------------------------------------------

function generateRunManifest(runDirectory, runName, results) {
  const manifest = {
    id: runName,
    date: formatRunDate(runName),
    failed: results.length,
    tests: results.map(t => ({
      fixture: t.fixtureName,
      theme: t.theme,
      viewport: t.viewport,
      px: t.pixelDiff,
      ratio: t.diffRatio,
      baseline: t.baselineSrc,
      actual: t.actualSrc,
      diff: t.diffSrc,
    })),
  };

  const manifestPath = resolve(runDirectory, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`  manifest: ${relative(projectRoot, manifestPath)} (${results.length} failures)`);
}

// ---------------------------------------------------------------------------
// Generate top-level manifest.json (run list)
// ---------------------------------------------------------------------------

function generateTopManifest(runDirs) {
  const entries = runDirs.map(dirName => {
    const manifestPath = resolve(runsRoot, dirName, 'manifest.json');
    if (existsSync(manifestPath)) {
      try {
        const data = JSON.parse(readFileSync(manifestPath, 'utf-8'));
        return { id: data.id, date: data.date, failed: data.failed };
      } catch {
        // fallback
      }
    }
    return { id: dirName, date: formatRunDate(dirName), failed: 0 };
  });

  writeFileSync(resolve(runsRoot, 'manifest.json'), JSON.stringify(entries, null, 2), 'utf-8');
  console.log(`  runs: ${relative(projectRoot, resolve(runsRoot, 'manifest.json'))} (${entries.length} runs)`);
}

// ---------------------------------------------------------------------------
// Generate per-run standalone viewer.html (for direct file:// opening)
// ---------------------------------------------------------------------------

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateRunViewer(runDirectory, runName, results) {
  const rows = results.map(t => `
    <div class="card">
      <div class="card-head" onclick="toggle(this)">
        <span class="badge fail">FAIL</span>
        <span class="name">${esc(t.fixtureName)} / ${esc(t.theme)} / ${esc(t.viewport)}</span>
        <span class="diff-num">${esc(t.pixelDiff)} px</span>
        <span class="arrow">&#9656;</span>
      </div>
      <div class="card-body" style="display:none">
        <div class="imgs">
          <div class="img-col"><div class="img-title">Baseline</div>${t.baselineSrc ? `<img src="${t.baselineSrc}"/>` : '<div class="na">N/A</div>'}</div>
          <div class="img-col"><div class="img-title">Actual</div>${t.actualSrc ? `<img src="${t.actualSrc}"/>` : '<div class="na">N/A</div>'}</div>
          <div class="img-col"><div class="img-title">Diff</div>${t.diffSrc ? `<img src="${t.diffSrc}"/>` : '<div class="na">N/A</div>'}</div>
        </div>
      </div>
    </div>`).join('');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>VRT — ${runName}</title><style>
:root{--bg:#fff;--surface:#f8f9fa;--border:#e1e4e8;--text:#1f2328;--text2:#656d76;--fail:#cf222e;--fail-bg:#ffebe9;--pass:#1a7f37;--pass-bg:#dafbe1}
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);padding:24px;max-width:1200px;margin:0 auto}
h1{font-size:18px;font-weight:600;margin-bottom:4px}.meta{color:var(--text2);font-size:13px;margin-bottom:20px}
.chip{display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;margin-right:8px}.chip.f{background:var(--fail-bg);color:var(--fail)}.chip.p{background:var(--pass-bg);color:var(--pass)}
.card{border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden;background:var(--bg)}
.card-head{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;user-select:none}.card-head:hover{background:var(--surface)}
.badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;letter-spacing:.5px}.badge.fail{background:var(--fail-bg);color:var(--fail)}
.name{flex:1;font-size:13px}.diff-num{color:var(--text2);font-size:12px;font-family:monospace}.arrow{color:var(--text2);font-size:11px;transition:transform .15s}.arrow.open{transform:rotate(90deg)}
.card-body{border-top:1px solid var(--border);padding:16px;background:var(--surface)}
.imgs{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.img-col{text-align:center}.img-title{font-size:11px;color:var(--text2);margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.img-col img{max-width:100%;border-radius:4px;border:1px solid var(--border)}.na{padding:32px;color:var(--text2);font-size:13px;border:1px dashed var(--border);border-radius:4px}
.empty{text-align:center;color:var(--text2);padding:60px;font-size:14px}
</style></head><body>
<h1>Visual Regression Report</h1><div class="meta">${formatRunDate(runName)}</div>
<div style="margin-bottom:20px">${results.length > 0 ? `<span class="chip f">${results.length} failed</span>` : '<span class="chip p">All passed</span>'}</div>
${results.length === 0 ? '<div class="empty">No visual differences detected.</div>' : rows}
<script>function toggle(h){var b=h.nextElementSibling,a=h.querySelector('.arrow');if(b.style.display==='none'){b.style.display='block';a.classList.add('open')}else{b.style.display='none';a.classList.remove('open')}}</script>
</body></html>`;

  writeFileSync(resolve(runDirectory, 'viewer.html'), html, 'utf-8');
  console.log(`  viewer: ${relative(projectRoot, resolve(runDirectory, 'viewer.html'))} (${results.length} failures)`);
}

// ---------------------------------------------------------------------------
// Cleanup: keep only the most recent MAX_HISTORY runs
// ---------------------------------------------------------------------------

function cleanupOldRuns(runDirs) {
  if (runDirs.length <= MAX_HISTORY) return;

  const toDelete = runDirs.slice(MAX_HISTORY);
  for (const dirName of toDelete) {
    const dir = resolve(runsRoot, dirName);
    rmSync(dir, { recursive: true, force: true });
    console.log(`  cleaned: ${dirName}`);
  }
  console.log(`  history: kept ${runDirs.length - toDelete.length} runs, removed ${toDelete.length}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const results = collectResults(runDir);
generateRunManifest(runDir, runId, results);
generateRunViewer(runDir, runId, results);

const allRunDirs = scanAllRuns();
generateTopManifest(allRunDirs);
cleanupOldRuns(allRunDirs);

console.log(`\n  Viewer: tests/visual/vrt-viewer.html`);
console.log(`  Open with: npx serve tests/visual -l 8099\n`);
