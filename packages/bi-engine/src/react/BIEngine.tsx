// ============================================================================
// react/BIEngine.tsx — BI Engine 统一公共入口组件
// ============================================================================

import type { BIEngineComponent } from '../schema/bi-engine-models';
import type { ThemeTokens } from '../theme/theme-tokens';
import { ComponentView } from './ComponentView';
import { RenderModeProvider, RenderMode } from '../platform/render-mode';
import { ChartThemeProvider } from '../theme/chart-theme-context';
import type { ComponentError } from '../platform/types';

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
}: BIEngineProps): React.ReactElement {
  const renderMode = mode === 'design' ? RenderMode.DESIGN : RenderMode.RUNTIME;

  const handleError = onError !== undefined
    ? (error: ComponentError) => {
        onError({ code: error.code, message: error.message });
      }
    : undefined;

  const inner = (
    <ComponentView
      component={schema}
      className={className}
      style={style}
      onError={handleError}
      onSelect={onSelect}
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
