// ============================================================================
// component-handlers/table/TableView.tsx — 原生 React 表格视图组件
// ============================================================================

import { useState, useCallback, useMemo, Fragment, type ReactNode } from 'react';
import type {
  TableColumn,
  SortState,
  SortDirection,
  FilterState,
  CellMerge,
  MergeMap,
} from './types';

// ---------------------------------------------------------------------------
// 样式常量
// ---------------------------------------------------------------------------

const S = {
  wrapper: { width: '100%', overflowX: 'auto', fontSize: 14, color: '#333' } as React.CSSProperties,
  title: { fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#1a1a1a' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse', border: '1px solid #e8e8e8', tableLayout: 'auto' as const } as React.CSSProperties,
  th: { padding: '10px 12px', fontWeight: 600, fontSize: 13, backgroundColor: '#fafafa', borderBottom: '2px solid #e8e8e8', textAlign: 'left', whiteSpace: 'nowrap', userSelect: 'none' as const } as React.CSSProperties,
  td: { padding: '8px 12px', borderBottom: '1px solid #f0f0f0', fontSize: 14 } as React.CSSProperties,
  thSortable: { cursor: 'pointer' } as React.CSSProperties,
  thRight: { borderRight: '1px solid #f0f0f0' } as React.CSSProperties,
  tdRight: { borderRight: '1px solid #f0f0f0' } as React.CSSProperties,
  rowEven: { backgroundColor: '#fafafa' } as React.CSSProperties,
  rowHover: { backgroundColor: '#e6f7ff' } as React.CSSProperties,
  empty: { textAlign: 'center', padding: '32px 16px', color: '#999', fontSize: 14 } as React.CSSProperties,
  sortIcon: { display: 'inline-flex', flexDirection: 'column', marginLeft: 4, verticalAlign: 'middle', lineHeight: 1, fontSize: 10, color: '#bbb' } as React.CSSProperties,
  sortIconActive: { color: '#1890ff' } as React.CSSProperties,
  arrow: { lineHeight: '8px' } as React.CSSProperties,
  filterRow: (padding: string): React.CSSProperties => ({ padding, backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8' }),
  filterInput: { width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 12, outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  toolbar: { display: 'flex', justifyContent: 'flex-end', marginBottom: 8 } as React.CSSProperties,
  toolbarBtn: { padding: '4px 12px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#333' } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

/** 收集叶子列（平铺多级表头） */
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

/** 计算列树最大深度 */
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

/** 计算列叶子数 */
function countLeaves(col: TableColumn): number {
  if (!col.children || col.children.length === 0) return 1;
  let c = 0;
  for (const ch of col.children) c += countLeaves(ch);
  return c;
}

/** 获取行唯一 key */
function getRowKey(
  row: Record<string, unknown>,
  index: number,
  rowKey?: string | ((row: Record<string, unknown>, index: number) => string),
): string {
  if (typeof rowKey === 'function') return rowKey(row, index);
  if (typeof rowKey === 'string') return String(row[rowKey] ?? index);
  return String(index);
}

/** 格式化单元格值 */
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

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

/** 筛选：模糊匹配（不区分大小写） */
function fuzzyMatch(cellValue: unknown, keyword: string): boolean {
  if (!keyword) return true;
  return String(cellValue ?? '').toLowerCase().includes(keyword.toLowerCase());
}

// ---------------------------------------------------------------------------
// 排序 Hook
// ---------------------------------------------------------------------------

function useTableSort(
  data: Record<string, unknown>[],
  columns: TableColumn[],
) {
  const [sortState, setSortState] = useState<SortState>({ columnKey: '', direction: 'default' });

  const handleSort = useCallback((columnKey: string) => {
    setSortState((prev) => {
      if (prev.columnKey !== columnKey) {
        return { columnKey, direction: 'asc' };
      }
      const next: SortDirection = prev.direction === 'default' ? 'asc' : prev.direction === 'asc' ? 'desc' : 'default';
      return { columnKey, direction: next };
    });
  }, []);

  const sortedData = useMemo(() => {
    if (!sortState.columnKey || sortState.direction === 'default') return data;
    return [...data].sort((a, b) => compareValues(a[sortState.columnKey], b[sortState.columnKey], sortState.direction));
  }, [data, sortState]);

  return { sortedData, sortState, handleSort };
}

// ---------------------------------------------------------------------------
// 筛选 Hook
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 列管理 Hook
// ---------------------------------------------------------------------------

function useColumnManager(allColumns: TableColumn[]) {
  const leafCols = useMemo(() => collectLeafColumns(allColumns), [allColumns]);
  const initialVisible = useMemo(() => leafCols.map((c) => c.key), [leafCols]);
  const [visibleKeys, setVisibleKeys] = useState<string[]>(initialVisible);
  const [managerOpen, setManagerOpen] = useState(false);

  const openManager = useCallback(() => setManagerOpen(true), []);
  const closeManager = useCallback(() => setManagerOpen(false), []);
  const applyColumns = useCallback((keys: string[]) => {
    setVisibleKeys(keys);
    setManagerOpen(false);
  }, []);

  // Reset when columns change
  const colKeyStr = leafCols.map((c) => c.key).join(',');
  const visibleKeysMemo = useMemo(() => {
    const valid = visibleKeys.filter((k) => leafCols.some((c) => c.key === k));
    return valid.length > 0 ? valid : leafCols.map((c) => c.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colKeyStr, leafCols]);

  return { visibleKeys: visibleKeysMemo, managerOpen, openManager, closeManager, applyColumns, allLeafColumns: leafCols };
}

// ---------------------------------------------------------------------------
// 合并单元格计算
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
  declaredMerges: Array<{ startRowIndex: number; rowSpan: number; columnKey: string }> | undefined,
): MergeMap {
  const map: MergeMap = {};

  // 1. Declarative merges
  if (declaredMerges && declaredMerges.length > 0) {
    const declared = buildDeclaredMergeMap(declaredMerges, leafColumns);
    for (const [k, v] of Object.entries(declared)) {
      map[k] = { rowSpan: v.rowSpan, colSpan: 1, hidden: v.hidden };
    }
  }

  // 2. Column-level function merges (override declarative)
  for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
    for (let colIdx = 0; colIdx < leafColumns.length; colIdx++) {
      const col = leafColumns[colIdx];
      const value = data[rowIdx][col.key];

      const rs = col.rowSpan ? col.rowSpan(value, data[rowIdx], rowIdx) : 1;
      const cs = col.colSpan ? col.colSpan(value, data[rowIdx], rowIdx) : 1;

      if (rs > 1 || cs > 1) {
        const key = `${rowIdx}:${colIdx}`;
        map[key] = { rowSpan: rs, colSpan: cs, hidden: false };

        // Mark covered cells as hidden
        for (let r = 0; r < rs; r++) {
          for (let c = 0; c < cs; c++) {
            if (r === 0 && c === 0) continue;
            const ck = `${rowIdx + r}:${colIdx + c}`;
            if (!map[ck]) {
              map[ck] = { rowSpan: 1, colSpan: 1, hidden: true };
            }
          }
        }
      }
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Header rendering
// ---------------------------------------------------------------------------

function renderHeaderRows(
  columns: TableColumn[],
  totalLeafCount: number,
  maxDepth: number,
  sortState: SortState,
  filterState: FilterState,
  onSort: (key: string) => void,
  onFilter: (key: string, value: string) => void,
  leafColumns: TableColumn[],
): ReactNode[] {
  const rows: ReactNode[] = [];
  const hasSortable = leafColumns.some((c) => c.sortable);
  const hasFilterable = leafColumns.some((c) => c.filterable);

  // Header rows
  for (let level = 0; level < maxDepth; level++) {
    const cells: ReactNode[] = [];
    fillHeaderRow(columns, level, 0, cells, maxDepth, totalLeafCount, sortState, onSort);
    rows.push(
      <tr key={`header-row-${level}`}>{cells}</tr>,
    );
  }

  // Filter row
  if (hasFilterable) {
    const filterCells: ReactNode[] = [];
    for (let i = 0; i < totalLeafCount; i++) {
      const col = leafColumns[i];
      if (col.filterable) {
        filterCells.push(
          <td key={`filter-${col.key}`} style={S.filterRow('4px 8px')}>
            <input
              type="text"
              placeholder={`筛选 ${col.title}`}
              value={filterState[col.key] ?? ''}
              onChange={(e) => onFilter(col.key, e.target.value)}
              style={S.filterInput}
            />
          </td>,
        );
      } else {
        filterCells.push(
          <td key={`filter-${col.key}`} style={S.filterRow('0')} />,
        );
      }
    }
    rows.push(<tr key="filter-row">{filterCells}</tr>);
  }

  return rows;
}

function fillHeaderRow(
  columns: TableColumn[],
  targetLevel: number,
  currentLevel: number,
  cells: ReactNode[],
  maxDepth: number,
  _totalLeafCount: number,
  sortState: SortState,
  onSort: (key: string) => void,
): number {
  let leafCount = 0;
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const hasChildren = col.children && col.children.length > 0;

    if (currentLevel === targetLevel) {
      const span = hasChildren ? countLeaves(col) : 1;
      const depth = hasChildren ? 1 : (maxDepth - currentLevel);
      const isLeaf = !hasChildren;
      const isSorted = isLeaf && sortState.columnKey === col.key;
      const isActive = isSorted && sortState.direction !== 'default';

      cells.push(
        <th
          key={`th-${cells.length}`}
          colSpan={span > 1 ? span : undefined}
          rowSpan={depth > 1 ? depth : undefined}
          style={{
            ...S.th,
            ...(cells.length > 0 ? S.thRight : {}),
            ...(isLeaf && col.sortable ? S.thSortable : {}),
          }}
          onClick={isLeaf && col.sortable ? () => onSort(col.key) : undefined}
        >
          {col.title}
          {isLeaf && col.sortable && (
            <span style={{ ...S.sortIcon, ...(isActive ? S.sortIconActive : {}) }}>
              <span style={{ ...S.arrow, ...(isActive && sortState.direction === 'asc' ? { color: '#1890ff' } : {}) }}>&#9650;</span>
              <span style={{ ...S.arrow, ...(isActive && sortState.direction === 'desc' ? { color: '#1890ff' } : {}) }}>&#9660;</span>
            </span>
          )}
        </th>,
      );
      leafCount += span;
    } else if (hasChildren) {
      leafCount += fillHeaderRow(col.children!, targetLevel, currentLevel + 1, cells, maxDepth, _totalLeafCount, sortState, onSort);
    } else if (currentLevel < targetLevel) {
      leafCount += 1;
    }
  }
  return leafCount;
}

// ---------------------------------------------------------------------------
// ColumnManager Modal
// ---------------------------------------------------------------------------

function ColumnManagerModal({
  allLeafColumns,
  visibleKeys,
  onClose,
  onApply,
}: {
  allLeafColumns: TableColumn[];
  visibleKeys: string[];
  onClose: () => void;
  onApply: (keys: string[]) => void;
}): React.ReactElement {
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
    onApply(rightKeys);
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

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.45)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  const modalStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 8, padding: 20, minWidth: 520, maxWidth: 680,
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
  };

  const panelStyle: React.CSSProperties = {
    flex: 1, border: '1px solid #e8e8e8', borderRadius: 4, minHeight: 200,
  };

  const itemStyle = (selected: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', padding: '6px 12px', cursor: 'pointer', fontSize: 13,
    backgroundColor: selected ? '#bae7ff' : 'transparent',
  });

  const btnStyle: React.CSSProperties = {
    padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff',
    cursor: 'pointer', fontSize: 16, lineHeight: 1,
  };

  const primaryBtnStyle: React.CSSProperties = {
    padding: '5px 16px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13,
    background: '#1890ff', color: '#fff',
  };

  const defaultBtnStyle: React.CSSProperties = {
    padding: '5px 16px', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', fontSize: 13,
    background: '#fff',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>列管理</div>
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Left panel - hidden columns */}
          <div style={panelStyle}>
            <div style={{ padding: '8px 12px', fontWeight: 600, fontSize: 13, background: '#fafafa', borderBottom: '1px solid #e8e8e8' }}>
              可选列
            </div>
            <ul style={{ padding: '4px 0', listStyle: 'none', margin: 0 }}>
              {leftKeys.map((key) => (
                <li key={key} style={itemStyle(leftSelected.has(key))} onClick={() => toggleLeft(key)}>
                  <input type="checkbox" checked={leftSelected.has(key)} readOnly style={{ marginRight: 8 }} />
                  {keyToTitle[key] ?? key}
                </li>
              ))}
              {leftKeys.length === 0 && <li style={{ padding: '12px', color: '#999', fontSize: 13, textAlign: 'center' }}>暂无可选列</li>}
            </ul>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <button style={{ ...btnStyle, opacity: leftKeys.length === 0 ? 0.4 : 1 }} onClick={moveAllToRight} disabled={leftKeys.length === 0}>&gt;&gt;</button>
            <button style={{ ...btnStyle, opacity: leftSelected.size === 0 ? 0.4 : 1 }} onClick={moveToRight} disabled={leftSelected.size === 0}>&gt;</button>
            <button style={{ ...btnStyle, opacity: rightSelected.size === 0 ? 0.4 : 1 }} onClick={moveToLeft} disabled={rightSelected.size === 0}>&lt;</button>
            <button style={{ ...btnStyle, opacity: rightKeys.length === 0 ? 0.4 : 1 }} onClick={moveAllToLeft} disabled={rightKeys.length === 0}>&lt;&lt;</button>
          </div>

          {/* Right panel - visible columns */}
          <div style={panelStyle}>
            <div style={{ padding: '8px 12px', fontWeight: 600, fontSize: 13, background: '#fafafa', borderBottom: '1px solid #e8e8e8' }}>
              已选列
            </div>
            <ul style={{ padding: '4px 0', listStyle: 'none', margin: 0 }}>
              {rightKeys.map((key) => (
                <li key={key} style={itemStyle(rightSelected.has(key))} onClick={() => toggleRight(key)}>
                  <input type="checkbox" checked={rightSelected.has(key)} readOnly style={{ marginRight: 8 }} />
                  {keyToTitle[key] ?? key}
                </li>
              ))}
              {rightKeys.length === 0 && <li style={{ padding: '12px', color: '#999', fontSize: 13, textAlign: 'center' }}>暂无已选列</li>}
            </ul>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button style={defaultBtnStyle} onClick={onClose}>取消</button>
          <button style={primaryBtnStyle} onClick={handleApply}>确认</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TableView 主组件
// ---------------------------------------------------------------------------

export interface TableViewProps {
  /** 数据源 */
  dataSource: Record<string, unknown>[];
  /** 列配置 */
  columns: TableColumn[];
  /** 行唯一标识 */
  rowKey?: string | ((row: Record<string, unknown>, index: number) => string);
  /** 标题 */
  title?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 声明式行合并配置 */
  declaredMerges?: Array<{ startRowIndex: number; rowSpan: number; columnKey: string }>;
}

export function TableView({
  dataSource,
  columns,
  rowKey,
  title,
  className,
  style,
  declaredMerges,
}: TableViewProps): React.ReactElement {
  const [hoverRow, setHoverRow] = useState<number | null>(null);

  const { sortedData, sortState, handleSort } = useTableSort(dataSource, columns);
  const { filteredData, filterState, setFilter } = useTableFilter(sortedData);
  const { visibleKeys, managerOpen, openManager, closeManager, applyColumns, allLeafColumns } = useColumnManager(columns);

  const maxDepth = useMemo(() => getMaxDepth(columns), [columns]);
  const leafColumns = useMemo(() => collectLeafColumns(columns), [columns]);
  const visibleLeafCols = useMemo(() => leafColumns.filter((c) => visibleKeys.includes(c.key)), [leafColumns, visibleKeys]);
  const visibleColCount = visibleLeafCols.length;

  // Build merge map for visible columns only
  const mergeMap = useMemo(
    () => computeMergeMap(filteredData, visibleLeafCols, declaredMerges?.filter((m) => visibleKeys.includes(m.columnKey))),
    [filteredData, visibleLeafCols, declaredMerges, visibleKeys],
  );

  const hasSortable = leafColumns.some((c) => c.sortable);
  const hasFilterable = leafColumns.some((c) => c.filterable);
  const hasColumnManager = leafColumns.length > 1;

  // Build visible columns version of header columns tree
  // For simplicity, we keep the original header tree but only show visible leaf columns
  // We need to rebuild the header to only include visible columns
  const visibleHeaderColumns = useMemo(() => {
    return filterVisibleColumns(columns, new Set(visibleKeys));
  }, [columns, visibleKeys]);

  const visibleHeaderMaxDepth = useMemo(() => getMaxDepth(visibleHeaderColumns), [visibleHeaderColumns]);
  const visibleHeaderLeafCount = useMemo(() => {
    let count = 0;
    for (const c of visibleHeaderColumns) count += countLeaves(c);
    return count;
  }, [visibleHeaderColumns]);

  if (visibleColCount === 0) {
    return (
      <div style={{ ...S.wrapper, ...style }} className={className}>
        {title && <div style={S.title}>{title}</div>}
        <div style={S.empty}>暂无可见列</div>
      </div>
    );
  }

  return (
    <div style={{ ...S.wrapper, ...style }} className={className}>
      {title && <div style={S.title}>{title}</div>}

      {/* Toolbar */}
      {hasColumnManager && (
        <div style={S.toolbar}>
          <button style={S.toolbarBtn} onClick={openManager}>列管理</button>
        </div>
      )}

      <table style={S.table}>
        <thead>
          {renderHeaderRows(
            visibleHeaderColumns,
            visibleHeaderLeafCount,
            visibleHeaderMaxDepth,
            sortState,
            filterState,
            handleSort,
            setFilter,
            visibleLeafCols,
          )}
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={visibleColCount} style={S.empty}>暂无数据</td>
            </tr>
          ) : (
            filteredData.map((row, rowIdx) => {
              const isHovered = hoverRow === rowIdx;
              return (
                <tr
                  key={getRowKey(row, rowIdx, rowKey)}
                  style={{ ...(rowIdx % 2 === 1 ? S.rowEven : {}), ...(isHovered ? S.rowHover : {}) }}
                  onMouseEnter={() => setHoverRow(rowIdx)}
                  onMouseLeave={() => setHoverRow(null)}
                >
                  {visibleLeafCols.map((col, colIdx) => {
                    const mergeKey = `${rowIdx}:${colIdx}`;
                    const merge = mergeMap[mergeKey];

                    if (merge && merge.hidden) return null;

                    const value = row[col.key];

                    // Custom render
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
                        style={{ ...S.td, ...(colIdx < visibleColCount - 1 ? S.tdRight : {}) }}
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

      {/* Column manager modal */}
      {managerOpen && (
        <ColumnManagerModal
          allLeafColumns={allLeafColumns}
          visibleKeys={visibleKeys}
          onClose={closeManager}
          onApply={applyColumns}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 过滤可见列（保留多级表头结构）
// ---------------------------------------------------------------------------

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
