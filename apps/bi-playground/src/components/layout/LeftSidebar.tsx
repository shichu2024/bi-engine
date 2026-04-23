import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppstoreOutlined } from '@ant-design/icons';
import { useLayoutStore, useThemeStore } from '@/stores';
import { ComponentTree } from './ComponentTree';
import styles from './LeftSidebar.module.css';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const COLLAPSED_WIDTH = 64;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeftSidebarProps {
  readonly children?: ReactNode;
}

// ---------------------------------------------------------------------------
// LeftSidebar
// ---------------------------------------------------------------------------

export function LeftSidebar({ children }: LeftSidebarProps): React.ReactElement {
  const sidebarWidth = useLayoutStore((s) => s.sidebarWidth);
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const setSidebarWidth = useLayoutStore((s) => s.setSidebarWidth);
  const themeMode = useThemeStore((s) => s.mode);

  const [dragging, setDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isDark = themeMode === 'dark';

  const width = sidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

  // ---- Drag to resize -----------------------------------------------------

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, setSidebarWidth]);

  // ---- Classes ------------------------------------------------------------

  const sidebarClassName = [
    styles.sidebar,
    isDark ? styles.sidebarDark : '',
    sidebarCollapsed ? styles.sidebarCollapsed : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClassName = [
    styles.dragHandle,
    dragging ? styles.dragHandleActive : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={sidebarRef}
      className={sidebarClassName}
      style={{ width }}
    >
      {/* Collapsed icon */}
      <div className={styles.collapsedIcon}>
        <AppstoreOutlined />
      </div>

      {/* Search area */}
      {!sidebarCollapsed && (
        <div className={styles.searchArea}>
          {children}
        </div>
      )}

      {/* Component tree */}
      {!sidebarCollapsed && (
        <div className={styles.treeContent}>
          <ComponentTree />
        </div>
      )}

      {/* Drag handle */}
      {!sidebarCollapsed && (
        <div
          className={handleClassName}
          onMouseDown={handleMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={sidebarWidth}
          aria-valuemin={MIN_WIDTH}
          aria-valuemax={MAX_WIDTH}
        />
      )}
    </div>
  );
}
