// ============================================================================
// VrtRenderPage.tsx
// ============================================================================
//
// Dedicated visual regression test render page.
//
// Query params:
//   - fixture: fixture ID (e.g. "line-single")
//   - theme: "light" | "dark" (default: "light")
//   - viewport: "{width}x{height}" (e.g. "960x600", default: "960x600")
//
// Renders a single chart in a clean, chrome-less container suitable for
// deterministic screenshot capture.
//
// ============================================================================

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChartThemeProvider, BIEngine, ChartStateView } from 'bi-engine';
import { getFixtureById } from 'bi-engine/testing';
import { DARK_PALETTE, LIGHT_PALETTE } from '../shared-constants';

// ---------------------------------------------------------------------------
// Default viewport
// ---------------------------------------------------------------------------

const DEFAULT_VIEWPORT = { width: 960, height: 600 };

function parseViewport(raw: string | null): { width: number; height: number } {
  if (!raw) {
    return DEFAULT_VIEWPORT;
  }
  const parts = raw.split('x');
  const width = Number(parts[0]);
  const height = Number(parts[1] ?? '');
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return DEFAULT_VIEWPORT;
  }
  return { width, height };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VrtRenderPage(): React.ReactElement {
  const [searchParams] = useSearchParams();

  const fixtureId = searchParams.get('fixture') ?? '';
  const theme = searchParams.get('theme') === 'dark' ? 'dark' : 'light';
  const viewport = useMemo(() => parseViewport(searchParams.get('viewport')), [searchParams]);

  const palette = theme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;

  const fixture = useMemo(() => getFixtureById(fixtureId), [fixtureId]);

  // Set page background to match theme for clean screenshots
  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#1a1a2e' : '#ffffff';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, [theme]);

  if (!fixture) {
    return (
      <div
        data-testid="vrt-render-error"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: viewport.width,
          height: viewport.height,
          color: '#e00',
          fontSize: 16,
        }}
      >
        Fixture not found: {fixtureId}
      </div>
    );
  }

  return (
    <div
      data-testid="vrt-render-container"
      style={{
        width: viewport.width,
        height: viewport.height,
        overflow: 'hidden',
      }}
    >
      <ChartThemeProvider palette={palette}>
        <ChartStateView state="success">
          <BIEngine schema={fixture.component} />
        </ChartStateView>
      </ChartThemeProvider>
    </div>
  );
}
