import { ChartThemeProvider } from 'bi-engine';
import type { ChartComponent } from 'bi-engine';
import { ChartPreview } from '@/components/ChartPreview';
import { useThemeStore } from '@/stores';
import styles from './SceneDetail.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InteractivePreviewProps {
  readonly component: ChartComponent;
  readonly description: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InteractivePreview({
  component,
  description,
}: InteractivePreviewProps): React.ReactElement {
  const { mode, palette } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <div
      className={`${styles.previewContainer} ${isDark ? styles.previewContainerDark : styles.previewContainerLight}`}
      data-testid="interactive-preview"
    >
      <ChartThemeProvider palette={palette}>
        <ChartPreview component={component} description={description} />
      </ChartThemeProvider>
    </div>
  );
}
