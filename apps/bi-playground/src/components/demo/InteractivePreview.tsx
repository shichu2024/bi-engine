import { useState, useCallback } from 'react';
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
  const themeMode = useThemeStore((s) => s.mode);
  const isDark = themeMode === 'dark';
  const locale = useLocaleStore((s) => s.locale);
  const isTable = component.type === 'table';

  const [localSchema, setLocalSchema] = useState<BIEngineComponent>(component);

  const handleChange = useCallback(
    (newSchema: BIEngineComponent) => {
      setLocalSchema(newSchema);
    },
    [],
  );

  return (
    <div
      className={isTable ? styles.previewContainerTable : styles.previewContainer}
      data-testid="interactive-preview"
    >
      {toolbar && <div style={{ marginBottom: 8 }}>{toolbar}</div>}
      <ChartThemeProvider tokens={isDark ? DARK_THEME_TOKENS : undefined}>
        <BIEngine
          schema={localSchema}
          mode="runtime"
          locale={locale}
          onChange={handleChange}
        />
      </ChartThemeProvider>
    </div>
  );
}
