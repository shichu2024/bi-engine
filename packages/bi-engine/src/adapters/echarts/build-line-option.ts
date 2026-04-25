import type {
  BarSeries,
  LineSeries,
  Series,
} from '../../schema/bi-engine-models';
import type { ChartSemanticModel, SemanticAxis } from '../../core/chart-semantic-model';

// ---------------------------------------------------------------------------
// ECharts 选项类型（本地定义 -- 无需 echarts 依赖）
// ---------------------------------------------------------------------------

/**
 * ECharts 选项对象的最小表示。
 *
 * 此类型有意在本地定义，以便适配层不要求 `echarts` 作为依赖。
 * 宿主组件（T-006）负责提供实际的 echarts 运行时。
 */
export interface EChartsOption {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

/**
 * 类型守卫：将 `Series` 收窄为 `LineSeries`。
 */
function isLineSeries(series: Series): series is LineSeries {
  return series.type === 'line';
}

/**
 * 类型守卫：将 `Series` 收窄为 `BarSeries`。
 */
function isBarSeries(series: Series): series is BarSeries {
  return series.type === 'bar';
}

/**
 * 使用第一个笛卡尔坐标系系列的 `encode.x` 字段从数据集中提取类目数据（x 轴刻度值）。
 */
function extractCategoryData(
  model: ChartSemanticModel,
): unknown[] {
  const firstCartesian = model.series.find(
    (s) => s.type === 'line' || s.type === 'bar',
  ) as LineSeries | BarSeries | undefined;

  if (firstCartesian === undefined) {
    return [];
  }

  const xField = firstCartesian.encode.x;
  const result: unknown[] = [];

  for (let i = 0; i < model.dataset.length; i++) {
    result.push(model.dataset[i][xField]);
  }

  return result;
}

/**
 * 根据给定系列的 `encode.y` 字段构建 y 轴数据数组。
 */
function extractSeriesYData(
  model: ChartSemanticModel,
  yField: string,
): unknown[] {
  const result: unknown[] = [];

  for (let i = 0; i < model.dataset.length; i++) {
    result.push(model.dataset[i][yField]);
  }

  return result;
}

/**
 * 将 `SemanticAxis[]` 转换为 ECharts 选项的 x 轴部分。
 *
 * 当存在多个 x 轴时，每个都会被渲染。当数据基于类目时，
 * `data` 仅设置在第一个 x 轴上（ECharts 约定）。
 */
function buildXAxes(
  axes: SemanticAxis[],
  categoryData: unknown[],
): Record<string, unknown>[] {
  const xAxes = axes.filter((a) => a.direction === 'x');

  if (xAxes.length === 0) {
    return [{ type: 'category', data: categoryData }];
  }

  const result: Record<string, unknown>[] = [];

  for (let i = 0; i < xAxes.length; i++) {
    const axis = xAxes[i];
    const entry: Record<string, unknown> = {
      type: axis.type,
    };

    if (axis.name !== undefined) {
      entry.name = axis.name;
    }

    // ECharts 约定：类目数据放在第一个 x 轴上。
    if (i === 0 && axis.type === 'category') {
      entry.data = categoryData;
    }

    result.push(entry);
  }

  return result;
}

/**
 * 将 `SemanticAxis[]` 转换为 ECharts 选项的 y 轴部分。
 */
function buildYAxes(
  axes: SemanticAxis[],
): Record<string, unknown>[] {
  const yAxes = axes.filter((a) => a.direction === 'y');

  if (yAxes.length === 0) {
    return [{ type: 'value' }];
  }

  const result: Record<string, unknown>[] = [];

  for (let i = 0; i < yAxes.length; i++) {
    const axis = yAxes[i];
    const entry: Record<string, unknown> = {
      type: axis.type,
    };

    if (axis.name !== undefined) {
      entry.name = axis.name;
    }

    result.push(entry);
  }

  return result;
}

/**
 * 构建笛卡尔坐标系图表的默认提示框配置。
 */
function buildCartesianTooltip(): Record<string, unknown> {
  return {
    trigger: 'axis',
  };
}

/**
 * 构建默认图例配置。
 */
function buildLegend(seriesNames: string[]): Record<string, unknown> {
  return {
    show: seriesNames.length > 1,
    data: seriesNames,
  };
}

// ---------------------------------------------------------------------------
// buildLineOption
// ---------------------------------------------------------------------------

/**
 * 从 `ChartSemanticModel` 构建折线/面积图的 ECharts 选项对象。
 *
 * 职责：
 * - 将折线系列条目映射为 ECharts 系列定义。
 * - 当 `subType === 'area'` 时设置 `areaStyle`。
 * - 从语义模型解析坐标轴索引。
 * - 为提示框、图例、xAxis、yAxis 提供合理的默认值。
 *
 * 适配器不执行业务校验；该工作由上游校验器处理。
 *
 * @param model - 完全解析的语义模型。
 * @returns 可供 ECharts 运行时使用的 `EChartsOption`。
 */
export function buildLineOption(model: ChartSemanticModel): EChartsOption {
  const categoryData = extractCategoryData(model);
  const seriesNames: string[] = [];
  const echartsSeries: Record<string, unknown>[] = [];

  for (let i = 0; i < model.series.length; i++) {
    const s = model.series[i];

    if (!isLineSeries(s)) {
      continue;
    }

    seriesNames.push(s.name);

    const seriesEntry: Record<string, unknown> = {
      type: 'line',
      name: s.name,
      data: extractSeriesYData(model, s.encode.y),
      xAxisIndex: s.encode.xAxisIndex ?? 0,
      yAxisIndex: s.encode.yAxisIndex ?? 0,
    };

    if (s.subType === 'area') {
      seriesEntry.areaStyle = {};
    }

    echartsSeries.push(seriesEntry);
  }

  const option: EChartsOption = {
    tooltip: buildCartesianTooltip(),
    legend: buildLegend(seriesNames),
    xAxis: buildXAxes(model.axes, categoryData),
    yAxis: buildYAxes(model.axes),
    series: echartsSeries,
  };

  return option;
}

// ---------------------------------------------------------------------------
// buildBarOption
// ---------------------------------------------------------------------------

/**
 * 从 `ChartSemanticModel` 构建柱状/条形图的 ECharts 选项对象。
 *
 * 职责：
 * - 将柱状系列条目映射为 ECharts 系列定义。
 * - 当 `subType === 'horizontal'` 时交换 x/y 轴角色。
 * - 从语义模型解析坐标轴索引。
 * - 为提示框、图例、xAxis、yAxis 提供合理的默认值。
 *
 * @param model - 完全解析的语义模型。
 * @returns 可供 ECharts 运行时使用的 `EChartsOption`。
 */
export function buildBarOption(model: ChartSemanticModel): EChartsOption {
  // 检测是否为水平条形图（取第一个柱状系列的 subType）
  const firstBar = model.series.find(isBarSeries) as BarSeries | undefined;
  const isHorizontal = firstBar?.subType === 'horizontal';

  const categoryData = extractCategoryData(model);
  const seriesNames: string[] = [];
  const echartsSeries: Record<string, unknown>[] = [];

  for (let i = 0; i < model.series.length; i++) {
    const s = model.series[i];

    if (!isBarSeries(s)) {
      continue;
    }

    seriesNames.push(s.name);

    const seriesEntry: Record<string, unknown> = {
      type: 'bar',
      name: s.name,
      data: extractSeriesYData(model, s.encode.y),
      xAxisIndex: s.encode.xAxisIndex ?? 0,
      yAxisIndex: s.encode.yAxisIndex ?? 0,
    };

    echartsSeries.push(seriesEntry);
  }

  // 对于条形图（水平柱状图），x 轴为数值轴，y 轴为类目轴。
  // encode 保持语义：x = 类目，y = 数值；水平模式只交换坐标轴渲染。
  const xAxisConfig = isHorizontal
    ? [{ type: 'value' as const }]
    : buildXAxes(model.axes, categoryData);

  const yAxisConfig = isHorizontal
    ? [{ type: 'category' as const, data: categoryData }]
    : buildYAxes(model.axes);

  const option: EChartsOption = {
    tooltip: buildCartesianTooltip(),
    legend: buildLegend(seriesNames),
    xAxis: xAxisConfig,
    yAxis: yAxisConfig,
    series: echartsSeries,
  };

  return option;
}
