// ============================================================================
// component-handlers/table/types.ts — 表格组件类型定义
// ============================================================================

import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// 列配置
// ---------------------------------------------------------------------------

/** 排序方向 */
export type SortDirection = 'asc' | 'desc' | 'default';

/** 排序状态 */
export interface SortState {
  columnKey: string;
  direction: SortDirection;
}

/** 筛选状态：列 key → 筛选文本 */
export type FilterState = Record<string, string>;

/** 表格列配置（标准化后） */
export interface TableColumn {
  /** 列唯一标识 */
  key: string;
  /** 表头展示文案 */
  title: string;
  /** 列宽 */
  width?: string | number;
  /** 是否开启排序 */
  sortable?: boolean;
  /** 是否开启筛选 */
  filterable?: boolean;
  /** 单元格自定义渲染 */
  render?: (value: unknown, row: Record<string, unknown>, index: number, column: TableColumn) => ReactNode;
  /** 动态跨行合并 */
  rowSpan?: (value: unknown, row: Record<string, unknown>, index: number) => number;
  /** 动态跨列合并 */
  colSpan?: (value: unknown, row: Record<string, unknown>, index: number) => number;
  /** 子列（多级表头） */
  children?: TableColumn[];
}

// ---------------------------------------------------------------------------
// 表格组件 Props
// ---------------------------------------------------------------------------

/** 表格组件标准 Props */
export interface TableViewProps {
  /** 数据源 */
  dataSource: Record<string, unknown>[];
  /** 列配置 */
  columns: TableColumn[];
  /** 行唯一标识字段名或生成函数 */
  rowKey?: string | ((row: Record<string, unknown>, index: number) => string);
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// 合并单元格信息
// ---------------------------------------------------------------------------

/** 单元格合并信息 */
export interface CellMerge {
  /** 跨行数 */
  rowSpan: number;
  /** 跨列数 */
  colSpan: number;
  /** 是否为被合并覆盖的隐藏单元格 */
  hidden: boolean;
}

/** 合并单元格映射：`rowIndex:colIndex` → CellMerge */
export type MergeMap = Record<string, CellMerge>;
