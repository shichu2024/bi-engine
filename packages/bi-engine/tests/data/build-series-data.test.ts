import { describe, it, expect } from 'vitest';
import { buildSeriesData } from '../../src/core/build-series-data';
import type {
  Series,
  LineSeries,
  BarSeries,
  PieSeries,
} from '../../src/schema/bi-engine-models';
import type {
  SeriesDataset,
  CartesianSeriesDataset,
  PieSeriesDataset,
} from '../../src/core/build-series-data';

// ---------------------------------------------------------------------------
// 共享测试数据
// ---------------------------------------------------------------------------

const sampleData: Record<string, unknown>[] = [
  { month: 'Jan', sales: 100, profit: 40 },
  { month: 'Feb', sales: 200, profit: 80 },
  { month: 'Mar', sales: 150, profit: 60 },
];

// ---------------------------------------------------------------------------
// buildSeriesData 测试
// ---------------------------------------------------------------------------

describe('buildSeriesData', () => {
  // =========================================================================
  // 折线系列
  // =========================================================================

  describe('折线系列', () => {
    it('使用 encode 从数据中提取 x 和 y 字段', () => {
      const series: Series[] = [
        {
          type: 'line',
          name: 'Sales',
          encode: { x: 'month', y: 'sales' },
        } as LineSeries,
      ];

      const result = buildSeriesData(series, sampleData);

      expect(result).toHaveLength(1);
      const dataset = result[0] as CartesianSeriesDataset;
      expect(dataset.seriesType).toBe('line');
      expect(dataset.seriesName).toBe('Sales');
      expect(dataset.xAxisIndex).toBe(0);
      expect(dataset.yAxisIndex).toBe(0);
      expect(dataset.data).toEqual([
        { x: 'Jan', y: 100 },
        { x: 'Feb', y: 200 },
        { x: 'Mar', y: 150 },
      ]);
    });

    it('遵守自定义的 xAxisIndex 和 yAxisIndex', () => {
      const series: Series[] = [
        {
          type: 'line',
          name: 'Sales',
          encode: { x: 'month', y: 'sales', xAxisIndex: 1, yAxisIndex: 2 },
        } as LineSeries,
      ];

      const result = buildSeriesData(series, sampleData);

      const dataset = result[0] as CartesianSeriesDataset;
      expect(dataset.xAxisIndex).toBe(1);
      expect(dataset.yAxisIndex).toBe(2);
    });

    it('当存在 subType 时携带（area）', () => {
      const series: Series[] = [
        {
          type: 'line',
          name: 'Area Sales',
          subType: 'area',
          encode: { x: 'month', y: 'sales' },
        } as LineSeries,
      ];

      const result = buildSeriesData(series, sampleData);

      const dataset = result[0] as CartesianSeriesDataset;
      expect(dataset.subType).toBe('area');
    });

    it('未提供 subType 时为 undefined', () => {
      const series: Series[] = [
        {
          type: 'line',
          name: 'Sales',
          encode: { x: 'month', y: 'sales' },
        } as LineSeries,
      ];

      const result = buildSeriesData(series, sampleData);

      const dataset = result[0] as CartesianSeriesDataset;
      expect(dataset.subType).toBeUndefined();
    });
  });

  // =========================================================================
  // 柱状系列
  // =========================================================================

  describe('柱状系列', () => {
    it('使用 encode 从数据中提取 x 和 y 字段', () => {
      const series: Series[] = [
        {
          type: 'bar',
          name: 'Profit',
          encode: { x: 'month', y: 'profit' },
        } as BarSeries,
      ];

      const result = buildSeriesData(series, sampleData);

      expect(result).toHaveLength(1);
      const dataset = result[0] as CartesianSeriesDataset;
      expect(dataset.seriesType).toBe('bar');
      expect(dataset.seriesName).toBe('Profit');
      expect(dataset.xAxisIndex).toBe(0);
      expect(dataset.yAxisIndex).toBe(0);
      expect(dataset.data).toEqual([
        { x: 'Jan', y: 40 },
        { x: 'Feb', y: 80 },
        { x: 'Mar', y: 60 },
      ]);
    });

    it('遵守自定义的坐标轴索引', () => {
      const series: Series[] = [
        {
          type: 'bar',
          name: 'Profit',
          encode: { x: 'month', y: 'profit', xAxisIndex: 0, yAxisIndex: 1 },
        } as BarSeries,
      ];

      const result = buildSeriesData(series, sampleData);

      const dataset = result[0] as CartesianSeriesDataset;
      expect(dataset.xAxisIndex).toBe(0);
      expect(dataset.yAxisIndex).toBe(1);
    });

    it('当存在 subType 时携带（horizontal）', () => {
      const series: Series[] = [
        {
          type: 'bar',
          name: 'Horizontal Profit',
          subType: 'horizontal',
          encode: { x: 'month', y: 'profit' },
        } as BarSeries,
      ];

      const result = buildSeriesData(series, sampleData);

      const dataset = result[0] as CartesianSeriesDataset;
      expect(dataset.subType).toBe('horizontal');
    });
  });

  // =========================================================================
  // 饼图系列
  // =========================================================================

  describe('饼图系列', () => {
    it('使用 encode 从数据中提取 name 和 value 字段', () => {
      const series: Series[] = [
        {
          type: 'pie',
          name: 'Sales Distribution',
          encode: { name: 'month', value: 'sales' },
        } as PieSeries,
      ];

      const result = buildSeriesData(series, sampleData);

      expect(result).toHaveLength(1);
      const dataset = result[0] as PieSeriesDataset;
      expect(dataset.seriesType).toBe('pie');
      expect(dataset.seriesName).toBe('Sales Distribution');
      expect(dataset.data).toEqual([
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 200 },
        { name: 'Mar', value: 150 },
      ]);
    });

    it('当存在 subType 时携带（ring）', () => {
      const series: Series[] = [
        {
          type: 'pie',
          name: 'Ring Chart',
          subType: 'ring',
          encode: { name: 'month', value: 'sales' },
        } as PieSeries,
      ];

      const result = buildSeriesData(series, sampleData);

      const dataset = result[0] as PieSeriesDataset;
      expect(dataset.subType).toBe('ring');
    });
  });

  // =========================================================================
  // 多系列
  // =========================================================================

  describe('多系列', () => {
    it('处理折线 + 柱状混合系列及不同坐标轴索引', () => {
      const series: Series[] = [
        {
          type: 'line',
          name: 'Sales',
          encode: { x: 'month', y: 'sales' },
        } as LineSeries,
        {
          type: 'bar',
          name: 'Profit',
          encode: { x: 'month', y: 'profit', yAxisIndex: 1 },
        } as BarSeries,
      ];

      const result = buildSeriesData(series, sampleData);

      expect(result).toHaveLength(2);

      const lineDs = result[0] as CartesianSeriesDataset;
      expect(lineDs.seriesType).toBe('line');
      expect(lineDs.seriesName).toBe('Sales');
      expect(lineDs.yAxisIndex).toBe(0);

      const barDs = result[1] as CartesianSeriesDataset;
      expect(barDs.seriesType).toBe('bar');
      expect(barDs.seriesName).toBe('Profit');
      expect(barDs.yAxisIndex).toBe(1);
    });

    it('处理饼图系列与笛卡尔系列并存的情况', () => {
      const series: Series[] = [
        {
          type: 'bar',
          name: 'Sales',
          encode: { x: 'month', y: 'sales' },
        } as BarSeries,
        {
          type: 'pie',
          name: 'Distribution',
          encode: { name: 'month', value: 'profit' },
        } as PieSeries,
      ];

      const result = buildSeriesData(series, sampleData);

      expect(result).toHaveLength(2);

      const barDs = result[0] as CartesianSeriesDataset;
      expect(barDs.seriesType).toBe('bar');

      const pieDs = result[1] as PieSeriesDataset;
      expect(pieDs.seriesType).toBe('pie');
      expect(pieDs.data).toEqual([
        { name: 'Jan', value: 40 },
        { name: 'Feb', value: 80 },
        { name: 'Mar', value: 60 },
      ]);
    });
  });

  // =========================================================================
  // 边界情况
  // =========================================================================

  describe('边界情况', () => {
    it('系列为空时返回空数组', () => {
      const result = buildSeriesData([], sampleData);
      expect(result).toEqual([]);
    });

    it('输入数据为空时返回带有空数据数组的条目', () => {
      const series: Series[] = [
        {
          type: 'line',
          name: 'Sales',
          encode: { x: 'month', y: 'sales' },
        } as LineSeries,
      ];

      const result = buildSeriesData(series, []);

      expect(result).toHaveLength(1);
      const dataset = result[0] as CartesianSeriesDataset;
      expect(dataset.data).toEqual([]);
    });

    it('优雅处理数据行中的 undefined 值', () => {
      const data: Record<string, unknown>[] = [
        { month: 'Jan' },
        { month: 'Feb', sales: 200 },
      ];

      const series: Series[] = [
        {
          type: 'line',
          name: 'Sales',
          encode: { x: 'month', y: 'sales' },
        } as LineSeries,
      ];

      const result = buildSeriesData(series, data);

      const dataset = result[0] as CartesianSeriesDataset;
      expect(dataset.data).toEqual([
        { x: 'Jan', y: undefined },
        { x: 'Feb', y: 200 },
      ]);
    });

    it('处理散点图系列', () => {
      const series = [
        {
          type: 'scatter',
          name: 'Scatter',
          encode: { x: 'month', y: 'sales' },
        },
      ] as Series[];

      const result = buildSeriesData(series, sampleData);
      expect(result).toHaveLength(1);
      expect(result[0].seriesType).toBe('scatter');
    });

    it('静默跳过不支持的系列类型（如 heatmap）', () => {
      const series = [
        {
          type: 'heatmap',
          name: 'Heat',
          encode: { x: 'month', y: 'sales' },
        },
      ] as Series[];

      const result = buildSeriesData(series, sampleData);
      expect(result).toHaveLength(0);
    });

    it('在同一数组中处理所有支持的类型', () => {
      const series = [
        {
          type: 'line',
          name: 'Sales',
          encode: { x: 'month', y: 'sales' },
        } as LineSeries,
        {
          type: 'scatter',
          name: 'Scatter',
          encode: { x: 'month', y: 'sales' },
        },
        {
          type: 'bar',
          name: 'Profit',
          encode: { x: 'month', y: 'profit' },
        } as BarSeries,
      ] as Series[];

      const result = buildSeriesData(series, sampleData);

      expect(result).toHaveLength(3);
      expect(result[0].seriesType).toBe('line');
      expect(result[1].seriesType).toBe('scatter');
      expect(result[2].seriesType).toBe('bar');
    });
  });
});
