export {
  // ---- 第2章: 图表渲染引擎DSL ----
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

  // ---- 第3章: 图表系列配置DSL ----
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

  // ---- 第4章: 智能报告DSL ----
  type Report,
  type BasicInfo,
  type Section,
  type Catalog,
  type Cover,
  type CoverContent,
  type SignaturePage,
  type Signer,
  type ReportSummary,

  // ---- 第5章: 智能PPT DSL ----
  type PPT,
  type Slide,
  type SlideSection,

  // ---- 第6章: 智能Dashboard DSL ----
  type Dashboard,

  // ---- 第7章: 智能问数DSL ----
  type Step,
  type Answer,
  type Chat,

  // ---- 第9章: 附加信息与列配置 ----
  type GenerateMeta,
  type AdditionalInfo,
  type ValueFormat,
  type FieldUI,
  type UIEvent,
  type EnumValue,
  type Column,

  // ---- 第8章: 枚举定义 ----
  LayoutType,
  CoverLayoutType,
  AnswerType,
  ContentType,
  ChatStatus,
  Status,
  FieldType,
  ValueFormatType,
  AdditionalInfoType,
} from './bi-engine-models';
