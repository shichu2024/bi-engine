// ============================================================================
// component-handlers/chart/index.ts
// ============================================================================

export { chartHandler } from './chart-handler';

export {
  validateChartComponent,
  ValidationErrorKind,
} from './chart-validator';
export type {
  ValidationError,
  ValidationResult,
} from './chart-validator';

export {
  normalizeChartComponent,
} from './chart-normalizer';
export type {
  NormalizedAxis,
  NormalizedChartComponent,
} from './chart-normalizer';

export {
  resolveChartData,
} from './chart-resolver';
export type {
  ResolvedData,
  UnsupportedResult as DataUnsupportedResult,
} from './chart-resolver';

export {
  buildSemanticModel,
} from './chart-semantic-model';
export type {
  ChartSemanticModel,
  SeriesKind,
  SemanticAxis,
  FormatterDescriptor,
} from './chart-semantic-model';

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
