import { describe, it, expect } from 'vitest';
import { buildBarOption } from '../../src/adapters/echarts/build-line-option';
import type { ChartSemanticModel } from '../../src/core/chart-semantic-model';
import type { BarSeries, LineSeries } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 共享测试数据
// ---------------------------------------------------------------------------

function makeBarModel(overrides: Partial<ChartSemanticModel> = {}): ChartSemanticModel {
  return {
    componentId: 'test-bar-chart',
    seriesKind: 'bar',
    title: undefined,
    axes: [
      { index: 0, direction: 'x', type: 'category', name: 'Month' },
      { index: 0, direction: 'y', type: 'value', name: 'Profit' },
    ],
    series: [
      {
        type: 'bar',
        name: 'Profit',
        encode: { x: 'month', y: 'profit' },
      } as BarSeries,
    ],
    dataset: [
      { month: 'Jan', profit: 40 },
      { month: 'Feb', profit: 80 },
      { month: 'Mar', profit: 60 },
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
// buildBarOption 测试
// ---------------------------------------------------------------------------

describe('buildBarOption', () => {
  it('生成包含预期顶层键的有效 ECharts 选项', () => {
    const model = makeBarModel();
    const option = buildBarOption(model);

    expect(option).toHaveProperty('series');
    expect(option).toHaveProperty('xAxis');
    expect(option).toHaveProperty('yAxis');
    expect(option).toHaveProperty('tooltip');
    expect(option).toHaveProperty('legend');
  });

  it('正确映射柱状系列数据', () => {
    const model = makeBarModel();
    const option = buildBarOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('bar');
    expect(series[0].name).toBe('Profit');
    expect(series[0].data).toEqual([40, 80, 60]);
  });

  it('将 xAxis 设置为分类轴并从数据集中填充数据', () => {
    const model = makeBarModel();
    const option = buildBarOption(model);

    const xAxis = option.xAxis as Array<Record<string, unknown>>;
    expect(xAxis).toHaveLength(1);
    expect(xAxis[0].type).toBe('category');
    expect(xAxis[0].data).toEqual(['Jan', 'Feb', 'Mar']);
  });

  it('将 yAxis 设置为数值轴', () => {
    const model = makeBarModel();
    const option = buildBarOption(model);

    const yAxis = option.yAxis as Array<Record<string, unknown>>;
    expect(yAxis).toHaveLength(1);
    expect(yAxis[0].type).toBe('value');
  });

  it('为水平柱状图交换坐标轴角色', () => {
    const model = makeBarModel({
      series: [
        { type: 'bar', name: 'Profit', subType: 'horizontal', encode: { x: 'month', y: 'profit' } } as BarSeries,
      ],
    });

    const option = buildBarOption(model);

    const xAxis = option.xAxis as Array<Record<string, unknown>>;
    const yAxis = option.yAxis as Array<Record<string, unknown>>;

    // 对于水平柱状图，xAxis 应为数值类型
    expect(xAxis[0].type).toBe('value');
    // yAxis 应携带分类数据
    expect(yAxis[0].data).toEqual(['Jan', 'Feb', 'Mar']);
  });

  it('提供标题时包含标题', () => {
    const model = makeBarModel({ title: 'Quarterly Profit' });
    const option = buildBarOption(model);

    expect(option.title).toEqual({ text: 'Quarterly Profit' });
  });

  it('跳过系列数组中的非柱状系列', () => {
    const model = makeBarModel({
      series: [
        { type: 'bar', name: 'Profit', encode: { x: 'month', y: 'profit' } } as BarSeries,
        { type: 'line', name: 'Sales', encode: { x: 'month', y: 'sales' } } as LineSeries,
      ],
    });

    const option = buildBarOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('bar');
  });

  it('遵守 encode 中的 xAxisIndex 和 yAxisIndex', () => {
    const model = makeBarModel({
      series: [
        { type: 'bar', name: 'Profit', encode: { x: 'month', y: 'profit', xAxisIndex: 0, yAxisIndex: 1 } } as BarSeries,
      ],
    });

    const option = buildBarOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series[0].xAxisIndex).toBe(0);
    expect(series[0].yAxisIndex).toBe(1);
  });

  it('优雅处理空数据集', () => {
    const model = makeBarModel({ dataset: [] });
    const option = buildBarOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].data).toEqual([]);
  });
});
