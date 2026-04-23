import { createContext, useContext, useMemo } from 'react';
import type { ThemeTokens } from './theme-tokens';
import { DEFAULT_THEME_TOKENS } from './theme-tokens';
import { DEFAULT_PALETTE } from './palette';

// ---------------------------------------------------------------------------
// 上下文值类型
// ---------------------------------------------------------------------------

/**
 * 图表主题上下文值的形状。
 *
 * 暴露令牌集（字体、间距、背景、边框）和调色板。
 * 消费者应使用调色板为系列着色，使用令牌进行结构样式设置。
 */
export interface ChartThemeContextValue {
  /** 已解析的主题令牌 */
  readonly tokens: ThemeTokens;
  /** 已解析的调色板（至少 8 种颜色） */
  readonly palette: readonly string[];
}

// ---------------------------------------------------------------------------
// 上下文
// ---------------------------------------------------------------------------

const ChartThemeContext = createContext<ChartThemeContextValue>({
  tokens: DEFAULT_THEME_TOKENS,
  palette: DEFAULT_PALETTE,
});

ChartThemeContext.displayName = 'ChartThemeContext';

// ---------------------------------------------------------------------------
// Provider 属性
// ---------------------------------------------------------------------------

/**
 * {@link ChartThemeProvider} 组件接受的属性。
 */
export interface ChartThemeProviderProps {
  /**
   * 可选的主题令牌覆盖。提供时，值在每个令牌类别层级
   * 与默认值浅合并。
   */
  readonly tokens?: Partial<ThemeTokens>;
  /**
   * 可选的调色板覆盖。必须包含至少 8 种颜色。
   * 省略时使用默认调色板。
   */
  readonly palette?: readonly string[];
  /** 要渲染的 React 子元素 */
  readonly children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Provider 组件
// ---------------------------------------------------------------------------

/**
 * 为后代图表组件提供主题上下文。
 *
 * 使用此 Provider 包裹图表树以自定义视觉令牌和调色板：
 *
 * ```tsx
 * import { ChartThemeProvider } from 'bi-engine/react';
 *
 * <ChartThemeProvider palette={['#a', '#b', '#c', '#d', '#e', '#f', '#g', '#h']}>
 *   <ChartView component={myChart} />
 * </ChartThemeProvider>
 * ```
 *
 * Provider 合并部分令牌覆盖，因此您可以只自定义关心的类别：
 *
 * ```tsx
 * <ChartThemeProvider tokens={{ font: { family: 'Inter', size: 14 } }}>
 *   ...
 * </ChartThemeProvider>
 * ```
 */
export function ChartThemeProvider({
  tokens: tokensOverride,
  palette: paletteOverride,
  children,
}: ChartThemeProviderProps): React.ReactElement {
  const value = useMemo<ChartThemeContextValue>(() => {
    const tokens: ThemeTokens = {
      background: {
        ...DEFAULT_THEME_TOKENS.background,
        ...tokensOverride?.background,
      },
      font: {
        ...DEFAULT_THEME_TOKENS.font,
        ...tokensOverride?.font,
      },
      spacing: {
        ...DEFAULT_THEME_TOKENS.spacing,
        ...tokensOverride?.spacing,
      },
      border: {
        ...DEFAULT_THEME_TOKENS.border,
        ...tokensOverride?.border,
      },
    };

    const palette = paletteOverride ?? DEFAULT_PALETTE;

    return { tokens, palette };
  }, [tokensOverride, paletteOverride]);

  return (
    <ChartThemeContext.Provider value={value}>
      {children}
    </ChartThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// 钩子
// ---------------------------------------------------------------------------

/**
 * 返回当前的图表主题上下文值。
 *
 * 必须在 {@link ChartThemeProvider} 内部调用。当没有 Provider 时，
 * 钩子返回默认主题。
 *
 * @returns 已解析的 {@link ChartThemeContextValue}。
 */
export function useChartTheme(): ChartThemeContextValue {
  return useContext(ChartThemeContext);
}
