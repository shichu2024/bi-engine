// ============================================================================
// extension-roadmap -- 未来阶段的计划扩展点
// ============================================================================
//
// 用途：
//   描述 bi-engine 图表渲染管道在第一阶段之后的扩展路线图。
//   这是一个面向文档的模块，将能力领域映射到其当前状态和预期实现路径。
//
// 此模块不导出运行时值。它作为贡献者和消费者规划集成工作的参考。
// ============================================================================

/**
 * 计划扩展领域的就绪状态。
 */
export type ExtensionReadiness =
  /** 在权威模型中已定义但尚未实现 */
  | 'model-only'
  /** `src/roadmap/` 中存在契约接口但无实现 */
  | 'contract-ready'
  /** 部分实现（如某些系列类型已完成，其他待完成） */
  | 'partial'
  /** 已完全实现并有测试覆盖 */
  | 'complete';

/**
 * 描述单个扩展领域及其状态和依赖关系。
 */
export interface ExtensionArea {
  /** 此扩展领域的稳定标识符 */
  readonly id: string;
  /** 人类可读的名称 */
  readonly name: string;
  /** 当前就绪状态 */
  readonly readiness: ExtensionReadiness;
  /**
   * 对权威模型类型或契约接口的引用，
   * 此扩展领域依赖或将要实现的。
   */
  readonly references: ReadonlyArray<string>;
  /** 需要构建的内容描述 */
  readonly description: string;
  /**
   * 必须在此扩展开始前完成的其他扩展领域。
   * 空数组表示除了第一阶段外无硬依赖。
   */
  readonly dependsOn: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// 扩展路线图。
//
// 每个条目代表权威模型在类型级别已支持但渲染引擎尚未执行的的能力。
// 顺序大致反映建议的实现优先级。
// ---------------------------------------------------------------------------

export const EXTENSION_ROADMAP: ReadonlyArray<ExtensionArea> = [
  // ---- 数据解析扩展 ----
  {
    id: 'ext-api-resolver',
    name: 'API Data Resolver',
    readiness: 'contract-ready',
    references: [
      'ApiResolver (src/roadmap/api-resolver.ts)',
      'DataProperty.url',
      'DataProperty.method',
      'DataProperty.autoRefresh',
      'DataProperty.refreshInterval',
    ],
    description:
      '实现 ApiResolver 契约，使 `dataType: "api"` 的组件可以在渲染时从远程端点获取数据。' +
      '宿主层（ChartView）应使用 autoRefresh/refreshInterval 管理刷新生命周期，' +
      '而解析器处理单次获取。',
    dependsOn: [],
  },
  {
    id: 'ext-datasource-resolver',
    name: 'Datasource Resolver',
    readiness: 'contract-ready',
    references: [
      'DatasourceResolver (src/roadmap/datasource-resolver.ts)',
      'DataProperty.sourceId',
    ],
    description:
      '实现 DatasourceResolver 契约，使 `dataType: "datasource"` 的组件可以从命名数据源' +
      '注册表解析数据。需要一个数据源配置层（连接字符串、查询模板、凭据管理），' +
      '该层在引擎范围之外。',
    dependsOn: [],
  },

  // ---- 系列类型扩展 ----
  {
    id: 'ext-scatter-series',
    name: 'Scatter Series Support',
    readiness: 'model-only',
    references: [
      'ScatterSeries (bi-engine-models.ts)',
      'UNSUPPORTED_SERIES_MAP entry: scatter',
    ],
    description:
      '添加散点图渲染。需要扩展校验器支持矩阵、添加 build-scatter-option 适配器，' +
      '并更新 SeriesKind 类型以包含 "scatter"。Encode 使用与 line/bar 相同的 x/y。',
    dependsOn: [],
  },
  {
    id: 'ext-radar-series',
    name: 'Radar Series Support',
    readiness: 'model-only',
    references: [
      'RadarSeries (bi-engine-models.ts)',
      'UNSUPPORTED_SERIES_MAP entry: radar',
    ],
    description:
      '添加雷达图渲染。需要一个权威模型中尚不存在的"雷达指示器"配置。' +
      '适配器必须从列元数据或新的平台扩展字段构建 ECharts radar.indicator。',
    dependsOn: [],
  },
  {
    id: 'ext-gauge-series',
    name: 'Gauge Series Support',
    readiness: 'model-only',
    references: [
      'GaugeSeries (bi-engine-models.ts)',
      'UNSUPPORTED_SERIES_MAP entry: gauge',
    ],
    description:
      '添加仪表盘图渲染。模型已定义 GaugeSeries.config 包含 min、max 和 unit。' +
      '适配器需要将这些映射到 ECharts 仪表盘选项。无需笛卡尔坐标轴。',
    dependsOn: [],
  },
  {
    id: 'ext-candlestick-series',
    name: 'Candlestick Series Support',
    readiness: 'model-only',
    references: [
      'CandlestickSeries (bi-engine-models.ts)',
      'UNSUPPORTED_SERIES_MAP entry: candlestick',
    ],
    description:
      '添加 K 线图渲染。需要将扁平数据记录重构为 [open, close, low, high] 元组。' +
      '需要笛卡尔坐标轴，通常 x 轴为表示时间周期的类目轴。',
    dependsOn: [],
  },

  // ---- 交互扩展 ----
  {
    id: 'ext-interaction-handler',
    name: 'Interaction Handler',
    readiness: 'contract-ready',
    references: [
      'InteractionHandler (src/roadmap/interaction-handler.ts)',
      'Interaction (bi-engine-models.ts)',
      'InteractionTrigger',
      'InteractionTarget',
    ],
    description:
      '实现 InteractionHandler 契约，使声明 `interactions` 的组件可以响应 click、' +
      'hover、change 和 select 动作。处理器应接入宿主层（而非引擎核心），' +
      '并支持 filter、jump 和 highlight 目标类型。这是跨组件仪表盘的基础。',
    dependsOn: [],
  },
  {
    id: 'ext-cross-component-filter',
    name: 'Cross-Component Filter (Dashboard)',
    readiness: 'model-only',
    references: [
      'InteractionTarget.type === "filter"',
      'InteractionTarget.params',
      'Dashboard (bi-engine-models.ts)',
    ],
    description:
      '在 Dashboard 中启用组件之间的过滤器类型交互。需要 InteractionHandler ' +
      '加上一个共享状态层，将过滤参数从源组件映射到目标组件的数据查询。' +
      '这主要是宿主层的关注点。',
    dependsOn: ['ext-interaction-handler'],
  },
] as const;
