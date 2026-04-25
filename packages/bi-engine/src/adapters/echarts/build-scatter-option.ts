// ============================================================================
// build-scatter-option.ts — 散点图 ECharts 选项构建器
// ============================================================================

import type { ScatterSeries, Series } from '../../schema/bi-engine-models';
import type { ChartSemanticModel, SemanticAxis } from '../../core/chart-semantic-model';
import type { EChartsOption } from './build-line-option';

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

/**
 * 类型守卫：将 `Series` 收窄为 `ScatterSeries`。
 */
function isScatterSeries(series: Series): series is ScatterSeries {
  return series.type === 'scatter';
}

/**
 * 从数据集中提取散点数据，映射为 ECharts 所需的 [[x, y], ...] 格式。
 */
function extractScatterData(
  model: ChartSemanticModel,
  encode: { x: string; y: string },
): number[][] {
  const result: number[][] = [];

  for (let i = 0; i < model.dataset.length; i++) {
    const row = model.dataset[i];
    result.push([
      Number(row[encode.x]),
      Number(row[encode.y]),
    ]);
  }

  return result;
}

/**
 * 构建 x 轴配置（散点图为数值轴）。
 */
function buildScatterXAxes(
  axes: SemanticAxis[],
): Record<string, unknown>[] {
  const xAxes = axes.filter((a) => a.direction === 'x');

  if (xAxes.length === 0) {
    return [{ type: 'value' }];
  }

  const result: Record<string, unknown>[] = [];

  for (let i = 0; i < xAxes.length; i++) {
    const axis = xAxes[i];
    const entry: Record<string, unknown> = {
      type: 'value',
    };

    if (axis.name !== undefined) {
      entry.name = axis.name;
    }

    result.push(entry);
  }

  return result;
}

/**
 * 构建 y 轴配置（散点图为数值轴）。
 */
function buildScatterYAxes(
  axes: SemanticAxis[],
): Record<string, unknown>[] {
  const yAxes = axes.filter((a) => a.direction === 'y');

  if (yAxes.length === 0) {
    return [{ type: 'value' }];
  }

  const result: Record<string, unknown>[] = [];

  for (let i = 0; i < yAxes.length; i++) {
    const axis = yAxes[i];
    const entry: Record<string, unknown> = {
      type: 'value',
    };

    if (axis.name !== undefined) {
      entry.name = axis.name;
    }

    result.push(entry);
  }

  return result;
}

// ---------------------------------------------------------------------------
// buildScatterOption
// ---------------------------------------------------------------------------

/**
 * 从 `ChartSemanticModel` 构建散点图的 ECharts 选项对象。
 *
 * 职责：
 * - 将散点系列条目映射为 ECharts 系列定义。
 * - 数据格式为 [[x1, y1], [x2, y2], ...]。
 * - 双轴均为数值轴（type: 'value'）。
 * - 为提示框和图例提供合理的默认值。
 *
 * @param model - 完全解析的语义模型。
 * @returns 可供 ECharts 运行时使用的 `EChartsOption`。
 */
export function buildScatterOption(model: ChartSemanticModel): EChartsOption {
  const seriesNames: string[] = [];
  const echartsSeries: Record<string, unknown>[] = [];

  for (let i = 0; i < model.series.length; i++) {
    const s = model.series[i];

    if (!isScatterSeries(s)) {
      continue;
    }

    seriesNames.push(s.name);

    const seriesEntry: Record<string, unknown> = {
      type: 'scatter',
      name: s.name,
      data: extractScatterData(model, s.encode),
      xAxisIndex: s.encode.xAxisIndex ?? 0,
      yAxisIndex: s.encode.yAxisIndex ?? 0,
    };

    echartsSeries.push(seriesEntry);
  }

  const option: EChartsOption = {
    tooltip: { trigger: 'item' },
    legend: {
      show: seriesNames.length > 1,
      data: seriesNames,
    },
    xAxis: buildScatterXAxes(model.axes),
    yAxis: buildScatterYAxes(model.axes),
    series: echartsSeries,
  };

  return option;
}
