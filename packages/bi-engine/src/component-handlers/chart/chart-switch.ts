// ============================================================================
// component-handlers/chart/chart-switch.ts — 图表类型切换映射与 Schema 转换
// ============================================================================

import type {
  BIEngineComponent,
  ChartComponent,
  Column,
  Series,
  LineSeries,
  BarSeries,
  TableComponent,
  TableDataProperty,
} from '../../schema/bi-engine-models';
import type { SeriesKind } from './chart-semantic-model';

// ---------------------------------------------------------------------------
// 类型定义
// ---------------------------------------------------------------------------

/** 切换目标描述 */
export interface SwitchTarget {
  /** 目标视图类型（SeriesKind 或 'table'） */
  type: SeriesKind | 'table' | 'area';
  /** locale 词条键（用于渲染时查找翻译） */
  labelKey: string;
}

// ---------------------------------------------------------------------------
// 切换映射
// ---------------------------------------------------------------------------

/** 轴类图表可以互相切换 */
const AXIS_SWITCHABLE_KEYS: readonly string[] = ['bar', 'line', 'area', 'table'];

/** 其他图表只能切换到自身和表格 */
const OTHER_CHART_KEYS: Record<string, string> = {
  pie: 'pie',
  scatter: 'scatter',
  radar: 'radar',
  gauge: 'gauge',
  candlestick: 'candlestick',
};

/**
 * 根据当前图表类型返回可切换的目标类型列表。
 *
 * - bar / line / area → [bar, line, area, table]
 * - 其他图表 → [self, table]
 * - table → [] (不展示切换)
 */
export function getSwitchableTypes(
  seriesKind: SeriesKind,
  series?: Series[],
): SwitchTarget[] {
  // 判断是否为面积图（line + subType=area）
  const isArea = isAreaChart(series);

  if (seriesKind === 'bar' || seriesKind === 'line' || isArea) {
    return AXIS_SWITCHABLE_KEYS.map((key) => ({ type: key as SeriesKind | 'table' | 'area', labelKey: key }));
  }

  const key = OTHER_CHART_KEYS[seriesKind] ?? seriesKind;
  return [
    { type: seriesKind, labelKey: key },
    { type: 'table', labelKey: 'table' },
  ];
}

/**
 * 判断当前图表是否为面积图。
 */
export function isAreaChart(series?: Series[]): boolean {
  if (!series || series.length === 0) return false;
  const first = series[0];
  return first.type === 'line' && (first as LineSeries).subType === 'area';
}

/**
 * 从 series 数组推导出用于切换显示的 SeriesKind。
 * 面积图返回 'area' 而非 'line'。
 */
export function deriveDisplayKind(
  seriesKind: SeriesKind,
  series?: Series[],
): SeriesKind | 'area' {
  if (seriesKind === 'line' && isAreaChart(series)) {
    return 'area';
  }
  return seriesKind;
}

// ---------------------------------------------------------------------------
// Schema 转换
// ---------------------------------------------------------------------------

/**
 * 将当前组件 schema 转换为目标类型。
 *
 * 不修改原始 schema（immutable）。
 */
export function convertSchema(
  schema: BIEngineComponent,
  targetType: SwitchTarget['type'],
): BIEngineComponent {
  if (schema.type === 'chart') {
    return convertChartSchema(schema as ChartComponent, targetType);
  }
  // 表格不支持切换
  return schema;
}

function convertChartSchema(
  chart: ChartComponent,
  targetType: SwitchTarget['type'],
): BIEngineComponent {
  if (targetType === 'table') {
    return chartToTable(chart);
  }

  // chart → chart 类型转换
  return convertChartToChart(chart, targetType);
}

function chartToTable(chart: ChartComponent): TableComponent {
  const dp = chart.dataProperties;
  const columns = deriveTableColumns(chart);

  const tableData: TableDataProperty = {
    dataType: dp.dataType,
    data: dp.data ?? [],
    title: dp.title,
    columns,
  };

  return {
    id: chart.id,
    type: 'table',
    dataProperties: tableData,
    layout: chart.layout,
  };
}

/**
 * 从 chart 的 columns 或 series.encode 推导表格列定义。
 */
function deriveTableColumns(chart: ChartComponent): Column[] {
  const dp = chart.dataProperties;

  // 优先使用已有的 columns
  if (dp.columns && dp.columns.length > 0) {
    return dp.columns.map((col) => ({
      key: col.key,
      title: col.title,
      width: col.width,
    }));
  }

  // 从 series.encode 推导
  const series = dp.series ?? [];
  if (series.length === 0) return [];

  const colKeys = new Set<string>();
  const colTitles: Record<string, string> = {};

  for (const s of series) {
    const encode = s.encode as Record<string, string>;
    for (const [field, key] of Object.entries(encode)) {
      if (!colKeys.has(key)) {
        colKeys.add(key);
        colTitles[key] = colTitles[key] ?? (s.name ? `${s.name}` : key);
      }
    }
  }

  return Array.from(colKeys).map((key) => ({
    key,
    title: colTitles[key] ?? key,
  }));
}

function convertChartToChart(
  chart: ChartComponent,
  targetType: SwitchTarget['type'],
): ChartComponent {
  const dp = chart.dataProperties;
  const oldSeries = dp.series ?? [];

  const newSeries = oldSeries.map((s) => convertSeriesItem(s, targetType));

  return {
    ...chart,
    dataProperties: {
      ...dp,
      series: newSeries,
    },
  };
}

function convertSeriesItem(series: Series, targetType: SwitchTarget['type']): Series {
  switch (targetType) {
    case 'bar':
      return toBarSeries(series);
    case 'line':
      return toLineSeries(series, false);
    case 'area':
      return toLineSeries(series, true);
    default:
      return series;
  }
}

function toBarSeries(series: Series): Series {
  if (series.type === 'bar') return series;

  // 从 line/scatter 转为 bar
  const encode = series.encode as { x: string; y: string; xAxisIndex?: number; yAxisIndex?: number };
  const result: BarSeries = {
    type: 'bar',
    name: series.name,
    encode: {
      x: encode.x,
      y: encode.y,
    },
  };
  return result;
}

function toLineSeries(series: Series, isArea: boolean): Series {
  if (series.type === 'line') {
    // line ↔ area 切换
    if ((series as LineSeries).subType === 'area' && !isArea) {
      // area → line: 移除 subType
      const { subType: _, ...rest } = series as LineSeries;
      return { ...rest };
    }
    if ((series as LineSeries).subType !== 'area' && isArea) {
      // line → area: 添加 subType
      return { ...series, subType: 'area' } as LineSeries;
    }
    return series;
  }

  // bar/scatter → line/area
  const encode = series.encode as { x: string; y: string; xAxisIndex?: number; yAxisIndex?: number };
  const result: LineSeries = {
    type: 'line',
    name: series.name,
    encode: {
      x: encode.x,
      y: encode.y,
    },
    ...(isArea ? { subType: 'area' } : {}),
  };
  return result;
}
