import type { IgnoreRegion, TestCase as StoreTestCase } from '@/stores';

// ---------------------------------------------------------------------------
// Re-export store types for convenience
// ---------------------------------------------------------------------------
export type { IgnoreRegion };

// ---------------------------------------------------------------------------
// VRT-specific types
// ---------------------------------------------------------------------------

/**
 * Extended TestCase for VRT persistence layer.
 * Adds viewport, theme, and baseline reference fields
 * on top of the core TestCase from the store.
 */
export interface TestCase extends StoreTestCase {
  viewportWidth: number;
  viewportHeight: number;
  theme: 'light' | 'dark';
}

export interface BaselineImage {
  id: string;
  testCaseId: string;
  version: string;
  imageBlob: Blob;
  width: number;
  height: number;
  createdAt: string;
}

export interface TestRunResult {
  id: string;
  testCaseId: string;
  status: 'passed' | 'failed';
  diffPixelCount: number;
  diffPercentage: number;
  baselineImageId: string;
  currentImageId: string;
  diffImageId: string | null;
  executedAt: string;
}
