import type {
  Series,
  LineSeries,
  BarSeries,
  PieSeries,
} from '../schema/bi-engine-models';

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

/**
 * 可供适配器直接消费的系列级数据结构。
 *
 * 每个条目对应组件定义中的一个 `Series`，
 * 数据根据其 `encode` 映射提取。
 */
export type SeriesDataset = CartesianSeriesDataset | PieSeriesDataset;

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
    }
    // 不支持的系列类型被静默跳过。
    // 它们应该已经由 validateChartComponent 标记。
  }

  return result;
}
