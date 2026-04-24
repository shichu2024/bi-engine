// ============================================================================
// platform/render-mode.tsx — 渲染模式 Context 与 Hooks
// ============================================================================

import { createContext, useContext } from 'react';
import { RenderMode } from './types';

export { RenderMode } from './types';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const RenderModeContext = createContext<RenderMode>(RenderMode.RUNTIME);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface RenderModeProviderProps {
  children: React.ReactNode;
  mode: RenderMode;
}

/** 渲染模式 Provider：注入 DESIGN 或 RUNTIME 模式 */
export function RenderModeProvider({ children, mode }: RenderModeProviderProps): React.ReactNode {
  return (
    <RenderModeContext.Provider value={mode}>
      {children}
    </RenderModeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** 获取当前渲染模式 */
export function useRenderMode(): RenderMode {
  return useContext(RenderModeContext);
}

/** 判断是否为设计态 */
export function useIsDesignMode(): boolean {
  return useRenderMode() === RenderMode.DESIGN;
}
