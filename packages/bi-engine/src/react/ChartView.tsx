// ============================================================================
// react/ChartView.tsx — ChartComponent 渲染组件
// ============================================================================
//
// v2.0: 委托给 ComponentView + 注册表管线。
// 保留原有 Props 接口以保持向后兼容。

import { ComponentView } from './ComponentView';
import type { ComponentViewProps } from './ComponentView';
import type { ChartComponent } from '../schema/bi-engine-models';
import type { ComponentError } from '../platform/types';

// ---------------------------------------------------------------------------
// 错误类型（保留原接口）
// ---------------------------------------------------------------------------

/** 传递给 `onError` 回调的错误结构 */
export interface ChartViewError {
  code: string;
  message: string;
}

// ---------------------------------------------------------------------------
// 组件属性
// ---------------------------------------------------------------------------

export interface ChartViewProps {
  component: ChartComponent;
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: ChartViewError) => void;
}

// ---------------------------------------------------------------------------
// ChartView
// ---------------------------------------------------------------------------

/**
 * ChartComponent 渲染组件。
 *
 * v2.0 行为：委托给 ComponentView，后者通过注册表分发到 chart handler。
 * 保留原有 ChartViewProps 接口，映射到 ComponentViewProps。
 */
export function ChartView({
  component,
  className,
  style,
  onError,
}: ChartViewProps): React.ReactElement {
  const handleError = onError !== undefined
    ? (error: ComponentError) => {
        onError({ code: error.code, message: error.message });
      }
    : undefined;

  return (
    <ComponentView
      component={component}
      className={className}
      style={style}
      onError={handleError}
    />
  );
}
