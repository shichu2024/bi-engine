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
  /** 语义色（错误/警告/成功/信息） */
  readonly semantic: SemanticTokens;
  /** 表格组件专用令牌 */
  readonly table: TableTokens;
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
  /** 第三级文本颜色（更弱的弱化文字） */
  readonly tertiaryColor: string;
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
  /** 网格线颜色 */
  readonly gridColor: string;
  /** 选中态颜色 */
  readonly selectedColor: string;
  /** 分割线颜色（表格等） */
  readonly dividerColor: string;
}

export interface SemanticTokens {
  /** 错误色 */
  readonly error: string;
  /** 警告色 */
  readonly warning: string;
  /** 成功色 */
  readonly success: string;
  /** 信息/主色 */
  readonly info: string;
}

export interface TableTokens {
  /** 表头背景色 */
  readonly headerBg: string;
  /** 表头边框色 */
  readonly headerBorder: string;
  /** 单元格边框色 */
  readonly cellBorder: string;
  /** 行悬停背景色 */
  readonly rowHoverBg: string;
  /** 斑马纹行背景色 */
  readonly rowStripeBg: string;
  /** 选中行/项背景色 */
  readonly selectedBg: string;
  /** 弹窗遮罩色 */
  readonly modalMask: string;
  /** 弹窗背景色 */
  readonly modalBg: string;
  /** 输入框边框色 */
  readonly inputBorder: string;
  /** 输入框背景色 */
  readonly inputBg: string;
  /** 按钮背景色 */
  readonly buttonBg: string;
  /** 按钮文字色 */
  readonly buttonColor: string;
  /** 按钮边框色 */
  readonly buttonBorder: string;
  /** 主按钮背景色 */
  readonly primaryButtonBg: string;
  /** 主按钮文字色 */
  readonly primaryButtonColor: string;
}

// ---------------------------------------------------------------------------
// 默认令牌值（浅色）
// ---------------------------------------------------------------------------

export const DEFAULT_BACKGROUND_TOKENS: BackgroundTokens = {
  chart: '#FFFFFF',
  tooltip: 'rgba(255, 255, 255, 0.96)',
  legend: 'transparent',
} as const;

export const DEFAULT_FONT_TOKENS: FontTokens = {
  family:
    "'Helvetica Neue', 'Arial', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  size: 12,
  titleSize: 16,
  axisLabelSize: 11,
  color: '#333333',
  secondaryColor: '#999999',
  tertiaryColor: '#BBBBBB',
} as const;

export const DEFAULT_SPACING_TOKENS: SpacingTokens = {
  padding: 16,
  legendGap: 12,
  tooltipPaddingH: 12,
  tooltipPaddingV: 8,
} as const;

export const DEFAULT_BORDER_TOKENS: BorderTokens = {
  radius: 4,
  axisLineColor: '#CCCCCC',
  splitLineColor: '#EEEEEE',
  tooltipBorderColor: '#E8E8E8',
  gridColor: '#F0F0F0',
  selectedColor: '#1890FF',
  dividerColor: '#E8E8E8',
} as const;

export const DEFAULT_SEMANTIC_TOKENS: SemanticTokens = {
  error: '#FF4D4F',
  warning: '#FAAD14',
  success: '#52C41A',
  info: '#1890FF',
} as const;

export const DEFAULT_TABLE_TOKENS: TableTokens = {
  headerBg: '#FAFAFA',
  headerBorder: '#E8E8E8',
  cellBorder: '#F0F0F0',
  rowHoverBg: '#E6F7FF',
  rowStripeBg: '#FAFAFA',
  selectedBg: '#BAE7FF',
  modalMask: 'rgba(0, 0, 0, 0.45)',
  modalBg: '#FFFFFF',
  inputBorder: '#D9D9D9',
  inputBg: '#FFFFFF',
  buttonBg: '#FFFFFF',
  buttonColor: '#333333',
  buttonBorder: '#D9D9D9',
  primaryButtonBg: '#1890FF',
  primaryButtonColor: '#FFFFFF',
} as const;

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  background: DEFAULT_BACKGROUND_TOKENS,
  font: DEFAULT_FONT_TOKENS,
  spacing: DEFAULT_SPACING_TOKENS,
  border: DEFAULT_BORDER_TOKENS,
  semantic: DEFAULT_SEMANTIC_TOKENS,
  table: DEFAULT_TABLE_TOKENS,
} as const;

// ---------------------------------------------------------------------------
// 暗色令牌值
// ---------------------------------------------------------------------------

export const DARK_BACKGROUND_TOKENS: BackgroundTokens = {
  chart: '#1A1A2E',
  tooltip: 'rgba(30, 30, 50, 0.9)',
  legend: 'transparent',
} as const;

export const DARK_FONT_TOKENS: FontTokens = {
  family:
    "'Helvetica Neue', 'Arial', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  size: 12,
  titleSize: 16,
  axisLabelSize: 11,
  color: '#E0E0E0',
  secondaryColor: '#B0B0B0',
  tertiaryColor: '#666666',
} as const;

export const DARK_BORDER_TOKENS: BorderTokens = {
  radius: 4,
  axisLineColor: '#555555',
  splitLineColor: '#333333',
  tooltipBorderColor: '#555555',
  gridColor: '#303030',
  selectedColor: '#177DDC',
  dividerColor: '#3A3A3A',
} as const;

export const DARK_SEMANTIC_TOKENS: SemanticTokens = {
  error: '#FF7875',
  warning: '#FFC53D',
  success: '#73D13D',
  info: '#177DDC',
} as const;

export const DARK_TABLE_TOKENS: TableTokens = {
  headerBg: '#1F1F1F',
  headerBorder: '#3A3A3A',
  cellBorder: '#303030',
  rowHoverBg: '#111B26',
  rowStripeBg: '#1A1A1A',
  selectedBg: '#111D2E',
  modalMask: 'rgba(0, 0, 0, 0.65)',
  modalBg: '#1F1F1F',
  inputBorder: '#434343',
  inputBg: '#141414',
  buttonBg: '#1F1F1F',
  buttonColor: '#D9D9D9',
  buttonBorder: '#434343',
  primaryButtonBg: '#177DDC',
  primaryButtonColor: '#FFFFFF',
} as const;

export const DARK_THEME_TOKENS: ThemeTokens = {
  background: DARK_BACKGROUND_TOKENS,
  font: DARK_FONT_TOKENS,
  spacing: DEFAULT_SPACING_TOKENS,
  border: DARK_BORDER_TOKENS,
  semantic: DARK_SEMANTIC_TOKENS,
  table: DARK_TABLE_TOKENS,
} as const;
