import { describe, it, expect } from 'vitest';
import { mergeChartOption } from '../../src/adapters/echarts/merge-chart-option';
import type { EChartsOption } from '../../src/adapters/echarts/build-line-option';
import type { ChartOption } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// mergeChartOption 测试
// ---------------------------------------------------------------------------

describe('mergeChartOption', () => {
  it('chartOption 为 undefined 时返回不变的基准选项', () => {
    const base: EChartsOption = { series: [], xAxis: [] };

    const result = mergeChartOption(base, undefined);

    expect(result).toEqual(base);
  });

  it('eChartOption 缺失时返回不变的基准选项', () => {
    const base: EChartsOption = { series: [], xAxis: [] };
    const chartOption: ChartOption = {};

    const result = mergeChartOption(base, chartOption);

    expect(result).toEqual(base);
  });

  it('从 eChartOption 合并非核心字段', () => {
    const base: EChartsOption = {
      series: [{ type: 'line' }],
      xAxis: [{ type: 'category' }],
    };
    const chartOption: ChartOption = {
      eChartOption: {
        color: ['#5470c6', '#91cc75'],
        grid: { left: '10%' },
      },
    };

    const result = mergeChartOption(base, chartOption);

    expect(result.color).toEqual(['#5470c6', '#91cc75']);
    expect(result.grid).toEqual({ left: '10%' });
    // 核心字段从基准选项保留
    expect(result.series).toEqual([{ type: 'line' }]);
    expect(result.xAxis).toEqual([{ type: 'category' }]);
  });

  it('保护 series 不被覆盖', () => {
    const base: EChartsOption = { series: [{ type: 'line' }] };
    const chartOption: ChartOption = {
      eChartOption: {
        series: [{ type: 'bar' }],
      },
    };

    const result = mergeChartOption(base, chartOption);

    expect(result.series).toEqual([{ type: 'line' }]);
  });

  it('保护 xAxis 不被覆盖', () => {
    const base: EChartsOption = { xAxis: [{ type: 'category' }] };
    const chartOption: ChartOption = {
      eChartOption: {
        xAxis: [{ type: 'value' }],
      },
    };

    const result = mergeChartOption(base, chartOption);

    expect(result.xAxis).toEqual([{ type: 'category' }]);
  });

  it('保护 yAxis 不被覆盖', () => {
    const base: EChartsOption = { yAxis: [{ type: 'value' }] };
    const chartOption: ChartOption = {
      eChartOption: {
        yAxis: [{ type: 'category' }],
      },
    };

    const result = mergeChartOption(base, chartOption);

    expect(result.yAxis).toEqual([{ type: 'value' }]);
  });

  it('保护 dataset 不被覆盖', () => {
    const base: EChartsOption = { dataset: { source: [1, 2, 3] } };
    const chartOption: ChartOption = {
      eChartOption: {
        dataset: { source: [4, 5, 6] },
      },
    };

    const result = mergeChartOption(base, chartOption);

    expect(result.dataset).toEqual({ source: [1, 2, 3] });
  });

  it('同时合并多个非核心字段', () => {
    const base: EChartsOption = { series: [], xAxis: [], yAxis: [] };
    const chartOption: ChartOption = {
      eChartOption: {
        color: ['#ccc'],
        textStyle: { fontSize: 12 },
        animation: false,
        tooltip: { trigger: 'item' },
      },
    };

    const result = mergeChartOption(base, chartOption);

    expect(result.color).toEqual(['#ccc']);
    expect(result.textStyle).toEqual({ fontSize: 12 });
    expect(result.animation).toBe(false);
    expect(result.tooltip).toEqual({ trigger: 'item' });
  });

  it('不修改基准选项', () => {
    const base: EChartsOption = { series: [], xAxis: [] };
    const baseBefore = { ...base };

    const chartOption: ChartOption = {
      eChartOption: {
        color: ['#ccc'],
      },
    };

    mergeChartOption(base, chartOption);

    expect(base).toEqual(baseBefore);
  });
});
