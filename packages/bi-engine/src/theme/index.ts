// ---------------------------------------------------------------------------
// theme 桶导出
// ---------------------------------------------------------------------------

export {
  DEFAULT_PALETTE,
  MIN_PALETTE_SIZE,
  isValidPalette,
  resolvePaletteColor,
} from './palette';

export type {
  ThemeTokens,
  BackgroundTokens,
  FontTokens,
  SpacingTokens,
  BorderTokens,
  SemanticTokens,
  TableTokens,
} from './theme-tokens';
export {
  DEFAULT_BACKGROUND_TOKENS,
  DEFAULT_FONT_TOKENS,
  DEFAULT_SPACING_TOKENS,
  DEFAULT_BORDER_TOKENS,
  DEFAULT_SEMANTIC_TOKENS,
  DEFAULT_TABLE_TOKENS,
  DEFAULT_THEME_TOKENS,
  DARK_BACKGROUND_TOKENS,
  DARK_FONT_TOKENS,
  DARK_BORDER_TOKENS,
  DARK_SEMANTIC_TOKENS,
  DARK_TABLE_TOKENS,
  DARK_THEME_TOKENS,
} from './theme-tokens';

// ---- 格式化器 ----
export { formatValue, createFormatter, ValueFormatType } from './value-formatter';

// ---- 主题上下文（React）----
export { ChartThemeProvider, useChartTheme } from './chart-theme-context';
export type { ChartThemeProviderProps, ChartThemeContextValue } from './chart-theme-context';
