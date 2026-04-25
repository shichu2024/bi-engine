import { describe, it, expect } from 'vitest';
import { buildScatterOption } from '../../src/adapters/echarts/build-scatter-option';
import type { ChartSemanticModel } from '../../src/core/chart-semantic-model';
import type { ScatterSeries } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 共享测试数据
// ---------------------------------------------------------------------------

function makeScatterModel(overrides: Partial<ChartSemanticModel> = {}): ChartSemanticModel {
  return {
    componentId: 'test-scatter-chart',
    seriesKind: 'scatter',
    title: undefined,
    axes: [
      { index: 0, direction: 'x', type: 'value', name: 'Ad Spend' },
      { index: 0, direction: 'y', type: 'value', name: 'Sales' },
    ],
    series: [
      {
        type: 'scatter',
        name: 'SalesData',
        encode: { x: 'adSpend', y: 'sales' },
      } as ScatterSeries,
    ],
    dataset: [
      { adSpend: 10, sales: 28 },
      { adSpend: 20, sales: 42 },
      { adSpend: 30, sales: 58 },
    ],
    columns: [],
    tooltip: { enabled: true },
    formatters: [],
    theme: undefined,
    chartOption: undefined,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildScatterOption 测试
// ---------------------------------------------------------------------------

describe('buildScatterOption', () => {
  it('生成包含预期顶层键的有效 ECharts 选项', () => {
    const model = makeScatterModel();
    const option = buildScatterOption(model);

    expect(option).toHaveProperty('series');
    expect(option).toHaveProperty('xAxis');
    expect(option).toHaveProperty('yAxis');
    expect(option).toHaveProperty('tooltip');
    expect(option).toHaveProperty('legend');
  });

  it('将散点系列数据映射为 [[x, y], ...] 格式', () => {
    const model = makeScatterModel();
    const option = buildScatterOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('scatter');
    expect(series[0].name).toBe('SalesData');
    expect(series[0].data).toEqual([[10, 28], [20, 42], [30, 58]]);
  });

  it('将 xAxis 设置为数值轴', () => {
    const model = makeScatterModel();
    const option = buildScatterOption(model);

    const xAxis = option.xAxis as Array<Record<string, unknown>>;
    expect(xAxis).toHaveLength(1);
    expect(xAxis[0].type).toBe('value');
  });

  it('将 yAxis 设置为数值轴', () => {
    const model = makeScatterModel();
    const option = buildScatterOption(model);

    const yAxis = option.yAxis as Array<Record<string, unknown>>;
    expect(yAxis).toHaveLength(1);
    expect(yAxis[0].type).toBe('value');
  });

  it('tooltip 触发方式为 item', () => {
    const model = makeScatterModel();
    const option = buildScatterOption(model);

    const tooltip = option.tooltip as Record<string, unknown>;
    expect(tooltip.trigger).toBe('item');
  });

  it('遵守 encode 中的 xAxisIndex 和 yAxisIndex', () => {
    const model = makeScatterModel({
      series: [
        {
          type: 'scatter',
          name: 'SalesData',
          encode: { x: 'adSpend', y: 'sales', xAxisIndex: 1, yAxisIndex: 2 },
        } as ScatterSeries,
      ],
    });
    const option = buildScatterOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].xAxisIndex).toBe(1);
    expect(series[0].yAxisIndex).toBe(2);
  });

  it('优雅处理空数据集', () => {
    const model = makeScatterModel({ dataset: [] });
    const option = buildScatterOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].data).toEqual([]);
  });

  it('跳过系列数组中的非散点系列', () => {
    const model = makeScatterModel({
      series: [
        { type: 'scatter', name: 'SalesData', encode: { x: 'adSpend', y: 'sales' } } as ScatterSeries,
        { type: 'line', name: 'Trend', encode: { x: 'adSpend', y: 'sales' } } as never,
      ],
    });
    const option = buildScatterOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('scatter');
  });
});
