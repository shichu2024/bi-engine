// ============================================================================
// pipeline/pipeline-engine.ts — 统一管线执行引擎
// ============================================================================

import type { BIEngineComponent } from '../schema/bi-engine-models';
import type {
  PipelineResult,
  ValidationOutput,
  NormalizedComponent,
  ResolvedData,
} from '../platform/types';
import { getComponentHandler } from '../platform/component-registry';
import { createComponentError } from '../platform/errors';

// ---------------------------------------------------------------------------
// 配置与结果
// ---------------------------------------------------------------------------

export interface PipelineConfig {
  failFast?: boolean;
}

export interface PipelineExecutionResult<TModel = unknown> {
  validation: PipelineResult<ValidationOutput>;
  normalization: PipelineResult<NormalizedComponent>;
  resolution: PipelineResult<ResolvedData>;
  model: PipelineResult<TModel>;
  hasFailure: boolean;
}

// ---------------------------------------------------------------------------
// PipelineEngine
// ---------------------------------------------------------------------------

/**
 * 统一管线引擎。
 *
 * 执行 validate → normalize → resolve → buildModel 四阶段。
 * 根据 component.type 从 ComponentRegistry 获取处理器并逐阶段执行。
 */
export class PipelineEngine {
  constructor(private readonly config: PipelineConfig = {}) {}

  execute<TModel = unknown>(
    component: BIEngineComponent,
  ): PipelineExecutionResult<TModel> {
    const handler = getComponentHandler(component.type);
    if (handler === undefined) {
      return makeErrorResult<TModel>(
        'UNSUPPORTED_COMPONENT_TYPE',
        `Component type "${component.type}" is not registered.`,
      );
    }

    // Stage 1: validate
    const validation = handler.validator.validate(component);
    if (!validation.ok && this.config.failFast) {
      return makePartialResult(validation);
    }

    // Stage 2: normalize
    const normalization = handler.normalizer.normalize(component);
    if (!normalization.ok && this.config.failFast) {
      return makePartialResult(validation, normalization);
    }

    // Stage 3: resolve
    const resolution = handler.resolver.resolve(component);
    if (!resolution.ok && this.config.failFast) {
      return makePartialResult(validation, normalization, resolution);
    }

    // Stage 4: buildModel
    const model = handler.modelBuilder.build(
      normalization.data!,
      resolution.data!,
      component,
    ) as PipelineResult<TModel>;

    return {
      validation,
      normalization,
      resolution,
      model,
      hasFailure: !(validation.ok && normalization.ok && resolution.ok && model.ok),
    };
  }
}

// ---------------------------------------------------------------------------
// 默认实例
// ---------------------------------------------------------------------------

export const defaultPipelineEngine = new PipelineEngine({ failFast: true });

// ---------------------------------------------------------------------------
// 辅助
// ---------------------------------------------------------------------------

function makeErrorResult<TModel>(
  code: string,
  message: string,
): PipelineExecutionResult<TModel> {
  const err: PipelineResult<ValidationOutput> = {
    ok: false,
    error: createComponentError(code, message, 'validation'),
  };
  const empty = { ok: false as const };
  return {
    validation: err,
    normalization: empty,
    resolution: empty,
    model: empty as PipelineResult<TModel>,
    hasFailure: true,
  };
}

function makePartialResult<TModel>(
  validation: PipelineResult<ValidationOutput>,
  normalization?: PipelineResult<NormalizedComponent>,
  resolution?: PipelineResult<ResolvedData>,
): PipelineExecutionResult<TModel> {
  const empty = { ok: false as const };
  return {
    validation,
    normalization: normalization ?? empty,
    resolution: resolution ?? empty,
    model: empty as PipelineResult<TModel>,
    hasFailure: true,
  };
}
