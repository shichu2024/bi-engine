import { describe, it, expect } from 'vitest';
import type {
  ChartComponent,
  LineSeries,
  BarSeries,
  PieSeries,
  Axis,
  Column,
} from '../../src/schema/bi-engine-models';
import { FieldType } from '../../src/schema/bi-engine-models';
import {
  normalizeChartComponent,
} from '../../src/core/normalize-chart-component';
import type { NormalizedAxis, NormalizedChartComponent } from '../../src/core/normalize-chart-component';

// ---------------------------------------------------------------------------
// 测试固件
// ---------------------------------------------------------------------------

const categoryAxis: Axis = { type: 'category', name: 'Month' };
const valueAxis: Axis = { type: 'value', name: 'Revenue' };

const lineSeries: LineSeries = {
  type: 'line',
  encode: { x: 'month', y: 'revenue' },
  name: 'Revenue Trend',
};

const barSeries: BarSeries = {
  type: 'bar',
  encode: { x: 'month', y: 'sales' },
  name: 'Sales Volume',
};

const pieSeries: PieSeries = {
  type: 'pie',
  encode: { name: 'category', value: 'amount' },
  name: 'Market Share',
};

function makeLineComponent(overrides: Partial<ChartComponent> = {}): ChartComponent {
  return {
    type: 'chart',
    id: 'chart-line-1',
    dataProperties: {
      dataType: 'static',
      title: 'Line Chart',
      columns: [
        { title: 'Month', key: 'month', type: FieldType.string },
        { title: 'Revenue', key: 'revenue', type: FieldType.double },
      ],
      data: [
        { month: 'Jan', revenue: 100 },
        { month: 'Feb', revenue: 200 },
      ],
      series: [lineSeries],
    },
    xAxis: categoryAxis,
    yAxis: valueAxis,
    ...overrides,
  };
}

function makePieComponent(overrides: Partial<ChartComponent> = {}): ChartComponent {
  return {
    type: 'chart',
    id: 'chart-pie-1',
    dataProperties: {
      dataType: 'static',
      title: 'Pie Chart',
      columns: [
        { title: 'Category', key: 'category', type: FieldType.string },
        { title: 'Amount', key: 'amount', type: FieldType.double },
      ],
      data: [
        { category: 'A', amount: 30 },
        { category: 'B', amount: 70 },
      ],
      series: [pieSeries],
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// normalizeChartComponent
// ---------------------------------------------------------------------------

describe('normalizeChartComponent', () => {
  it('规范化包含单个 Axis 对象的折线图', () => {
    const component = makeLineComponent();
    const result = normalizeChartComponent(component);

    expect(result.id).toBe('chart-line-1');
    expect(result.title).toBe('Line Chart');
    expect(result.series).toHaveLength(1);
    expect(result.series[0]).toEqual(lineSeries);
    expect(result.data).toEqual([
      { month: 'Jan', revenue: 100 },
      { month: 'Feb', revenue: 200 },
    ]);
    expect(result.dataType).toBe('static');
    expect(result.chartOption).toBeUndefined();
    expect(result.layout).toBeUndefined();
  });

  it('将单个 xAxis 对象规范化为扁平坐标轴数组', () => {
    const component = makeLineComponent();
    const result = normalizeChartComponent(component);

    const xAxes = result.axes.filter((a) => a.direction === 'x');
    expect(xAxes).toHaveLength(1);
    expect(xAxes[0]).toEqual({
      index: 0,
      direction: 'x',
      type: 'category',
      name: 'Month',
    });
  });

  it('将单个 yAxis 对象规范化为扁平坐标轴数组', () => {
    const component = makeLineComponent();
    const result = normalizeChartComponent(component);

    const yAxes = result.axes.filter((a) => a.direction === 'y');
    expect(yAxes).toHaveLength(1);
    expect(yAxes[0]).toEqual({
      index: 0,
      direction: 'y',
      type: 'value',
      name: 'Revenue',
    });
  });

  it('将坐标轴数组规范化并赋予正确的索引', () => {
    const component = makeLineComponent({
      xAxis: [
        { type: 'category', name: 'Primary' },
        { type: 'category', name: 'Secondary' },
      ],
      yAxis: [
        { type: 'value', name: 'Left' },
        { type: 'value', name: 'Right' },
      ],
    });
    const result = normalizeChartComponent(component);

    const xAxes = result.axes.filter((a) => a.direction === 'x');
    expect(xAxes).toHaveLength(2);
    expect(xAxes[0].index).toBe(0);
    expect(xAxes[0].name).toBe('Primary');
    expect(xAxes[1].index).toBe(1);
    expect(xAxes[1].name).toBe('Secondary');

    const yAxes = result.axes.filter((a) => a.direction === 'y');
    expect(yAxes).toHaveLength(2);
    expect(yAxes[0].index).toBe(0);
    expect(yAxes[0].name).toBe('Left');
    expect(yAxes[1].index).toBe(1);
    expect(yAxes[1].name).toBe('Right');
  });

  it('为饼图生成空的坐标轴数组', () => {
    const component = makePieComponent();
    const result = normalizeChartComponent(component);

    expect(result.axes).toEqual([]);
  });

  it('忽略饼图上即使存在的坐标轴', () => {
    // 防御性测试——验证应该捕获此问题，但规范化不应崩溃
    const component = makePieComponent({
      xAxis: categoryAxis,
      yAxis: valueAxis,
    });
    const result = normalizeChartComponent(component);

    expect(result.axes).toEqual([]);
  });

  it('columns 缺失时默认为空数组', () => {
    const component = makeLineComponent({
      dataProperties: {
        dataType: 'static',
        series: [lineSeries],
        data: [{ month: 'Jan', revenue: 100 }],
      },
    });
    const result = normalizeChartComponent(component);

    expect(result.columns).toEqual([]);
  });

  it('data 缺失时默认为空数组', () => {
    const component = makeLineComponent({
      dataProperties: {
        dataType: 'static',
        series: [lineSeries],
        columns: [],
      },
    });
    const result = normalizeChartComponent(component);

    expect(result.data).toEqual([]);
  });

  it('保留存在的图表选项', () => {
    const component = makeLineComponent({
      options: {
        eChartOption: { grid: { left: 50 } },
        centerText: 'Total',
      },
    });
    const result = normalizeChartComponent(component);

    expect(result.chartOption).toEqual({
      eChartOption: { grid: { left: 50 } },
      centerText: 'Total',
    });
  });

  it('保留存在的布局信息', () => {
    const component = makeLineComponent({
      layout: {
        type: 'grid' as const,
        gx: 0,
        gy: 0,
        gw: 6,
        gh: 4,
      },
    });
    const result = normalizeChartComponent(component);

    expect(result.layout).toEqual({
      type: 'grid',
      gx: 0,
      gy: 0,
      gw: 6,
      gh: 4,
    });
  });

  it('处理混合的笛卡尔系列类型（折线 + 柱状）', () => {
    const component = makeLineComponent({
      dataProperties: {
        dataType: 'static',
        series: [lineSeries, barSeries],
        data: [{ month: 'Jan', revenue: 100, sales: 50 }],
      },
    });
    const result = normalizeChartComponent(component);

    expect(result.series).toHaveLength(2);
    expect(result.series[0].type).toBe('line');
    expect(result.series[1].type).toBe('bar');
  });

  it('优雅处理笛卡尔图表中 xAxis 为 undefined 的情况', () => {
    const component = makeLineComponent();
    delete (component as Record<string, unknown>).xAxis;

    const result = normalizeChartComponent(component);

    const xAxes = result.axes.filter((a) => a.direction === 'x');
    expect(xAxes).toHaveLength(0);
    // yAxis 仍应被规范化
    const yAxes = result.axes.filter((a) => a.direction === 'y');
    expect(yAxes).toHaveLength(1);
  });
});
