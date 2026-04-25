// ============================================================================
// option-templates/index.ts — 标准化 Option 模板 barrel export
// ============================================================================

// 基础配置
export { getBaseOption, getCartesianAxisDefaults, FONT_FAMILY, FONT_SIZE, TEXT_COLOR, COLOR_PALETTE, SPACING, SHADOW, BORDER } from './base-option';

// 图表类型模板
export { getLineOptionTemplate } from './line-option-template';
export { getBarOptionTemplate } from './bar-option-template';
export { getPieOptionTemplate, getRingOptionTemplate } from './pie-option-template';
export { getRadarOptionTemplate } from './radar-option-template';
export { getScatterOptionTemplate } from './scatter-option-template';
export { getCandlestickOptionTemplate } from './candlestick-option-template';
export { getGaugeOptionTemplate } from './gauge-option-template';

// 异常兜底
export { getEmptyDataOption, isDatasetEmpty } from './empty-data-option';
