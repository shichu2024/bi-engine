import { getDb } from './db';
import { captureElement } from './capture';
import { compareImages } from './comparator';
import type { BaselineImage } from './test-case-model';
import type { CompareResult } from './comparator';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface GenerateBaselineParams {
  testCaseId: string;
  element: HTMLElement;
  version: string;
  disableAnimation: boolean;
}

export interface CompareWithBaselineParams {
  testCaseId: string;
  element: HTMLElement;
  threshold?: number;
  ignoreRegions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface CompareWithBaselineResult {
  result: CompareResult | null;
  baseline: BaselineImage | null;
  currentBlob: Blob;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a PNG Blob into an HTMLImageElement that can be drawn on a canvas.
 */
function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image from Blob'));
    };

    img.src = url;
  });
}

/**
 * Generate a unique identifier.
 */
function generateId(): string {
  return `bl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// BaselineService
// ---------------------------------------------------------------------------

export class BaselineService {
  /**
   * Capture the given element and store the resulting PNG as a baseline
   * image in IndexedDB, associated with the provided test case.
   */
  static async generateBaseline(
    params: GenerateBaselineParams,
  ): Promise<BaselineImage> {
    const { testCaseId, element, version, disableAnimation } = params;

    try {
      const blob = await captureElement({
        element,
        disableAnimation,
      });

      // Determine image dimensions by decoding the captured blob
      const img = await blobToImage(blob);
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      const baseline: BaselineImage = {
        id: generateId(),
        testCaseId,
        version,
        imageBlob: blob,
        width,
        height,
        createdAt: new Date().toISOString(),
      };

      const db = await getDb();
      await db.put('baseline-images', baseline);

      return baseline;
    } catch (error) {
      throw new Error(
        `基准图生成失败：${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Capture the current state of an element and compare it against the
   * most recent baseline image stored in IndexedDB.
   *
   * If no baseline exists yet the method returns `result: null` together
   * with the current screenshot so that callers can prompt the user to
   * create an initial baseline.
   */
  static async compareWithBaseline(
    params: CompareWithBaselineParams,
  ): Promise<CompareWithBaselineResult> {
    const { testCaseId, element, threshold, ignoreRegions } = params;

    try {
      // Capture current state
      const currentBlob = await captureElement({
        element,
        disableAnimation: true,
      });

      // Retrieve latest baseline for the test case
      const db = await getDb();
      const tx = db.transaction('baseline-images', 'readonly');
      const baselines = await tx.store
        .index('by-testCaseId')
        .getAll(testCaseId);
      await tx.done;

      if (baselines.length === 0) {
        return {
          result: null,
          baseline: null,
          currentBlob,
        };
      }

      // Use the most recently created baseline
      const baseline = baselines.reduce((latest, current) =>
        current.createdAt > latest.createdAt ? current : latest,
      );

      // Load both images
      const baselineImg = await blobToImage(baseline.imageBlob);
      const currentImg = await blobToImage(currentBlob);

      // Run pixel-level comparison
      const result = await compareImages({
        baselineImage: baselineImg,
        currentImage: currentImg,
        threshold,
        ignoreRegions,
      });

      return {
        result,
        baseline,
        currentBlob,
      };
    } catch (error) {
      throw new Error(
        `基准图对比失败：${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Replace the image data of an existing baseline record.
   * The width and height are recalculated from the new image.
   */
  static async updateBaselineImage(
    baselineId: string,
    newImage: Blob,
  ): Promise<void> {
    try {
      const db = await getDb();
      const existing = await db.get('baseline-images', baselineId);

      if (!existing) {
        throw new Error(`Baseline image "${baselineId}" not found`);
      }

      const img = await blobToImage(newImage);

      const updated: BaselineImage = {
        ...existing,
        imageBlob: newImage,
        width: img.naturalWidth,
        height: img.naturalHeight,
        createdAt: new Date().toISOString(),
      };

      await db.put('baseline-images', updated);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw new Error(
        `基准图更新失败：${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
