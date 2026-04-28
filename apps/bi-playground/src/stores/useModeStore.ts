import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BIMode = 'chat' | 'edit' | 'view';

export interface ChangeEvent {
  id: string;
  timestamp: number;
  source: string;
  summary: string;
}

export interface ModeStore {
  mode: BIMode;
  events: ChangeEvent[];
  setMode: (mode: BIMode) => void;
  addEvent: (source: string, summary: string) => void;
  clearEvents: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

let eventCounter = 0;

export const useModeStore = create<ModeStore>((set) => ({
  mode: 'view',
  events: [],

  setMode: (mode) => set({ mode }),

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
