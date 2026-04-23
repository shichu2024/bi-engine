import { useCallback, useMemo, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import TopNavBar from '@/components/layout/TopNavBar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { ComponentSearch } from '@/components/layout/ComponentSearch';
import { useThemeStore, useLayoutStore } from '@/stores';
import { useKeyboardShortcuts } from '@/hooks';
import type { ComponentSearchRef } from '@/components/layout/ComponentSearch';
import { AppLayout } from './layouts/AppLayout';
import { SceneDemoPage } from './pages/SceneDemoPage';
import { EditorPage } from './pages/EditorPage';

// Re-export types for backward compatibility with existing component imports
export type { ThemeMode, ViewportSize } from './shared-constants';
export { VIEWPORT_SIZES } from './shared-constants';

export function App(): React.ReactElement {
  const mode = useThemeStore((s) => s.mode);
  const viewMode = useLayoutStore((s) => s.viewMode);
  const isDark = mode === 'dark';

  const searchRef = useRef<ComponentSearchRef>(null);

  const handleSave = useCallback(() => {
    // Dispatch custom event so editor page can listen and handle save
    window.dispatchEvent(new CustomEvent('bi-playground:save'));
  }, []);

  const handleRender = useCallback(() => {
    window.dispatchEvent(new CustomEvent('bi-playground:render'));
  }, []);

  useKeyboardShortcuts({
    searchInputRef: searchRef,
    onSave: handleSave,
    onRender: handleRender,
  });

  const antdAlgorithm = useMemo(
    () => (isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm),
    [isDark],
  );

  const sidebarSlot = useMemo(
    () => (
      <LeftSidebar>
        <ComponentSearch ref={searchRef} />
      </LeftSidebar>
    ),
    [],
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: antdAlgorithm,
      }}
    >
      <Routes>
        <Route
          element={
            <AppLayout
              isDark={isDark}
              topBarSlot={<TopNavBar />}
              sidebarSlot={viewMode === 'editor' ? undefined : sidebarSlot}
            />
          }
        >
          <Route path="/" element={<SceneDemoPage />} />
          <Route path="/editor/:componentId/:sceneId" element={<EditorPage />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}
