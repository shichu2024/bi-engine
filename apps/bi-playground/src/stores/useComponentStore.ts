import { create } from 'zustand';
import type { FixtureEntry } from 'bi-engine/testing';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComponentStore {
  /** 组件列表数据 - 从 bi-engine fixture registry 获取 */
  components: FixtureEntry[];
  setComponents: (components: FixtureEntry[]) => void;

  /** 当前选中组件 ID */
  selectedComponentId: string;
  selectComponent: (id: string) => void;

  /** 分类展开状态 */
  expandedCategories: string[];
  toggleCategory: (category: string) => void;
  setExpandedCategories: (categories: string[]) => void;

  /** 搜索关键字 */
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useComponentStore = create<ComponentStore>((set) => ({
  components: [],
  setComponents: (components) =>
    set({ components }),

  selectedComponentId: '',
  selectComponent: (id) =>
    set({ selectedComponentId: id }),

  expandedCategories: [],
  toggleCategory: (category) =>
    set((state) => {
      const isExpanded = state.expandedCategories.includes(category);
      const next = isExpanded
        ? state.expandedCategories.filter((c) => c !== category)
        : [...state.expandedCategories, category];
      return { expandedCategories: next };
    }),
  setExpandedCategories: (categories) =>
    set({ expandedCategories: categories }),

  searchKeyword: '',
  setSearchKeyword: (keyword) =>
    set({ searchKeyword: keyword }),
}));
