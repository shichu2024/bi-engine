import type { ChartSemanticModel } from '../../core/chart-semantic-model';
import type { EChartsOption } from './build-line-option';
import { buildLineOption, buildBarOption } from './build-line-option';
import { buildPieOption } from './build-pie-option';
import { mergeChartOption } from './merge-chart-option';

// 重新导出所有公共类型和函数，以便消费者可以从单一入口点导入。
export { buildLineOption, buildBarOption } from './build-line-option';
export type { EChartsOption } from './build-line-option';
export { buildPieOption } from './build-pie-option';
export { mergeChartOption } from './merge-chart-option';

// ---------------------------------------------------------------------------
// 统一适配器入口
// ---------------------------------------------------------------------------

/**
 * 从 `ChartSemanticModel` 构建完整的 ECharts 选项。
 *
 * 这是消费者应该使用的单一入口点。它：
 * 1. 根据 `model.seriesKind` 路由到正确的构建器。
 * 2. 通过受控合并应用用户提供的 `ChartOption`。
 *
 * 支持的 `seriesKind` 值（第一阶段）：
 * - `'line'` -- 委托给 `buildLineOption`（折线图和面积图）
 * - `'bar'`  -- 委托给 `buildBarOption`（柱状图和条形图）
 * - `'pie'`  -- 委托给 `buildPieOption`（饼图和环形图）
 *
 * @param model - 完全解析的语义模型。
 * @returns 可供 ECharts 运行时使用的 `EChartsOption`。
 */
export function buildEChartsOption(
  model: ChartSemanticModel,
): EChartsOption {
  const baseOption = buildBaseOption(model);
  return mergeChartOption(baseOption, model.chartOption);
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
    default:
      // 防御性降级 -- 校验后不应出现此情况。
      return buildBarOption(model);
  }
}
