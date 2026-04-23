import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark';

export interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  palette: string[];
  setPalette: (palette: string[]) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'bi-playground-theme';

const DEFAULT_DARK_PALETTE: string[] = [
  '#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE',
  '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#48C9B0',
];

const DEFAULT_LIGHT_PALETTE: string[] = [
  '#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE',
  '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#48C9B0',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface PersistedTheme {
  mode: ThemeMode;
  palette: string[];
}

function loadPersistedTheme(): PersistedTheme | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PersistedTheme;
    }
  } catch {
    // localStorage unavailable or corrupt data — ignore
  }
  return null;
}

function persistTheme(data: PersistedTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable or quota exceeded — ignore
  }
}

const persisted = loadPersistedTheme();

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: persisted?.mode ?? 'light',
  setMode: (mode) => {
    persistTheme({ mode, palette: get().palette });
    set({ mode });
  },
  toggleMode: () => {
    const next = get().mode === 'light' ? 'dark' : 'light';
    persistTheme({ mode: next, palette: get().palette });
    set({ mode: next });
  },
  palette: persisted?.palette ?? DEFAULT_LIGHT_PALETTE,
  setPalette: (palette) => {
    persistTheme({ mode: get().mode, palette });
    set({ palette });
  },
}));

// ---------------------------------------------------------------------------
// Exported default palettes for convenience
// ---------------------------------------------------------------------------

export { DEFAULT_DARK_PALETTE, DEFAULT_LIGHT_PALETTE };
