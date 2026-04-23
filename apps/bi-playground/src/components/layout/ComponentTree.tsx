import { useMemo } from 'react';
import { useComponentStore } from '@/stores';
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
// ComponentTree — flat category list (折线图 / 柱状图 / 饼图)
// ---------------------------------------------------------------------------

export function ComponentTree(): React.ReactElement {
  const searchKeyword = useComponentStore((s) => s.searchKeyword);

  const filtered = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      return CATEGORIES;
    }
    return CATEGORIES.filter(
      (c) => c.label.toLowerCase().includes(keyword) || c.kind.toLowerCase().includes(keyword),
    );
  }, [searchKeyword]);

  if (filtered.length === 0) {
    return <div style={{ padding: '16px 12px', color: '#8c8c8c', fontSize: 13 }}>暂无匹配组件</div>;
  }

  return (
    <div>
      {filtered.map((cat) => (
        <ComponentTreeItem key={cat.kind} kind={cat.kind} label={cat.label} />
      ))}
    </div>
  );
}
