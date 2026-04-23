import { describe, it, expect } from 'vitest';
import { buildEChartsOption } from '../../src/adapters/echarts/index';
import type { ChartSemanticModel } from '../../src/core/chart-semantic-model';
import type { LineSeries, BarSeries, PieSeries } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 共享测试数据
// ---------------------------------------------------------------------------

const sharedDataset = [
  { month: 'Jan', sales: 100, profit: 40 },
  { month: 'Feb', sales: 200, profit: 80 },
  { month: 'Mar', sales: 150, profit: 60 },
];

function makeLineModel(overrides: Partial<ChartSemanticModel> = {}): ChartSemanticModel {
  return {
    componentId: 'test-line',
    seriesKind: 'line',
    title: 'Line Chart',
    axes: [
      { index: 0, direction: 'x', type: 'category' },
      { index: 0, direction: 'y', type: 'value' },
    ],
    series: [
      { type: 'line', name: 'Sales', encode: { x: 'month', y: 'sales' } } as LineSeries,
    ],
    dataset: sharedDataset,
    columns: [],
    tooltip: { enabled: true },
    formatters: [],
    theme: undefined,
    chartOption: undefined,
    ...overrides,
  };
}

function makeBarModel(overrides: Partial<ChartSemanticModel> = {}): ChartSemanticModel {
  return {
    componentId: 'test-bar',
    seriesKind: 'bar',
    title: 'Bar Chart',
    axes: [
      { index: 0, direction: 'x', type: 'category' },
      { index: 0, direction: 'y', type: 'value' },
    ],
    series: [
      { type: 'bar', name: 'Profit', encode: { x: 'month', y: 'profit' } } as BarSeries,
    ],
    dataset: sharedDataset,
    columns: [],
    tooltip: { enabled: true },
    formatters: [],
    theme: undefined,
    chartOption: undefined,
    ...overrides,
  };
}

function makePieModel(overrides: Partial<ChartSemanticModel> = {}): ChartSemanticModel {
  return {
    componentId: 'test-pie',
    seriesKind: 'pie',
    title: 'Pie Chart',
    axes: [],
    series: [
      { type: 'pie', name: 'Distribution', encode: { name: 'month', value: 'sales' } } as PieSeries,
    ],
    dataset: sharedDataset,
    columns: [],
    tooltip: { enabled: true },
    formatters: [],
    theme: undefined,
    chartOption: undefined,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildEChartsOption（统一入口）测试
// ---------------------------------------------------------------------------

describe('buildEChartsOption', () => {
  // =========================================================================
  // 路由
  // =========================================================================

  describe('按 seriesKind 路由', () => {
    it('seriesKind=line 时路由到折线图构建器', () => {
      const model = makeLineModel();
      const option = buildEChartsOption(model);

      const series = option.series as Array<Record<string, unknown>>;
      expect(series[0].type).toBe('line');
    });

    it('seriesKind=bar 时路由到柱状图构建器', () => {
      const model = makeBarModel();
      const option = buildEChartsOption(model);

      const series = option.series as Array<Record<string, unknown>>;
      expect(series[0].type).toBe('bar');
    });

    it('seriesKind=pie 时路由到饼图构建器', () => {
      const model = makePieModel();
      const option = buildEChartsOption(model);

      const series = option.series as Array<Record<string, unknown>>;
      expect(series[0].type).toBe('pie');
    });
  });

  // =========================================================================
  // 合并集成
  // =========================================================================

  describe('ChartOption 合并集成', () => {
    it('将 chartOption.eChartOption 应用到输出', () => {
      const model = makeLineModel({
        chartOption: {
          eChartOption: {
            color: ['#ff0000'],
            animation: false,
          },
        },
      });

      const option = buildEChartsOption(model);

      expect(option.color).toEqual(['#ff0000']);
      expect(option.animation).toBe(false);
    });

    it('保护核心字段免受 eChartOption 覆盖', () => {
      const model = makeLineModel({
        chartOption: {
          eChartOption: {
            series: [{ type: 'pie' }],
            xAxis: [{ type: 'value' }],
          },
        },
      });

      const option = buildEChartsOption(model);

      const series = option.series as Array<Record<string, unknown>>;
      expect(series[0].type).toBe('line');

      const xAxis = option.xAxis as Array<Record<string, unknown>>;
      expect(xAxis[0].type).toBe('category');
    });

    it('返回不含 chartOption 的干净选项', () => {
      const model = makeBarModel();
      const option = buildEChartsOption(model);

      expect(option).toHaveProperty('series');
      expect(option).toHaveProperty('xAxis');
      expect(option).toHaveProperty('yAxis');
      expect(option).toHaveProperty('tooltip');
    });
  });

  // =========================================================================
  // 结构完整性
  // =========================================================================

  describe('选项结构', () => {
    it('折线图选项包含所有预期的键', () => {
      const model = makeLineModel();
      const option = buildEChartsOption(model);

      expect(option.title).toEqual({ text: 'Line Chart' });
      expect(option).toHaveProperty('series');
      expect(option).toHaveProperty('xAxis');
      expect(option).toHaveProperty('yAxis');
      expect(option).toHaveProperty('tooltip');
      expect(option).toHaveProperty('legend');
    });

    it('柱状图选项包含所有预期的键', () => {
      const model = makeBarModel();
      const option = buildEChartsOption(model);

      expect(option.title).toEqual({ text: 'Bar Chart' });
      expect(option).toHaveProperty('series');
      expect(option).toHaveProperty('xAxis');
      expect(option).toHaveProperty('yAxis');
      expect(option).toHaveProperty('tooltip');
      expect(option).toHaveProperty('legend');
    });

    it('饼图选项包含预期的键且无坐标轴', () => {
      const model = makePieModel();
      const option = buildEChartsOption(model);

      expect(option.title).toEqual({ text: 'Pie Chart' });
      expect(option).toHaveProperty('series');
      expect(option).toHaveProperty('tooltip');
      expect(option).toHaveProperty('legend');
      expect(option.xAxis).toBeUndefined();
      expect(option.yAxis).toBeUndefined();
    });
  });
});
