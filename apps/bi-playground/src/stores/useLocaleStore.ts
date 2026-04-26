import { create } from 'zustand';
import type { BuiltInLocale } from 'bi-engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocaleStore {
  locale: BuiltInLocale;
  setLocale: (locale: BuiltInLocale) => void;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'bi-playground-locale';

function loadPersistedLocale(): BuiltInLocale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'en-US' || raw === 'zh-CN') return raw;
  } catch {
    // ignore
  }
  return 'zh-CN';
}

function persistLocale(locale: BuiltInLocale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: loadPersistedLocale(),
  setLocale: (locale) => {
    persistLocale(locale);
    set({ locale });
  },
}));
