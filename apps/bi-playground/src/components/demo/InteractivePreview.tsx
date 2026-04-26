import type { BIEngineComponent } from 'bi-engine';
import { BIEngine, ChartThemeProvider, DARK_THEME_TOKENS } from 'bi-engine';
import { useThemeStore, useLocaleStore } from '@/stores';
import styles from './SceneDetail.module.css';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InteractivePreviewProps {
  readonly component: BIEngineComponent;
  readonly description: string;
  readonly toolbar?: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InteractivePreview({
  component,
  toolbar,
}: InteractivePreviewProps): React.ReactElement {
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === 'dark';
  const locale = useLocaleStore((s) => s.locale);
  const isTable = component.type === 'table';

  return (
    <div
      className={isTable ? styles.previewContainerTable : styles.previewContainer}
      data-testid="interactive-preview"
    >
      {toolbar && <div style={{ marginBottom: 8 }}>{toolbar}</div>}
      <ChartThemeProvider tokens={isDark ? DARK_THEME_TOKENS : undefined}>
        <BIEngine
          schema={component}
          locale={locale}
        />
      </ChartThemeProvider>
    </div>
  );
}
