import { describe, it, expect } from 'vitest';
import { buildCandlestickOption } from '../../src/adapters/echarts/build-candlestick-option';
import type { ChartSemanticModel } from '../../src/core/chart-semantic-model';
import type { CandlestickSeries } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 共享测试数据
// ---------------------------------------------------------------------------

function makeCandlestickModel(overrides: Partial<ChartSemanticModel> = {}): ChartSemanticModel {
  return {
    componentId: 'test-candlestick-chart',
    seriesKind: 'candlestick',
    title: undefined,
    axes: [
      { index: 0, direction: 'x', type: 'category', name: '日期' },
      { index: 0, direction: 'y', type: 'value', name: '价格' },
    ],
    series: [
      {
        type: 'candlestick',
        name: '价格走势',
        encode: { open: 'open', close: 'close', low: 'low', high: 'high' },
      } as CandlestickSeries,
    ],
    dataset: [
      { date: '周一', open: 20, close: 24, low: 18, high: 25 },
      { date: '周二', open: 24, close: 22, low: 20, high: 27 },
    ],
    columns: [
      { title: '日期', key: 'date' },
      { title: '开盘价', key: 'open' },
      { title: '收盘价', key: 'close' },
      { title: '最低价', key: 'low' },
      { title: '最高价', key: 'high' },
    ],
    tooltip: { enabled: true },
    formatters: [],
    theme: undefined,
    chartOption: undefined,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildCandlestickOption 测试
// ---------------------------------------------------------------------------

describe('buildCandlestickOption', () => {
  it('生成包含预期顶层键的有效 ECharts 选项', () => {
    const model = makeCandlestickModel();
    const option = buildCandlestickOption(model);

    expect(option).toHaveProperty('series');
    expect(option).toHaveProperty('xAxis');
    expect(option).toHaveProperty('yAxis');
    expect(option).toHaveProperty('tooltip');
    expect(option).toHaveProperty('legend');
  });

  it('将蜡烛图数据映射为 [[open, close, low, high], ...] 格式', () => {
    const model = makeCandlestickModel();
    const option = buildCandlestickOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('candlestick');
    expect(series[0].data).toEqual([
      [20, 24, 18, 25],
      [24, 22, 20, 27],
    ]);
  });

  it('将 xAxis 设置为类目轴并填充日期数据', () => {
    const model = makeCandlestickModel();
    const option = buildCandlestickOption(model);

    const xAxis = option.xAxis as Array<Record<string, unknown>>;
    expect(xAxis).toHaveLength(1);
    expect(xAxis[0].type).toBe('category');
    expect(xAxis[0].data).toEqual(['周一', '周二']);
  });

  it('将 yAxis 设置为数值轴', () => {
    const model = makeCandlestickModel();
    const option = buildCandlestickOption(model);

    const yAxis = option.yAxis as Array<Record<string, unknown>>;
    expect(yAxis).toHaveLength(1);
    expect(yAxis[0].type).toBe('value');
  });

  it('tooltip 触发方式为 axis', () => {
    const model = makeCandlestickModel();
    const option = buildCandlestickOption(model);

    const tooltip = option.tooltip as Record<string, unknown>;
    expect(tooltip.trigger).toBe('axis');
  });

  it('优雅处理空数据集', () => {
    const model = makeCandlestickModel({ dataset: [] });
    const option = buildCandlestickOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].data).toEqual([]);
  });

  it('跳过系列数组中的非蜡烛图系列', () => {
    const model = makeCandlestickModel({
      series: [
        { type: 'candlestick', name: 'K线', encode: { open: 'open', close: 'close', low: 'low', high: 'high' } } as CandlestickSeries,
        { type: 'line', name: '均线', encode: { x: 'date', y: 'close' } } as never,
      ],
    });
    const option = buildCandlestickOption(model);
    const series = option.series as Array<Record<string, unknown>>;

    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('candlestick');
  });
});
