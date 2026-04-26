import type { ThemeTokens } from '../../theme/theme-tokens';
import type { ChartSemanticModel } from '../../core/chart-semantic-model';
import type { EChartsOption } from './build-line-option';
import { buildLineOption, buildBarOption } from './build-line-option';
import { buildPieOption } from './build-pie-option';
import { buildScatterOption } from './build-scatter-option';
import { buildRadarOption } from './build-radar-option';
import { buildCandlestickOption } from './build-candlestick-option';
import { buildGaugeOption } from './build-gauge-option';
import { mergeChartOption } from './merge-chart-option';
import { deepMergeOption } from './option-merge';
import type { MergeMode } from './option-merge';
import {
  getLineOptionTemplate,
  getBarOptionTemplate,
  getPieOptionTemplate,
  getScatterOptionTemplate,
  getRadarOptionTemplate,
  getCandlestickOptionTemplate,
  getGaugeOptionTemplate,
  getEmptyDataOption,
  isDatasetEmpty,
} from './option-templates';

// 重新导出所有公共类型和函数，以便消费者可以从单一入口点导入。
export { buildLineOption, buildBarOption } from './build-line-option';
export type { EChartsOption } from './build-line-option';
export { buildPieOption } from './build-pie-option';
export { buildScatterOption } from './build-scatter-option';
export { buildRadarOption } from './build-radar-option';
export { buildCandlestickOption } from './build-candlestick-option';
export { buildGaugeOption } from './build-gauge-option';
export { mergeChartOption } from './merge-chart-option';
export { deepMergeOption } from './option-merge';
export type { MergeMode } from './option-merge';
export {
  getBaseOption,
  getCartesianAxisDefaults,
  FONT_FAMILY,
  FONT_SIZE,
  TEXT_COLOR,
  COLOR_PALETTE,
  SPACING,
  SHADOW,
  BORDER,
  getLineOptionTemplate,
  getBarOptionTemplate,
  getPieOptionTemplate,
  getRingOptionTemplate,
  getRadarOptionTemplate,
  getScatterOptionTemplate,
  getCandlestickOptionTemplate,
  getGaugeOptionTemplate,
  getEmptyDataOption,
  isDatasetEmpty,
} from './option-templates';

// ---------------------------------------------------------------------------
// 统一适配器入口
// ---------------------------------------------------------------------------

/**
 * 从 `ChartSemanticModel` 构建完整的 ECharts 选项。
 *
 * 这是消费者应该使用的单一入口点。它：
 * 1. 检查空数据场景，返回兜底配置。
 * 2. 根据 `model.seriesKind` 获取标准化模板（视觉规范）。
 * 3. 路由到对应的数据构建器（数据结构）。
 * 4. 深度合并：模板 + 数据构建器 + 用户自定义配置。
 *
 * 合并优先级：用户 chartOption > 数据构建器 > 标准化模板
 *
 * 支持的 `seriesKind` 值：
 * - `'line'`        -- 折线图和面积图
 * - `'bar'`         -- 柱状图和条形图
 * - `'pie'`         -- 饼图和环形图
 * - `'scatter'`     -- 散点图
 * - `'radar'`       -- 雷达图
 * - `'candlestick'` -- 蜡烛图/K 线图
 * - `'gauge'`       -- 仪表盘
 *
 * @param model - 完全解析的语义模型。
 * @returns 可供 ECharts 运行时使用的 `EChartsOption`。
 */
export function buildEChartsOption(
  model: ChartSemanticModel,
  theme?: ThemeTokens,
): EChartsOption {
  // 空数据兜底
  if (isDatasetEmpty(model.dataset)) {
    return getEmptyDataOption(400, 300, theme);
  }

  // 获取标准化模板
  const template = getTemplate(model, theme);

  // 获取数据驱动的构建结果
  const dataOption = buildBaseOption(model);

  // 注入图表标题（来自语义模型）
  if (model.title !== undefined && model.title !== '') {
    (dataOption as Record<string, unknown>).title = { show: true, text: model.title };
  }

  // 深度合并：模板 + 数据构建器
  const mergedBase = deepMergeOption(template, dataOption, 'merge');

  // 应用用户自定义配置
  return mergeChartOption(mergedBase, model.chartOption);
}

/**
 * 根据图表类型获取对应的标准化模板。
 *
 * 饼图/环形图共用同一个模板（视觉规范一致），
 * 环形图特有的 center 文本和 radius 由 builder 层负责。
 */
function getTemplate(model: ChartSemanticModel, theme?: ThemeTokens): EChartsOption {
  const kind = model.seriesKind;

  switch (kind) {
    case 'line':
      return getLineOptionTemplate(theme);
    case 'bar':
      return getBarOptionTemplate(theme);
    case 'pie':
      return getPieOptionTemplate(theme);
    case 'scatter':
      return getScatterOptionTemplate(theme);
    case 'radar':
      return getRadarOptionTemplate(theme);
    case 'candlestick':
      return getCandlestickOptionTemplate(theme);
    case 'gauge':
      return getGaugeOptionTemplate(theme);
    default:
      return getBarOptionTemplate(theme);
  }
}

/**
 * 内部路由器，委托给相应的构建器。
 */
function buildBaseOption(model: ChartSemanticModel): EChartsOption {
  switch (model.seriesKind) {
    case 'line':
      return buildLineOption(model);
    case 'bar':
      return buildBarOption(model);
    case 'pie':
      return buildPieOption(model);
    case 'scatter':
      return buildScatterOption(model);
    case 'radar':
      return buildRadarOption(model);
    case 'candlestick':
      return buildCandlestickOption(model);
    case 'gauge':
      return buildGaugeOption(model);
    default:
      return buildBarOption(model);
  }
}
