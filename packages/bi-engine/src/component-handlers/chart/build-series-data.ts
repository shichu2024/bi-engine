import type {
  Series,
  LineSeries,
  BarSeries,
  PieSeries,
  ScatterSeries,
  RadarSeries,
  CandlestickSeries,
  GaugeSeries,
} from '../../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 输出类型
// ---------------------------------------------------------------------------

/** 从笛卡尔坐标系（折线/柱状）系列中提取的单个数据点 */
export interface CartesianDataPoint {
  x: unknown;
  y: unknown;
}

/** 从饼图系列中提取的单个数据点 */
export interface PieDataPoint {
  name: unknown;
  value: unknown;
}

/** 折线或柱状系列的数据集，携带坐标轴索引引用 */
export interface CartesianSeriesDataset {
  /** 系列类型：'line' 或 'bar' */
  seriesType: 'line' | 'bar';
  /** 系列名称（用于图例） */
  seriesName: string;
  /** 可选的子类型（如折线的 'area'，柱状的 'horizontal'） */
  subType?: string;
  /** 引用的 x 轴索引（从 0 开始） */
  xAxisIndex: number;
  /** 引用的 y 轴索引（从 0 开始） */
  yAxisIndex: number;
  /** 提取的数据点 */
  data: CartesianDataPoint[];
}

/** 饼图系列的数据集 */
export interface PieSeriesDataset {
  /** 系列类型：始终为 'pie' */
  seriesType: 'pie';
  /** 系列名称（用于图例） */
  seriesName: string;
  /** 可选的子类型（如 'ring'） */
  subType?: string;
  /** 提取的数据点 */
  data: PieDataPoint[];
}

/** 从散点系列中提取的单个数据点 */
export interface ScatterDataPoint {
  x: number;
  y: number;
}

/** 从雷达系列中提取的单个数据点 */
export interface RadarDataPoint {
  name: string;
  value: number[];
}

/** 从蜡烛图系列中提取的单个数据点 */
export interface CandlestickDataPoint {
  open: number;
  close: number;
  low: number;
  high: number;
  x?: string;
}

/** 从仪表盘系列中提取的单个数据点 */
export interface GaugeDataPoint {
  value: number;
}

/** 散点系列的数据集，携带坐标轴索引引用 */
export interface ScatterSeriesDataset extends CartesianSeriesDataset {
  seriesType: 'scatter';
  data: ScatterDataPoint[];
}

/** 雷达系列的数据集 */
export interface RadarSeriesDataset {
  seriesType: 'radar';
  seriesName: string;
  subType?: string;
  data: RadarDataPoint[];
}

/** 蜡烛图系列的数据集，携带坐标轴索引引用 */
export interface CandlestickSeriesDataset extends CartesianSeriesDataset {
  seriesType: 'candlestick';
  data: CandlestickDataPoint[];
}

/** 仪表盘系列的数据集 */
export interface GaugeSeriesDataset {
  seriesType: 'gauge';
  seriesName: string;
  subType?: string;
  data: GaugeDataPoint[];
}

/**
 * 可供适配器直接消费的系列级数据结构。
 *
 * 每个条目对应组件定义中的一个 `Series`，
 * 数据根据其 `encode` 映射提取。
 */
export type SeriesDataset =
  | CartesianSeriesDataset
  | PieSeriesDataset
  | ScatterSeriesDataset
  | RadarSeriesDataset
  | CandlestickSeriesDataset
  | GaugeSeriesDataset;

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

function isLineSeries(series: Series): series is LineSeries {
  return series.type === 'line';
}

function isBarSeries(series: Series): series is BarSeries {
  return series.type === 'bar';
}

function isPieSeries(series: Series): series is PieSeries {
  return series.type === 'pie';
}

function isScatterSeries(series: Series): series is ScatterSeries {
  return series.type === 'scatter';
}

function isRadarSeries(series: Series): series is RadarSeries {
  return series.type === 'radar';
}

function isCandlestickSeries(series: Series): series is CandlestickSeries {
  return series.type === 'candlestick';
}

function isGaugeSeries(series: Series): series is GaugeSeries {
  return series.type === 'gauge';
}

function buildCartesianData(
  encode: { x: string; y: string },
  data: Record<string, unknown>[],
): CartesianDataPoint[] {
  const result: CartesianDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    result.push({
      x: row[encode.x],
      y: row[encode.y],
    });
  }

  return result;
}

function buildPieData(
  encode: { name: string; value: string },
  data: Record<string, unknown>[],
): PieDataPoint[] {
  const result: PieDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    result.push({
      name: row[encode.name],
      value: row[encode.value],
    });
  }

  return result;
}

function buildScatterData(
  encode: { x: string; y: string },
  data: Record<string, unknown>[],
): ScatterDataPoint[] {
  const result: ScatterDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    result.push({
      x: Number(row[encode.x]),
      y: Number(row[encode.y]),
    });
  }

  return result;
}

function buildRadarData(
  encode: { name: string; value: string },
  data: Record<string, unknown>[],
): RadarDataPoint[] {
  const result: RadarDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rawValue = row[encode.value];
    const values = Array.isArray(rawValue)
      ? rawValue.map((v) => Number(v))
      : [Number(rawValue)];
    result.push({
      name: String(row[encode.name]),
      value: values,
    });
  }

  return result;
}

function buildCandlestickData(
  encode: { open: string; close: string; low: string; high: string },
  data: Record<string, unknown>[],
): CandlestickDataPoint[] {
  const result: CandlestickDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    result.push({
      open: Number(row[encode.open]),
      close: Number(row[encode.close]),
      low: Number(row[encode.low]),
      high: Number(row[encode.high]),
    });
  }

  return result;
}

function buildGaugeData(
  encode: { value: string },
  data: Record<string, unknown>[],
): GaugeDataPoint[] {
  const result: GaugeDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    result.push({
      value: Number(row[encode.value]),
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// 主构建器
// ---------------------------------------------------------------------------

/**
 * 根据每个系列的 `encode` 映射提取数据字段，构建系列级数据集。
 *
 * 支持的系列类型（第一阶段）：
 * - `LineSeries`：提取 `x` 和 `y` 字段，遵循 `xAxisIndex` / `yAxisIndex`。
 * - `BarSeries`：与折线相同。
 * - `PieSeries`：提取 `name` 和 `value` 字段。
 * - `ScatterSeries`：提取 `x` 和 `y` 数值字段。
 * - `RadarSeries`：提取 `name` 和 `value` 字段。
 * - `CandlestickSeries`：提取 `open`、`close`、`low`、`high` 字段。
 * - `GaugeSeries`：提取 `value` 字段。
 *
 * 未列出的系列类型会被静默跳过（预期已由管道中上游的校验器标记为不支持）。
 *
 * @param series - 图表组件中的系列定义数组。
 * @param data - 已解析的数据记录。
 * @returns `SeriesDataset` 条目数组，每个支持的系列一个。
 */
export function buildSeriesData(
  series: Series[],
  data: Record<string, unknown>[],
): SeriesDataset[] {
  const result: SeriesDataset[] = [];

  for (let i = 0; i < series.length; i++) {
    const s = series[i];

    if (isLineSeries(s)) {
      result.push({
        seriesType: 'line',
        seriesName: s.name,
        subType: s.subType,
        xAxisIndex: s.encode.xAxisIndex ?? 0,
        yAxisIndex: s.encode.yAxisIndex ?? 0,
        data: buildCartesianData(s.encode, data),
      });
    } else if (isBarSeries(s)) {
      result.push({
        seriesType: 'bar',
        seriesName: s.name,
        subType: s.subType,
        xAxisIndex: s.encode.xAxisIndex ?? 0,
        yAxisIndex: s.encode.yAxisIndex ?? 0,
        data: buildCartesianData(s.encode, data),
      });
    } else if (isPieSeries(s)) {
      result.push({
        seriesType: 'pie',
        seriesName: s.name,
        subType: s.subType,
        data: buildPieData(s.encode, data),
      });
    } else if (isScatterSeries(s)) {
      result.push({
        seriesType: 'scatter',
        seriesName: s.name,
        subType: s.subType,
        xAxisIndex: s.encode.xAxisIndex ?? 0,
        yAxisIndex: s.encode.yAxisIndex ?? 0,
        data: buildScatterData(s.encode, data),
      });
    } else if (isRadarSeries(s)) {
      result.push({
        seriesType: 'radar',
        seriesName: s.name,
        subType: s.subType,
        data: buildRadarData(s.encode, data),
      });
    } else if (isCandlestickSeries(s)) {
      result.push({
        seriesType: 'candlestick',
        seriesName: s.name,
        subType: s.subType,
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: buildCandlestickData(s.encode, data),
      });
    } else if (isGaugeSeries(s)) {
      result.push({
        seriesType: 'gauge',
        seriesName: s.name,
        subType: s.subType,
        data: buildGaugeData(s.encode, data),
      });
    }
    // 不支持的系列类型被静默跳过。
    // 它们应该已经由 validateChartComponent 标记。
  }

  return result;
}
