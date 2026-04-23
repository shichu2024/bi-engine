import { useRef, useMemo } from 'react';
import type { ChartComponent } from '../schema/bi-engine-models';
import { validateChartComponent } from '../core/validate-chart-component';
import { normalizeChartComponent } from '../core/normalize-chart-component';
import { resolveChartData } from '../core/resolve-chart-data';
import { buildSemanticModel } from '../core/chart-semantic-model';
import { buildEChartsOption } from '../adapters/echarts';
import type { EChartsOption } from '../adapters/echarts';
import type { ChartOptionInput } from './use-chart-instance';
import { useChartInstance } from './use-chart-instance';

// ---------------------------------------------------------------------------
// 错误类型
// ---------------------------------------------------------------------------

/** 传递给 `onError` 回调的错误结构 */
export interface ChartViewError {
  /** 机器可读的错误码 */
  code: string;
  /** 人类可读的描述 */
  message: string;
}

// ---------------------------------------------------------------------------
// 组件属性
// ---------------------------------------------------------------------------

export interface ChartViewProps {
  /** 待渲染的图表组件定义 */
  component: ChartComponent;
  /** 应用于容器 div 的可选 CSS 类名 */
  className?: string;
  /** 应用于容器 div 的可选内联样式 */
  style?: React.CSSProperties;
  /**
   * 当校验或数据解析失败时调用的回调。
   *
   * ChartView 本身不渲染任何错误 UI（该职责属于 T-007 ChartStateView）。
   * 宿主可以使用此回调来决定如何展示失败。
   */
  onError?: (error: ChartViewError) => void;
}

// ---------------------------------------------------------------------------
// 管道：ChartComponent -> EChartsOption | null
// ---------------------------------------------------------------------------

/**
 * 运行完整的渲染管道并返回生成的 ECharts 选项，
 * 或在管道遇到错误时返回 `null`。
 *
 * @param component - 原始图表组件。
 * @param onError   - 可选的错误回调。
 * @returns 可供图表运行时使用的 `EChartsOption`，或 `null`。
 */
function resolveOption(
  component: ChartComponent,
  onError?: (error: ChartViewError) => void,
): EChartsOption | null {
  // 步骤 1：校验
  const validationResult = validateChartComponent(component);
  if (!validationResult.ok) {
    const firstError = validationResult.errors[0];
    if (onError !== undefined) {
      onError({
        code: firstError?.code ?? 'VALIDATION_FAILED',
        message: firstError?.message ?? 'ChartComponent validation failed.',
      });
    }
    return null;
  }

  // 步骤 2：标准化
  const normalized = normalizeChartComponent(component);

  // 步骤 3：解析数据
  const resolved = resolveChartData(component.dataProperties);
  if (!resolved.ok) {
    if (onError !== undefined) {
      onError({
        code: resolved.code,
        message: resolved.message,
      });
    }
    return null;
  }

  // 步骤 4：构建语义模型
  const model = buildSemanticModel(normalized, resolved.data);

  // 步骤 5：构建 ECharts 选项
  const option = buildEChartsOption(model);

  return option;
}

// ---------------------------------------------------------------------------
// ChartView 组件
// ---------------------------------------------------------------------------

/**
 * 使用 ECharts 渲染 {@link ChartComponent} 的 React 宿主组件。
 *
 * 职责：
 * - 接受 `ChartComponent` 作为核心输入。
 * - 运行完整管道：校验 -> 标准化 -> 解析数据 ->
 *   构建语义模型 -> 构建 ECharts 选项。
 * - 将 ECharts 实例生命周期委托给 `useChartInstance`。
 * - 渲染单个 `<div>` 容器。
 * - 当校验或数据解析失败时调用 `onError`（如果提供了），
 *   但不渲染任何错误/加载/空状态 UI（那是 T-007 的职责）。
 *
 * 该组件是纯粹的宿主：不处理页面布局、业务数据平台逻辑或 schema 重写。
 */
export function ChartView({
  component,
  className,
  style,
  onError,
}: ChartViewProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 缓存选项计算，使其仅在 component prop 引用变化时重新运行。
  // 我们有意通过无 ref 模式在闭包中捕获 onError：
  // 调用方预期稳定化 onError（例如使用 useCallback），
  // 或接受新引用会触发重新解析。
  const option = useMemo<ChartOptionInput | null>(() => {
    return resolveOption(component, onError);
  }, [component, onError]);

  useChartInstance({
    containerRef,
    option,
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
}
