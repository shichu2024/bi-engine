import type {
  Axis,
  ChartOption,
  Column,
  Series,
  ValueFormat,
} from '../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// ChartSemanticModel -- 引擎内部稳定协议
// ---------------------------------------------------------------------------

/**
 * 图表类型，根据第一个系列条目推导得出。
 *
 * 这是完整 `Series` 可辨识联合类型的缩小版本，
 * 仅反映第一阶段支持的类型。
 */
export type SeriesKind = 'line' | 'bar' | 'pie';

/**
 * 语义模型中使用的坐标轴描述符。
 *
 * 每个坐标轴携带显式的 `index`，以便下游适配器可以可靠地
 * 引用多坐标轴配置，而无需重新计算顺序。
 */
export interface SemanticAxis {
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
 * 附加到列或系列字段的格式化器描述符。
 *
 * 适配层使用此描述符来应用提示框/标签格式化，
 * 而无需直接理解 `ValueFormat`。
 */
export interface FormatterDescriptor {
  /** 此格式化器应用的数据字段（列 key） */
  field: string;
  /** 权威模型中的 `ValueFormat` 规范 */
  spec: ValueFormat;
}

/**
 * 稳定的内部协议，将权威的 `ChartComponent`
 * 与任何特定图表库的选项格式（如 ECharts option）隔离开来。
 *
 * 适配器只消费此结构，它们永远不会直接看到原始的 `ChartComponent`。
 */
export interface ChartSemanticModel {
  /** 来自权威模型的组件 ID */
  componentId: string;

  /** 根据第一个系列条目推导的图表类型 */
  seriesKind: SeriesKind;

  /** 图表标题（来自 `dataProperties.title`） */
  title: string | undefined;

  /** 标准化后的坐标轴数组（饼图为空） */
  axes: SemanticAxis[];

  /** 标准化后的系列数组（至少一个条目） */
  series: Series[];

  /** 从 `dataProperties.data` 解析的原始数据记录 */
  dataset: Record<string, unknown>[];

  /** 用于格式化和显示提示的列元数据 */
  columns: Column[];

  /** 提示框是否启用（第一阶段有数据时始终为 true） */
  tooltip: {
    enabled: boolean;
  };

  /** 从列的 `uiConfig.valueFormat` 提取的格式化器描述符 */
  formatters: FormatterDescriptor[];

  /** 主题令牌名称 -- 由宿主在渲染时解析 */
  theme: string | undefined;

  /** 合并后的图表选项，包含用户提供的 `eChartOption` */
  chartOption: ChartOption | undefined;
}

// ---------------------------------------------------------------------------
// buildSemanticModel -- 初始框架
// ---------------------------------------------------------------------------

import type { NormalizedChartComponent } from './normalize-chart-component';

/**
 * 根据标准化组件及其已解析的数据构建 `ChartSemanticModel`。
 *
 * 第一阶段行为：
 * - `dataset` 直接取自 `resolvedData`（预期为 `static` 数据源的
 *   `dataProperties.data` 数组）。
 * - `formatters` 从声明了 `valueFormat` 的列中提取。
 * - `tooltip.enabled` 在至少有一个系列时默认为 `true`。
 * - `theme` 目前保持 `undefined`；宿主可通过上下文注入。
 *
 * @param normalized - 由 `normalizeChartComponent` 产生的标准化图表组件。
 * @param resolvedData - 已解析的数据记录（第一阶段：静态数组）。
 * @returns 完整填充的 `ChartSemanticModel`。
 */
export function buildSemanticModel(
  normalized: NormalizedChartComponent,
  resolvedData: unknown,
): ChartSemanticModel {
  const dataset = normalizeDataset(resolvedData);

  const formatters = extractFormatters(normalized.columns);

  return {
    componentId: normalized.id,
    seriesKind: deriveSeriesKind(normalized.series),
    title: normalized.title,
    axes: normalized.axes,
    series: normalized.series,
    dataset,
    columns: normalized.columns,
    tooltip: {
      enabled: normalized.series.length > 0,
    },
    formatters,
    theme: undefined,
    chartOption: normalized.chartOption,
  };
}

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

function normalizeDataset(
  resolvedData: unknown,
): Record<string, unknown>[] {
  if (Array.isArray(resolvedData)) {
    return resolvedData as Record<string, unknown>[];
  }
  return [];
}

function extractFormatters(
  columns: Column[],
): FormatterDescriptor[] {
  const result: FormatterDescriptor[] = [];

  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    const valueFormat = column.uiConfig?.valueFormat;
    if (valueFormat !== undefined) {
      result.push({
        field: column.key,
        spec: valueFormat,
      });
    }
  }

  return result;
}

function deriveSeriesKind(series: Series[]): SeriesKind {
  const firstType = series[0]?.type;
  if (firstType === 'line' || firstType === 'bar' || firstType === 'pie') {
    return firstType;
  }
  // 降级处理 -- 校验后不应出现此情况，但提供安全保障。
  return 'bar';
}
