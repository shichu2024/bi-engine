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

// ---- 图表切换 ----
export {
  getSwitchableTypes,
  convertSchema,
  isAreaChart,
  deriveDisplayKind,
} from './chart-switch';
export type {
  SwitchTarget,
} from './chart-switch';

export { ChartSwitchToolbar } from './ChartSwitchToolbar';
export type { ChartSwitchToolbarProps } from './ChartSwitchToolbar';

export {
  CHART_TYPE_ICONS,
  BarIcon,
  LineIcon,
  AreaIcon,
  TableIcon,
  PieIcon,
  ScatterIcon,
  RadarIcon,
  GaugeIcon,
  CandlestickIcon,
} from './chart-icons';
export type { ChartIconProps } from './chart-icons';
