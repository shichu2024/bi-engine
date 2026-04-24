import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './LeftSidebar.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComponentTreeItemProps {
  readonly kind: string;
  readonly label: string;
}

// ---------------------------------------------------------------------------
// ComponentTreeItem — navigates via route, highlights active from URL
// ---------------------------------------------------------------------------

export function ComponentTreeItem({ kind, label }: ComponentTreeItemProps): React.ReactElement {
  const navigate = useNavigate();
  const { kind: activeKind } = useParams<{ readonly kind: string }>();

  const isSelected = (activeKind ?? 'line') === kind;

  const handleClick = useCallback(() => {
    navigate(`/${kind}`);
  }, [navigate, kind]);

  const itemClassName = `${styles.treeItem}${isSelected ? ` ${styles.treeItemSelected}` : ''}`;

  return (
    <div className={itemClassName} onClick={handleClick} role="button" tabIndex={0}>
      <div className={styles.itemInfo}>
        <div className={styles.itemName}>{label}</div>
      </div>
    </div>
  );
}
