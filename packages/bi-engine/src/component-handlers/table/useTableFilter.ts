// ============================================================================
// component-handlers/table/useTableFilter.ts — 筛选 Hook
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import type { FilterState } from './types';

/** 模糊匹配（不区分大小写） */
function fuzzyMatch(cellValue: unknown, keyword: string): boolean {
  if (!keyword) return true;
  return String(cellValue ?? '').toLowerCase().includes(keyword.toLowerCase());
}

export interface UseTableFilterResult {
  /** 筛选后的数据 */
  filteredData: Record<string, unknown>[];
  /** 当前筛选状态 */
  filterState: FilterState;
  /** 设置某列的筛选值 */
  setFilter: (columnKey: string, value: string) => void;
  /** 清空所有筛选 */
  clearFilters: () => void;
}

export function useTableFilter(
  data: Record<string, unknown>[],
): UseTableFilterResult {
  const [filterState, setFilterState] = useState<FilterState>({});

  const setFilter = useCallback((columnKey: string, value: string) => {
    setFilterState((prev) => ({ ...prev, [columnKey]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState({});
  }, []);

  const filteredData = useMemo(() => {
    const keys = Object.keys(filterState).filter((k) => filterState[k]);
    if (keys.length === 0) return data;
    return data.filter((row) =>
      keys.every((k) => fuzzyMatch(row[k], filterState[k])),
    );
  }, [data, filterState]);

  return { filteredData, filterState, setFilter, clearFilters };
}
