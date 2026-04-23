// ============================================================================
// bi-engine/core -- 聚合 barrel export
// ============================================================================
//
// 将 validator、model、data、errors 四个模块的公开 API
// 合并到单一入口点，便于消费者统一导入。
//
// ============================================================================

// ---- 校验器 ----
export {
  validateChartComponent,
  ValidationErrorKind,
} from './validate-chart-component';
export type {
  ValidationError,
  ValidationResult,
} from './validate-chart-component';

// ---- 标准化 ----
export {
  normalizeChartComponent,
} from './normalize-chart-component';
export type {
  NormalizedAxis,
  NormalizedChartComponent,
} from './normalize-chart-component';

// ---- 语义模型 ----
export {
  buildSemanticModel,
} from './chart-semantic-model';
export type {
  ChartSemanticModel,
  SeriesKind,
  SemanticAxis,
  FormatterDescriptor,
} from './chart-semantic-model';

// ---- 数据解析 ----
export {
  resolveChartData,
} from './resolve-chart-data';
export type {
  ResolvedData,
  UnsupportedResult as DataUnsupportedResult,
} from './resolve-chart-data';

// ---- 系列数据构建 ----
export {
  buildSeriesData,
} from './build-series-data';
export type {
  SeriesDataset,
  CartesianSeriesDataset,
  PieSeriesDataset,
  CartesianDataPoint,
  PieDataPoint,
} from './build-series-data';

// ---- 错误 ----
export {
  ChartRenderError,
  ChartRenderErrorCategory,
  createValidationError,
  createDataError,
  createRenderError,
} from './chart-render-error';
