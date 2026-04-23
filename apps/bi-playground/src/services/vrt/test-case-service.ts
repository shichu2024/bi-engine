import { getDb } from './db';
import type { BaselineImage, TestCase, TestRunResult } from './test-case-model';

// ---------------------------------------------------------------------------
// TestCaseService – CRUD + baseline images + test results + export/import
// ---------------------------------------------------------------------------

export class TestCaseService {
  // -----------------------------------------------------------------------
  // TestCase CRUD
  // -----------------------------------------------------------------------

  static async getAll(): Promise<TestCase[]> {
    try {
      const db = await getDb();
      const tx = db.transaction('test-cases', 'readonly');
      const all = await tx.store.getAll();
      await tx.done;
      return all;
    } catch (error) {
      throw new Error(
        `Failed to fetch all test cases: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async getById(id: string): Promise<TestCase | undefined> {
    try {
      const db = await getDb();
      return await db.get('test-cases', id);
    } catch (error) {
      throw new Error(
        `Failed to fetch test case "${id}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async getByComponent(componentId: string): Promise<TestCase[]> {
    try {
      const db = await getDb();
      const tx = db.transaction('test-cases', 'readonly');
      const results = await tx.store.index('by-componentId').getAll(componentId);
      await tx.done;
      return results;
    } catch (error) {
      throw new Error(
        `Failed to fetch test cases for component "${componentId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async create(testCase: TestCase): Promise<void> {
    try {
      const db = await getDb();
      await db.put('test-cases', testCase);
    } catch (error) {
      throw new Error(
        `Failed to create test case "${testCase.id}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async update(id: string, data: Partial<TestCase>): Promise<void> {
    try {
      const db = await getDb();
      const existing = await db.get('test-cases', id);
      if (!existing) {
        throw new Error(`Test case "${id}" not found`);
      }
      const updated: TestCase = {
        ...existing,
        ...data,
        id: existing.id,
        updatedAt: new Date().toISOString(),
      };
      await db.put('test-cases', updated);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw new Error(
        `Failed to update test case "${id}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete('test-cases', id);
    } catch (error) {
      throw new Error(
        `Failed to delete test case "${id}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // -----------------------------------------------------------------------
  // Baseline Images
  // -----------------------------------------------------------------------

  static async saveBaselineImage(image: BaselineImage): Promise<void> {
    try {
      const db = await getDb();
      await db.put('baseline-images', image);
    } catch (error) {
      throw new Error(
        `Failed to save baseline image "${image.id}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async getBaselineImage(id: string): Promise<BaselineImage | undefined> {
    try {
      const db = await getDb();
      return await db.get('baseline-images', id);
    } catch (error) {
      throw new Error(
        `Failed to fetch baseline image "${id}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async getBaselineByTestCase(testCaseId: string): Promise<BaselineImage[]> {
    try {
      const db = await getDb();
      const tx = db.transaction('baseline-images', 'readonly');
      const results = await tx.store.index('by-testCaseId').getAll(testCaseId);
      await tx.done;
      return results;
    } catch (error) {
      throw new Error(
        `Failed to fetch baseline images for test case "${testCaseId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async deleteBaselineImage(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete('baseline-images', id);
    } catch (error) {
      throw new Error(
        `Failed to delete baseline image "${id}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // -----------------------------------------------------------------------
  // Test Results
  // -----------------------------------------------------------------------

  static async saveTestResult(result: TestRunResult): Promise<void> {
    try {
      const db = await getDb();
      await db.put('test-results', result);
    } catch (error) {
      throw new Error(
        `Failed to save test result "${result.id}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async getTestResults(testCaseId: string): Promise<TestRunResult[]> {
    try {
      const db = await getDb();
      const tx = db.transaction('test-results', 'readonly');
      const results = await tx.store.index('by-testCaseId').getAll(testCaseId);
      await tx.done;
      return results;
    } catch (error) {
      throw new Error(
        `Failed to fetch test results for test case "${testCaseId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async deleteTestResult(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete('test-results', id);
    } catch (error) {
      throw new Error(
        `Failed to delete test result "${id}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // -----------------------------------------------------------------------
  // Export / Import
  // -----------------------------------------------------------------------

  static async exportAll(): Promise<string> {
    try {
      const db = await getDb();
      const tcTx = db.transaction('test-cases', 'readonly');
      const blTx = db.transaction('baseline-images', 'readonly');
      const trTx = db.transaction('test-results', 'readonly');

      const [testCases, baselineImages, testResults] = await Promise.all([
        tcTx.store.getAll(),
        blTx.store.getAll(),
        trTx.store.getAll(),
      ]);

      await Promise.all([tcTx.done, blTx.done, trTx.done]);

      // Baseline images contain Blobs – convert to base64 for JSON serialisation
      const serialisableBaselineImages = await Promise.all(
        baselineImages.map(async (img) => ({
          ...img,
          imageBlob: await blobToBase64(img.imageBlob),
        })),
      );

      const payload = {
        testCases,
        baselineImages: serialisableBaselineImages,
        testResults,
        exportedAt: new Date().toISOString(),
      };

      return JSON.stringify(payload, null, 2);
    } catch (error) {
      throw new Error(
        `Failed to export VRT data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static async importAll(json: string): Promise<void> {
    try {
      const payload = JSON.parse(json) as {
        testCases: TestCase[];
        baselineImages: Array<
          Omit<BaselineImage, 'imageBlob'> & { imageBlob: string }
        >;
        testResults: TestRunResult[];
      };

      const db = await getDb();

      const tcTx = db.transaction('test-cases', 'readwrite');
      const blTx = db.transaction('baseline-images', 'readwrite');
      const trTx = db.transaction('test-results', 'readwrite');

      // Clear existing data
      await Promise.all([
        tcTx.store.clear(),
        blTx.store.clear(),
        trTx.store.clear(),
      ]);

      // Write test cases
      for (const tc of payload.testCases) {
        await tcTx.store.put(tc);
      }

      // Write baseline images (convert base64 back to Blob)
      for (const img of payload.baselineImages) {
        const restored: BaselineImage = {
          ...img,
          imageBlob: base64ToBlob(img.imageBlob),
        };
        await blTx.store.put(restored);
      }

      // Write test results
      for (const tr of payload.testResults) {
        await trTx.store.put(tr);
      }

      await Promise.all([tcTx.done, blTx.done, trTx.done]);
    } catch (error) {
      throw new Error(
        `Failed to import VRT data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to convert Blob to base64'));
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(',');
  const mimeMatch = meta.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}
