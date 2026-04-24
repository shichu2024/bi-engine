// ============================================================================
// component-handlers/unsupported-handler.ts — 未实现组件类型的占位处理器
// ============================================================================
//
// 对于尚未实现的组件类型（table/text/markdown），
// 返回 UNSUPPORTED_COMPONENT_TYPE 错误。
// FEAT-005 会逐个替换为真实实现。

import type {
  ComponentHandler,
  PipelineResult,
  ValidationOutput,
  NormalizedComponent,
  ResolvedData,
  RenderContext,
  ComponentType,
} from '../platform/types';
import type { BIEngineComponent } from '../schema/bi-engine-models';
import { createComponentError } from '../platform/errors';

function unsupportedResult(type: ComponentType): PipelineResult<never> {
  return {
    ok: false,
    error: createComponentError(
      'UNSUPPORTED_COMPONENT_TYPE',
      `Component type "${type}" is not yet implemented. Will be available in a future release.`,
      'validation',
    ),
  };
}

/**
 * 创建一个占位处理器，所有策略均返回 UNSUPPORTED_COMPONENT_TYPE。
 */
export function createUnsupportedHandler(type: ComponentType): ComponentHandler {
  return {
    type,
    validator: {
      validate(): PipelineResult<ValidationOutput> {
        return unsupportedResult(type);
      },
    },
    normalizer: {
      normalize(): PipelineResult<NormalizedComponent> {
        return unsupportedResult(type);
      },
    },
    resolver: {
      resolve(): PipelineResult<ResolvedData> {
        return unsupportedResult(type);
      },
    },
    modelBuilder: {
      build(): PipelineResult<never> {
        return unsupportedResult(type);
      },
    },
    renderer: {
      render(_model: unknown, _context: RenderContext): React.ReactNode {
        return null;
      },
    },
  };
}
