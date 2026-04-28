// ============================================================================
// react/BIEngine.tsx — BI Engine 统一公共入口组件
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import type { BIEngineComponent, ChartComponent } from '../schema/bi-engine-models';
import { ComponentView } from './ComponentView';
import { RenderModeProvider } from '../platform/render-mode';
import { RenderMode } from '../platform/types';
import { ChartThemeProvider } from '../theme/chart-theme-context';
import { DEFAULT_THEME_TOKENS, DARK_THEME_TOKENS } from '../theme/theme-tokens';
import type { ComponentError } from '../platform/types';
import { ComponentRegistry } from '../platform/component-registry';
import { chartHandler } from '../component-handlers/chart';
import { textHandler } from '../component-handlers/text';
import { tableHandler } from '../component-handlers/table';
import { createUnsupportedHandler } from '../component-handlers/unsupported-handler';
import type { LocaleInput } from '../locale/types';
import { LocaleProvider, resolveLocale } from '../locale';
import { SelectionProvider } from '../design/selection-context';

// ---------------------------------------------------------------------------
// 懒注册
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

/** 渲染模式类型 */
export type BIMode = 'chat' | 'edit' | 'view';

/** 主题类型 */
export type BITheme = 'dark' | 'light';

export interface BIEngineProps {
  /** BI 标准 DSL，描述待渲染的组件 */
  schema: BIEngineComponent;
  /**
   * 渲染模式：
   * - 'chat': 智能对话 — 图表可切换，文本只读
   * - 'edit': 编辑 — 图表可切换，文本可编辑
   * - 'view': 只读查看 — 图表不可切换，文本只读
   * @default 'view'
   */
  mode?: BIMode;
  /**
   * 主题：'dark' 或 'light'
   * @default 'light'
   */
  theme?: BITheme;
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
  /** 统一变更回调：图表切换、文本编辑等均通过此回调通知 */
  onChange?: (newSchema: BIEngineComponent) => void;
  /** 国际化：传入语言标识或自定义词条对象，默认 zh-CN */
  locale?: LocaleInput;
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
  mode = 'view',
  theme = 'light',
  className,
  style,
  onError,
  onSelect,
  onChartTypeChange,
  onChange,
  locale,
}: BIEngineProps): React.ReactElement {
  ensureHandlersRegistered();

  const renderMode = mode === 'chat' ? RenderMode.CHAT : mode === 'edit' ? RenderMode.EDIT : RenderMode.VIEW;
  const themeTokens = theme === 'dark' ? DARK_THEME_TOKENS : DEFAULT_THEME_TOKENS;

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
      onChange?.(newSchema);
    },
    [onChartTypeChange, onChange],
  );

  // 统一 onChange：透传给 ComponentView，使 renderer（如文本编辑）也能上报变更
  const handleChange = useCallback(
    (newSchema: BIEngineComponent) => {
      if (!onChartTypeChange) {
        setInternalSchema(newSchema);
      }
      onChange?.(newSchema);
    },
    [onChartTypeChange, onChange],
  );

  // 追踪最近的 chart schema：切换到 table 后仍保留，以便 toolbar 可以切回
  const chartSchemaRef = useRef<ChartComponent | undefined>(
    schema.type === 'chart' ? schema as ChartComponent : undefined,
  );
  if (activeSchema.type === 'chart') {
    chartSchemaRef.current = activeSchema as ChartComponent;
  }

  const resolvedLocale = resolveLocale(locale);

  const inner = (
    <ComponentView
      component={activeSchema}
      className={className}
      style={style}
      onError={handleError}
      onSelect={onSelect}
      onChartTypeChange={handleChartTypeChange}
      onChange={handleChange}
      originalChartSchema={chartSchemaRef.current}
    />
  );

  return (
    <LocaleProvider locale={resolvedLocale}>
      <RenderModeProvider mode={renderMode}>
        <SelectionProvider>
          <ChartThemeProvider tokens={themeTokens}>
            {inner}
          </ChartThemeProvider>
        </SelectionProvider>
      </RenderModeProvider>
    </LocaleProvider>
  );
}
