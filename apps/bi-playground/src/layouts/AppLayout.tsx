import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useLayoutStore } from '@/stores';
import styles from './AppLayout.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppLayoutProps {
  readonly isDark: boolean;
  readonly topBarSlot?: ReactNode;
  readonly sidebarSlot?: ReactNode;
}

// ---------------------------------------------------------------------------
// Breakpoint hook
// ---------------------------------------------------------------------------

type ScreenSize = 'desktop' | 'tablet' | 'mobile';

function useScreenSize(): ScreenSize {
  const [size, setSize] = useState<ScreenSize>(() => {
    if (typeof window === 'undefined') {
      return 'desktop';
    }
    if (window.innerWidth < 768) {
      return 'mobile';
    }
    if (window.innerWidth < 1200) {
      return 'tablet';
    }
    return 'desktop';
  });

  useEffect(() => {
    function handleResize(): void {
      if (window.innerWidth < 768) {
        setSize('mobile');
      } else if (window.innerWidth < 1200) {
        setSize('tablet');
      } else {
        setSize('desktop');
      }
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppLayout({
  isDark,
  topBarSlot,
  sidebarSlot,
}: AppLayoutProps): React.ReactElement {
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useLayoutStore((s) => s.setSidebarCollapsed);
  const screenSize = useScreenSize();

  // Mobile drawer open state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on screen size change to desktop/tablet
  useEffect(() => {
    if (screenSize !== 'mobile') {
      setDrawerOpen(false);
    }
  }, [screenSize]);

  // On tablet, auto-collapse sidebar
  useEffect(() => {
    if (screenSize === 'tablet' && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [screenSize, sidebarCollapsed, setSidebarCollapsed]);

  const handleBackdropClick = useCallback(() => {
    if (screenSize === 'mobile') {
      setDrawerOpen(false);
    } else {
      setSidebarCollapsed(true);
    }
  }, [screenSize, setSidebarCollapsed]);

  // Determine sidebar visibility
  const hasSidebar = Boolean(sidebarSlot);
  const showSidebar =
    hasSidebar &&
    !sidebarCollapsed &&
    (screenSize === 'desktop' || screenSize === 'tablet');

  // Build sidebar class
  const sidebarClasses = [
    styles.sidebar,
    isDark ? styles.sidebarDark : '',
    !showSidebar && !drawerOpen ? styles.sidebarCollapsed : '',
    screenSize === 'tablet' && showSidebar ? styles.sidebarOverlay : '',
    screenSize === 'tablet' && showSidebar && isDark ? styles.sidebarOverlayDark : '',
    screenSize === 'tablet' && showSidebar ? styles.sidebarExpanded : '',
  ]
    .filter(Boolean)
    .join(' ');

  const mainClasses = [
    styles.main,
    isDark ? styles.mainDark : '',
  ]
    .filter(Boolean)
    .join(' ');

  const topBarClasses = [
    styles.topBar,
    isDark ? styles.topBarDark : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={styles.layout}
      data-theme={isDark ? 'dark' : 'light'}
    >
      <div className={topBarClasses}>
        {topBarSlot}
      </div>
      <div className={styles.body}>
        {/* Desktop & Tablet sidebar */}
        {hasSidebar && screenSize !== 'mobile' && (
          <div className={sidebarClasses}>
            {sidebarSlot}
          </div>
        )}

        {/* Tablet backdrop */}
        {screenSize === 'tablet' && showSidebar && (
          <div
            className={styles.backdrop}
            onClick={handleBackdropClick}
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
          />
        )}

        {/* Mobile drawer */}
        {hasSidebar && screenSize === 'mobile' && (
          <>
            {drawerOpen && (
              <div
                className={styles.drawerBackdrop}
                onClick={handleBackdropClick}
                role="button"
                tabIndex={0}
                aria-label="Close sidebar"
              />
            )}
            <div
              className={[
                styles.drawerWrapper,
                drawerOpen ? styles.drawerWrapperVisible : '',
                isDark ? styles.drawerWrapperDark : '',
              ].filter(Boolean).join(' ')}
            >
              {sidebarSlot}
            </div>
          </>
        )}

        <div className={mainClasses}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
