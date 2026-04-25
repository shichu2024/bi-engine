import { describe, it, expect } from 'vitest';
import { buildGaugeOption } from '../../src/adapters/echarts/build-gauge-option';
import type { ChartSemanticModel } from '../../src/core/chart-semantic-model';
import type { GaugeSeries } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 共享测试数据
// ---------------------------------------------------------------------------

function makeGaugeModel(overrides: Partial<ChartSemanticModel> = {}): ChartSemanticModel {
  return {
    componentId: 'test-gauge-chart',
    seriesKind: 'gauge',
    title: undefined,
    axes: [],
    series: [
      {
        type: 'gauge',
        name: '完成率',
        encode: { value: 'value' },
        config: { min: 0, max: 100, unit: '%' },
      } as GaugeSeries,
    ],
    dataset: [
      { metric: '完成率', value: 72 },
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
// buildGaugeOption 测试
// ---------------------------------------------------------------------------

describe('buildGaugeOption', () => {
  it('生成包含预期顶层键的有效 ECharts 选项', () => {
    const model = makeGaugeModel();
    const option = buildGaugeOption(model);

    expect(option).toHaveProperty('series');
    expect(option).toHaveProperty('tooltip');
  });

  it('不包含 xAxis / yAxis / radar', () => {
    const model = makeGaugeModel();
    const option = buildGaugeOption(model);

    expect(option.xAxis).toBeUndefined();
    expect(option.yAxis).toBeUndefined();
    expect(option.radar).toBeUndefined();
  });

  it('正确映射 gauge 系列数据', () => {
    const model = makeGaugeModel();
    const option = buildGaugeOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series).toHaveLength(1);
    expect(series[0].type).toBe('gauge');
    expect(series[0].data).toEqual([{ value: 72, name: '' }]);
  });

  it('正确映射 config.min 和 config.max', () => {
    const model = makeGaugeModel();
    const option = buildGaugeOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].min).toBe(0);
    expect(series[0].max).toBe(100);
  });

  it('正确映射 config.unit 到轴标签格式化器', () => {
    const model = makeGaugeModel();
    const option = buildGaugeOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].axisLabel).toEqual({ formatter: '{value}%' });
    expect(series[0].detail).toEqual({ formatter: '{value}%' });
  });

  it('config 缺失时使用默认值', () => {
    const model = makeGaugeModel({
      series: [
        { type: 'gauge', name: '温度', encode: { value: 'temp' } } as GaugeSeries,
      ],
      dataset: [{ temp: 36.5 }],
    });
    const option = buildGaugeOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].min).toBe(0);
    expect(series[0].max).toBe(100);
    expect(series[0].axisLabel).toBeUndefined();
  });

  it('tooltip 触发方式为 item', () => {
    const model = makeGaugeModel();
    const option = buildGaugeOption(model);

    const tooltip = option.tooltip as Record<string, unknown>;
    expect(tooltip.trigger).toBe('item');
  });

  it('优雅处理空数据集', () => {
    const model = makeGaugeModel({ dataset: [] });
    const option = buildGaugeOption(model);

    const series = option.series as Array<Record<string, unknown>>;
    expect(series[0].data).toEqual([]);
  });
});
