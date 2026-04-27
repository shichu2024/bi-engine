/**
 * 集成测试：验证标准化 Option 构建流程端到端工作正常。
 */
import { describe, it, expect } from 'vitest';
import { buildEChartsOption } from '../index';
import { deepMergeOption } from '../option-merge';
import { getBaseOption } from '../option-templates';
import type { ChartSemanticModel } from '../../../core/chart-semantic-model';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createModel(overrides: Partial<ChartSemanticModel> = {}): ChartSemanticModel {
  return {
    componentId: 'test-chart',
    seriesKind: 'line',
    title: undefined,
    axes: [],
    series: [],
    dataset: [{ month: 'Jan', sales: 100 }, { month: 'Feb', sales: 200 }],
    columns: [],
    tooltip: { enabled: true },
    formatters: [],
    theme: undefined,
    chartOption: undefined,
    ...overrides,
  };
}

// ============================================================================
// Integration Tests
// ============================================================================

describe('buildEChartsOption integration', () => {
  it('returns empty data option when dataset is empty', () => {
    const model = createModel({ dataset: [] });
    const option = buildEChartsOption(model);
    const graphic = option.graphic as Record<string, unknown>;
    const style = graphic.style as Record<string, unknown>;
    expect(style.text).toBe('暂无数据');
  });

  it('includes standardized base config (color, textStyle, grid) for line chart', () => {
    const base = getBaseOption();
    const model = createModel({
      seriesKind: 'line',
      series: [{
        type: 'line' as const,
        name: 'Sales',
        encode: { x: 'month', y: 'sales' },
      }],
      axes: [
        { index: 0, direction: 'x' as const, type: 'category' as const, name: 'Month' },
        { index: 0, direction: 'y' as const, type: 'value' as const, name: 'Amount' },
      ],
    });

    const option = buildEChartsOption(model);

    // 验证标准化色板被保留
    expect(Array.isArray(option.color)).toBe(true);
    expect((option.color as string[]).length).toBeGreaterThanOrEqual(8);

    // 验证标准化 textStyle 被保留
    const textStyle = option.textStyle as Record<string, unknown>;
    expect(textStyle.fontFamily).toBeDefined();

    // 验证标准化 grid 被保留
    const grid = option.grid as Record<string, unknown>;
    expect(grid.containLabel).toBe(true);
  });

  it('includes tooltip styling from template', () => {
    const model = createModel({
      seriesKind: 'bar',
      series: [{
        type: 'bar' as const,
        name: 'Revenue',
        encode: { x: 'month', y: 'revenue' },
      }],
      axes: [
        { index: 0, direction: 'x' as const, type: 'category' as const },
        { index: 0, direction: 'y' as const, type: 'value' as const },
      ],
    });

    const option = buildEChartsOption(model);
    const tooltip = option.tooltip as Record<string, unknown>;

    // 来自标准化模板的 tooltip 样式
    expect(tooltip.backgroundColor).toBe('rgba(255, 255, 255, 0.96)');
    expect(tooltip.borderColor).toBe('#E8E8E8');
    // 来自 builder 的 tooltip trigger
    expect(tooltip.trigger).toBe('axis');
  });

  it('applies user chartOption via deep merge', () => {
    const model = createModel({
      seriesKind: 'line',
      series: [{
        type: 'line' as const,
        name: 'Sales',
        encode: { x: 'month', y: 'sales' },
      }],
      axes: [
        { index: 0, direction: 'x' as const, type: 'category' as const },
        { index: 0, direction: 'y' as const, type: 'value' as const },
      ],
      chartOption: {
        eChartOption: {
          grid: { left: 100 },
          animation: false,
        },
      },
    });

    const option = buildEChartsOption(model);
    const grid = option.grid as Record<string, unknown>;

    // 用户配置覆盖了模板默认值
    expect(grid.left).toBe(100);
    // 但其他 grid 属性保留
    expect(grid.containLabel).toBe(true);
    expect(option.animation).toBe(false);
  });

  it('protects core fields from user override', () => {
    const model = createModel({
      seriesKind: 'line',
      series: [{
        type: 'line' as const,
        name: 'Sales',
        encode: { x: 'month', y: 'sales' },
      }],
      axes: [
        { index: 0, direction: 'x' as const, type: 'category' as const },
        { index: 0, direction: 'y' as const, type: 'value' as const },
      ],
      chartOption: {
        eChartOption: {
          series: [{ type: 'bar', data: [999] }],
          xAxis: [{ type: 'value' }],
        },
      },
    });

    const option = buildEChartsOption(model);

    // 核心字段不受用户配置影响
    const series = option.series as Record<string, unknown>[];
    expect(series[0].type).toBe('line');
    expect(series[0].name).toBe('Sales');

    const xAxis = option.xAxis as Record<string, unknown>[];
    expect(xAxis[0].type).toBe('category');
  });

  it('works for all 7 chart types', () => {
    const types: Array<{ kind: ChartSemanticModel['seriesKind']; series: Record<string, unknown> }> = [
      { kind: 'line', series: { type: 'line', name: 'L', encode: { x: 'month', y: 'sales' } } },
      { kind: 'bar', series: { type: 'bar', name: 'B', encode: { x: 'month', y: 'sales' } } },
      { kind: 'pie', series: { type: 'pie', name: 'P', encode: { name: 'month', value: 'sales' } } },
      { kind: 'scatter', series: { type: 'scatter', name: 'S', encode: { x: 'sales', y: 'sales2' } } },
      { kind: 'radar', series: { type: 'radar', name: 'R', encode: { name: 'month', value: 'sales' } } },
      { kind: 'candlestick', series: { type: 'candlestick', name: 'C', encode: { open: 'sales', close: 'sales2', low: 'sales3', high: 'sales4' } } },
      { kind: 'gauge', series: { type: 'gauge', name: 'G', encode: { value: 'sales' } } },
    ];
    // Note: 'combo' tested separately in multi-series tests below

    const dataset = [
      { month: 'Jan', sales: 100, sales2: 200, sales3: 50, sales4: 300 },
    ];

    for (const { kind, series } of types) {
      const model = createModel({
        seriesKind: kind,
        series: [series as ChartSemanticModel['series'][number]],
        dataset,
        columns: [
          { title: 'Month', key: 'month', type: 'string' as const },
          { title: 'Sales', key: 'sales', type: 'double' as const },
        ],
      });

      const option = buildEChartsOption(model);

      // 所有图表类型都应返回有效 option
      expect(option).toBeDefined();
      expect(typeof option).toBe('object');

      // 所有图表类型都应包含标准化色板
      expect(Array.isArray(option.color)).toBe(true);
    }
  });

  it('ring chart shows center text from model centerText/subCenterText', () => {
    const model = createModel({
      seriesKind: 'pie',
      series: [{
        type: 'pie' as const,
        name: 'Distribution',
        subType: 'ring',
        centerText: 'Total',
        subCenterText: '$100K',
        encode: { name: 'month', value: 'sales' },
      }],
      dataset: [
        { month: 'Jan', sales: 100 },
        { month: 'Feb', sales: 200 },
      ],
      columns: [
        { title: 'Month', key: 'month', type: 'string' as const },
        { title: 'Sales', key: 'sales', type: 'double' as const },
      ],
    });

    const option = buildEChartsOption(model);

    // 不再使用 graphic 方案
    expect(option.graphic).toBeUndefined();

    // 使用 series.label + rich 富文本方案
    const series = option.series as Record<string, unknown>[];
    expect(series[0].radius).toEqual(['50%', '75%']);
    expect(series[0].center).toEqual(['40%', '50%']);

    const label = series[0].label as Record<string, unknown>;
    expect(label.show).toBe(true);
    expect(label.position).toBe('center');

    // formatter 包含主/副文本
    expect(label.formatter).toContain('{title|Total}');
    expect(label.formatter).toContain('{value|$100K}');

    // rich 样式定义
    const rich = label.rich as Record<string, Record<string, unknown>>;
    expect(rich.title).toBeDefined();
    expect(rich.title.fontSize).toBe(20);
    expect(rich.title.fontWeight).toBe(700);
    expect(rich.title.align).toBe('center');
    expect(rich.value).toBeDefined();
    expect(rich.value.align).toBe('center');

    // 数据切片 label 控制：第一个显示，其余隐藏
    const data = series[0].data as Array<Record<string, unknown>>;
    const firstItemLabel = data[0].label as Record<string, unknown>;
    expect(firstItemLabel.show).toBe(true);
    const secondItemLabel = data[1].label as Record<string, unknown>;
    expect(secondItemLabel.show).toBe(false);
  });

  it('ring chart without centerText has no center label', () => {
    const model = createModel({
      seriesKind: 'pie',
      series: [{
        type: 'pie' as const,
        name: 'Distribution',
        subType: 'ring',
        encode: { name: 'month', value: 'sales' },
      }],
      dataset: [{ month: 'Jan', sales: 100 }],
      columns: [
        { title: 'Month', key: 'month', type: 'string' as const },
      ],
    });

    const option = buildEChartsOption(model);
    expect(option.graphic).toBeUndefined();

    // 无 centerText 时，builder 不注入中心 label
    const series = option.series as Record<string, unknown>[];
    expect(series[0].label).toBeUndefined();
  });

  it('ring chart legend is on right with 10% distance', () => {
    const model = createModel({
      seriesKind: 'pie',
      series: [{
        type: 'pie' as const,
        name: 'Distribution',
        subType: 'ring',
        encode: { name: 'month', value: 'sales' },
      }],
      dataset: [{ month: 'Jan', sales: 100 }],
      columns: [
        { title: 'Month', key: 'month', type: 'string' as const },
      ],
    });

    const option = buildEChartsOption(model);
    const legend = option.legend as Record<string, unknown>;
    expect(legend.orient).toBe('vertical');
    expect(legend.right).toBe('10%');
  });
});

// ============================================================================
// deepMergeOption with real templates
// ============================================================================

describe('deepMergeOption with real templates', () => {
  it('can merge base option with custom overrides', () => {
    const base = getBaseOption();
    const custom: Record<string, unknown> = {
      grid: { left: 100, right: 50 },
      textStyle: { color: '#red' },
    };

    const result = deepMergeOption(base, custom as import('../build-line-option').EChartsOption);

    const grid = result.grid as Record<string, unknown>;
    expect(grid.left).toBe(100);
    expect(grid.right).toBe(50);
    expect(grid.containLabel).toBe(true);

    const textStyle = result.textStyle as Record<string, unknown>;
    expect(textStyle.color).toBe('#red');
    expect(textStyle.fontFamily).toBeDefined();
  });
});

// ============================================================================
// Multi-Series Tests
// ============================================================================

describe('buildEChartsOption multi-series', () => {
  it('stacked bar chart passes stack field to ECharts series', () => {
    const model = createModel({
      seriesKind: 'bar',
      series: [
        { type: 'bar' as const, name: 'Direct', stack: 'traffic', encode: { x: 'month', y: 'sales' } },
        { type: 'bar' as const, name: 'Organic', stack: 'traffic', encode: { x: 'month', y: 'sales' } },
      ],
      dataset: [
        { month: 'Jan', sales: 100 },
        { month: 'Feb', sales: 200 },
      ],
      axes: [
        { index: 0, direction: 'x' as const, type: 'category' as const },
        { index: 0, direction: 'y' as const, type: 'value' as const },
      ],
    });

    const option = buildEChartsOption(model);
    const series = option.series as Record<string, unknown>[];

    expect(series.length).toBe(2);
    expect(series[0].stack).toBe('traffic');
    expect(series[1].stack).toBe('traffic');
    expect(series[0].name).toBe('Direct');
    expect(series[1].name).toBe('Organic');
  });

  it('3+ line series generates correct legend and series count', () => {
    const model = createModel({
      seriesKind: 'line',
      series: [
        { type: 'line' as const, name: 'Beijing', encode: { x: 'month', y: 'temp1' } },
        { type: 'line' as const, name: 'Shanghai', encode: { x: 'month', y: 'temp2' } },
        { type: 'line' as const, name: 'Guangzhou', encode: { x: 'month', y: 'temp3' } },
      ],
      dataset: [
        { month: 'Jan', temp1: -2, temp2: 5, temp3: 14 },
        { month: 'Feb', temp1: 1, temp2: 7, temp3: 16 },
      ],
      axes: [
        { index: 0, direction: 'x' as const, type: 'category' as const },
        { index: 0, direction: 'y' as const, type: 'value' as const },
      ],
    });

    const option = buildEChartsOption(model);
    const series = option.series as Record<string, unknown>[];
    const legend = option.legend as Record<string, unknown>;

    expect(series.length).toBe(3);
    expect(series[0].type).toBe('line');
    expect(series[1].type).toBe('line');
    expect(series[2].type).toBe('line');
    expect(legend.show).toBe(true);
    expect(legend.data).toEqual(['Beijing', 'Shanghai', 'Guangzhou']);
  });

  it('combo chart renders both bar and line series', () => {
    const model = createModel({
      seriesKind: 'combo',
      series: [
        { type: 'bar' as const, name: 'Revenue', encode: { x: 'month', y: 'revenue' } },
        { type: 'line' as const, name: 'Margin %', encode: { x: 'month', y: 'margin' } },
      ],
      dataset: [
        { month: 'Jan', revenue: 120, margin: 22 },
        { month: 'Feb', revenue: 150, margin: 25 },
      ],
      axes: [
        { index: 0, direction: 'x' as const, type: 'category' as const },
        { index: 0, direction: 'y' as const, type: 'value' as const },
      ],
    });

    const option = buildEChartsOption(model);
    const series = option.series as Record<string, unknown>[];

    expect(series.length).toBe(2);
    expect(series[0].type).toBe('bar');
    expect(series[0].name).toBe('Revenue');
    expect(series[1].type).toBe('line');
    expect(series[1].name).toBe('Margin %');
  });

  it('combo chart includes correct legend for mixed types', () => {
    const model = createModel({
      seriesKind: 'combo',
      series: [
        { type: 'bar' as const, name: 'Sales', encode: { x: 'month', y: 'sales' } },
        { type: 'line' as const, name: 'Growth', encode: { x: 'month', y: 'growth' } },
      ],
      dataset: [
        { month: 'Jan', sales: 100, growth: 5 },
      ],
      axes: [
        { index: 0, direction: 'x' as const, type: 'category' as const },
        { index: 0, direction: 'y' as const, type: 'value' as const },
      ],
    });

    const option = buildEChartsOption(model);
    const legend = option.legend as Record<string, unknown>;

    expect(legend.show).toBe(true);
    expect(legend.data).toEqual(['Sales', 'Growth']);
  });

  it('multi-area chart includes areaStyle for each series', () => {
    const model = createModel({
      seriesKind: 'line',
      series: [
        { type: 'line' as const, subType: 'area', name: 'Desktop', encode: { x: 'month', y: 'desktop' } },
        { type: 'line' as const, subType: 'area', name: 'Mobile', encode: { x: 'month', y: 'mobile' } },
      ],
      dataset: [
        { month: 'Jan', desktop: 3200, mobile: 2100 },
        { month: 'Feb', desktop: 3500, mobile: 2500 },
      ],
      axes: [
        { index: 0, direction: 'x' as const, type: 'category' as const },
        { index: 0, direction: 'y' as const, type: 'value' as const },
      ],
    });

    const option = buildEChartsOption(model);
    const series = option.series as Record<string, unknown>[];

    expect(series.length).toBe(2);
    expect(series[0].areaStyle).toBeDefined();
    expect(series[1].areaStyle).toBeDefined();
    expect(series[0].name).toBe('Desktop');
    expect(series[1].name).toBe('Mobile');
  });

  it('combo chart with stacked bar passes stack through correctly', () => {
    const model = createModel({
      seriesKind: 'combo',
      series: [
        { type: 'bar' as const, name: 'Product A', stack: 'products', encode: { x: 'month', y: 'sales' } },
        { type: 'bar' as const, name: 'Product B', stack: 'products', encode: { x: 'month', y: 'sales2' } },
        { type: 'line' as const, name: 'Trend', encode: { x: 'month', y: 'growth' } },
      ],
      dataset: [
        { month: 'Jan', sales: 100, sales2: 80, growth: 5 },
      ],
      axes: [
        { index: 0, direction: 'x' as const, type: 'category' as const },
        { index: 0, direction: 'y' as const, type: 'value' as const },
      ],
    });

    const option = buildEChartsOption(model);
    const series = option.series as Record<string, unknown>[];

    expect(series.length).toBe(3);
    expect(series[0].stack).toBe('products');
    expect(series[1].stack).toBe('products');
    expect(series[2].type).toBe('line');
  });
});

// ============================================================================
// axisGroup Integration Tests
// ============================================================================

describe('buildEChartsOption with axisGroup fixtures', () => {
  it('line-axis-group fixture renders multiple series from pivot', async () => {
    const { lineAxisGroupFixture: fixture } = await import('../../../testing/fixtures/line-axis-group');
    const { normalizeChartComponent } = await import('../../../component-handlers/chart/chart-normalizer');
    const { buildSemanticModel } = await import('../../../component-handlers/chart/chart-semantic-model');
    const { chartGroupProcess } = await import('../../../component-handlers/chart/chart-group-process');

    const normalized = normalizeChartComponent(fixture);
    const axisGroup = fixture.dataProperties.axisGroup;
    const data = fixture.dataProperties.data as Record<string, unknown>[];

    const groupResult = chartGroupProcess({
      series: normalized.series,
      axisGroup,
      chartData: data,
    });

    const transformedNormalized = {
      ...normalized,
      series: groupResult.renderSeries,
    };
    const model = buildSemanticModel(transformedNormalized, groupResult.renderData);

    const option = buildEChartsOption(model);
    const series = option.series as Record<string, unknown>[];

    // 2 series from 2 unique group combinations
    expect(series.length).toBe(2);
    expect(series[0].type).toBe('line');
    expect(series[1].type).toBe('line');

    // Legend should show both group keys
    const legend = option.legend as Record<string, unknown>;
    expect(legend.show).toBe(true);
  });

  it('bar-axis-group fixture renders multiple series from pivot', async () => {
    const { barAxisGroupFixture: fixture } = await import('../../../testing/fixtures/bar-axis-group');
    const { normalizeChartComponent } = await import('../../../component-handlers/chart/chart-normalizer');
    const { buildSemanticModel } = await import('../../../component-handlers/chart/chart-semantic-model');
    const { chartGroupProcess } = await import('../../../component-handlers/chart/chart-group-process');

    const normalized = normalizeChartComponent(fixture);
    const axisGroup = fixture.dataProperties.axisGroup;
    const data = fixture.dataProperties.data as Record<string, unknown>[];

    const groupResult = chartGroupProcess({
      series: normalized.series,
      axisGroup,
      chartData: data,
    });

    const transformedNormalized = {
      ...normalized,
      series: groupResult.renderSeries,
    };
    const model = buildSemanticModel(transformedNormalized, groupResult.renderData);

    const option = buildEChartsOption(model);
    const series = option.series as Record<string, unknown>[];

    // 3 series from 3 unique regions
    expect(series.length).toBe(3);
    expect(series[0].type).toBe('bar');
    expect(series[1].type).toBe('bar');
    expect(series[2].type).toBe('bar');
  });
});
