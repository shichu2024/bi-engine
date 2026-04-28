// ============================================================================
// platform/render-mode.tsx — 渲染模式 Context 与 Hooks
// ============================================================================

import { createContext, useContext } from 'react';
import { RenderMode } from './types';

export { RenderMode } from './types';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const RenderModeContext = createContext<RenderMode>(RenderMode.VIEW);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface RenderModeProviderProps {
  children: React.ReactNode;
  mode: RenderMode;
}

/** 渲染模式 Provider：注入 CHAT / EDIT / VIEW 模式 */
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

/** 判断是否为编辑模式 */
export function useIsEditMode(): boolean {
  return useRenderMode() === RenderMode.EDIT;
}

/** 当前模式是否允许图表类型切换（chat 和 edit 模式） */
export function useCanSwitchChart(): boolean {
  const mode = useRenderMode();
  return mode === RenderMode.CHAT || mode === RenderMode.EDIT;
}

/** 当前模式是否允许文本编辑（仅 edit 模式） */
export function useCanEditText(): boolean {
  return useRenderMode() === RenderMode.EDIT;
}
