import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EditorStore {
  /** 当前 DSL 内容 */
  dsl: string;
  /** 进入编辑器时的初始 DSL */
  originalDsl: string;
  /** 更新当前 DSL */
  setDsl: (dsl: string) => void;
  /** 恢复到 originalDsl */
  resetDsl: () => void;
  /** 同时设置 originalDsl 和 dsl（进入编辑器时调用） */
  initDsl: (dsl: string) => void;

  /** 最近修改历史（最多保留 10 条） */
  history: string[];
  /** 将一条 DSL 快照推入历史 */
  pushHistory: (dsl: string) => void;

  /** 编辑器字号 */
  fontSize: number;
  /** 编辑器换行设置 */
  wordWrap: 'on' | 'off';
  setFontSize: (size: number) => void;
  setWordWrap: (wrap: 'on' | 'off') => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'bi-playground-editor-settings';
const MAX_HISTORY_LENGTH = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface EditorSettings {
  fontSize: number;
  wordWrap: 'on' | 'off';
}

function loadSettings(): EditorSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as EditorSettings;
    }
  } catch {
    // ignore
  }
  return null;
}

function persistSettings(settings: EditorSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

const saved = loadSettings();

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useEditorStore = create<EditorStore>((set, get) => ({
  dsl: '',
  originalDsl: '',
  setDsl: (dsl) => set({ dsl }),
  resetDsl: () => set((state) => ({ dsl: state.originalDsl })),
  initDsl: (dsl) => set({ dsl, originalDsl: dsl, history: [] }),

  history: [],
  pushHistory: (dsl) =>
    set((state) => {
      const next = [...state.history, dsl];
      if (next.length > MAX_HISTORY_LENGTH) {
        return { history: next.slice(next.length - MAX_HISTORY_LENGTH) };
      }
      return { history: next };
    }),

  fontSize: saved?.fontSize ?? 14,
  wordWrap: saved?.wordWrap ?? 'on',
  setFontSize: (size) => {
    persistSettings({ fontSize: size, wordWrap: get().wordWrap });
    set({ fontSize: size });
  },
  setWordWrap: (wrap) => {
    persistSettings({ fontSize: get().fontSize, wordWrap: wrap });
    set({ wordWrap: wrap });
  },
}));
