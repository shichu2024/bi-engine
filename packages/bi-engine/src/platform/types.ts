// ============================================================================
// platform/types.ts — 统一组件渲染平台核心类型定义
// ============================================================================

import type { BIEngineComponent } from '../schema/bi-engine-models';
import type { ThemeTokens } from '../theme/theme-tokens';

export type { BIEngineComponent } from '../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 渲染模式
// ---------------------------------------------------------------------------

/** 渲染模式：运行态只读渲染，设计态可编辑 */
export enum RenderMode {
  RUNTIME = 'runtime',
  DESIGN = 'design',
}

// ---------------------------------------------------------------------------
// 管线结果
// ---------------------------------------------------------------------------

/** 管线阶段统一结果包装 */
export interface PipelineResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: ComponentError;
}

// ---------------------------------------------------------------------------
// 错误
// ---------------------------------------------------------------------------

/** 管线阶段标识 */
export type PipelineStage = 'validation' | 'normalization' | 'resolution' | 'rendering';

/** 组件错误 */
export interface ComponentError {
  code: string;
  message: string;
  stage: PipelineStage;
  cause?: unknown;
}

// ---------------------------------------------------------------------------
// 验证
// ---------------------------------------------------------------------------

/** 验证警告 */
export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
}

/** 验证阶段输出 */
export interface ValidationOutput {
  warnings: ValidationWarning[];
}

// ---------------------------------------------------------------------------
// 标准化
// ---------------------------------------------------------------------------

/** 标准化组件（通用结构） */
export interface NormalizedComponent {
  id: string;
  type: ComponentType;
  properties: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// 数据解析
// ---------------------------------------------------------------------------

/** 已解析数据 */
export interface ResolvedData {
  dataType: 'static' | 'datasource' | 'api';
  data: unknown;
  meta?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// 渲染上下文
// ---------------------------------------------------------------------------

/** 组件事件处理器 */
export interface ComponentEventHandlers {
  onClick?: (componentId: string, data: unknown) => void;
  onHover?: (componentId: string, data: unknown) => void;
  onSelect?: (componentId: string) => void;
}

/** 渲染上下文，传递给 Renderer */
export interface RenderContext {
  mode: RenderMode;
  theme: ThemeTokens;
  componentId: string;
  selected?: boolean;
  events?: ComponentEventHandlers;
  className?: string;
  style?: React.CSSProperties;
  /** 组件变更回调，renderer 可通过此回调上报 schema 变更（如文本编辑、图表切换） */
  onChange?: (newSchema: BIEngineComponent) => void;
}

// ---------------------------------------------------------------------------
// 组件类型
// ---------------------------------------------------------------------------

/** 组件类型标识，从 BIEngineComponent 联合类型推导 */
export type ComponentType = BIEngineComponent['type'];

// ---------------------------------------------------------------------------
// 策略接口
// ---------------------------------------------------------------------------

/** 验证器策略 */
export interface ComponentValidator<TComponent extends BIEngineComponent = BIEngineComponent> {
  validate(component: TComponent): PipelineResult<ValidationOutput>;
}

/** 标准化器策略 */
export interface ComponentNormalizer<TComponent extends BIEngineComponent = BIEngineComponent> {
  normalize(component: TComponent): PipelineResult<NormalizedComponent>;
}

/** 数据解析器策略 */
export interface ComponentResolver<TComponent extends BIEngineComponent = BIEngineComponent> {
  resolve(component: TComponent): PipelineResult<ResolvedData>;
}

/** 语义模型构建器策略 */
export interface ComponentModelBuilder<
  TComponent extends BIEngineComponent = BIEngineComponent,
  TModel = unknown,
> {
  build(
    normalized: NormalizedComponent,
    resolved: ResolvedData,
    component: TComponent,
  ): PipelineResult<TModel>;
}

/** 渲染器策略 */
export interface ComponentRenderer<
  TComponent extends BIEngineComponent = BIEngineComponent,
  TModel = unknown,
> {
  render(model: TModel, context: RenderContext): React.ReactNode;
}

// ---------------------------------------------------------------------------
// 组件处理器（聚合接口）
// ---------------------------------------------------------------------------

/** 组件处理器：封装一个组件类型的全部管线策略 */
export interface ComponentHandler<
  TComponent extends BIEngineComponent = BIEngineComponent,
  TModel = unknown,
> {
  readonly type: ComponentType;
  readonly validator: ComponentValidator<TComponent>;
  readonly normalizer: ComponentNormalizer<TComponent>;
  readonly resolver: ComponentResolver<TComponent>;
  readonly modelBuilder: ComponentModelBuilder<TComponent, TModel>;
  readonly renderer: ComponentRenderer<TComponent, TModel>;
}
