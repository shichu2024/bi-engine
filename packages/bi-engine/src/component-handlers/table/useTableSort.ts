// ============================================================================
// component-handlers/table/useTableSort.ts — 排序 Hook
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import type { SortState, SortDirection } from './types';

/** 排序比较函数 */
function compareValues(a: unknown, b: unknown, direction: SortDirection): number {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a;
  }
  const sa = String(a);
  const sb = String(b);
  const cmp = sa.localeCompare(sb, undefined, { numeric: true });
  return direction === 'asc' ? cmp : -cmp;
}

export interface UseTableSortResult {
  /** 排序后的数据 */
  sortedData: Record<string, unknown>[];
  /** 当前排序状态 */
  sortState: SortState;
  /** 切换排序 */
  handleSort: (columnKey: string) => void;
  /** 手动设置排序状态 */
  setSortState: React.Dispatch<React.SetStateAction<SortState>>;
}

export function useTableSort(
  data: Record<string, unknown>[],
): UseTableSortResult {
  const [sortState, setSortState] = useState<SortState>({ columnKey: '', direction: 'default' });

  const handleSort = useCallback((columnKey: string) => {
    setSortState((prev) => {
      if (prev.columnKey !== columnKey) {
        return { columnKey, direction: 'asc' };
      }
      const next: SortDirection =
        prev.direction === 'default' ? 'asc' : prev.direction === 'asc' ? 'desc' : 'default';
      return { columnKey, direction: next };
    });
  }, []);

  const sortedData = useMemo(() => {
    if (!sortState.columnKey || sortState.direction === 'default') return data;
    return [...data].sort((a, b) =>
      compareValues(a[sortState.columnKey], b[sortState.columnKey], sortState.direction),
    );
  }, [data, sortState]);

  return { sortedData, sortState, handleSort, setSortState };
}
