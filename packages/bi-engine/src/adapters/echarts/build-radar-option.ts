// ============================================================================
// build-radar-option.ts — 雷达图 ECharts 选项构建器
// ============================================================================

import type { RadarSeries, Series } from '../../schema/bi-engine-models';
import type { ChartSemanticModel } from '../../core/chart-semantic-model';
import type { EChartsOption } from './build-line-option';

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

/**
 * 类型守卫：将 `Series` 收窄为 `RadarSeries`。
 */
function isRadarSeries(series: Series): series is RadarSeries {
  return series.type === 'radar';
}

/**
 * 从列元数据推导雷达指示器。
 *
 * 首期实现：使用列名作为维度名，max 默认为 100。
 * 如果 chartOption.eChartOption.radar.indicator 存在，则优先使用。
 */
function buildRadarIndicator(
  model: ChartSemanticModel,
): Array<{ name: string; max: number }> {
  // 优先使用 chartOption 中显式配置的 indicator
  const explicitIndicator = (model.chartOption?.eChartOption as Record<string, unknown> | undefined)
    ?.radar as Record<string, unknown> | undefined;

  if (explicitIndicator !== undefined && Array.isArray(explicitIndicator.indicator)) {
    return explicitIndicator.indicator as Array<{ name: string; max: number }>;
  }

  // 从列元数据推导：跳过 encode.name 对应的列
  const nameField = model.series.length > 0
    ? (model.series.find(isRadarSeries)?.encode.name ?? '')
    : '';

  const result: Array<{ name: string; max: number }> = [];

  for (let i = 0; i < model.columns.length; i++) {
    const col = model.columns[i];
    if (col.key !== nameField) {
      result.push({ name: col.title ?? col.key, max: 100 });
    }
  }

  return result;
}

/**
 * 从数据集中提取雷达系列数据。
 *
 * 数据格式为 [{ value: [v1, v2, ...], name: seriesName }]。
 * 每个系列取数据集中所有行的值维度，组合为值数组。
 */
function extractRadarSeriesData(
  model: ChartSemanticModel,
  encode: { name: string; value: string },
): Array<{ value: number[]; name: string }> {
  const result: Array<{ value: number[]; name: string }> = [];

  for (let i = 0; i < model.dataset.length; i++) {
    const row = model.dataset[i];
    const rawValue = row[encode.value];
    const values = Array.isArray(rawValue)
      ? rawValue.map((v) => Number(v))
      : [Number(rawValue)];

    result.push({
      value: values,
      name: String(row[encode.name] ?? ''),
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// buildRadarOption
// ---------------------------------------------------------------------------

/**
 * 从 `ChartSemanticModel` 构建雷达图的 ECharts 选项对象。
 *
 * 职责：
 * - 将雷达系列条目映射为 ECharts 系列定义。
 * - 构建雷达指示器（radar indicator）配置。
 * - 数据格式为 [{ value: [v1, v2, ...], name }]。
 * - 雷达图不使用 xAxis / yAxis。
 *
 * @param model - 完全解析的语义模型。
 * @returns 可供 ECharts 运行时使用的 `EChartsOption`。
 */
export function buildRadarOption(model: ChartSemanticModel): EChartsOption {
  const seriesNames: string[] = [];
  const echartsSeries: Record<string, unknown>[] = [];

  for (let i = 0; i < model.series.length; i++) {
    const s = model.series[i];

    if (!isRadarSeries(s)) {
      continue;
    }

    seriesNames.push(s.name);

    const seriesEntry: Record<string, unknown> = {
      type: 'radar',
      name: s.name,
      data: extractRadarSeriesData(model, s.encode),
    };

    echartsSeries.push(seriesEntry);
  }

  const indicator = buildRadarIndicator(model);

  const option: EChartsOption = {
    tooltip: { trigger: 'item' },
    legend: {
      show: seriesNames.length > 1,
      data: seriesNames,
    },
    radar: {
      indicator,
    },
    series: echartsSeries,
  };

  return option;
}
