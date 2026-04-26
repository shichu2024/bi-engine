import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DesignMode = 'runtime' | 'design';

export interface ChangeEvent {
  id: string;
  timestamp: number;
  source: string;
  summary: string;
}

export interface ModeStore {
  mode: DesignMode;
  events: ChangeEvent[];
  setMode: (mode: DesignMode) => void;
  toggleMode: () => void;
  addEvent: (source: string, summary: string) => void;
  clearEvents: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

let eventCounter = 0;

export const useModeStore = create<ModeStore>((set) => ({
  mode: 'runtime',
  events: [],

  setMode: (mode) => set({ mode }),

  toggleMode: () =>
    set((state) => ({ mode: state.mode === 'runtime' ? 'design' : 'runtime' })),

  addEvent: (source, summary) => {
    eventCounter += 1;
    const newEvent: ChangeEvent = {
      id: `evt-${eventCounter}`,
      timestamp: Date.now(),
      source,
      summary,
    };
    set((state) => ({ events: [...state.events, newEvent] }));
  },

  clearEvents: () => set({ events: [] }),
}));
