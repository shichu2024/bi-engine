import { openDB, type IDBPDatabase, type DBSchema } from 'idb';

import type { BaselineImage, TestCase, TestRunResult } from './test-case-model';

// ---------------------------------------------------------------------------
// IDB schema definition
// ---------------------------------------------------------------------------

interface VrtDbSchema extends DBSchema {
  'test-cases': {
    key: string;
    value: TestCase;
    indexes: {
      'by-componentId': string;
      'by-tags': string;
      'by-priority': string;
    };
  };
  'baseline-images': {
    key: string;
    value: BaselineImage;
    indexes: {
      'by-testCaseId': string;
    };
  };
  'test-results': {
    key: string;
    value: TestRunResult;
    indexes: {
      'by-testCaseId': string;
      'by-status': string;
    };
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DB_NAME = 'bi-playground-vrt';
const DB_VERSION = 1;

// ---------------------------------------------------------------------------
// Database helpers
// ---------------------------------------------------------------------------

let dbInstance: IDBPDatabase<VrtDbSchema> | null = null;

/**
 * Open (and lazily create/upgrade) the VRT IndexedDB database.
 * The database is created on first call and reused afterwards.
 */
export async function getDb(): Promise<IDBPDatabase<VrtDbSchema>> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await openDB<VrtDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // -- test-cases store --
        if (!db.objectStoreNames.contains('test-cases')) {
          const testCaseStore = db.createObjectStore('test-cases', {
            keyPath: 'id',
          });
          testCaseStore.createIndex('by-componentId', 'componentId', {
            unique: false,
          });
          testCaseStore.createIndex('by-tags', 'tags', {
            unique: false,
            multiEntry: true,
          });
          testCaseStore.createIndex('by-priority', 'priority', {
            unique: false,
          });
        }

        // -- baseline-images store --
        if (!db.objectStoreNames.contains('baseline-images')) {
          const baselineStore = db.createObjectStore('baseline-images', {
            keyPath: 'id',
          });
          baselineStore.createIndex('by-testCaseId', 'testCaseId', {
            unique: false,
          });
        }

        // -- test-results store --
        if (!db.objectStoreNames.contains('test-results')) {
          const resultStore = db.createObjectStore('test-results', {
            keyPath: 'id',
          });
          resultStore.createIndex('by-testCaseId', 'testCaseId', {
            unique: false,
          });
          resultStore.createIndex('by-status', 'status', {
            unique: false,
          });
        }
      },
    });

    return dbInstance;
  } catch (error) {
    throw new Error(
      `Failed to open VRT database: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Close the database connection and reset the cached instance.
 * Useful for testing or when a clean re-initialisation is required.
 */
export async function closeDb(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
