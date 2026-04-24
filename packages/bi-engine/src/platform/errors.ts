// ============================================================================
// platform/errors.ts — 平台级错误工厂与错误码
// ============================================================================

import type { ComponentError, PipelineStage } from './types';

// ---------------------------------------------------------------------------
// 错误码常量
// ---------------------------------------------------------------------------

export const ErrorCodes = {
  UNSUPPORTED_COMPONENT_TYPE: 'UNSUPPORTED_COMPONENT_TYPE',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  NORMALIZATION_FAILED: 'NORMALIZATION_FAILED',
  RESOLUTION_FAILED: 'RESOLUTION_FAILED',
  MODEL_BUILD_FAILED: 'MODEL_BUILD_FAILED',
  RENDERING_FAILED: 'RENDERING_FAILED',
  TYPE_NOT_REGISTERED: 'TYPE_NOT_REGISTERED',
  TYPE_ALREADY_REGISTERED: 'TYPE_ALREADY_REGISTERED',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ---------------------------------------------------------------------------
// 错误工厂
// ---------------------------------------------------------------------------

export function createComponentError(
  code: string,
  message: string,
  stage: PipelineStage,
  cause?: unknown,
): ComponentError {
  return { code, message, stage, cause };
}

export function createValidationError(message: string, cause?: unknown): ComponentError {
  return createComponentError(ErrorCodes.VALIDATION_FAILED, message, 'validation', cause);
}

export function createNormalizationError(message: string, cause?: unknown): ComponentError {
  return createComponentError(ErrorCodes.NORMALIZATION_FAILED, message, 'normalization', cause);
}

export function createResolutionError(message: string, cause?: unknown): ComponentError {
  return createComponentError(ErrorCodes.RESOLUTION_FAILED, message, 'resolution', cause);
}

export function createModelBuildError(message: string, cause?: unknown): ComponentError {
  return createComponentError(ErrorCodes.MODEL_BUILD_FAILED, message, 'rendering', cause);
}
