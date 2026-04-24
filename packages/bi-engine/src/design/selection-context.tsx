// ============================================================================
// design/selection-context.tsx — 设计态选中状态管理
// ============================================================================

import { createContext, useContext, useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SelectionContextValue {
  selectedId: string | null;
  select: (id: string) => void;
  deselect: () => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface SelectionProviderProps {
  children: React.ReactNode;
  initialSelectedId?: string | null;
}

/** 选中状态 Provider，管理设计态下当前选中的组件 */
export function SelectionProvider({
  children,
  initialSelectedId = null,
}: SelectionProviderProps): React.ReactNode {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);

  const select = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const deselect = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <SelectionContext.Provider value={{ selectedId, select, deselect }}>
      {children}
    </SelectionContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/** 获取选中状态上下文，必须在 SelectionProvider 内使用 */
export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (ctx === null) {
    throw new Error('useSelection must be used within a SelectionProvider.');
  }
  return ctx;
}
