import { describe, it, expect } from 'vitest';
import type {
  LineSeries,
  PieSeries,
  Axis,
  Column,
} from '../../src/schema/bi-engine-models';
import { FieldType, ValueFormatType } from '../../src/schema/bi-engine-models';
import type { NormalizedChartComponent } from '../../src/core/normalize-chart-component';
import {
  buildSemanticModel,
} from '../../src/core/chart-semantic-model';
import type { ChartSemanticModel } from '../../src/core/chart-semantic-model';

// ---------------------------------------------------------------------------
// 测试固件
// ---------------------------------------------------------------------------

const lineSeries: LineSeries = {
  type: 'line',
  encode: { x: 'month', y: 'revenue' },
  name: 'Revenue',
};

const pieSeries: PieSeries = {
  type: 'pie',
  encode: { name: 'category', value: 'amount' },
  name: 'Share',
};

function makeNormalizedLine(
  overrides: Partial<NormalizedChartComponent> = {},
): NormalizedChartComponent {
  return {
    id: 'chart-line-1',
    title: 'Revenue Chart',
    axes: [
      { index: 0, direction: 'x', type: 'category', name: 'Month' },
      { index: 0, direction: 'y', type: 'value', name: 'Revenue' },
    ],
    series: [lineSeries],
    columns: [
      { title: 'Month', key: 'month', type: FieldType.string },
      { title: 'Revenue', key: 'revenue', type: FieldType.double },
    ],
    data: [
      { month: 'Jan', revenue: 100 },
      { month: 'Feb', revenue: 200 },
    ],
    dataType: 'static',
    chartOption: undefined,
    layout: undefined,
    ...overrides,
  };
}

function makeNormalizedPie(
  overrides: Partial<NormalizedChartComponent> = {},
): NormalizedChartComponent {
  return {
    id: 'chart-pie-1',
    title: 'Share Chart',
    axes: [],
    series: [pieSeries],
    columns: [
      { title: 'Category', key: 'category', type: FieldType.string },
      { title: 'Amount', key: 'amount', type: FieldType.double },
    ],
    data: [
      { category: 'A', amount: 30 },
      { category: 'B', amount: 70 },
    ],
    dataType: 'static',
    chartOption: undefined,
    layout: undefined,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildSemanticModel
// ---------------------------------------------------------------------------

describe('buildSemanticModel', () => {
  it('从折线图规范化组件构建语义模型', () => {
    const normalized = makeNormalizedLine();
    const data = normalized.data;

    const model = buildSemanticModel(normalized, data);

    expect(model.componentId).toBe('chart-line-1');
    expect(model.seriesKind).toBe('line');
    expect(model.title).toBe('Revenue Chart');
    expect(model.axes).toHaveLength(2);
    expect(model.series).toHaveLength(1);
    expect(model.dataset).toEqual(data);
    expect(model.columns).toHaveLength(2);
    expect(model.tooltip.enabled).toBe(true);
    expect(model.theme).toBeUndefined();
    expect(model.chartOption).toBeUndefined();
  });

  it('将饼图的 seriesKind 推导为 "pie"', () => {
    const normalized = makeNormalizedPie();
    const model = buildSemanticModel(normalized, normalized.data);

    expect(model.seriesKind).toBe('pie');
  });

  it('将柱状图的 seriesKind 推导为 "bar"', () => {
    const normalized = makeNormalizedLine({
      series: [
        { type: 'bar', encode: { x: 'month', y: 'revenue' }, name: 'Revenue' },
      ],
    });
    const model = buildSemanticModel(normalized, normalized.data);

    expect(model.seriesKind).toBe('bar');
  });

  it('从带有 valueFormat 的列中提取格式化器', () => {
    const normalized = makeNormalizedLine({
      columns: [
        { title: 'Month', key: 'month', type: FieldType.string },
        {
          title: 'Revenue',
          key: 'revenue',
          type: FieldType.double,
          uiConfig: {
            valueFormat: { type: ValueFormatType.number, decimal: 2 },
          },
        },
      ],
    });

    const model = buildSemanticModel(normalized, normalized.data);

    expect(model.formatters).toHaveLength(1);
    expect(model.formatters[0].field).toBe('revenue');
    expect(model.formatters[0].spec).toEqual({
      type: ValueFormatType.number,
      decimal: 2,
    });
  });

  it('当没有列包含 valueFormat 时返回空的格式化器列表', () => {
    const normalized = makeNormalizedLine();
    const model = buildSemanticModel(normalized, normalized.data);

    expect(model.formatters).toEqual([]);
  });

  it('优雅处理非数组的 resolvedData', () => {
    const normalized = makeNormalizedLine();
    const model = buildSemanticModel(normalized, null);

    expect(model.dataset).toEqual([]);
  });

  it('优雅处理 undefined 的 resolvedData', () => {
    const normalized = makeNormalizedLine();
    const model = buildSemanticModel(normalized, undefined);

    expect(model.dataset).toEqual([]);
  });

  it('当系列为空时禁用提示框', () => {
    const normalized = makeNormalizedLine({ series: [] });
    const model = buildSemanticModel(normalized, normalized.data);

    expect(model.tooltip.enabled).toBe(false);
  });

  it('保留规范化组件中的 chartOption', () => {
    const normalized = makeNormalizedLine({
      chartOption: {
        eChartOption: { grid: { left: 50 } },
        centerText: 'Total',
      },
    });
    const model = buildSemanticModel(normalized, normalized.data);

    expect(model.chartOption).toEqual({
      eChartOption: { grid: { left: 50 } },
      centerText: 'Total',
    });
  });
});
