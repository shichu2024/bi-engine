import { describe, it, expect } from 'vitest';
import { chartGroupProcess } from '../chart-group-process';
import type { ChartGroupInput } from '../chart-group-process';
import type { Series } from '../../../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 测试数据
// ---------------------------------------------------------------------------

const baseSeries: Series[] = [
  {
    type: 'line',
    name: 'CPU',
    encode: { x: '测试时间戳', y: '利用率(%)' },
  },
];

const multiAxisGroupData = [
  { '测试时间戳': '2026-02-09 07:45:00', '利用率(%)': 19, '测试名称': 'test1', '测试维度': '测试维度1' },
  { '测试时间戳': '2026-02-09 07:45:00', '利用率(%)': 10, '测试名称': 'test2', '测试维度': '测试维度2' },
  { '测试时间戳': '2026-02-09 07:46:00', '利用率(%)': 190, '测试名称': 'test1', '测试维度': '测试维度1' },
  { '测试时间戳': '2026-02-09 07:46:00', '利用率(%)': 100, '测试名称': 'test2', '测试维度': '测试维度2' },
];

const singleAxisGroupData = [
  { '测试时间戳': '2026-02-09 07:45:00', '利用率(%)': 19, '测试名称': 'test1' },
  { '测试时间戳': '2026-02-09 07:45:00', '利用率(%)': 10, '测试名称': 'test2' },
  { '测试时间戳': '2026-02-09 07:46:00', '利用率(%)': 190, '测试名称': 'test1' },
  { '测试时间戳': '2026-02-09 07:46:00', '利用率(%)': 100, '测试名称': 'test2' },
];

// ============================================================================
// Tests
// ============================================================================

describe('chartGroupProcess', () => {
  it('passes through when axisGroup is undefined', () => {
    const input: ChartGroupInput = {
      series: baseSeries,
      chartData: multiAxisGroupData,
    };

    const result = chartGroupProcess(input);

    expect(result.renderData).toBe(multiAxisGroupData);
    expect(result.renderSeries).toBe(baseSeries);
  });

  it('passes through when axisGroup is empty array', () => {
    const input: ChartGroupInput = {
      series: baseSeries,
      axisGroup: [],
      chartData: multiAxisGroupData,
    };

    const result = chartGroupProcess(input);

    expect(result.renderData).toBe(multiAxisGroupData);
    expect(result.renderSeries).toBe(baseSeries);
  });

  it('passes through when axisGroup is ["None"]', () => {
    const input: ChartGroupInput = {
      series: baseSeries,
      axisGroup: ['None'],
      chartData: multiAxisGroupData,
    };

    const result = chartGroupProcess(input);

    expect(result.renderData).toBe(multiAxisGroupData);
    expect(result.renderSeries).toBe(baseSeries);
  });

  it('pivots data with multiple axisGroup fields (joined with -)', () => {
    const input: ChartGroupInput = {
      series: baseSeries,
      axisGroup: ['测试名称', '测试维度'],
      chartData: multiAxisGroupData,
    };

    const result = chartGroupProcess(input);

    // 2 rows (one per unique x value)
    expect(result.renderData.length).toBe(2);

    // First row: x='2026-02-09 07:45:00'
    const row1 = result.renderData[0];
    expect(row1['测试时间戳']).toBe('2026-02-09 07:45:00');
    expect(row1['test1-测试维度1']).toBe(19);
    expect(row1['test2-测试维度2']).toBe(10);

    // Second row: x='2026-02-09 07:46:00'
    const row2 = result.renderData[1];
    expect(row2['测试时间戳']).toBe('2026-02-09 07:46:00');
    expect(row2['test1-测试维度1']).toBe(190);
    expect(row2['test2-测试维度2']).toBe(100);

    // 2 series generated
    expect(result.renderSeries.length).toBe(2);
    expect(result.renderSeries[0].encode.y).toBe('test1-测试维度1');
    expect(result.renderSeries[1].encode.y).toBe('test2-测试维度2');
    expect(result.renderSeries[0].type).toBe('line');
    expect(result.renderSeries[1].type).toBe('line');
  });

  it('pivots data with single axisGroup field (no - separator)', () => {
    const input: ChartGroupInput = {
      series: baseSeries,
      axisGroup: ['测试名称'],
      chartData: singleAxisGroupData,
    };

    const result = chartGroupProcess(input);

    expect(result.renderData.length).toBe(2);

    const row1 = result.renderData[0];
    expect(row1['测试时间戳']).toBe('2026-02-09 07:45:00');
    expect(row1['test1']).toBe(19);
    expect(row1['test2']).toBe(10);

    const row2 = result.renderData[1];
    expect(row2['测试时间戳']).toBe('2026-02-09 07:46:00');
    expect(row2['test1']).toBe(190);
    expect(row2['test2']).toBe(100);

    expect(result.renderSeries.length).toBe(2);
    expect(result.renderSeries[0].encode.y).toBe('test1');
    expect(result.renderSeries[1].encode.y).toBe('test2');
  });

  it('returns empty arrays when chartData is empty', () => {
    const input: ChartGroupInput = {
      series: baseSeries,
      axisGroup: ['测试名称'],
      chartData: [],
    };

    const result = chartGroupProcess(input);

    expect(result.renderData).toEqual([]);
    expect(result.renderSeries).toEqual([]);
  });

  it('returns empty arrays when series is empty', () => {
    const input: ChartGroupInput = {
      series: [],
      axisGroup: ['测试名称'],
      chartData: multiAxisGroupData,
    };

    const result = chartGroupProcess(input);

    expect(result.renderData).toEqual([]);
    expect(result.renderSeries).toEqual([]);
  });

  it('preserves series type and other properties in generated series', () => {
    const barSeries: Series[] = [
      {
        type: 'bar',
        name: 'Sales',
        stack: 'total',
        encode: { x: 'month', y: 'amount' },
      },
    ];
    const data = [
      { month: 'Jan', amount: 100, region: 'North' },
      { month: 'Jan', amount: 200, region: 'South' },
      { month: 'Feb', amount: 150, region: 'North' },
      { month: 'Feb', amount: 250, region: 'South' },
    ];

    const result = chartGroupProcess({
      series: barSeries,
      axisGroup: ['region'],
      chartData: data,
    });

    expect(result.renderSeries.length).toBe(2);
    expect(result.renderSeries[0].type).toBe('bar');
    expect(result.renderSeries[0].stack).toBe('total');
    expect(result.renderSeries[1].type).toBe('bar');
    expect(result.renderSeries[1].stack).toBe('total');
  });

  it('handles 3+ unique group values generating 3+ series', () => {
    const data = [
      { month: 'Jan', value: 10, category: 'A' },
      { month: 'Jan', value: 20, category: 'B' },
      { month: 'Jan', value: 30, category: 'C' },
      { month: 'Feb', value: 40, category: 'A' },
      { month: 'Feb', value: 50, category: 'B' },
      { month: 'Feb', value: 60, category: 'C' },
    ];

    const result = chartGroupProcess({
      series: [{ type: 'line', name: 'val', encode: { x: 'month', y: 'value' } }],
      axisGroup: ['category'],
      chartData: data,
    });

    expect(result.renderSeries.length).toBe(3);
    expect(result.renderData.length).toBe(2);
    expect(result.renderSeries.map((s) => s.encode.y).sort()).toEqual(['A', 'B', 'C']);
  });
});
