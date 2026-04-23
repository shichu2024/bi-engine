// ============================================================================
// roadmap -- 扩展规划模块的桶导出
// ============================================================================
//
// 这些模块记录了未来阶段的计划扩展点。
// 它们导出类型和只读数据结构仅供参考；
// 不附带任何运行时行为。
// ============================================================================

// ---- 扩展路线图 ----
export type {
  ExtensionReadiness,
  ExtensionArea,
} from './extension-roadmap';

export { EXTENSION_ROADMAP } from './extension-roadmap';

// ---- 不支持的系列映射 ----
export type {
  SeriesEncodeDescriptor,
  UnsupportedSeriesEntry,
} from './unsupported-series-map';

export { UNSUPPORTED_SERIES_MAP } from './unsupported-series-map';

// ---- 数据源解析契约 ----
export type {
  DatasourceResolver,
  DatasourceResolveParams,
} from './datasource-resolver';

// ---- API 解析契约 ----
export type {
  ApiResolver,
  ApiResolveParams,
} from './api-resolver';

// ---- 交互处理契约 ----
export type {
  InteractionHandler,
  InteractionContext,
  InteractionDispatchResult,
} from './interaction-handler';
