// ============================================================================
// react/ComponentView.tsx — 统一组件视图
// ============================================================================

import { useMemo, useEffect } from 'react';
import type { BIEngineComponent, ChartComponent } from '../schema/bi-engine-models';
import { getComponentHandler } from '../platform/component-registry';
import { defaultPipelineEngine } from '../pipeline/pipeline-engine';
import { useRenderMode, useCanSwitchChart } from '../platform/render-mode';
import { RenderMode } from '../platform/types';
import { DEFAULT_THEME_TOKENS } from '../theme/theme-tokens';
import { useChartTheme } from '../theme/chart-theme-context';
import type { ComponentError, RenderContext } from '../platform/types';
import { DesignableWrapper } from './DesignableWrapper';
import {
  getSwitchableTypes,
  convertSchema,
  deriveDisplayKind,
} from '../component-handlers/chart/chart-switch';
import type { SwitchTarget } from '../component-handlers/chart/chart-switch';
import { ChartSwitchToolbar } from '../component-handlers/chart/ChartSwitchToolbar';
import type { ChartSemanticModel } from '../component-handlers/chart/chart-semantic-model';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ComponentViewProps {
  /** 待渲染的组件（任意类型） */
  component: BIEngineComponent;
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: ComponentError) => void;
  /** 设计态选中回调 */
  onSelect?: (componentId: string) => void;
  /** 图表类型切换回调 */
  onChartTypeChange?: (newSchema: BIEngineComponent) => void;
  /**
   * 原始图表 schema（当从 chart 切换到 table 时保留原始 chart 引用）。
   * 用于在 table 视图下仍能显示切换 toolbar。
   */
  originalChartSchema?: ChartComponent;
  /** 组件变更回调（文本编辑、图表切换等统一出口） */
  onChange?: (newSchema: BIEngineComponent) => void;
}

// ---------------------------------------------------------------------------
// ComponentView
// ---------------------------------------------------------------------------

/**
 * 统一组件视图。
 *
 * 根据 component.type 从 ComponentRegistry 获取处理器，
 * 执行管线 (validate → normalize → resolve → buildModel)，
 * 然后调用 renderer.render() 输出 React 节点。
 */
export function ComponentView({
  component,
  className,
  style,
  onError,
  onSelect,
  onChartTypeChange,
  originalChartSchema,
  onChange,
}: ComponentViewProps): React.ReactNode {
  const mode = useRenderMode();
  const canSwitchChart = useCanSwitchChart();
  const chartTheme = useChartTheme();

  // 1. 获取处理器
  const handler = useMemo(
    () => getComponentHandler(component.type),
    [component.type],
  );

  // 2. 执行管线
  const pipelineResult = useMemo(() => {
    if (handler === undefined) return null;
    return defaultPipelineEngine.execute(component);
  }, [component, handler]);

  // 3. 提取首个错误
  const firstError = useMemo((): ComponentError | null => {
    if (handler === undefined) {
      return {
        code: 'UNSUPPORTED_COMPONENT_TYPE',
        message: `Component type "${component.type}" is not registered.`,
        stage: 'rendering',
      };
    }
    if (pipelineResult === null) return null;
    return (
      pipelineResult.validation.error ??
      pipelineResult.normalization.error ??
      pipelineResult.resolution.error ??
      pipelineResult.model.error ??
      null
    );
  }, [handler, pipelineResult, component.type]);

  // 4. 触发错误回调
  useEffect(() => {
    if (firstError !== null) {
      onError?.(firstError);
    }
  }, [firstError, onError]);

  // 5. 错误解围
  if (firstError !== null) {
    return <ErrorFallback code={firstError.code} message={firstError.message} theme={chartTheme.tokens} />;
  }

  // 6. 构建渲染上下文
  const isChart = component.type === 'chart';
  const isSwitchedTable = component.type !== 'chart' && !!originalChartSchema;
  const renderContext: RenderContext = {
    mode,
    theme: chartTheme.tokens,
    componentId: component.id,
    className,
    style,
    onChange,
    hideTitle: isChart || isSwitchedTable,
  };

  // 7. 渲染
  const rendered = handler!.renderer.render(pipelineResult!.model.data!, renderContext);

  // 8. 图表头部：标题（所有模式）+ 切换按钮（chat/edit 模式）
  const chartSource = component.type === 'chart'
    ? (component as ChartComponent)
    : originalChartSchema;
  const chartModel = component.type === 'chart'
    ? (pipelineResult!.model.data as ChartSemanticModel)
    : null;
  const title = chartSource?.dataProperties?.title;
  const switchToolbar = canSwitchChart && chartSource
    ? buildSwitchToolbar(chartSource, chartModel, onChartTypeChange, onChange, chartTheme.tokens, component.type)
    : null;

  const chartHeader = (isChart || isSwitchedTable) && (title || switchToolbar)
    ? (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
        {title ? (
          <span style={{
            fontSize: chartTheme.tokens.font.titleSize,
            fontWeight: 600,
            color: chartTheme.tokens.font.color,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: 12,
          }}>
            {title}
          </span>
        ) : <span />}
        {switchToolbar}
      </div>
    )
    : null;

  // 9. 图表类型组件始终用统一容器，保证不同模式下高度一致
  const isChartLike = component.type === 'chart' || component.type === 'table';
  const content = isChartLike
    ? (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        {chartHeader}
        <div style={{ flex: 1, minHeight: 0 }}>
          {rendered}
        </div>
      </div>
    )
    : rendered;

  // 10. 编辑模式包装（原 DesignableWrapper）
  if (mode === RenderMode.EDIT) {
    return (
      <DesignableWrapper
        componentId={component.id}
        className={className}
        style={style}
        onClick={onSelect}
      >
        {content}
      </DesignableWrapper>
    );
  }

  return <>{content}</>;
}

// ---------------------------------------------------------------------------
// Switch toolbar builder
// ---------------------------------------------------------------------------

function buildSwitchToolbar(
  chartSchema: ChartComponent,
  chartModel: ChartSemanticModel | null,
  onChartTypeChange: ((newSchema: BIEngineComponent) => void) | undefined,
  onChange: ((newSchema: BIEngineComponent) => void) | undefined,
  theme: import('../theme/theme-tokens').ThemeTokens,
  currentViewType: string,
): React.ReactNode {
  if (!onChartTypeChange && !onChange) return null;

  // 从 chart schema 推导 seriesKind
  const series = chartSchema.dataProperties.series ?? [];
  let seriesKind: string;
  if (currentViewType === 'table') {
    const first = series[0];
    seriesKind = first?.type ?? 'bar';
  } else if (chartModel) {
    seriesKind = chartModel.seriesKind;
  } else {
    const first = series[0];
    seriesKind = first?.type ?? 'bar';
  }

  const displayKind = deriveDisplayKind(seriesKind as 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'candlestick' | 'gauge' | 'combo', series);
  const switchable = getSwitchableTypes(seriesKind as 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'candlestick' | 'gauge' | 'combo', series);

  if (switchable.length === 0) return null;

  const currentType = currentViewType === 'table' ? 'table' : (displayKind === 'area' ? 'area' : seriesKind);

  const handleSwitch = (target: SwitchTarget) => {
    const newSchema = convertSchema(chartSchema, target.type);
    onChartTypeChange?.(newSchema);
    onChange?.(newSchema);
  };

  return (
    <ChartSwitchToolbar
      currentType={currentType}
      switchableTypes={switchable}
      onSwitch={handleSwitch}
      theme={theme}
    />
  );
}

// ---------------------------------------------------------------------------
// ErrorFallback
// ---------------------------------------------------------------------------

function ErrorFallback({ code, message, theme }: { code: string; message: string; theme: import('../theme/theme-tokens').ThemeTokens }) {
  return (
    <div style={{ padding: 16, border: `1px solid ${theme.semantic.error}`, borderRadius: theme.border.radius }}>
      <div style={{ fontWeight: 'bold', color: theme.semantic.error }}>{code}</div>
      <div style={{ marginTop: 4, color: theme.font.secondaryColor }}>{message}</div>
    </div>
  );
}
