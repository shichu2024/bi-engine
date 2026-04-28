// ============================================================================
// platform/index.ts — 平台层公共导出
// ============================================================================

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
} from './types';

export {
  ErrorCodes,
  type ErrorCode,
  createComponentError,
  createValidationError,
  createNormalizationError,
  createResolutionError,
  createModelBuildError,
} from './errors';

export {
  ComponentRegistry,
  registerComponentHandler,
  getComponentHandler,
} from './component-registry';

export {
  RenderModeProvider,
  useRenderMode,
  useIsEditMode,
  useCanSwitchChart,
  useCanEditText,
  type RenderModeProviderProps,
} from './render-mode';

export {
  registerBuiltinHandlers,
} from './auto-registry';
