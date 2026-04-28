// ============================================================================
// component-handlers/composite-table/CompositeTableView.tsx — 组合表格视图
// ============================================================================

import { useMemo, type ReactNode } from 'react';
import type { ThemeTokens } from '../../theme/theme-tokens';
import { DEFAULT_THEME_TOKENS } from '../../theme/theme-tokens';
import { TableView } from '../table/TableView';
import type { TableColumn, MergeColumnInfoView } from '../table/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubTableConfig {
  title?: string;
  columns: TableColumn[];
  data: Record<string, unknown>[];
  mergeColumns?: MergeColumnInfoView[];
}

export interface CompositeTableViewProps {
  /** 组合表格主标题 */
  title?: string;
  /** 子表格列表 */
  tables: SubTableConfig[];
  /** 主题 */
  theme?: ThemeTokens;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Style factory
// ---------------------------------------------------------------------------

function createCompositeStyles(t: ThemeTokens) {
  return {
    wrapper: { width: '100%', overflowX: 'auto' } as React.CSSProperties,
    title: {
      fontWeight: 600,
      fontSize: 16,
      marginBottom: 0,
      color: t.font.color,
    } as React.CSSProperties,
    subTableTitle: {
      fontWeight: 600,
      fontSize: 13,
      textAlign: 'center' as const,
      backgroundColor: t.table.rowStripeBg,
      padding: '8px 12px',
      borderBottom: `1px solid ${t.table.cellBorder}`,
      color: t.font.color,
    } as React.CSSProperties,
    tableWrapper: {
      marginBottom: 0,
    } as React.CSSProperties,
    lastTableWrapper: {
      marginBottom: 0,
    } as React.CSSProperties,
  };
}

// ---------------------------------------------------------------------------
// CompositeTableView Component
// ---------------------------------------------------------------------------

export function CompositeTableView({
  title,
  tables,
  theme,
  className,
  style,
}: CompositeTableViewProps): React.ReactElement {
  const t = theme ?? DEFAULT_THEME_TOKENS;
  const st = useMemo(() => createCompositeStyles(t), [t]);

  return (
    <div style={{ ...st.wrapper, ...style }} className={className}>
      {title && <div style={st.title}>{title}</div>}
      {tables.map((subTable, idx) => (
        <div key={`sub-table-${idx}`}>
          {subTable.title && (
            <div style={st.subTableTitle}>{subTable.title}</div>
          )}
          <div style={idx < tables.length - 1 ? st.tableWrapper : st.lastTableWrapper}>
            <TableView
              dataSource={subTable.data}
              columns={subTable.columns}
              theme={theme}
              mergeColumns={subTable.mergeColumns}
              disableInteractions={true}
              isSubTable={true}
              style={{
                margin: 0,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
