import { describe, it, expect } from 'vitest';
import { buildRadarOption } from '../../src/adapters/echarts/build-radar-option';
import type { ChartSemanticModel } from '../../src/core/chart-semantic-model';
import type { RadarSeries } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 共享测试数据
// ---------------------------------------------------------------------------

function makeRadarModel(overrides: Partial<ChartSemanticModel> = {}): ChartSemanticModel {
  return {
    componentId: 'test-radar-chart',
    seriesKind: 'radar',
    title: undefined,
    axes: [],
    series: [
      {
        type: 'radar',
        name: '产品 A',
        encode: { name: 'product', value: 'performance' },
      } as RadarSeries,
    ],
    dataset: [
      { product: '产品 A', performance: 90 },
    ],
    columns: [
      { title: '产品', key: 'product' },
      { title: '性能', key: 'performance' },
    ],
    tooltip: { enabled: true },
    formatters: [],
    theme: undefined,
    chartOption: {
      eChartOption: {
        radar: {
          indicator: [
            { name: '性能', max: 100 },
          ],
        },
      },
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildRadarOption 测试
// ---------------------------------------------------------------------------

describe('buildRadarOption', () => {
  it('生成包含预期顶层键的有效 ECharts 选项', () => {
    const model = makeRadarModel();
    const option = buildRadarOption(model);

    expect(option).toHaveProperty('series');
    expect(option).toHaveProperty('radar');
    expect(option).toHaveProperty('tooltip');
    expect(option).toHaveProperty('legend');
  });

  it('不包含 xAxis 和 yAxis', () => {
    const model = makeRadarModel();
    const option = buildRadarOption(model);

    expect(option.xAxis).toBeUndefined();
    expect(option.yAxis).toBeUndefined();
  });

  it('构建正确的雷达指示器', () => {
    const model = makeRadarModel();
    const option = buildRadarOption(model);

    const radar = option.radar as Record<string, unknown>;
    expect(radar.indicator).toEqual([{ name: '性能', max: 100 }]);
  });

  it('将雷达系列数据映射为 [{ value, name }] 格式', () => {
    const model = makeRadarModel();
    const option = buildRadarOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('radar');
    expect(series[0].name).toBe('产品 A');
    expect(series[0].data).toEqual([{ value: [90], name: '产品 A' }]);
  });

  it('tooltip 触发方式为 item', () => {
    const model = makeRadarModel();
    const option = buildRadarOption(model);

    const tooltip = option.tooltip as Record<string, unknown>;
    expect(tooltip.trigger).toBe('item');
  });

  it('多系列雷达图正确叠加', () => {
    const model = makeRadarModel({
      series: [
        { type: 'radar', name: '产品 A', encode: { name: 'product', value: 'scoreA' } } as RadarSeries,
        { type: 'radar', name: '产品 B', encode: { name: 'product', value: 'scoreB' } } as RadarSeries,
      ],
      dataset: [
        { product: '对比', scoreA: 90, scoreB: 80 },
      ],
    });
    const option = buildRadarOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series).toHaveLength(2);
    expect(series[0].name).toBe('产品 A');
    expect(series[1].name).toBe('产品 B');
  });

  it('优雅处理空数据集', () => {
    const model = makeRadarModel({ dataset: [] });
    const option = buildRadarOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].data).toEqual([]);
  });
});
