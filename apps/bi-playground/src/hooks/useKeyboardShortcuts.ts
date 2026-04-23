import { useEffect } from 'react';

import { useLayoutStore } from '@/stores';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KeyboardShortcutsOptions {
  /** Ref to a component or element that has a focus() method (for Ctrl+K) */
  readonly searchInputRef?: React.RefObject<{ focus: () => void } | null>;
  /** Callback fired on Ctrl+S (save) */
  readonly onSave?: () => void;
  /** Callback fired on Ctrl+Enter (manual render) */
  readonly onRender?: () => void;
}

// ---------------------------------------------------------------------------
// Custom event names (for cross-component communication)
// ---------------------------------------------------------------------------

const EVENT_SAVE = 'bi-playground:save';
const EVENT_RENDER = 'bi-playground:render';
const EVENT_SEARCH_FOCUS = 'bi-playground:search-focus';

export { EVENT_SAVE, EVENT_RENDER, EVENT_SEARCH_FOCUS };

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function isModifierKey(e: KeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useKeyboardShortcuts(
  options: KeyboardShortcutsOptions = {},
): void {
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (!isModifierKey(e)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        // Ctrl/Cmd + K: Focus search
        case 'k': {
          e.preventDefault();
          if (options.searchInputRef?.current) {
            options.searchInputRef.current.focus();
          } else {
            window.dispatchEvent(new CustomEvent(EVENT_SEARCH_FOCUS));
          }
          break;
        }

        // Ctrl/Cmd + S: Save
        case 's': {
          e.preventDefault();
          if (options.onSave) {
            options.onSave();
          } else {
            window.dispatchEvent(new CustomEvent(EVENT_SAVE));
          }
          break;
        }

        // Ctrl/Cmd + B: Toggle sidebar
        case 'b': {
          e.preventDefault();
          toggleSidebar();
          break;
        }

        // Ctrl/Cmd + Enter: Manual render
        case 'enter': {
          e.preventDefault();
          if (options.onRender) {
            options.onRender();
          } else {
            window.dispatchEvent(new CustomEvent(EVENT_RENDER));
          }
          break;
        }

        default:
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [options, toggleSidebar]);
}
