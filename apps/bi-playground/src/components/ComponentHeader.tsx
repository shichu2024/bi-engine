import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComponentHeaderProps {
  /** 组件标题（如 dataProperties.title 或 fixture 名称） */
  title: string;
  /** 右侧工具栏区域 */
  toolbar?: ReactNode;
  /** 额外信息（如组件类型标签） */
  extra?: ReactNode;
}

// ---------------------------------------------------------------------------
// ComponentHeader
// ---------------------------------------------------------------------------

/**
 * 统一组件头部：title（溢出省略） + toolbar。
 *
 * 图表、表格、文本等所有组件类型复用此头部。
 */
export function ComponentHeader({
  title,
  toolbar,
  extra,
}: ComponentHeaderProps): React.ReactElement {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      minHeight: 36,
      borderBottom: '1px solid #f0f0f0',
      flexShrink: 0,
    }}
    data-testid="component-header"
    >
      <div style={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontWeight: 700,
        fontSize: 14,
      }}>
        {title}
      </div>

      {extra !== undefined && (
        <div style={{ flexShrink: 0 }}>
          {extra}
        </div>
      )}

      {toolbar !== undefined && (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          {toolbar}
        </div>
      )}
    </div>
  );
}
