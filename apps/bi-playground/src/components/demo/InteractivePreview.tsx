import type { ChartComponent } from 'bi-engine';
import { ChartPreview } from '@/components/ChartPreview';
import styles from './SceneDetail.module.css';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InteractivePreviewProps {
  readonly component: ChartComponent;
  readonly description: string;
  readonly toolbar?: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InteractivePreview({
  component,
  description,
  toolbar,
}: InteractivePreviewProps): React.ReactElement {
  return (
    <div
      className={styles.previewContainer}
      data-testid="interactive-preview"
    >
      <ChartPreview
        component={component}
        description={description}
        toolbar={toolbar}
      />
    </div>
  );
}
