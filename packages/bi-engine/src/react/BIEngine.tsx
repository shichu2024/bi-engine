// ============================================================================
// react/BIEngine.tsx — BI Engine 统一公共入口组件
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import type { BIEngineComponent, ChartComponent } from '../schema/bi-engine-models';
import type { ThemeTokens } from '../theme/theme-tokens';
import { ComponentView } from './ComponentView';
import { RenderModeProvider, RenderMode } from '../platform/render-mode';
import { ChartThemeProvider } from '../theme/chart-theme-context';
import type { ComponentError } from '../platform/types';
import { ComponentRegistry } from '../platform/component-registry';
import { chartHandler } from '../component-handlers/chart';
import { textHandler } from '../component-handlers/text';
import { tableHandler } from '../component-handlers/table';
import { createUnsupportedHandler } from '../component-handlers/unsupported-handler';

// ---------------------------------------------------------------------------
// 懒注册：首次渲染前确保 handler 已注册，避免消费方忘记调用
// registerBuiltinHandlers 或模块实例不一致导致注册丢失。
// ---------------------------------------------------------------------------

let lazyRegistered = false;

function ensureHandlersRegistered(): void {
  if (lazyRegistered) return;
  const registry = ComponentRegistry.getInstance();
  if (registry.has('chart')) return;
  registry.registerOrReplace('chart', chartHandler);
  registry.registerOrReplace('text', textHandler);
  registry.registerOrReplace('table', tableHandler);
  registry.registerOrReplace('markdown', createUnsupportedHandler('markdown'));
  lazyRegistered = true;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BIEngineProps {
  /** BI 标准 DSL，描述待渲染的组件 */
  schema: BIEngineComponent;
  /** 渲染模式：'runtime'（默认）或 'design' */
  mode?: 'runtime' | 'design';
  /** 主题覆盖：传入 Partial<ThemeTokens> 覆盖默认主题 */
  theme?: Partial<ThemeTokens>;
  /** 自定义 CSS 类名 */
  className?: string;
  /** 自定义内联样式 */
  style?: React.CSSProperties;
  /** 错误回调 */
  onError?: (error: { code: string; message: string }) => void;
  /** 设计态选中回调 */
  onSelect?: (componentId: string) => void;
  /** 图表类型切换回调（受控模式）；不传则内部自动切换（非受控模式） */
  onChartTypeChange?: (newSchema: BIEngineComponent) => void;
}

// ---------------------------------------------------------------------------
// BIEngine
// ---------------------------------------------------------------------------

/**
 * BI Engine 统一公共入口组件。
 *
 * 面向外部消费者的唯一推荐入口。
 * 封装 RenderMode 和 ChartThemeProvider，隐藏内部 pipeline 细节。
 */
export function BIEngine({
  schema,
  mode = 'runtime',
  theme,
  className,
  style,
  onError,
  onSelect,
  onChartTypeChange,
}: BIEngineProps): React.ReactElement {
  ensureHandlersRegistered();

  const renderMode = mode === 'design' ? RenderMode.DESIGN : RenderMode.RUNTIME;

  // 非受控模式：内部维护 schema 状态
  const [internalSchema, setInternalSchema] = useState<BIEngineComponent>(schema);

  // 外部 schema 变化时同步内部状态（非受控模式）
  useEffect(() => {
    if (!onChartTypeChange) {
      setInternalSchema(schema);
    }
  }, [schema, onChartTypeChange]);

  const activeSchema = onChartTypeChange ? schema : internalSchema;

  const handleError = onError !== undefined
    ? (error: ComponentError) => {
        onError({ code: error.code, message: error.message });
      }
    : undefined;

  const handleChartTypeChange = useCallback(
    (newSchema: BIEngineComponent) => {
      if (onChartTypeChange) {
        onChartTypeChange(newSchema);
      } else {
        setInternalSchema(newSchema);
      }
    },
    [onChartTypeChange],
  );

  // 追踪最近的 chart schema：切换到 table 后仍保留，以便 toolbar 可以切回
  const chartSchemaRef = useRef<ChartComponent | undefined>(
    schema.type === 'chart' ? schema as ChartComponent : undefined,
  );
  if (activeSchema.type === 'chart') {
    chartSchemaRef.current = activeSchema as ChartComponent;
  }

  const inner = (
    <ComponentView
      component={activeSchema}
      className={className}
      style={style}
      onError={handleError}
      onSelect={onSelect}
      onChartTypeChange={handleChartTypeChange}
      originalChartSchema={chartSchemaRef.current}
    />
  );

  return (
    <RenderModeProvider mode={renderMode}>
      {theme !== undefined ? (
        <ChartThemeProvider tokens={theme}>
          {inner}
        </ChartThemeProvider>
      ) : (
        inner
      )}
    </RenderModeProvider>
  );
}
