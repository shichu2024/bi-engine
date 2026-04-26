// ============================================================================
// __tests__/handlers/chart-switch.test.ts — 图表切换功能测试
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  getSwitchableTypes,
  convertSchema,
  isAreaChart,
  deriveDisplayKind,
} from '../../component-handlers/chart/chart-switch';
import type { SwitchTarget } from '../../component-handlers/chart/chart-switch';
import type {
  ChartComponent,
  TableComponent,
  LineSeries,
  BarSeries,
  PieSeries,
  Column,
} from '../../schema/bi-engine-models';
import type { Series } from '../../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBarChart(series?: Series[]): ChartComponent {
  const s: Series[] = series ?? [
    { type: 'bar', name: 'Sales', encode: { x: 'month', y: 'sales' } },
  ];
  return {
    id: 'chart-1',
    type: 'chart',
    dataProperties: {
      dataType: 'static',
      title: 'Test Chart',
      data: [
        { month: 'Jan', sales: 100 },
        { month: 'Feb', sales: 200 },
      ],
      series: s,
      columns: [
        { key: 'month', title: 'Month' },
        { key: 'sales', title: 'Sales' },
      ],
    },
    xAxis: { type: 'category' },
    yAxis: { type: 'value' },
  };
}

function makeLineChart(subType?: 'area'): ChartComponent {
  const s: LineSeries = {
    type: 'line',
    subType,
    name: 'Sales',
    encode: { x: 'month', y: 'sales' },
  };
  return makeBarChart([s]);
}

function makePieChart(): ChartComponent {
  return {
    id: 'chart-pie',
    type: 'chart',
    dataProperties: {
      dataType: 'static',
      title: 'Pie Chart',
      data: [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
      ],
      series: [
        { type: 'pie', name: 'Share', encode: { name: 'name', value: 'value' } },
      ],
    },
  };
}

function makeScatterChart(): ChartComponent {
  return {
    id: 'chart-scatter',
    type: 'chart',
    dataProperties: {
      dataType: 'static',
      title: 'Scatter',
      data: [{ x: 1, y: 2 }],
      series: [
        { type: 'scatter', name: 'Points', encode: { x: 'x', y: 'y' } },
      ],
    },
    xAxis: { type: 'value' },
    yAxis: { type: 'value' },
  };
}

function makeTable(): TableComponent {
  return {
    id: 'table-1',
    type: 'table',
    dataProperties: {
      dataType: 'static',
      title: 'Table',
      data: [{ month: 'Jan', sales: 100 }],
      columns: [
        { key: 'month', title: 'Month' },
        { key: 'sales', title: 'Sales' },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// getSwitchableTypes
// ---------------------------------------------------------------------------

describe('getSwitchableTypes', () => {
  it('bar → [bar, line, area, table]', () => {
    const result = getSwitchableTypes('bar');
    const types = result.map((t) => t.type);
    expect(types).toEqual(['bar', 'line', 'area', 'table']);
  });

  it('line → [bar, line, area, table]', () => {
    const series: Series[] = [{ type: 'line', name: 'S', encode: { x: 'x', y: 'y' } }];
    const result = getSwitchableTypes('line', series);
    const types = result.map((t) => t.type);
    expect(types).toEqual(['bar', 'line', 'area', 'table']);
  });

  it('line with subType=area → [bar, line, area, table]', () => {
    const series: Series[] = [{ type: 'line', subType: 'area', name: 'S', encode: { x: 'x', y: 'y' } }];
    const result = getSwitchableTypes('line', series);
    const types = result.map((t) => t.type);
    expect(types).toEqual(['bar', 'line', 'area', 'table']);
  });

  it('pie → [pie, table]', () => {
    const result = getSwitchableTypes('pie');
    const types = result.map((t) => t.type);
    expect(types).toEqual(['pie', 'table']);
  });

  it('scatter → [scatter, table]', () => {
    const result = getSwitchableTypes('scatter');
    const types = result.map((t) => t.type);
    expect(types).toEqual(['scatter', 'table']);
  });

  it('radar → [radar, table]', () => {
    const result = getSwitchableTypes('radar');
    const types = result.map((t) => t.type);
    expect(types).toEqual(['radar', 'table']);
  });

  it('gauge → [gauge, table]', () => {
    const result = getSwitchableTypes('gauge');
    const types = result.map((t) => t.type);
    expect(types).toEqual(['gauge', 'table']);
  });

  it('candlestick → [candlestick, table]', () => {
    const result = getSwitchableTypes('candlestick');
    const types = result.map((t) => t.type);
    expect(types).toEqual(['candlestick', 'table']);
  });
});

// ---------------------------------------------------------------------------
// isAreaChart
// ---------------------------------------------------------------------------

describe('isAreaChart', () => {
  it('returns true for line with subType=area', () => {
    const series: Series[] = [{ type: 'line', subType: 'area', name: 'S', encode: { x: 'x', y: 'y' } }];
    expect(isAreaChart(series)).toBe(true);
  });

  it('returns false for line without subType', () => {
    const series: Series[] = [{ type: 'line', name: 'S', encode: { x: 'x', y: 'y' } }];
    expect(isAreaChart(series)).toBe(false);
  });

  it('returns false for bar', () => {
    const series: Series[] = [{ type: 'bar', name: 'S', encode: { x: 'x', y: 'y' } }];
    expect(isAreaChart(series)).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(isAreaChart([])).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isAreaChart(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deriveDisplayKind
// ---------------------------------------------------------------------------

describe('deriveDisplayKind', () => {
  it('returns "area" for line+area', () => {
    const series: Series[] = [{ type: 'line', subType: 'area', name: 'S', encode: { x: 'x', y: 'y' } }];
    expect(deriveDisplayKind('line', series)).toBe('area');
  });

  it('returns "line" for plain line', () => {
    const series: Series[] = [{ type: 'line', name: 'S', encode: { x: 'x', y: 'y' } }];
    expect(deriveDisplayKind('line', series)).toBe('line');
  });

  it('returns "bar" for bar', () => {
    expect(deriveDisplayKind('bar')).toBe('bar');
  });
});

// ---------------------------------------------------------------------------
// convertSchema — chart → chart
// ---------------------------------------------------------------------------

describe('convertSchema chart-to-chart', () => {
  it('bar → line: converts series type', () => {
    const original = makeBarChart();
    const result = convertSchema(original, 'line') as ChartComponent;

    expect(result.type).toBe('chart');
    expect((result.dataProperties.series as Series[])[0].type).toBe('line');
    expect((result.dataProperties.series as Series[])[0].name).toBe('Sales');
  });

  it('bar → area: converts to line with subType=area', () => {
    const original = makeBarChart();
    const result = convertSchema(original, 'area') as ChartComponent;

    expect(result.type).toBe('chart');
    const s = result.dataProperties.series as Series[];
    expect(s[0].type).toBe('line');
    expect((s[0] as LineSeries).subType).toBe('area');
  });

  it('line → bar: converts series type', () => {
    const original = makeLineChart();
    const result = convertSchema(original, 'bar') as ChartComponent;

    expect(result.type).toBe('chart');
    expect((result.dataProperties.series as Series[])[0].type).toBe('bar');
  });

  it('line → area: adds subType', () => {
    const original = makeLineChart();
    const result = convertSchema(original, 'area') as ChartComponent;

    const s = result.dataProperties.series as Series[];
    expect(s[0].type).toBe('line');
    expect((s[0] as LineSeries).subType).toBe('area');
  });

  it('area → line: removes subType', () => {
    const original = makeLineChart('area');
    const result = convertSchema(original, 'line') as ChartComponent;

    const s = result.dataProperties.series as Series[];
    expect(s[0].type).toBe('line');
    expect((s[0] as LineSeries).subType).toBeUndefined();
  });

  it('area → bar: converts to bar', () => {
    const original = makeLineChart('area');
    const result = convertSchema(original, 'bar') as ChartComponent;

    const s = result.dataProperties.series as Series[];
    expect(s[0].type).toBe('bar');
  });

  it('does not mutate original schema', () => {
    const original = makeBarChart();
    const originalSeries = original.dataProperties.series![0];
    const originalType = originalSeries.type;

    convertSchema(original, 'line');

    expect(originalSeries.type).toBe(originalType);
  });

  it('preserves componentId and title', () => {
    const original = makeBarChart();
    const result = convertSchema(original, 'line') as ChartComponent;

    expect(result.id).toBe('chart-1');
    expect(result.dataProperties.title).toBe('Test Chart');
  });

  it('preserves data', () => {
    const original = makeBarChart();
    const result = convertSchema(original, 'line') as ChartComponent;

    expect(result.dataProperties.data).toEqual(original.dataProperties.data);
  });

  it('preserves encode', () => {
    const original = makeBarChart();
    const result = convertSchema(original, 'line') as ChartComponent;

    const s = result.dataProperties.series as Series[];
    const encode = s[0].encode as { x: string; y: string };
    expect(encode.x).toBe('month');
    expect(encode.y).toBe('sales');
  });

  it('handles multi-series chart', () => {
    const multiSeries: Series[] = [
      { type: 'bar', name: 'Sales', encode: { x: 'month', y: 'sales' } },
      { type: 'bar', name: 'Profit', encode: { x: 'month', y: 'profit' } },
    ];
    const original = makeBarChart(multiSeries);
    const result = convertSchema(original, 'line') as ChartComponent;

    const s = result.dataProperties.series as Series[];
    expect(s.length).toBe(2);
    expect(s[0].type).toBe('line');
    expect(s[1].type).toBe('line');
  });
});

// ---------------------------------------------------------------------------
// convertSchema — chart → table
// ---------------------------------------------------------------------------

describe('convertSchema chart-to-table', () => {
  it('bar → table: creates TableComponent', () => {
    const original = makeBarChart();
    const result = convertSchema(original, 'table') as TableComponent;

    expect(result.type).toBe('table');
    expect(result.id).toBe('chart-1');
    expect(result.dataProperties.title).toBe('Test Chart');
  });

  it('uses existing columns when available', () => {
    const original = makeBarChart();
    const result = convertSchema(original, 'table') as TableComponent;

    const cols = result.dataProperties.columns!;
    expect(cols.length).toBe(2);
    expect(cols[0].key).toBe('month');
    expect(cols[1].key).toBe('sales');
  });

  it('derives columns from series.encode when columns empty', () => {
    const original: ChartComponent = {
      id: 'c1',
      type: 'chart',
      dataProperties: {
        dataType: 'static',
        data: [{ month: 'Jan', sales: 100 }],
        series: [
          { type: 'bar', name: 'Sales', encode: { x: 'month', y: 'sales' } },
        ],
      },
    };
    const result = convertSchema(original, 'table') as TableComponent;

    const cols = result.dataProperties.columns!;
    expect(cols.length).toBe(2);
    expect(cols.map((c) => c.key)).toContain('month');
    expect(cols.map((c) => c.key)).toContain('sales');
  });

  it('preserves data', () => {
    const original = makeBarChart();
    const result = convertSchema(original, 'table') as TableComponent;

    expect(result.dataProperties.data).toEqual(original.dataProperties.data);
  });

  it('preserves layout', () => {
    const original = makeBarChart();
    original.layout = { type: 'grid', gx: 0, gy: 0, gw: 12, gh: 6 };
    const result = convertSchema(original, 'table') as TableComponent;

    expect(result.layout).toEqual(original.layout);
  });
});

// ---------------------------------------------------------------------------
// convertSchema — table
// ---------------------------------------------------------------------------

describe('convertSchema table', () => {
  it('table → table: returns unchanged', () => {
    const table = makeTable();
    const result = convertSchema(table, 'bar');

    expect(result).toBe(table);
  });
});

// ---------------------------------------------------------------------------
// convertSchema — pie
// ---------------------------------------------------------------------------

describe('convertSchema pie', () => {
  it('pie → table: creates TableComponent', () => {
    const original = makePieChart();
    const result = convertSchema(original, 'table') as TableComponent;

    expect(result.type).toBe('table');
    expect(result.dataProperties.title).toBe('Pie Chart');
    expect(result.dataProperties.data).toEqual(original.dataProperties.data);
  });
});

// ---------------------------------------------------------------------------
// convertSchema — scatter
// ---------------------------------------------------------------------------

describe('convertSchema scatter', () => {
  it('scatter → table: creates TableComponent', () => {
    const original = makeScatterChart();
    const result = convertSchema(original, 'table') as TableComponent;

    expect(result.type).toBe('table');
    expect(result.dataProperties.data).toEqual(original.dataProperties.data);
  });
});
