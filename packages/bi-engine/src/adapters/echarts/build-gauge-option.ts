// ============================================================================
// build-gauge-option.ts — 仪表盘 ECharts 选项构建器
// ============================================================================

import type { GaugeSeries, Series } from '../../schema/bi-engine-models';
import type { ChartSemanticModel } from '../../core/chart-semantic-model';
import type { EChartsOption } from './build-line-option';

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

/**
 * 类型守卫：将 `Series` 收窄为 `GaugeSeries`。
 */
function isGaugeSeries(series: Series): series is GaugeSeries {
  return series.type === 'gauge';
}

/**
 * 从数据集中提取仪表盘数据。
 *
 * 取数据集中最后一行的 value 作为仪表盘指针值。
 */
function extractGaugeData(
  model: ChartSemanticModel,
  encode: { value: string },
): Array<{ value: number; name: string }> {
  if (model.dataset.length === 0) {
    return [];
  }

  // 仪表盘通常只显示单个数值，取最后一行
  const lastRow = model.dataset[model.dataset.length - 1];
  const value = Number(lastRow[encode.value]);

  return [{ value, name: '' }];
}

// ---------------------------------------------------------------------------
// buildGaugeOption
// ---------------------------------------------------------------------------

/**
 * 从 `ChartSemanticModel` 构建仪表盘的 ECharts 选项对象。
 *
 * 职责：
 * - 将仪表盘系列条目映射为 ECharts 系列定义。
 * - 映射 GaugeSeries.config（min/max/unit）到 ECharts gauge 选项。
 * - 仪表盘不使用 xAxis / yAxis / radar。
 *
 * @param model - 完全解析的语义模型。
 * @returns 可供 ECharts 运行时使用的 `EChartsOption`。
 */
export function buildGaugeOption(model: ChartSemanticModel): EChartsOption {
  const echartsSeries: Record<string, unknown>[] = [];

  for (let i = 0; i < model.series.length; i++) {
    const s = model.series[i];

    if (!isGaugeSeries(s)) {
      continue;
    }

    const config = s.config;
    const gaugeData = extractGaugeData(model, s.encode);

    const seriesEntry: Record<string, unknown> = {
      type: 'gauge',
      name: s.name,
      min: config?.min ?? 0,
      max: config?.max ?? 100,
      data: gaugeData,
    };

    // 如果配置了单位，添加到轴标签格式化器
    if (config?.unit !== undefined) {
      seriesEntry.axisLabel = {
        formatter: `{value}${config.unit}`,
      };
      seriesEntry.detail = {
        formatter: `{value}${config.unit}`,
      };
    }

    echartsSeries.push(seriesEntry);
  }

  const option: EChartsOption = {
    tooltip: { trigger: 'item' },
    series: echartsSeries,
  };

  return option;
}
