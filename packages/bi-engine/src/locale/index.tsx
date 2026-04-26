// ============================================================================
// locale/index.ts — 国际化 Context、Provider、Hook 与工具函数
// ============================================================================

import { createContext, useContext } from 'react';
import type { BILocale, BuiltInLocale, LocaleInput } from './types';
import { zhCN } from './zh-CN';
import { enUS } from './en-US';

// ---------------------------------------------------------------------------
// 内置词条映射
// ---------------------------------------------------------------------------

const BUILTIN_LOCALES: Record<BuiltInLocale, BILocale> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const LocaleContext = createContext<BILocale>(zhCN);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface LocaleProviderProps {
  locale: BILocale;
  children: React.ReactNode;
}

/**
 * 国际化 Context Provider。
 * 在 BIEngine 内部包裹子组件，注入 locale 词条。
 */
export function LocaleProvider({ locale, children }: LocaleProviderProps): React.ReactElement {
  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * 获取当前 locale 词条。
 * 必须在 LocaleProvider 内部使用。
 */
export function useLocale(): BILocale {
  return useContext(LocaleContext);
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

/**
 * 将 locale prop 解析为 BILocale 对象。
 * - 字符串 → 使用内置词条包
 * - 对象 → 直接使用
 * - undefined → 默认 zh-CN
 */
export function resolveLocale(input: LocaleInput | undefined): BILocale {
  if (input === undefined) return zhCN;
  if (typeof input === 'string') {
    return BUILTIN_LOCALES[input] ?? zhCN;
  }
  return input;
}

/**
 * 简单模板插值：将 `{key}` 替换为 params[key] 的值。
 */
export function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ''));
}

// ---------------------------------------------------------------------------
// 导出
// ---------------------------------------------------------------------------

export { zhCN } from './zh-CN';
export { enUS } from './en-US';
export type { BILocale, BuiltInLocale, LocaleInput } from './types';
