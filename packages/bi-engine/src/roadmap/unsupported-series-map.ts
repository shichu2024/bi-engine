// ============================================================================
// unsupported-series-map -- 尚未被渲染管道支持的系列类型能力注册表
// ============================================================================
//
// 用途：
//   记录权威模型中定义的每个不支持的系列类型、
//   其所需的数据 encode 结构以及任何附加配置。
//   此信息帮助未来实现者理解每个系列类型的需求，
//   而无需重新阅读模型定义。
//
// 第一阶段限制：
//   仅支持 `LineSeries`、`BarSeries` 和 `PieSeries`。
//   `Series` 联合类型中的所有其他系列类型在第一阶段
//   会产生 `UNSUPPORTED_SERIES_TYPE` 校验错误。
//
// 与权威模型的对齐：
//   此映射中的每个条目直接对应 `bi-engine-models.ts` 中定义的系列接口。
//   不引入新类型或新字段。
// ============================================================================

/**
 * 描述不支持的系列类型所需的 encode 结构。
 *
 * 每个字段名映射到该 encode 字段在该系列类型上下文中
 * 的人类可读描述。
 */
export interface SeriesEncodeDescriptor {
  /** Encode 字段名（如 'x'、'y'、'open'、'close'） */
  field: string;
  /** 此 encode 字段的含义 */
  description: string;
}

/**
 * 描述一个不支持的系列类型以及支持它所需的工作。
 */
export interface UnsupportedSeriesEntry {
  /** 系列类型字符串，与模型中的 `type` 判别符匹配 */
  seriesType: string;
  /** 权威模型接口名（如 'ScatterSeries'） */
  modelInterface: string;
  /** 此系列类型是否需要笛卡尔坐标轴（xAxis / yAxis） */
  requiresCartesianAxes: boolean;
  /** 此系列类型期望的 encode 字段 */
  encodeFields: SeriesEncodeDescriptor[];
  /**
   * 关于适配器实现需要处理的附加说明
   * （如子类型、平台特有配置）。
   */
  implementationNotes: string;
}

// ---------------------------------------------------------------------------
// 不支持系列的能力映射。
//
// 顺序与 bi-engine-models.ts 中 `Series` 联合类型匹配：
// ScatterSeries, RadarSeries, GaugeSeries, CandlestickSeries。
// ---------------------------------------------------------------------------

export const UNSUPPORTED_SERIES_MAP: ReadonlyArray<UnsupportedSeriesEntry> = [
  {
    seriesType: 'scatter',
    modelInterface: 'ScatterSeries',
    requiresCartesianAxes: true,
    encodeFields: [
      { field: 'x', description: '水平（x 轴）坐标对应的数据键。' },
      { field: 'y', description: '垂直（y 轴）坐标对应的数据键。' },
      { field: 'xAxisIndex', description: '多坐标轴配置的可选索引。' },
      { field: 'yAxisIndex', description: '多坐标轴配置的可选索引。' },
    ],
    implementationNotes:
      'ScatterSeries 未定义 subType。适配器需要将 encode.x 和 encode.y ' +
      '映射到散点系列选项。ECharts 开箱支持 symbolSize 和 itemStyle，' +
      '可以由未来的平台扩展驱动。',
  },
  {
    seriesType: 'radar',
    modelInterface: 'RadarSeries',
    requiresCartesianAxes: false,
    encodeFields: [
      { field: 'name', description: '维度名称的数据键（如每个雷达轴上的类目标签）。' },
      { field: 'value', description: '每个维度上度量值的数据键。' },
    ],
    implementationNotes:
      'RadarSeries 需要一个独立的"雷达指示器"配置，定义维度及其最小/最大范围。' +
      '权威模型尚未包含雷达指示器定义；需要从列元数据中推导，' +
      '或作为新的平台扩展字段添加。',
  },
  {
    seriesType: 'gauge',
    modelInterface: 'GaugeSeries',
    requiresCartesianAxes: false,
    encodeFields: [
      { field: 'value', description: '仪表盘上显示的单一度量值的数据键。' },
    ],
    implementationNotes:
      'GaugeSeries 携带一个可选的 `config` 对象，包含 min、max 和 unit。' +
      '适配器需要将这些映射到仪表盘特有的选项（如 ECharts 的 ' +
      'gauge.axisLine、gauge.pointer）。模型已定义所需字段；只需编写适配器。',
  },
  {
    seriesType: 'candlestick',
    modelInterface: 'CandlestickSeries',
    requiresCartesianAxes: true,
    encodeFields: [
      { field: 'open', description: '开盘价的数据键。' },
      { field: 'close', description: '收盘价的数据键。' },
      { field: 'low', description: '最低价的数据键。' },
      { field: 'high', description: '最高价的数据键。' },
    ],
    implementationNotes:
      'CandlestickSeries 需要四个 encode 字段。适配器需要将扁平数据记录' +
      '重构为 ECharts K 线系列期望的 [open, close, low, high] 元组。' +
      'x 轴通常是表示时间周期的类目轴。',
  },
] as const;
