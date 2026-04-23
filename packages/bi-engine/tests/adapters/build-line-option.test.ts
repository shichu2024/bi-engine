import { describe, it, expect } from 'vitest';
import { buildLineOption } from '../../src/adapters/echarts/build-line-option';
import type { EChartsOption } from '../../src/adapters/echarts/build-line-option';
import type { ChartSemanticModel } from '../../src/core/chart-semantic-model';
import type { LineSeries, BarSeries } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 共享测试数据
// ---------------------------------------------------------------------------

function makeLineModel(overrides: Partial<ChartSemanticModel> = {}): ChartSemanticModel {
  return {
    componentId: 'test-line-chart',
    seriesKind: 'line',
    title: undefined,
    axes: [
      { index: 0, direction: 'x', type: 'category', name: 'Month' },
      { index: 0, direction: 'y', type: 'value', name: 'Sales' },
    ],
    series: [
      {
        type: 'line',
        name: 'Sales',
        encode: { x: 'month', y: 'sales' },
      } as LineSeries,
    ],
    dataset: [
      { month: 'Jan', sales: 100 },
      { month: 'Feb', sales: 200 },
      { month: 'Mar', sales: 150 },
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
// buildLineOption 测试
// ---------------------------------------------------------------------------

describe('buildLineOption', () => {
  it('生成包含预期顶层键的有效 ECharts 选项', () => {
    const model = makeLineModel();
    const option = buildLineOption(model);

    expect(option).toHaveProperty('series');
    expect(option).toHaveProperty('xAxis');
    expect(option).toHaveProperty('yAxis');
    expect(option).toHaveProperty('tooltip');
    expect(option).toHaveProperty('legend');
  });

  it('正确映射折线系列数据', () => {
    const model = makeLineModel();
    const option = buildLineOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('line');
    expect(series[0].name).toBe('Sales');
    expect(series[0].data).toEqual([100, 200, 150]);
  });

  it('将 xAxis 设置为分类轴并从数据集中填充数据', () => {
    const model = makeLineModel();
    const option = buildLineOption(model);

    const xAxis = option.xAxis as Array<Record<string, unknown>>;
    expect(xAxis).toHaveLength(1);
    expect(xAxis[0].type).toBe('category');
    expect(xAxis[0].data).toEqual(['Jan', 'Feb', 'Mar']);
    expect(xAxis[0].name).toBe('Month');
  });

  it('将 yAxis 设置为数值轴并使用坐标轴名称', () => {
    const model = makeLineModel();
    const option = buildLineOption(model);

    const yAxis = option.yAxis as Array<Record<string, unknown>>;
    expect(yAxis).toHaveLength(1);
    expect(yAxis[0].type).toBe('value');
    expect(yAxis[0].name).toBe('Sales');
  });

  it('将提示框触发方式设置为 axis', () => {
    const model = makeLineModel();
    const option = buildLineOption(model);

    const tooltip = option.tooltip as Record<string, unknown>;
    expect(tooltip.trigger).toBe('axis');
  });

  it('只有单个系列时隐藏图例', () => {
    const model = makeLineModel();
    const option = buildLineOption(model);

    const legend = option.legend as Record<string, unknown>;
    expect(legend.show).toBe(false);
  });

  it('有多个系列时显示图例', () => {
    const model = makeLineModel({
      series: [
        { type: 'line', name: 'Sales', encode: { x: 'month', y: 'sales' } } as LineSeries,
        { type: 'line', name: 'Profit', encode: { x: 'month', y: 'profit' } } as LineSeries,
      ],
    });

    const option = buildLineOption(model);

    const legend = option.legend as Record<string, unknown>;
    expect(legend.show).toBe(true);
    expect(legend.data).toEqual(['Sales', 'Profit']);
  });

  it('提供标题时包含标题', () => {
    const model = makeLineModel({ title: 'Monthly Sales' });
    const option = buildLineOption(model);

    expect(option.title).toEqual({ text: 'Monthly Sales' });
  });

  it('标题为 undefined 时省略标题', () => {
    const model = makeLineModel({ title: undefined });
    const option = buildLineOption(model);

    expect(option.title).toBeUndefined();
  });

  it('为 area subType 添加 areaStyle', () => {
    const model = makeLineModel({
      series: [
        { type: 'line', name: 'Area Sales', subType: 'area', encode: { x: 'month', y: 'sales' } } as LineSeries,
      ],
    });

    const option = buildLineOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series[0].areaStyle).toEqual({});
  });

  it('没有 subType 时不添加 areaStyle', () => {
    const model = makeLineModel();
    const option = buildLineOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series[0].areaStyle).toBeUndefined();
  });

  it('跳过系列数组中的非折线系列', () => {
    const model = makeLineModel({
      series: [
        { type: 'line', name: 'Sales', encode: { x: 'month', y: 'sales' } } as LineSeries,
        { type: 'bar', name: 'Profit', encode: { x: 'month', y: 'profit' } } as BarSeries,
      ],
    });

    const option = buildLineOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('line');
  });

  it('未提供坐标轴时默认 xAxis 为分类轴', () => {
    const model = makeLineModel({ axes: [] });
    const option = buildLineOption(model);

    const xAxis = option.xAxis as Array<Record<string, unknown>>;
    expect(xAxis).toHaveLength(1);
    expect(xAxis[0].type).toBe('category');
    expect(xAxis[0].data).toEqual(['Jan', 'Feb', 'Mar']);
  });

  it('未提供坐标轴时默认 yAxis 为数值轴', () => {
    const model = makeLineModel({ axes: [] });
    const option = buildLineOption(model);

    const yAxis = option.yAxis as Array<Record<string, unknown>>;
    expect(yAxis).toHaveLength(1);
    expect(yAxis[0].type).toBe('value');
  });

  it('遵守 encode 中的 xAxisIndex 和 yAxisIndex', () => {
    const model = makeLineModel({
      series: [
        { type: 'line', name: 'Sales', encode: { x: 'month', y: 'sales', xAxisIndex: 1, yAxisIndex: 2 } } as LineSeries,
      ],
    });

    const option = buildLineOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series[0].xAxisIndex).toBe(1);
    expect(series[0].yAxisIndex).toBe(2);
  });

  it('优雅处理空数据集', () => {
    const model = makeLineModel({ dataset: [] });
    const option = buildLineOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].data).toEqual([]);

    const xAxis = option.xAxis as Array<Record<string, unknown>>;
    expect(xAxis[0].data).toEqual([]);
  });
});
