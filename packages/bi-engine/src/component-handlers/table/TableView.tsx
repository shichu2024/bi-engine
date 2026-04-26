// ============================================================================
// component-handlers/table/TableView.tsx — 原生 React 表格视图组件
// ============================================================================

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  TableColumn,
  SortState,
  SortDirection,
  FilterState,
  PaginationState,
  PaginationConfig,
  MergeMap,
} from './types';
import type { ThemeTokens } from '../../theme/theme-tokens';
import { DEFAULT_THEME_TOKENS } from '../../theme/theme-tokens';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const MIN_COL_WIDTH = 50;

// ---------------------------------------------------------------------------
// Style factory
// ---------------------------------------------------------------------------

function createStyles(t: ThemeTokens) {
  return {
    wrapper: { width: '100%', overflowX: 'auto', fontSize: 14, color: t.font.color } as React.CSSProperties,
    title: { fontWeight: 600, fontSize: 16, marginBottom: 8, color: t.font.color } as React.CSSProperties,
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      border: `1px solid ${t.table.headerBorder}`,
      tableLayout: 'fixed' as const,
    } as React.CSSProperties,
    th: {
      padding: '10px 12px',
      fontWeight: 600,
      fontSize: 13,
      backgroundColor: t.table.headerBg,
      borderBottom: `2px solid ${t.table.headerBorder}`,
      textAlign: 'left',
      userSelect: 'none' as const,
      position: 'relative' as const,
    } as React.CSSProperties,
    td: {
      padding: '8px 12px',
      borderBottom: `1px solid ${t.table.cellBorder}`,
      fontSize: 14,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    } as React.CSSProperties,
    thRight: { borderRight: `1px solid ${t.table.cellBorder}` } as React.CSSProperties,
    tdRight: { borderRight: `1px solid ${t.table.cellBorder}` } as React.CSSProperties,
    rowEven: { backgroundColor: t.table.rowStripeBg } as React.CSSProperties,
    rowHover: { backgroundColor: t.table.rowHoverBg } as React.CSSProperties,
    empty: { textAlign: 'center', padding: '32px 16px', color: t.font.tertiaryColor, fontSize: 14 } as React.CSSProperties,
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      overflow: 'hidden',
    } as React.CSSProperties,
    headerText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: '1 1 auto',
      minWidth: 0,
    } as React.CSSProperties,
    sortIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
      flexShrink: 0,
      width: 16,
      height: 16,
    } as React.CSSProperties,
    filterIcon: {
      cursor: 'pointer',
      marginLeft: 4,
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      borderRadius: 2,
    } as React.CSSProperties,
    filterIconActive: {
      color: t.semantic.info,
      backgroundColor: 'rgba(22,119,255,0.1)',
    } as React.CSSProperties,
    gearIcon: {
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
      flexShrink: 0,
      width: 20,
      height: 20,
      borderRadius: 2,
      color: t.font.tertiaryColor,
    } as React.CSSProperties,
    resizeHandle: {
      position: 'absolute' as const,
      right: 0,
      top: 0,
      bottom: 0,
      width: 4,
      cursor: 'col-resize',
      backgroundColor: 'transparent',
      zIndex: 1,
    } as React.CSSProperties,
    tooltip: {
      position: 'fixed' as const,
      backgroundColor: 'rgba(0,0,0,0.75)',
      color: '#fff',
      padding: '4px 8px',
      borderRadius: 4,
      fontSize: 12,
      zIndex: 1100,
      pointerEvents: 'none' as const,
      maxWidth: 300,
      wordBreak: 'break-word' as const,
    } as React.CSSProperties,
    paginationWrapper: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '8px 0',
      gap: 8,
      fontSize: 13,
      color: t.font.color,
    } as React.CSSProperties,
    paginationBtn: {
      minWidth: 28,
      height: 28,
      padding: '0 6px',
      border: `1px solid ${t.table.buttonBorder}`,
      borderRadius: t.border.radius,
      background: t.table.buttonBg,
      cursor: 'pointer',
      fontSize: 13,
      color: t.table.buttonColor,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as React.CSSProperties,
    paginationBtnActive: {
      background: t.table.primaryButtonBg,
      color: t.table.primaryButtonColor,
      borderColor: t.table.primaryButtonBg,
    } as React.CSSProperties,
    paginationBtnDisabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    } as React.CSSProperties,
    paginationSelect: {
      padding: '2px 4px',
      border: `1px solid ${t.table.buttonBorder}`,
      borderRadius: t.border.radius,
      background: t.table.inputBg,
      color: t.font.color,
      fontSize: 13,
      outline: 'none',
    } as React.CSSProperties,
    // ColumnManager modal styles
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: t.table.modalMask,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as React.CSSProperties,
    modalContent: {
      background: t.table.modalBg,
      borderRadius: 8,
      padding: 20,
      minWidth: 520,
      maxWidth: 680,
      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
    } as React.CSSProperties,
    modalPanel: {
      flex: 1,
      border: `1px solid ${t.table.headerBorder}`,
      borderRadius: 4,
      minHeight: 200,
    } as React.CSSProperties,
    modalItem: (selected: boolean): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: 13,
      backgroundColor: selected ? t.table.selectedBg : 'transparent',
    }),
    modalBtn: {
      padding: '4px 8px',
      border: `1px solid ${t.table.buttonBorder}`,
      borderRadius: 4,
      background: t.table.buttonBg,
      cursor: 'pointer',
      fontSize: 16,
      lineHeight: 1,
      color: t.table.buttonColor,
    } as React.CSSProperties,
    modalPrimaryBtn: {
      padding: '5px 16px',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 13,
      background: t.table.primaryButtonBg,
      color: t.table.primaryButtonColor,
    } as React.CSSProperties,
    modalDefaultBtn: {
      padding: '5px 16px',
      border: `1px solid ${t.table.buttonBorder}`,
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 13,
      background: t.table.buttonBg,
      color: t.table.buttonColor,
    } as React.CSSProperties,
  };
}

// ---------------------------------------------------------------------------
// SVG Icon Components
// ---------------------------------------------------------------------------

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
      <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.98l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z" />
    </svg>
  );
}

function FunnelIcon() {
  return (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
    </svg>
  );
}

// Sort arrow icons — separate up/down for clarity
function SortUpIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} fill={active ? 'currentColor' : 'currentColor'} style={{ opacity: active ? 1 : 0.3 }}>
      <path d="M8 3l5 6H3z" />
    </svg>
  );
}

function SortDownIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} fill="currentColor" style={{ opacity: active ? 1 : 0.3 }}>
      <path d="M8 13l5-6H3z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function collectLeafColumns(columns: TableColumn[]): TableColumn[] {
  const result: TableColumn[] = [];
  for (const col of columns) {
    if (col.children && col.children.length > 0) {
      result.push(...collectLeafColumns(col.children));
    } else {
      result.push(col);
    }
  }
  return result;
}

function getMaxDepth(columns: TableColumn[]): number {
  let max = 1;
  for (const col of columns) {
    if (col.children && col.children.length > 0) {
      const d = getMaxDepth(col.children) + 1;
      if (d > max) max = d;
    }
  }
  return max;
}

function countLeaves(col: TableColumn[]): number {
  if (!col.children || col.children.length === 0) return 1;
  let c = 0;
  for (const ch of col.children) c += countLeaves(ch);
  return c;
}

function getRowKey(
  row: Record<string, unknown>,
  index: number,
  rowKey?: string | ((row: Record<string, unknown>, index: number) => string),
): string {
  if (typeof rowKey === 'function') return rowKey(row, index);
  if (typeof rowKey === 'string') return String(row[rowKey] ?? index);
  return String(index);
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

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

function fuzzyMatch(cellValue: unknown, keyword: string): boolean {
  if (!keyword) return true;
  return String(cellValue ?? '').toLowerCase().includes(keyword.toLowerCase());
}

function filterVisibleColumns(columns: TableColumn[], visibleKeys: Set<string>): TableColumn[] {
  const result: TableColumn[] = [];
  for (const col of columns) {
    if (col.children && col.children.length > 0) {
      const filteredChildren = filterVisibleColumns(col.children, visibleKeys);
      if (filteredChildren.length > 0) {
        result.push({ ...col, children: filteredChildren });
      }
    } else {
      if (visibleKeys.has(col.key)) {
        result.push(col);
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useTableSort(data: Record<string, unknown>[]) {
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

  return { sortedData, sortState, handleSort };
}

function useTableFilter(data: Record<string, unknown>[]) {
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
    return data.filter((row) => keys.every((k) => fuzzyMatch(row[k], filterState[k])));
  }, [data, filterState]);

  return { filteredData, filterState, setFilter, clearFilters };
}

function useTablePagination(
  totalItems: number,
  config?: PaginationConfig | boolean,
) {
  const pageSizeOpts = config && config !== true
    ? (config.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS)
    : DEFAULT_PAGE_SIZE_OPTIONS;
  const defaultPageSize = config && config !== true
    ? (config.defaultPageSize ?? DEFAULT_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: defaultPageSize,
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));

  useEffect(() => {
    setPagination((prev) => {
      const newTotalPages = Math.max(1, Math.ceil(totalItems / prev.pageSize));
      if (prev.current > newTotalPages) {
        return { ...prev, current: Math.max(1, newTotalPages) };
      }
      return prev;
    });
  }, [totalItems]);

  const paginatedRange = useMemo((): [number, number] => {
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = Math.min(start + pagination.pageSize, totalItems);
    return [start, end];
  }, [pagination, totalItems]);

  const changePage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, current: Math.max(1, Math.min(page, Math.ceil(totalItems / prev.pageSize))) }));
  }, [totalItems]);

  const changePageSize = useCallback((size: number) => {
    setPagination({ current: 1, pageSize: size });
  }, []);

  return { pagination, totalPages, paginatedRange, changePage, changePageSize, pageSizeOpts };
}

function useColumnManager(allLeafColumns: TableColumn[]) {
  const [visibleKeys, setVisibleKeys] = useState<string[]>(() => allLeafColumns.map((c) => c.key));
  const [managerOpen, setManagerOpen] = useState(false);

  const openManager = useCallback(() => setManagerOpen(true), []);
  const closeManager = useCallback(() => setManagerOpen(false), []);
  const applyColumns = useCallback((keys: string[]) => {
    setVisibleKeys(keys);
    setManagerOpen(false);
  }, []);

  return {
    visibleKeys,
    managerOpen,
    openManager,
    closeManager,
    applyColumns,
  };
}

// ---------------------------------------------------------------------------
// Merge cell computation
// ---------------------------------------------------------------------------

interface DeclaredMerge {
  rowSpan: number;
  hidden: boolean;
}

function buildDeclaredMergeMap(
  mergeRows: Array<{ startRowIndex: number; rowSpan: number; columnKey: string }>,
  leafColumns: TableColumn[],
): Record<string, DeclaredMerge> {
  const map: Record<string, DeclaredMerge> = {};
  for (const m of mergeRows) {
    const colIdx = leafColumns.findIndex((c) => c.key === m.columnKey);
    if (colIdx === -1) continue;
    map[`${m.startRowIndex}:${colIdx}`] = { rowSpan: m.rowSpan, hidden: false };
    for (let i = 1; i < m.rowSpan; i++) {
      map[`${m.startRowIndex + i}:${colIdx}`] = { rowSpan: 1, hidden: true };
    }
  }
  return map;
}

function computeMergeMap(
  data: Record<string, unknown>[],
  leafColumns: TableColumn[],
  declaredMerges?: Array<{ startRowIndex: number; rowSpan: number; columnKey: string }>,
): MergeMap {
  const map: MergeMap = {};

  if (declaredMerges && declaredMerges.length > 0) {
    const declared = buildDeclaredMergeMap(declaredMerges, leafColumns);
    for (const [k, v] of Object.entries(declared)) {
      map[k] = { rowSpan: v.rowSpan, colSpan: 1, hidden: v.hidden };
    }
  }

  for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
    for (let colIdx = 0; colIdx < leafColumns.length; colIdx++) {
      const col = leafColumns[colIdx];
      const value = data[rowIdx][col.key];
      const rs = col.rowSpan ? col.rowSpan(value, data[rowIdx], rowIdx) : 1;
      const cs = col.colSpan ? col.colSpan(value, data[rowIdx], rowIdx) : 1;
      if (rs > 1 || cs > 1) {
        map[`${rowIdx}:${colIdx}`] = { rowSpan: rs, colSpan: cs, hidden: false };
        for (let r = 0; r < rs; r++) {
          for (let c = 0; c < cs; c++) {
            if (r === 0 && c === 0) continue;
            const ck = `${rowIdx + r}:${colIdx + c}`;
            if (!map[ck]) map[ck] = { rowSpan: 1, colSpan: 1, hidden: true };
          }
        }
      }
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// HeaderTooltip
// ---------------------------------------------------------------------------

function HeaderTooltip({
  text,
  anchorRef,
}: {
  text: string;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ x: rect.left, y: rect.bottom + 4 });
    }
  }, [anchorRef]);

  if (!pos) return null;

  const st = createStyles(DEFAULT_THEME_TOKENS);
  return (
    <div style={{ ...st.tooltip, left: pos.x, top: pos.y }}>
      {text}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FilterDropdown — positioned below the funnel icon
// ---------------------------------------------------------------------------

function FilterDropdown({
  columnKey,
  columnTitle,
  currentValue,
  onConfirm,
  onClose,
  theme,
}: {
  columnKey: string;
  columnTitle: string;
  currentValue: string;
  onConfirm: (key: string, val: string) => void;
  onClose: () => void;
  theme: ThemeTokens;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(currentValue);
  const t = theme;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm(columnKey, inputValue);
    onClose();
  }, [columnKey, inputValue, onConfirm, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [handleConfirm, onClose]);

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 1050,
    background: t.table.modalBg,
    border: `1px solid ${t.table.headerBorder}`,
    borderRadius: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    padding: 8,
    minWidth: 180,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 8px',
    border: `1px solid ${t.table.inputBorder}`,
    borderRadius: t.border.radius,
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: t.table.inputBg,
    color: t.font.color,
  };

  const btnStyle: React.CSSProperties = {
    marginTop: 6,
    padding: '3px 12px',
    border: 'none',
    borderRadius: t.border.radius,
    fontSize: 12,
    cursor: 'pointer',
    background: t.table.primaryButtonBg,
    color: t.table.primaryButtonColor,
  };

  return (
    <div ref={ref} style={dropdownStyle} onClick={(e) => e.stopPropagation()}>
      <div style={{ fontSize: 12, color: t.font.tertiaryColor, marginBottom: 4 }}>筛选 {columnTitle}</div>
      <input
        type="text"
        placeholder="输入筛选关键词，回车确认"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={inputStyle}
        autoFocus
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
        <button style={btnStyle} onClick={handleConfirm}>确定</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ColumnManagerModal
// ---------------------------------------------------------------------------

function ColumnManagerModal({
  allLeafColumns,
  visibleKeys,
  onClose,
  onApply,
  theme,
}: {
  allLeafColumns: TableColumn[];
  visibleKeys: string[];
  onClose: () => void;
  onApply: (keys: string[]) => void;
  theme: ThemeTokens;
}): React.ReactElement {
  const st = useMemo(() => createStyles(theme), [theme]);

  const [leftKeys, setLeftKeys] = useState<string[]>(() =>
    allLeafColumns.map((c) => c.key).filter((k) => !visibleKeys.includes(k)),
  );
  const [rightKeys, setRightKeys] = useState<string[]>(() => [...visibleKeys]);
  const [leftSelected, setLeftSelected] = useState<Set<string>>(new Set());
  const [rightSelected, setRightSelected] = useState<Set<string>>(new Set());

  const keyToTitle = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of allLeafColumns) m[c.key] = c.title;
    return m;
  }, [allLeafColumns]);

  const moveToRight = useCallback(() => {
    setRightKeys((r) => [...r, ...leftSelected]);
    setLeftKeys((l) => l.filter((k) => !leftSelected.has(k)));
    setLeftSelected(new Set());
  }, [leftSelected]);

  const moveToLeft = useCallback(() => {
    setLeftKeys((l) => [...l, ...rightSelected]);
    setRightKeys((r) => r.filter((k) => !rightSelected.has(k)));
    setRightSelected(new Set());
  }, [rightSelected]);

  const moveAllToRight = useCallback(() => {
    setRightKeys((r) => [...r, ...leftKeys]);
    setLeftKeys([]);
    setLeftSelected(new Set());
  }, [leftKeys]);

  const moveAllToLeft = useCallback(() => {
    setLeftKeys((l) => [...l, ...rightKeys]);
    setRightKeys([]);
    setRightSelected(new Set());
  }, [rightKeys]);

  const handleApply = useCallback(() => {
    if (rightKeys.length > 0) {
      onApply(rightKeys);
    }
  }, [rightKeys, onApply]);

  const toggleLeft = useCallback((key: string) => {
    setLeftSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleRight = useCallback((key: string) => {
    setRightSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const headerStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontWeight: 600,
    fontSize: 13,
    background: theme.table.headerBg,
    borderBottom: `1px solid ${theme.table.headerBorder}`,
    color: theme.font.color,
  };

  return (
    <div style={st.modalOverlay} onClick={onClose}>
      <div style={st.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: theme.font.color }}>列管理</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={st.modalPanel}>
            <div style={headerStyle}>可选列</div>
            <ul style={{ padding: '4px 0', listStyle: 'none', margin: 0 }}>
              {leftKeys.map((key) => (
                <li key={key} style={st.modalItem(leftSelected.has(key))} onClick={() => toggleLeft(key)}>
                  <input type="checkbox" checked={leftSelected.has(key)} readOnly style={{ marginRight: 8 }} />
                  {keyToTitle[key] ?? key}
                </li>
              ))}
              {leftKeys.length === 0 && <li style={{ padding: 12, color: theme.font.tertiaryColor, fontSize: 13, textAlign: 'center' }}>暂无可选列</li>}
            </ul>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <button style={{ ...st.modalBtn, opacity: leftKeys.length === 0 ? 0.4 : 1 }} onClick={moveAllToRight} disabled={leftKeys.length === 0}>&gt;&gt;</button>
            <button style={{ ...st.modalBtn, opacity: leftSelected.size === 0 ? 0.4 : 1 }} onClick={moveToRight} disabled={leftSelected.size === 0}>&gt;</button>
            <button style={{ ...st.modalBtn, opacity: rightSelected.size === 0 ? 0.4 : 1 }} onClick={moveToLeft} disabled={rightSelected.size === 0}>&lt;</button>
            <button style={{ ...st.modalBtn, opacity: rightKeys.length === 0 ? 0.4 : 1 }} onClick={moveAllToLeft} disabled={rightKeys.length === 0}>&lt;&lt;</button>
          </div>
          <div style={st.modalPanel}>
            <div style={headerStyle}>已选列</div>
            <ul style={{ padding: '4px 0', listStyle: 'none', margin: 0 }}>
              {rightKeys.map((key) => (
                <li key={key} style={st.modalItem(rightSelected.has(key))} onClick={() => toggleRight(key)}>
                  <input type="checkbox" checked={rightSelected.has(key)} readOnly style={{ marginRight: 8 }} />
                  {keyToTitle[key] ?? key}
                </li>
              ))}
              {rightKeys.length === 0 && <li style={{ padding: 12, color: theme.font.tertiaryColor, fontSize: 13, textAlign: 'center' }}>暂无已选列</li>}
            </ul>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button style={st.modalDefaultBtn} onClick={onClose}>取消</button>
          <button style={{ ...st.modalPrimaryBtn, opacity: rightKeys.length === 0 ? 0.4 : 1, cursor: rightKeys.length === 0 ? 'not-allowed' : 'pointer' }} onClick={handleApply} disabled={rightKeys.length === 0}>确认</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination Component
// ---------------------------------------------------------------------------

function Pagination({
  current,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOpts,
  onPageChange,
  onPageSizeChange,
  styles: st,
}: {
  current: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOpts: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  styles: ReturnType<typeof createStyles>;
}) {
  if (totalItems <= pageSizeOpts[0] && totalPages <= 1) return null;

  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={st.paginationWrapper}>
      <span>共 {totalItems} 条</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        style={st.paginationSelect}
      >
        {pageSizeOpts.map((s) => (
          <option key={s} value={s}>{s} 条/页</option>
        ))}
      </select>
      <button
        style={{ ...st.paginationBtn, ...(current <= 1 ? st.paginationBtnDisabled : {}) }}
        onClick={() => onPageChange(current - 1)}
        disabled={current <= 1}
      >
        &lt;
      </button>
      {start > 1 && (
        <>
          <button style={st.paginationBtn} onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span>...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          style={{ ...st.paginationBtn, ...(p === current ? st.paginationBtnActive : {}) }}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span>...</span>}
          <button style={st.paginationBtn} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button
        style={{ ...st.paginationBtn, ...(current >= totalPages ? st.paginationBtnDisabled : {}) }}
        onClick={() => onPageChange(current + 1)}
        disabled={current >= totalPages}
      >
        &gt;
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main TableView Component
// ---------------------------------------------------------------------------

export interface TableViewProps {
  dataSource: Record<string, unknown>[];
  columns: TableColumn[];
  rowKey?: string | ((row: Record<string, unknown>, index: number) => string);
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  theme?: ThemeTokens;
  declaredMerges?: Array<{ startRowIndex: number; rowSpan: number; columnKey: string }>;
  showColumnManager?: boolean;
  pagination?: PaginationConfig | boolean;
}

export function TableView({
  dataSource,
  columns,
  rowKey,
  title,
  className,
  style,
  theme,
  declaredMerges,
  showColumnManager = false,
  pagination: paginationProp,
}: TableViewProps): React.ReactElement {
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null);
  const st = useMemo(() => createStyles(theme ?? DEFAULT_THEME_TOKENS), [theme]);

  // Leaf columns
  const leafColumns = useMemo(() => collectLeafColumns(columns), [columns]);

  // Column manager
  const { visibleKeys, managerOpen, openManager, closeManager, applyColumns } = useColumnManager(leafColumns);

  // Visible columns
  const visibleLeafCols = useMemo(
    () => leafColumns.filter((c) => visibleKeys.includes(c.key)),
    [leafColumns, visibleKeys],
  );
  const visibleColCount = visibleLeafCols.length;

  // Visible header tree
  const visibleHeaderColumns = useMemo(
    () => filterVisibleColumns(columns, new Set(visibleKeys)),
    [columns, visibleKeys],
  );
  const visibleHeaderMaxDepth = useMemo(() => getMaxDepth(visibleHeaderColumns), [visibleHeaderColumns]);

  // Data pipeline: filter → sort → paginate
  const { filteredData, filterState, setFilter } = useTableFilter(dataSource);
  const { sortedData, sortState, handleSort } = useTableSort(filteredData);

  // Pagination
  const enablePagination = paginationProp !== undefined && paginationProp !== false;
  const {
    pagination,
    totalPages,
    paginatedRange,
    changePage,
    changePageSize,
    pageSizeOpts,
  } = useTablePagination(sortedData.length, enablePagination ? (paginationProp === true ? undefined : paginationProp) : undefined);

  const finalData = enablePagination
    ? sortedData.slice(paginatedRange[0], paginatedRange[1])
    : sortedData;

  // Merge map
  const mergeMap = useMemo(
    () => computeMergeMap(
      finalData,
      visibleLeafCols,
      declaredMerges?.filter((m) => visibleKeys.includes(m.columnKey)),
    ),
    [finalData, visibleLeafCols, declaredMerges, visibleKeys],
  );

  const hasGear = showColumnManager && leafColumns.length > 1;

  // Tooltip state
  const [tooltipInfo, setTooltipInfo] = useState<{ text: string; rect: DOMRect } | null>(null);

  if (visibleColCount === 0) {
    return (
      <div style={{ ...st.wrapper, ...style }} className={className}>
        {title && <div style={st.title}>{title}</div>}
        <div style={st.empty}>暂无可见列</div>
      </div>
    );
  }

  // ---- Build header rows ----
  const headerRows: ReactNode[] = [];
  for (let level = 0; level < visibleHeaderMaxDepth; level++) {
    const cells: ReactNode[] = [];
    fillHeaderRow(
      visibleHeaderColumns, level, 0, cells, visibleHeaderMaxDepth,
      sortState, handleSort, filterState, setFilter,
      activeFilterKey, setActiveFilterKey,
    );
    headerRows.push(<tr key={`header-row-${level}`}>{cells}</tr>);
  }

  return (
    <div style={{ ...st.wrapper, ...style }} className={className}>
      {title && <div style={st.title}>{title}</div>}

      <table style={st.table}>
        <colgroup>
          {visibleLeafCols.map((col) => (
            <col key={`col-${col.key}`} style={col.width ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          {headerRows}
        </thead>
        <tbody>
          {finalData.length === 0 ? (
            <tr>
              <td colSpan={visibleColCount} style={st.empty}>暂无数据</td>
            </tr>
          ) : (
            finalData.map((row, rowIdx) => {
              const isHovered = hoverRow === rowIdx;
              return (
                <tr
                  key={getRowKey(row, rowIdx, rowKey)}
                  style={{ ...(rowIdx % 2 === 1 ? st.rowEven : {}), ...(isHovered ? st.rowHover : {}) }}
                  onMouseEnter={() => setHoverRow(rowIdx)}
                  onMouseLeave={() => setHoverRow(null)}
                >
                  {visibleLeafCols.map((col, colIdx) => {
                    const mergeKey = `${rowIdx}:${colIdx}`;
                    const merge = mergeMap[mergeKey];
                    if (merge && merge.hidden) return null;

                    const value = row[col.key];
                    let cellContent: ReactNode;
                    if (col.render) {
                      cellContent = col.render(value, row, rowIdx, col);
                    } else {
                      cellContent = formatCellValue(value);
                    }

                    return (
                      <td
                        key={col.key}
                        colSpan={merge && merge.colSpan > 1 ? merge.colSpan : undefined}
                        rowSpan={merge && merge.rowSpan > 1 ? merge.rowSpan : undefined}
                        style={{ ...st.td, ...(colIdx < visibleColCount - 1 ? st.tdRight : {}) }}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {enablePagination && (
        <Pagination
          current={pagination.current}
          totalPages={totalPages}
          totalItems={sortedData.length}
          pageSize={pagination.pageSize}
          pageSizeOpts={pageSizeOpts}
          onPageChange={changePage}
          onPageSizeChange={changePageSize}
          styles={st}
        />
      )}

      {/* Column manager modal */}
      {managerOpen && (
        <ColumnManagerModal
          allLeafColumns={leafColumns}
          visibleKeys={visibleKeys}
          onClose={closeManager}
          onApply={applyColumns}
          theme={theme ?? DEFAULT_THEME_TOKENS}
        />
      )}

      {/* Tooltip */}
      {tooltipInfo && (
        <div
          style={{
            ...st.tooltip,
            left: tooltipInfo.rect.left,
            top: tooltipInfo.rect.bottom + 4,
          }}
        >
          {tooltipInfo.text}
        </div>
      )}
    </div>
  );

  // ---- Header row filling (nested) ----
  function fillHeaderRow(
    cols: TableColumn[],
    targetLevel: number,
    currentLevel: number,
    cells: ReactNode[],
    maxDepth: number,
    ss: SortState,
    onSort: (key: string) => void,
    fs: FilterState,
    onSetFilter: (key: string, val: string) => void,
    activeFKey: string | null,
    setActiveFKey: (key: string | null) => void,
  ): number {
    let leafCount = 0;
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];
      const hasChildren = col.children && col.children.length > 0;

      if (currentLevel === targetLevel) {
        const span = hasChildren ? countLeaves(col) : 1;
        const depth = hasChildren ? 1 : (maxDepth - currentLevel);
        const isLeaf = !hasChildren;
        const isLastCol = isLeaf && i === cols.length - 1 && targetLevel === 0;

        if (isLeaf) {
          const isSorted = ss.columnKey === col.key;
          const sortDir = isSorted ? ss.direction : 'default';

          // Determine sort icon
          let sortIconEl: ReactNode = null;
          if (col.sortable) {
            if (sortDir === 'asc') {
              sortIconEl = (
                <span style={st.sortIcon}>
                  <SortUpIcon active={true} />
                </span>
              );
            } else if (sortDir === 'desc') {
              sortIconEl = (
                <span style={st.sortIcon}>
                  <SortDownIcon active={true} />
                </span>
              );
            } else {
              // default: show dimmed up arrow
              sortIconEl = (
                <span style={st.sortIcon}>
                  <SortUpIcon active={false} />
                </span>
              );
            }
          }

          const hasFilter = fs[col.key] && fs[col.key].length > 0;

          cells.push(
            <LeafHeaderCell
              key={`th-${col.key}`}
              col={col}
              sortIcon={sortIconEl}
              sortable={!!col.sortable}
              onSort={onSort}
              hasFilter={!!hasFilter}
              filterable={!!col.filterable}
              activeFilterKey={activeFKey}
              onSetActiveFilterKey={setActiveFKey}
              filterValue={fs[col.key] ?? ''}
              onSetFilter={onSetFilter}
              showGear={isLastCol && hasGear}
              onGearClick={openManager}
              onTooltip={setTooltipInfo}
              thStyle={st.th}
              thRightStyle={i < cols.length - 1 ? st.thRight : undefined}
              headerContentStyle={st.headerContent}
              headerTextStyle={st.headerText}
              filterIconStyle={st.filterIcon}
              filterIconActiveStyle={st.filterIconActive}
              gearIconStyle={st.gearIcon}
              resizeHandleStyle={st.resizeHandle}
              theme={theme ?? DEFAULT_THEME_TOKENS}
            />,
          );
        } else {
          cells.push(
            <th
              key={`th-${col.key}-${targetLevel}`}
              colSpan={span > 1 ? span : undefined}
              rowSpan={depth > 1 ? depth : undefined}
              style={st.th}
            >
              {col.title}
            </th>,
          );
        }
        leafCount += span;
      } else if (hasChildren) {
        leafCount += fillHeaderRow(col.children!, targetLevel, currentLevel + 1, cells, maxDepth, ss, onSort, fs, onSetFilter, activeFKey, setActiveFKey);
      } else if (currentLevel < targetLevel) {
        leafCount += 1;
      }
    }
    return leafCount;
  }
}

// ---------------------------------------------------------------------------
// LeafHeaderCell — handles sort, filter, gear, tooltip, resize
// ---------------------------------------------------------------------------

function LeafHeaderCell({
  col,
  sortIcon,
  sortable,
  onSort,
  hasFilter,
  filterable,
  activeFilterKey,
  onSetActiveFilterKey,
  filterValue,
  onSetFilter,
  showGear,
  onGearClick,
  onTooltip,
  thStyle,
  thRightStyle,
  headerContentStyle,
  headerTextStyle,
  filterIconStyle,
  filterIconActiveStyle,
  gearIconStyle,
  resizeHandleStyle,
  theme,
}: {
  col: TableColumn;
  sortIcon: ReactNode;
  sortable: boolean;
  onSort: (key: string) => void;
  hasFilter: boolean;
  filterable: boolean;
  activeFilterKey: string | null;
  onSetActiveFilterKey: (key: string | null) => void;
  filterValue: string;
  onSetFilter: (key: string, val: string) => void;
  showGear: boolean;
  onGearClick: () => void;
  onTooltip: (info: { text: string; rect: DOMRect } | null) => void;
  thStyle: React.CSSProperties;
  thRightStyle?: React.CSSProperties;
  headerContentStyle: React.CSSProperties;
  headerTextStyle: React.CSSProperties;
  filterIconStyle: React.CSSProperties;
  filterIconActiveStyle: React.CSSProperties;
  gearIconStyle: React.CSSProperties;
  resizeHandleStyle: React.CSSProperties;
  theme: ThemeTokens;
}) {
  const thRef = useRef<HTMLTableCellElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const isFilterOpen = activeFilterKey === col.key;

  // Check if text overflows
  const [isOverflow, setIsOverflow] = useState(false);
  useEffect(() => {
    if (textRef.current) {
      setIsOverflow(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  }, [col.title, isFilterOpen]);

  const handleMouseEnter = useCallback(() => {
    if (isOverflow && thRef.current) {
      const rect = thRef.current.getBoundingClientRect();
      onTooltip({ text: col.title, rect });
    }
  }, [isOverflow, col.title, onTooltip]);

  const handleMouseLeave = useCallback(() => {
    onTooltip(null);
  }, [onTooltip]);

  const handleFilterClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSetActiveFilterKey(isFilterOpen ? null : col.key);
  }, [col.key, isFilterOpen, onSetActiveFilterKey]);

  const handleThClick = useCallback(() => {
    if (sortable) onSort(col.key);
  }, [sortable, col.key, onSort]);

  // Resize
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const th = (e.target as HTMLElement).closest('th') as HTMLTableCellElement;
    if (!th) return;
    const startX = e.clientX;
    const startW = th.offsetWidth;
    const handle = e.target as HTMLElement;
    handle.style.backgroundColor = 'var(--resize-color, #1677ff)';

    const onMouseMove = (ev: MouseEvent) => {
      const diff = ev.clientX - startX;
      th.style.width = `${Math.max(50, startW + diff)}px`;
    };
    const onMouseUp = () => {
      handle.style.backgroundColor = 'transparent';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <th
      ref={thRef}
      style={{
        ...thStyle,
        ...(thRightStyle ?? {}),
        ...(sortable ? { cursor: 'pointer' } : {}),
      }}
      onClick={handleThClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={headerContentStyle}>
        <span ref={textRef} style={headerTextStyle}>
          {col.title}
        </span>
        {sortIcon}
        {filterable && (
          <span
            style={{
              ...filterIconStyle,
              ...(hasFilter ? filterIconActiveStyle : {}),
              color: hasFilter ? theme.semantic.info : theme.font.tertiaryColor,
            }}
            onClick={handleFilterClick}
          >
            <FunnelIcon />
          </span>
        )}
        {showGear && (
          <span style={gearIconStyle} onClick={(e) => { e.stopPropagation(); onGearClick(); }}>
            <GearIcon />
          </span>
        )}
      </div>
      {/* Filter dropdown — positioned absolute inside th */}
      {isFilterOpen && (
        <FilterDropdown
          columnKey={col.key}
          columnTitle={col.title}
          currentValue={filterValue}
          onConfirm={onSetFilter}
          onClose={() => onSetActiveFilterKey(null)}
          theme={theme}
        />
      )}
      {/* Resize handle */}
      <div
        style={resizeHandleStyle}
        onMouseDown={handleResizeMouseDown}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = 'var(--resize-color, #1677ff)'; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; }}
      />
    </th>
  );
}
