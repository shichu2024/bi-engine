import type { ChartOption } from '../../schema/bi-engine-models';
import type { EChartsOption } from './build-line-option';

// ---------------------------------------------------------------------------
// 核心字段保护
// ---------------------------------------------------------------------------

/**
 * 被视为适配器输出"核心"的键，不能被 `ChartOption.eChartOption` 覆盖。
 *
 * 这可以防止用户提供的覆盖项静默破坏图表结构，
 * 同时仍允许对非核心字段进行外观自定义。
 */
const CORE_OPTION_KEYS: ReadonlySet<string> = new Set([
  'series',
  'xAxis',
  'yAxis',
  'dataset',
]);

// ---------------------------------------------------------------------------
// mergeChartOption
// ---------------------------------------------------------------------------

/**
 * 将用户提供的 `ChartOption` 合并到适配器生成的基础选项中。
 *
 * 合并规则：
 * 1. `eChartOption` 字段浅合并到基础选项中。
 * 2. 核心字段（`series`、`xAxis`、`yAxis`、`dataset`）受保护，
 *    不能被 `eChartOption` 覆盖。如果 `eChartOption` 包含核心键，
 *    该键将被静默跳过。
 * 3. 当 `chartOption` 为 `undefined` 或 `eChartOption` 不存在时，
 *    返回未修改的基础选项。
 *
 * 这确保了适配器对图表结构的权威性，
 * 同时仍允许消费者自定义外观属性（如 `color`、`grid`、`textStyle`）。
 *
 * @param base - 由某个适配器构建器生成的 ECharts 选项。
 * @param chartOption - 可选的用户提供的图表覆盖配置。
 * @returns 应用了受控合并的新 `EChartsOption`。
 */
export function mergeChartOption(
  base: EChartsOption,
  chartOption?: ChartOption,
): EChartsOption {
  if (chartOption === undefined) {
    return base;
  }

  const eChartOption = chartOption.eChartOption;

  if (eChartOption === undefined) {
    return base;
  }

  const merged: EChartsOption = { ...base };

  const keys = Object.keys(eChartOption);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    // 保护核心字段不被覆盖。
    if (CORE_OPTION_KEYS.has(key)) {
      continue;
    }

    merged[key] = eChartOption[key];
  }

  return merged;
}
