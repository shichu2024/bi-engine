import type { ReactNode } from 'react';
import type { ChartRenderError } from '../core/chart-render-error';

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

/** 图表渲染的生命周期状态 */
export type ChartState = 'loading' | 'empty' | 'error' | 'success';

/** `ChartStateView` 接受的属性 */
export interface ChartStateViewProps {
  /** 图表当前渲染状态 */
  state: ChartState;

  /**
   * 结构化错误信息。仅在 `state === 'error'` 时使用。
   * `ChartStateView` 只读取 `code` 和 `message` -- 不会将原始 `details` 暴露到 DOM。
   */
  error?: ChartRenderError;

  /**
   * 当 `state === 'success'` 时渲染的内容。
   * 其他状态下忽略。
   */
  children?: ReactNode;

  /** 应用于最外层容器的可选 CSS 类名 */
  className?: string;

  /** 应用于最外层容器的可选内联样式 */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// 内联样式常量
//
// 刻意保持最小化 -- 不依赖外部 CSS，不依赖主题令牌。
// 宿主应用可以通过 `className` / `style` 属性覆盖。
// ---------------------------------------------------------------------------

const CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const TEXT_BASE: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.5,
  textAlign: 'center',
};

const MUTED_TEXT: React.CSSProperties = {
  ...TEXT_BASE,
  color: '#888',
};

const ERROR_TEXT: React.CSSProperties = {
  ...TEXT_BASE,
  color: '#c00',
};

const ERROR_CODE_STYLE: React.CSSProperties = {
  ...TEXT_BASE,
  color: '#999',
  fontSize: 12,
  marginTop: 4,
};

// ---------------------------------------------------------------------------
// 加载旋转器（纯 CSS 动画）
// ---------------------------------------------------------------------------

const SPINNER_SIZE = 24;

const SPINNER_WRAPPER: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: SPINNER_SIZE,
  height: SPINNER_SIZE,
};

/** React 样式对象中无法使用内联关键帧，
 *  因此使用不需要 CSS 动画支持的简单 SVG 旋转器。 */
function Spinner(): React.ReactElement {
  return (
    <svg
      width={SPINNER_SIZE}
      height={SPINNER_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'bi-engine-spin 1s linear infinite' }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#ccc"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        strokeDashoffset="0"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ChartStateView 组件
// ---------------------------------------------------------------------------

/**
 * 根据当前图表渲染状态渲染相应的 UI。
 *
 * - `loading` -- 最小的旋转器占位符。
 * - `empty` -- "无数据"消息。
 * - `error` -- 结构化错误展示（错误码 + 消息，不显示原始详情）。
 * - `success` -- 渲染 `children`。
 *
 * 组件刻意保持简单：无外部 CSS、无图标库、无主题依赖。
 * 宿主可以通过 `className` 和 `style` 属性自定义外观。
 */
export function ChartStateView({
  state,
  error,
  children,
  className,
  style,
}: ChartStateViewProps): React.ReactElement | null {
  const containerStyles = { ...CONTAINER_STYLE, ...style };

  if (state === 'loading') {
    return (
      <div className={className} style={containerStyles}>
        {/* 注入旋转器的最小关键帧。重复注入是安全的。 */}
        <style>{`@keyframes bi-engine-spin { to { transform: rotate(360deg) } }`}</style>
        <div style={SPINNER_WRAPPER}>
          <Spinner />
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className={className} style={containerStyles}>
        <span style={MUTED_TEXT}>No data available</span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={className} style={containerStyles}>
        <span style={ERROR_TEXT}>
          {error !== undefined ? error.message : 'An unexpected error occurred.'}
        </span>
        {error !== undefined && (
          <span style={ERROR_CODE_STYLE}>{error.code}</span>
        )}
      </div>
    );
  }

  // state === 'success'
  if (children !== undefined) {
    return <>{children}</>;
  }

  return null;
}
