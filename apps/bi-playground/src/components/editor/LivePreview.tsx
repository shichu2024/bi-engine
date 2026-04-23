import { Component, useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'antd';
import { ChartThemeProvider } from 'bi-engine';
import type { ChartComponent } from 'bi-engine';
import { ChartPreview } from '@/components/ChartPreview';
import { useEditorStore, useThemeStore, useViewportStore } from '@/stores';
import { PreviewToolbar } from './PreviewToolbar';
import styles from './LivePreview.module.css';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 300;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RenderState =
  | { status: 'idle' }
  | { status: 'success'; component: ChartComponent }
  | { status: 'error'; message: string };

// ---------------------------------------------------------------------------
// Custom hook: debounced value
// ---------------------------------------------------------------------------

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ---------------------------------------------------------------------------
// Error boundary
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
  readonly onError: (message: string) => void;
}

class PreviewErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    const { onError } = this.props;
    onError(`组件渲染错误：${error.message}`);
  }

  render(): React.ReactNode {
    const { error } = this.state;
    if (error) {
      // Error is already reported via onError; render nothing so the parent
      // Alert is displayed.
      return null;
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LivePreview(): React.ReactElement {
  const dsl = useEditorStore((s) => s.dsl);
  const palette = useThemeStore((s) => s.palette);
  const viewport = useViewportStore((s) => s.currentViewport());

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [disableAnimation, setDisableAnimation] = useState(false);
  const [boundaryError, setBoundaryError] = useState<string | null>(null);

  const debouncedDsl = useDebouncedValue(dsl, DEBOUNCE_MS);

  const renderState: RenderState = useMemo(() => {
    if (!debouncedDsl.trim()) {
      return { status: 'idle' };
    }

    try {
      const parsed = JSON.parse(debouncedDsl) as ChartComponent;

      if (!parsed || typeof parsed !== 'object' || !parsed.type) {
        return { status: 'error', message: 'JSON 解析失败：缺少必要的 type 字段' };
      }

      return { status: 'success', component: parsed };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);
      return { status: 'error', message: `JSON 解析失败：${message}` };
    }
  }, [debouncedDsl]);

  const handleFullscreenChange = useCallback((fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
  }, []);

  const handleDisableAnimationChange = useCallback((disabled: boolean) => {
    setDisableAnimation(disabled);
  }, []);

  const handleBoundaryError = useCallback((message: string) => {
    setBoundaryError(message);
  }, []);

  // Reset boundary error when DSL changes
  useEffect(() => {
    setBoundaryError(null);
  }, [debouncedDsl]);

  const displayError = boundaryError ?? (
    renderState.status === 'error' ? renderState.message : null
  );

  const viewportWidth = viewport.width === 0 ? '100%' : viewport.width;
  const isConstrained = viewport.width > 0;

  const viewportFrameClassName = isConstrained
    ? `${styles.viewportFrame} ${styles.viewportFrameConstrained}`
    : styles.viewportFrame;

  const rootClassName = isFullscreen
    ? styles.fullscreenOverlay
    : styles.container;

  const animationStyle = disableAnimation
    ? ({ animation: 'none', transition: 'none' } as React.CSSProperties)
    : undefined;

  return (
    <div className={rootClassName}>
      <PreviewToolbar
        isFullscreen={isFullscreen}
        onFullscreenChange={handleFullscreenChange}
        disableAnimation={disableAnimation}
        onDisableAnimationChange={handleDisableAnimationChange}
      />

      <div className={styles.renderArea}>
        {renderState.status === 'idle' && (
          <div className={styles.emptyState}>
            在左侧编辑器中输入 DSL JSON 以预览
          </div>
        )}

        {displayError && (
          <div className={styles.errorCenter}>
            <Alert type="error" message={displayError} showIcon style={{ width: '100%' }} />
          </div>
        )}

        {renderState.status === 'success' && !displayError && (
          <div
            className={viewportFrameClassName}
            style={{
              '--preview-viewport-width': `${viewport.width}px`,
              width: viewportWidth,
              height: viewport.height,
              ...animationStyle,
            } as React.CSSProperties}
          >
            <PreviewErrorBoundary onError={handleBoundaryError}>
              <ChartThemeProvider palette={palette}>
                <ChartPreview
                  component={renderState.component}
                  description={renderState.component.id ?? 'Preview'}
                />
              </ChartThemeProvider>
            </PreviewErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
}
