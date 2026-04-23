export { getDb, closeDb } from './db';
export { TestCaseService } from './test-case-service';
export { captureElement } from './capture';
export type { CaptureOptions } from './capture';
export { compareImages } from './comparator';
export type { CompareOptions, CompareResult } from './comparator';
export { BaselineService } from './baseline-service';
export type {
  GenerateBaselineParams,
  CompareWithBaselineParams,
  CompareWithBaselineResult,
} from './baseline-service';
export type { TestCase, BaselineImage, TestRunResult } from './test-case-model';
