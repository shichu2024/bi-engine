// ============================================================================
// bi-engine -- 根桶导出
// ============================================================================
//
// 这是 bi-engine 包的单一公共入口点。
//
// 设计规则：
// 1. Schema 类型和枚举始终导出 -- 它们代表所有消费者共享的权威模型。
// 2. 图表渲染所需的运行时函数和组件被导出。
// 3. 内部模块（adapters、model、data）不在此处导出。
//    消费者不应依赖内部管道细节。
//
// ============================================================================

// ---- Schema 层（权威模型类型和枚举）----
export {
  // 第2章：BI 引擎组件 DSL
  type ComponentTypeMap,
  type BIEngineComponent,
  type BasicComponent,
  type DataProperty,
  type TextDataProperty,
  type TableDataProperty,
  type ChartDataProperty,
  type MarkdownDataProperty,
  type CompositeTableDataProperty,
  type MergeColumnInfo,
  type MergeRowConfig,
  type TextComponent,
  type TableComponent,
  type ChartComponent,
  type MarkdownComponent,
  type CompositeTable,
  type ComponentLayout,
  type PageLayout,
  type InteractionAction,
  type InteractionTrigger,
  type InteractionTarget,
  type Interaction,

  // 第3章：图表系列配置 DSL
  type Axis,
  type LineSeries,
  type BarSeries,
  type PieSeries,
  type ScatterSeries,
  type RadarSeries,
  type GaugeSeries,
  type CandlestickSeries,
  type Series,
  type ChartOption,

  // 第4章：智能报告 DSL
  type Report,
  type BasicInfo,
  type Section,
  type Catalog,
  type Cover,
  type CoverContent,
  type SignaturePage,
  type Signer,
  type ReportSummary,

  // 第5章：智能PPT DSL
  type PPT,
  type Slide,
  type SlideSection,

  // 第6章：智能Dashboard DSL
  type Dashboard,

  // 第7章：智能问数 DSL
  type Step,
  type Answer,
  type Chat,

  // 第9章：附加信息与列配置
  type GenerateMeta,
  type AdditionalInfo,
  type ValueFormat,
  type FieldUI,
  type UIEvent,
  type EnumValue,
  type Column,

  // 第8章：枚举定义
  LayoutType,
  CoverLayoutType,
  AnswerType,
  ContentType,
  ChatStatus,
  Status,
  FieldType,
  ValueFormatType,
  AdditionalInfoType,
} from './schema/bi-engine-models';

// ---- 校验器 ----
export {
  validateChartComponent,
  ValidationErrorKind,
} from './core/validate-chart-component';
export type {
  ValidationError,
  ValidationResult,
} from './core/validate-chart-component';

// ---- BIEngine 统一公共入口 ----
export { BIEngine } from './react/BIEngine';
export type { BIEngineProps } from './react/BIEngine';

export { ChartStateView } from './react/ChartStateView';
export type { ChartStateViewProps, ChartState } from './react/ChartStateView';

// ---- 主题 Provider ----
export { ChartThemeProvider, useChartTheme } from './theme/chart-theme-context';
export type {
  ChartThemeProviderProps,
  ChartThemeContextValue,
} from './theme/chart-theme-context';

// ---- 测试渲染配置 ----
export {
  enableTestMode,
  disableTestMode,
  isTestMode,
  getTestRenderConfig,
  TEST_RENDER_CONFIG,
} from './react/test-render-config';
export type { TestRenderConfig } from './react/test-render-config';

// ---- 错误 ----
export {
  ChartRenderError,
  ChartRenderErrorCategory,
  createValidationError,
  createDataError,
  createRenderError,
} from './core/chart-render-error';

// ---- 格式化器 ----
export { formatValue, createFormatter } from './theme/value-formatter';

// ---- 主题工具 ----
export {
  DEFAULT_PALETTE,
  isValidPalette,
  resolvePaletteColor,
} from './theme/palette';
export type {
  ThemeTokens,
  BackgroundTokens,
  FontTokens,
  SpacingTokens,
  BorderTokens,
} from './theme/theme-tokens';
export { DEFAULT_THEME_TOKENS } from './theme/theme-tokens';

// ============================================================================
// v2.0 — 统一组件渲染平台
// ============================================================================

// ---- 平台层 ----
export {
  RenderMode,
  type ComponentType,
  type PipelineResult,
  type ComponentError,
  type PipelineStage,
  type ValidationWarning,
  type ValidationOutput,
  type NormalizedComponent,
  type ResolvedData,
  type ComponentEventHandlers,
  type RenderContext,
  type ComponentValidator,
  type ComponentNormalizer,
  type ComponentResolver,
  type ComponentModelBuilder,
  type ComponentRenderer,
  type ComponentHandler,
} from './platform/types';

export {
  ComponentRegistry,
  registerComponentHandler,
  getComponentHandler,
} from './platform/component-registry';

export {
  RenderModeProvider,
  useRenderMode,
  useIsDesignMode,
  type RenderModeProviderProps,
} from './platform/render-mode';

export {
  ErrorCodes,
  type ErrorCode,
  createComponentError,
  createValidationError as createPlatformValidationError,
  createNormalizationError,
  createResolutionError,
  createModelBuildError,
} from './platform/errors';

export {
  registerBuiltinHandlers,
} from './platform/auto-registry';

// ---- 管线层 ----
export {
  PipelineEngine,
  defaultPipelineEngine,
  type PipelineConfig,
  type PipelineExecutionResult,
} from './pipeline';

// ---- 统一组件视图 ----
export { ComponentView } from './react/ComponentView';
export type { ComponentViewProps } from './react/ComponentView';

// ---- 设计态 ----
export {
  SelectionProvider,
  useSelection,
  type SelectionProviderProps,
} from './design/selection-context';

export {
  DesignableWrapper,
  type DesignableWrapperProps,
} from './react/DesignableWrapper';

// ---- 适配器 ----
export {
  ChartAdapterRegistry,
  type ChartAdapter,
  type ChartAdapterHandle,
} from './adapters/adapter-registry';

export {
  echartsAdapter,
  EChartsAdapter,
} from './adapters/echarts/echarts-adapter';
