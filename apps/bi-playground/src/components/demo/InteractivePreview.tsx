import { useState, useCallback } from 'react';
import type { BIEngineComponent, BITheme } from 'bi-engine';
import { BIEngine } from 'bi-engine';
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
  const theme: BITheme = themeMode === 'dark' ? 'dark' : 'light';
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
      <BIEngine
        schema={localSchema}
        mode="chat"
        theme={theme}
        locale={locale}
        onChange={handleChange}
      />
    </div>
  );
}
