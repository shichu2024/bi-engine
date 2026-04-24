import type {
  Axis,
  ChartComponent,
  ChartOption,
  Column,
  ComponentLayout,
  Series,
} from '../../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// NormalizedChartComponent 类型
// ---------------------------------------------------------------------------

/**
 * `NormalizedChartComponent` 中承载的标准化坐标轴描述符。
 *
 * 与权威 `Axis`（在 `ChartComponent.xAxis / yAxis` 中可能是单个对象或数组）不同，
 * 此类型始终是扁平数组的一个元素，内嵌方向和索引信息。
 */
export interface NormalizedAxis {
  /** 同方向同级坐标轴中从 0 开始的位置索引 */
  index: number;
  /** 坐标轴方向 */
  direction: 'x' | 'y';
  /** 来自权威模型的坐标轴类型 */
  type: Axis['type'];
  /** 可选的人类可读坐标轴名称 */
  name?: string;
}

/**
 * `ChartComponent` 的稳定、完全解析的内部表示。
 *
 * 设计目标：
 * 1. 消除坐标轴可选的"单个 vs 数组"歧义。
 * 2. 保证 `series`、`columns`、`data` 和 `title` 存在
 *    （可能为空/默认值），使下游消费者无需进行空值检查。
 * 3. 提供单一扁平结构，语义模型和适配器可以直接依赖，
 *    无需重新遍历原始组件。
 */
export interface NormalizedChartComponent {
  /** 来自权威模型的组件 ID */
  id: string;

  /** 图表标题（`dataProperties.title`，可能为 undefined） */
  title: string | undefined;

  /** 标准化坐标轴 -- 始终为扁平数组。饼图为空。 */
  axes: NormalizedAxis[];

  /** 系列数组（校验后至少一个条目） */
  series: Series[];

  /** 列元数据（`dataProperties.columns`，默认为空） */
  columns: Column[];

  /** 原始数据记录（`dataProperties.data`，默认为空） */
  data: Record<string, unknown>[];

  /** 来自 `dataProperties` 的数据类型 */
  dataType: 'static' | 'datasource' | 'api';

  /** 标准化图表选项（始终存在，字段携带默认值） */
  chartOption: ChartOption | undefined;

  /** 来自组件的布局信息（如存在） */
  layout: ComponentLayout | undefined;
}

// ---------------------------------------------------------------------------
// 默认值
// ---------------------------------------------------------------------------

/** 共享的可变空数组，用作默认值。未冻结以保持类型可赋值。 */
const EMPTY_COLUMNS: Column[] = [];
const EMPTY_DATA: Record<string, unknown>[] = [];

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

/**
 * 将单个 `Axis` 或 `Axis` 数组标准化为 `NormalizedAxis` 条目的扁平数组，
 * 每个条目标记方向和从 0 开始的索引。
 */
function normalizeAxes(
  raw: Axis | Axis[] | undefined,
  direction: 'x' | 'y',
): NormalizedAxis[] {
  if (raw === undefined) {
    return [];
  }

  const items: Axis[] = Array.isArray(raw) ? raw : [raw];

  const result: NormalizedAxis[] = [];
  for (let i = 0; i < items.length; i++) {
    const axis = items[i];
    result.push({
      index: i,
      direction,
      type: axis.type,
      name: axis.name,
    });
  }

  return result;
}

/**
 * 判断组件是否包含任何笛卡尔坐标系（非饼图）系列。
 */
function hasCartesianSeries(series: Series[]): boolean {
  for (let i = 0; i < series.length; i++) {
    const s = series[i];
    if (s.type === 'line' || s.type === 'bar' || s.type === 'scatter' || s.type === 'candlestick') {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// 主标准化函数
// ---------------------------------------------------------------------------

/**
 * 将已校验的 `ChartComponent` 转换为 `NormalizedChartComponent`。
 *
 * 标准化规则：
 * - `xAxis / yAxis` 合并为带方向和索引的单一扁平 `axes` 数组。
 *   即使原始组件上存在坐标轴，饼图也会产生空坐标轴数组
 *   （校验应该已捕获此问题，但标准化器采用防御性处理）。
 * - `series` 原样传递（已校验）。
 * - `columns` 缺失时默认为空数组。
 * - `data` 缺失时默认为空数组。
 * - `chartOption` 原样保留（第一阶段不做深度合并）。
 * - `layout` 原样保留。
 *
 * @param component - 结构有效的 `ChartComponent`。调用方应先运行
 *   `validateChartComponent`，仅在 `ok === true` 时继续。
 * @returns 完整填充的 `NormalizedChartComponent`。
 */
export function normalizeChartComponent(
  component: ChartComponent,
): NormalizedChartComponent {
  const dp = component.dataProperties;
  const series = dp.series ?? [];
  const isCartesian = hasCartesianSeries(series);

  // 仅对笛卡尔坐标系图表构建坐标轴；饼图获得空数组。
  const xAxisEntries = isCartesian
    ? normalizeAxes(component.xAxis, 'x')
    : [];
  const yAxisEntries = isCartesian
    ? normalizeAxes(component.yAxis, 'y')
    : [];

  // 将 x 和 y 坐标轴合并为单一扁平数组（x 在前，y 在后）。
  const axes: NormalizedAxis[] = [...xAxisEntries, ...yAxisEntries];

  const columns: Column[] = dp.columns !== undefined && dp.columns.length > 0
    ? dp.columns
    : (EMPTY_COLUMNS as Column[]);

  const data: Record<string, unknown>[] = dp.data !== undefined && dp.data.length > 0
    ? dp.data
    : (EMPTY_DATA as Record<string, unknown>[]);

  return {
    id: component.id,
    title: dp.title,
    axes,
    series,
    columns,
    data,
    dataType: dp.dataType,
    chartOption: component.options ?? undefined,
    layout: component.layout ?? undefined,
  };
}
