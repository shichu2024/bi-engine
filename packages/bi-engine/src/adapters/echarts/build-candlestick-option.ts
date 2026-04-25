// ============================================================================
// build-candlestick-option.ts — 蜡烛图 ECharts 选项构建器
// ============================================================================

import type { CandlestickSeries, Series } from '../../schema/bi-engine-models';
import type { ChartSemanticModel, SemanticAxis } from '../../core/chart-semantic-model';
import type { EChartsOption } from './build-line-option';

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

/**
 * 类型守卫：将 `Series` 收窄为 `CandlestickSeries`。
 */
function isCandlestickSeries(series: Series): series is CandlestickSeries {
  return series.type === 'candlestick';
}

/**
 * 从数据集中提取类目数据（x 轴标签）。
 */
function extractCategoryData(
  model: ChartSemanticModel,
  encode: { open: string; close: string; low: string; high: string },
): string[] {
  // 查找 x 轴对应的字段：优先使用数据的第一个非 encode 字段
  const encodeFields = new Set([encode.open, encode.close, encode.low, encode.high]);
  const xField = model.columns.find((col) => !encodeFields.has(col.key))?.key;

  if (xField === undefined) {
    return [];
  }

  const result: string[] = [];
  for (let i = 0; i < model.dataset.length; i++) {
    result.push(String(model.dataset[i][xField] ?? ''));
  }

  return result;
}

/**
 * 从数据集中提取蜡烛图数据，重排为 ECharts 所需的 [open, close, low, high] 元组。
 */
function extractCandlestickData(
  model: ChartSemanticModel,
  encode: { open: string; close: string; low: string; high: string },
): number[][] {
  const result: number[][] = [];

  for (let i = 0; i < model.dataset.length; i++) {
    const row = model.dataset[i];
    result.push([
      Number(row[encode.open]),
      Number(row[encode.close]),
      Number(row[encode.low]),
      Number(row[encode.high]),
    ]);
  }

  return result;
}

/**
 * 构建 x 轴配置（蜡烛图 x 轴为类目轴）。
 */
function buildCandlestickXAxes(
  axes: SemanticAxis[],
  categoryData: string[],
): Record<string, unknown>[] {
  const xAxes = axes.filter((a) => a.direction === 'x');

  if (xAxes.length === 0) {
    return [{ type: 'category', data: categoryData }];
  }

  const result: Record<string, unknown>[] = [];

  for (let i = 0; i < xAxes.length; i++) {
    const axis = xAxes[i];
    const entry: Record<string, unknown> = {
      type: 'category',
    };

    if (axis.name !== undefined) {
      entry.name = axis.name;
    }

    // 类目数据放在第一个 x 轴上
    if (i === 0) {
      entry.data = categoryData;
    }

    result.push(entry);
  }

  return result;
}

/**
 * 构建 y 轴配置。
 */
function buildCandlestickYAxes(
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
      type: axis.type,
    };

    if (axis.name !== undefined) {
      entry.name = axis.name;
    }

    result.push(entry);
  }

  return result;
}

// ---------------------------------------------------------------------------
// buildCandlestickOption
// ---------------------------------------------------------------------------

/**
 * 从 `ChartSemanticModel` 构建蜡烛图（K 线图）的 ECharts 选项对象。
 *
 * 职责：
 * - 将蜡烛图系列条目映射为 ECharts 系列定义。
 * - 数据从扁平 { open, close, low, high } 重排为 [open, close, low, high] 元组。
 * - x 轴为类目轴（通常为时间周期）。
 * - 为提示框和图例提供合理的默认值。
 *
 * @param model - 完全解析的语义模型。
 * @returns 可供 ECharts 运行时使用的 `EChartsOption`。
 */
export function buildCandlestickOption(model: ChartSemanticModel): EChartsOption {
  const seriesNames: string[] = [];
  const echartsSeries: Record<string, unknown>[] = [];
  let firstEncode: { open: string; close: string; low: string; high: string } | undefined;

  for (let i = 0; i < model.series.length; i++) {
    const s = model.series[i];

    if (!isCandlestickSeries(s)) {
      continue;
    }

    seriesNames.push(s.name);

    if (firstEncode === undefined) {
      firstEncode = s.encode;
    }

    const seriesEntry: Record<string, unknown> = {
      type: 'candlestick',
      name: s.name,
      data: extractCandlestickData(model, s.encode),
    };

    echartsSeries.push(seriesEntry);
  }

  const encode = firstEncode ?? { open: '', close: '', low: '', high: '' };
  const categoryData = extractCategoryData(model, encode);

  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      show: seriesNames.length > 1,
      data: seriesNames,
    },
    xAxis: buildCandlestickXAxes(model.axes, categoryData),
    yAxis: buildCandlestickYAxes(model.axes),
    series: echartsSeries,
  };

  return option;
}
