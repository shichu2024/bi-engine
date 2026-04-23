import { useCallback } from 'react';
import { useComponentStore } from '@/stores';
import styles from './LeftSidebar.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComponentTreeItemProps {
  readonly kind: string;
  readonly label: string;
}

// ---------------------------------------------------------------------------
// ComponentTreeItem — single category row
// ---------------------------------------------------------------------------

export function ComponentTreeItem({ kind, label }: ComponentTreeItemProps): React.ReactElement {
  const selectedComponentId = useComponentStore((s) => s.selectedComponentId);
  const selectComponent = useComponentStore((s) => s.selectComponent);

  const isSelected = selectedComponentId === kind;

  const handleClick = useCallback(() => {
    selectComponent(kind);
  }, [selectComponent, kind]);

  const itemClassName = `${styles.treeItem}${isSelected ? ` ${styles.treeItemSelected}` : ''}`;

  return (
    <div className={itemClassName} onClick={handleClick} role="button" tabIndex={0}>
      <div className={styles.itemInfo}>
        <div className={styles.itemName}>{label}</div>
      </div>
    </div>
  );
}
