import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IgnoreRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TestCase {
  id: string;
  name: string;
  componentId: string;
  sceneId: string;
  dsl: string;
  mockData: string;
  tags: string[];
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  ignoreRegions: IgnoreRegion[];
  baselineImageId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TestStatus = 'passed' | 'failed' | 'pending';

export interface TestResult {
  id: string;
  testCaseId: string;
  status: TestStatus;
  diffPixelCount: number;
  diffPercentage: number;
  currentImageId: string;
  diffImageId: string | null;
  executedAt: string;
}

export interface TestStore {
  testCases: TestCase[];
  testResults: TestResult[];
  setTestCases: (cases: TestCase[]) => void;
  addTestCase: (testCase: TestCase) => void;
  updateTestCase: (id: string, data: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  addTestResult: (result: TestResult) => void;
  clearResults: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useTestStore = create<TestStore>((set) => ({
  testCases: [],
  testResults: [],

  setTestCases: (cases) => set({ testCases: cases }),

  addTestCase: (testCase) =>
    set((state) => ({
      testCases: [...state.testCases, testCase],
    })),

  updateTestCase: (id, data) =>
    set((state) => ({
      testCases: state.testCases.map((tc) =>
        tc.id === id ? { ...tc, ...data, updatedAt: new Date().toISOString() } : tc,
      ),
    })),

  deleteTestCase: (id) =>
    set((state) => ({
      testCases: state.testCases.filter((tc) => tc.id !== id),
    })),

  addTestResult: (result) =>
    set((state) => ({
      testResults: [...state.testResults, result],
    })),

  clearResults: () => set({ testResults: [] }),
}));
