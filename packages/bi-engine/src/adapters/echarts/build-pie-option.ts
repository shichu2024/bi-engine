import type { PieSeries, Series } from '../../schema/bi-engine-models';
import type { ChartSemanticModel } from '../../core/chart-semantic-model';
import type { EChartsOption } from './build-line-option';

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

/**
 * 类型守卫：将 `Series` 收窄为 `PieSeries`。
 */
function isPieSeries(series: Series): series is PieSeries {
  return series.type === 'pie';
}

/**
 * 使用系列的 encode 映射从数据集中提取饼图数据点。
 *
 * 每个数据点变为 ECharts 饼图系列期望的 `{ name, value }` 格式。
 */
function extractPieData(
  model: ChartSemanticModel,
  encode: { name: string; value: string },
): Array<Record<string, unknown>> {
  const result: Array<Record<string, unknown>> = [];

  for (let i = 0; i < model.dataset.length; i++) {
    const row = model.dataset[i];
    result.push({
      name: row[encode.name],
      value: row[encode.value],
    });
  }

  return result;
}

/**
 * 构建饼图的默认提示框配置。
 */
function buildPieTooltip(): Record<string, unknown> {
  return {
    trigger: 'item',
  };
}

/**
 * 构建饼图的默认图例配置。
 *
 * 饼图图例显示数据中的类目名称，而非系列名称。
 * 当只有一个数据切片时，隐藏图例。
 */
function buildPieLegend(
  data: Array<Record<string, unknown>>,
): Record<string, unknown> {
  const names: unknown[] = [];

  for (let i = 0; i < data.length; i++) {
    names.push(data[i].name);
  }

  return {
    show: names.length > 1,
    data: names,
  };
}

// ---------------------------------------------------------------------------
// buildPieOption
// ---------------------------------------------------------------------------

/**
 * 从 `ChartSemanticModel` 构建饼图/环形图的 ECharts 选项对象。
 *
 * 职责：
 * - 将饼图系列条目映射为 ECharts 系列定义。
 * - 当 `subType === 'ring'` 时设置 `radius`。
 * - 为提示框和图例提供合理的默认值。
 * - 饼图没有 xAxis / yAxis。
 *
 * 适配器不执行业务校验；该工作由上游校验器处理。
 *
 * @param model - 完全解析的语义模型。
 * @returns 可供 ECharts 运行时使用的 `EChartsOption`。
 */
export function buildPieOption(model: ChartSemanticModel): EChartsOption {
  const echartsSeries: Record<string, unknown>[] = [];
  let firstPieData: Array<Record<string, unknown>> = [];

  for (let i = 0; i < model.series.length; i++) {
    const s = model.series[i];

    if (!isPieSeries(s)) {
      continue;
    }

    const pieData = extractPieData(model, s.encode);

    if (i === 0) {
      firstPieData = pieData;
    }

    const seriesEntry: Record<string, unknown> = {
      type: 'pie',
      name: s.name,
      data: pieData,
    };

    if (s.subType === 'ring') {
      seriesEntry.radius = ['40%', '70%'];
    }

    echartsSeries.push(seriesEntry);
  }

  const option: EChartsOption = {
    tooltip: buildPieTooltip(),
    legend: buildPieLegend(firstPieData),
    series: echartsSeries,
  };

  return option;
}
