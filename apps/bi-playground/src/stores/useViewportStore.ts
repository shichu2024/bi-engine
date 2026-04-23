import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ViewportSize {
  label: string;
  width: number;
  height: number;
}

export interface ViewportStore {
  /** 预设视口列表 */
  viewports: ViewportSize[];
  /** 当前选中的视口索引 */
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  /** 获取当前视口尺寸（计算属性风格） */
  currentViewport: () => ViewportSize;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_VIEWPORTS: ViewportSize[] = [
  { label: 'PC', width: 1920, height: 1080 },
  { label: 'Tablet', width: 1366, height: 768 },
  { label: 'Mobile', width: 375, height: 667 },
  { label: 'Full Width', width: 0, height: 500 },
];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useViewportStore = create<ViewportStore>((set, get) => ({
  viewports: DEFAULT_VIEWPORTS,
  selectedIndex: 3,
  setSelectedIndex: (index) => set({ selectedIndex: index }),
  currentViewport: () => {
    const { viewports, selectedIndex } = get();
    return viewports[selectedIndex] ?? DEFAULT_VIEWPORTS[0];
  },
}));
