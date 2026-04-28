import { ComponentTreeItem } from './ComponentTreeItem';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: readonly { kind: string; label: string }[] = [
  { kind: 'line', label: '折线图' },
  { kind: 'bar', label: '柱状图' },
  { kind: 'pie', label: '饼图' },
  { kind: 'scatter', label: '散点图' },
  { kind: 'radar', label: '雷达图' },
  { kind: 'candlestick', label: '蜡烛图' },
  { kind: 'gauge', label: '仪表盘' },
  { kind: 'table', label: '表格' },
  { kind: 'compositeTable', label: '组合表格' },
  { kind: 'text', label: '文本' },
  { kind: 'markdown', label: 'Markdown' },
];

// ---------------------------------------------------------------------------
// ComponentTree — flat category list
// ---------------------------------------------------------------------------

export function ComponentTree(): React.ReactElement {
  return (
    <div>
      {CATEGORIES.map((cat) => (
        <ComponentTreeItem key={cat.kind} kind={cat.kind} label={cat.label} />
      ))}
    </div>
  );
}
