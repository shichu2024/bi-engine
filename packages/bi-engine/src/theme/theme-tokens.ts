// ---------------------------------------------------------------------------
// 主题令牌定义
// ---------------------------------------------------------------------------

/**
 * 控制图表视觉外观的主题令牌完整集合。
 *
 * 令牌按语义分组，以便消费者可以覆盖单个类别而无需替换整个主题。
 */
export interface ThemeTokens {
  /** 背景颜色 */
  readonly background: BackgroundTokens;
  /** 排版设置 */
  readonly font: FontTokens;
  /** 间距和尺寸值 */
  readonly spacing: SpacingTokens;
  /** 线条和边框样式 */
  readonly border: BorderTokens;
}

export interface BackgroundTokens {
  /** 主图表背景色 */
  readonly chart: string;
  /** 提示框背景色 */
  readonly tooltip: string;
  /** 图例背景色 */
  readonly legend: string;
}

export interface FontTokens {
  /** 基础字体族栈 */
  readonly family: string;
  /** 默认字体大小（像素） */
  readonly size: number;
  /** 标题字体大小（像素） */
  readonly titleSize: number;
  /** 坐标轴标签字体大小（像素） */
  readonly axisLabelSize: number;
  /** 主要文本颜色 */
  readonly color: string;
  /** 次要/弱化文本颜色（坐标轴标签、图例等） */
  readonly secondaryColor: string;
}

export interface SpacingTokens {
  /** 图表画布外围内边距（像素） */
  readonly padding: number;
  /** 图例与图表区域之间的间距（像素） */
  readonly legendGap: number;
  /** 提示框内容水平内边距（像素） */
  readonly tooltipPaddingH: number;
  /** 提示框内容垂直内边距（像素） */
  readonly tooltipPaddingV: number;
}

export interface BorderTokens {
  /** 默认边框圆角（像素） */
  readonly radius: number;
  /** 坐标轴线颜色 */
  readonly axisLineColor: string;
  /** 分隔线颜色（网格线） */
  readonly splitLineColor: string;
  /** 提示框边框颜色 */
  readonly tooltipBorderColor: string;
}

// ---------------------------------------------------------------------------
// 默认令牌值
// ---------------------------------------------------------------------------

/**
 * 默认背景令牌。
 */
export const DEFAULT_BACKGROUND_TOKENS: BackgroundTokens = {
  chart: '#FFFFFF',
  tooltip: 'rgba(50, 50, 50, 0.9)',
  legend: 'transparent',
} as const;

/**
 * 默认字体令牌。
 */
export const DEFAULT_FONT_TOKENS: FontTokens = {
  family:
    "'Helvetica Neue', 'Arial', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  size: 12,
  titleSize: 16,
  axisLabelSize: 11,
  color: '#333333',
  secondaryColor: '#999999',
} as const;

/**
 * 默认间距令牌。
 */
export const DEFAULT_SPACING_TOKENS: SpacingTokens = {
  padding: 16,
  legendGap: 12,
  tooltipPaddingH: 12,
  tooltipPaddingV: 8,
} as const;

/**
 * 默认边框令牌。
 */
export const DEFAULT_BORDER_TOKENS: BorderTokens = {
  radius: 4,
  axisLineColor: '#CCCCCC',
  splitLineColor: '#EEEEEE',
  tooltipBorderColor: '#333333',
} as const;

/**
 * 组合所有令牌类别的默认主题。
 */
export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  background: DEFAULT_BACKGROUND_TOKENS,
  font: DEFAULT_FONT_TOKENS,
  spacing: DEFAULT_SPACING_TOKENS,
  border: DEFAULT_BORDER_TOKENS,
} as const;
