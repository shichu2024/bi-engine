import type { BIEngineComponent } from 'bi-engine';
import { BIEngine } from 'bi-engine';
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
  return (
    <div
      className={styles.previewContainer}
      data-testid="interactive-preview"
    >
      {toolbar && <div style={{ marginBottom: 8 }}>{toolbar}</div>}
      <BIEngine
        schema={component}
      />
    </div>
  );
}
