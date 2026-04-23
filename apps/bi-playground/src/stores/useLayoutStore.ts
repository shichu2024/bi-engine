import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ViewMode = 'demo' | 'editor';

export interface LayoutStore {
  /** 侧栏宽度（px），默认 240 */
  sidebarWidth: number;
  /** 侧栏是否折叠 */
  sidebarCollapsed: boolean;
  /** 当前视图模式 */
  viewMode: ViewMode;
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'bi-playground-layout';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface PersistedLayout {
  sidebarWidth: number;
  sidebarCollapsed: boolean;
}

function loadLayout(): PersistedLayout | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PersistedLayout;
    }
  } catch {
    // ignore
  }
  return null;
}

function persistLayout(data: PersistedLayout): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const saved = loadLayout();

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useLayoutStore = create<LayoutStore>((set, get) => ({
  sidebarWidth: saved?.sidebarWidth ?? 240,
  sidebarCollapsed: saved?.sidebarCollapsed ?? false,
  viewMode: 'demo',

  setSidebarWidth: (width) => {
    persistLayout({ sidebarWidth: width, sidebarCollapsed: get().sidebarCollapsed });
    set({ sidebarWidth: width });
  },

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    persistLayout({ sidebarWidth: get().sidebarWidth, sidebarCollapsed: next });
    set({ sidebarCollapsed: next });
  },

  setSidebarCollapsed: (collapsed) => {
    persistLayout({ sidebarWidth: get().sidebarWidth, sidebarCollapsed: collapsed });
    set({ sidebarCollapsed: collapsed });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
}));
