import { describe, it, expect } from 'vitest';
import { buildPieOption } from '../../src/adapters/echarts/build-pie-option';
import type { ChartSemanticModel } from '../../src/core/chart-semantic-model';
import type { PieSeries, BarSeries } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 共享测试数据
// ---------------------------------------------------------------------------

function makePieModel(overrides: Partial<ChartSemanticModel> = {}): ChartSemanticModel {
  return {
    componentId: 'test-pie-chart',
    seriesKind: 'pie',
    title: undefined,
    axes: [],
    series: [
      {
        type: 'pie',
        name: 'Sales Distribution',
        encode: { name: 'month', value: 'sales' },
      } as PieSeries,
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
// buildPieOption 测试
// ---------------------------------------------------------------------------

describe('buildPieOption', () => {
  it('生成包含预期顶层键的有效 ECharts 选项', () => {
    const model = makePieModel();
    const option = buildPieOption(model);

    expect(option).toHaveProperty('series');
    expect(option).toHaveProperty('tooltip');
    expect(option).toHaveProperty('legend');
  });

  it('不包含 xAxis 或 yAxis', () => {
    const model = makePieModel();
    const option = buildPieOption(model);

    expect(option.xAxis).toBeUndefined();
    expect(option.yAxis).toBeUndefined();
  });

  it('将饼图系列数据映射为名称/值对', () => {
    const model = makePieModel();
    const option = buildPieOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('pie');
    expect(series[0].name).toBe('Sales Distribution');
    expect(series[0].data).toEqual([
      { name: 'Jan', value: 100 },
      { name: 'Feb', value: 200 },
      { name: 'Mar', value: 150 },
    ]);
  });

  it('将提示框触发方式设置为 item', () => {
    const model = makePieModel();
    const option = buildPieOption(model);

    const tooltip = option.tooltip as Record<string, unknown>;
    expect(tooltip.trigger).toBe('item');
  });

  it('从数据分类名称构建图例', () => {
    const model = makePieModel();
    const option = buildPieOption(model);

    const legend = option.legend as Record<string, unknown>;
    expect(legend.data).toEqual(['Jan', 'Feb', 'Mar']);
  });

  it('有多个数据点时显示图例', () => {
    const model = makePieModel();
    const option = buildPieOption(model);

    const legend = option.legend as Record<string, unknown>;
    expect(legend.show).toBe(true);
  });

  it('只有一个数据点时隐藏图例', () => {
    const model = makePieModel({
      dataset: [{ month: 'Jan', sales: 100 }],
    });

    const option = buildPieOption(model);

    const legend = option.legend as Record<string, unknown>;
    expect(legend.show).toBe(false);
  });

  it('title 由外部 ComponentHeader 渲染，option 不包含 title', () => {
    const model = makePieModel({ title: 'Sales by Month' });
    const option = buildPieOption(model);

    expect(option.title).toBeUndefined();
  });

  it('为 ring subType 设置 radius', () => {
    const model = makePieModel({
      series: [
        { type: 'pie', name: 'Ring', subType: 'ring', encode: { name: 'month', value: 'sales' } } as PieSeries,
      ],
    });

    const option = buildPieOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series[0].radius).toEqual(['50%', '75%']);
  });

  it('没有 subType 时不设置 radius', () => {
    const model = makePieModel();
    const option = buildPieOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series[0].radius).toBeUndefined();
  });

  it('跳过系列数组中的非饼图系列', () => {
    const model = makePieModel({
      series: [
        { type: 'pie', name: 'Distribution', encode: { name: 'month', value: 'sales' } } as PieSeries,
        { type: 'bar', name: 'Sales', encode: { x: 'month', y: 'sales' } } as BarSeries,
      ],
    });

    const option = buildPieOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('pie');
  });

  it('优雅处理空数据集', () => {
    const model = makePieModel({ dataset: [] });
    const option = buildPieOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].data).toEqual([]);

    const legend = option.legend as Record<string, unknown>;
    expect(legend.data).toEqual([]);
  });

  it('所有饼图系列都设置 center 为 [40%, 50%]', () => {
    const model = makePieModel();
    const option = buildPieOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series[0].center).toEqual(['40%', '50%']);
  });

  it('环形图带 centerText/subCenterText 时生成 series.label 中心文本', () => {
    const model = makePieModel({
      series: [
        {
          type: 'pie',
          name: 'Ring',
          subType: 'ring',
          centerText: 'Total',
          subCenterText: '$100K',
          encode: { name: 'month', value: 'sales' },
        } as PieSeries,
      ],
    });

    const option = buildPieOption(model);

    // 不再使用 graphic
    expect(option.graphic).toBeUndefined();

    const series = option.series as Array<Record<string, unknown>>;
    const label = series[0].label as Record<string, unknown>;
    expect(label).toBeDefined();
    expect(label.show).toBe(true);
    expect(label.position).toBe('center');

    // formatter 包含主/副文本
    expect(label.formatter).toContain('{title|Total}');
    expect(label.formatter).toContain('{value|$100K}');

    // rich 样式
    const rich = label.rich as Record<string, Record<string, unknown>>;
    expect(rich.title.fontSize).toBe(20);
    expect(rich.title.fontWeight).toBe(700);
    expect(rich.value).toBeDefined();

    // 数据切片 label 控制：第一个显示，其余隐藏
    const data = series[0].data as Array<Record<string, unknown>>;
    expect((data[0].label as Record<string, unknown>).show).toBe(true);
    expect((data[1].label as Record<string, unknown>).show).toBe(false);
  });

  it('环形图无 centerText 时不注入中心 label', () => {
    const model = makePieModel({
      series: [
        { type: 'pie', name: 'Ring', subType: 'ring', encode: { name: 'month', value: 'sales' } } as PieSeries,
      ],
    });

    const option = buildPieOption(model);
    expect(option.graphic).toBeUndefined();

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].label).toBeUndefined();
  });
});
