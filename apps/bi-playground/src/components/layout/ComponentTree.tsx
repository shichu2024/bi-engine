import { ComponentTreeItem } from './ComponentTreeItem';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: readonly { kind: string; label: string }[] = [
  { kind: 'line', label: '折线图' },
  { kind: 'bar', label: '柱状图' },
  { kind: 'pie', label: '饼图' },
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
