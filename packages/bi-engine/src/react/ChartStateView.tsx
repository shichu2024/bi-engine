import type { ReactNode } from 'react';
import type { ChartRenderError } from '../core/chart-render-error';
import { useChartTheme } from '../theme/chart-theme-context';

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

export type ChartState = 'loading' | 'empty' | 'error' | 'success';

export interface ChartStateViewProps {
  state: ChartState;
  error?: ChartRenderError;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// ChartStateView 组件
// ---------------------------------------------------------------------------

export function ChartStateView({
  state,
  error,
  children,
  className,
  style,
}: ChartStateViewProps): React.ReactElement | null {
  const { tokens: t } = useChartTheme();

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    fontFamily: t.font.family,
    ...style,
  };

  if (state === 'loading') {
    return (
      <div className={className} style={containerStyles}>
        <style>{`@keyframes bi-engine-spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            style={{ animation: 'bi-engine-spin 1s linear infinite' }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke={t.border.axisLineColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
              strokeDashoffset="0"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className={className} style={containerStyles}>
        <span style={{ fontSize: 14, lineHeight: 1.5, textAlign: 'center', color: t.font.secondaryColor }}>
          No data available
        </span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={className} style={containerStyles}>
        <span style={{ fontSize: 14, lineHeight: 1.5, textAlign: 'center', color: t.semantic.error }}>
          {error !== undefined ? error.message : 'An unexpected error occurred.'}
        </span>
        {error !== undefined && (
          <span style={{ fontSize: 12, lineHeight: 1.5, textAlign: 'center', color: t.font.tertiaryColor, marginTop: 4 }}>
            {error.code}
          </span>
        )}
      </div>
    );
  }

  if (children !== undefined) {
    return <>{children}</>;
  }

  return null;
}
