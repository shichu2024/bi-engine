// ============================================================================
// test-mode/index.ts
// ============================================================================
//
// Playground 端的测试模式引导模块。
//
// 测试模式可通过以下方式激活：
//   1. 在 playground URL 中添加 `?testMode=true`
//   2. 在图表组件挂载之前调用 `enableTestMode()`
//
// 激活后，图表将使用 SVG 渲染器，并通过 bi-engine 测试渲染配置
// 禁用动画。
//
// ============================================================================

import { enableTestMode } from 'bi-engine';

// ---------------------------------------------------------------------------
// URL 参数检测
// ---------------------------------------------------------------------------

/**
 * 检查当前 URL 中是否包含 `?testMode=true`（不区分大小写）。
 *
 * 可以安全地在模块作用域或函数内部调用——仅读取
 * `window.location.search`，不会修改全局状态。
 */
function hasTestModeUrlParam(): boolean {
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  const value = params.get('testMode');
  return value !== null && value.toLowerCase() === 'true';
}

// ---------------------------------------------------------------------------
// 公共 API
// ---------------------------------------------------------------------------

/**
 * 激活 playground 测试模式。
 *
 * 委托给 bi-engine 的 `enableTestMode()`，该方法会切换控制渲染器
 * 选择和动画行为的内部标志。
 */
function activateTestMode(): void {
  enableTestMode();
}

/**
 * 根据 URL 参数 `?testMode=true` 自动检测并激活测试模式。
 *
 * 请在应用引导早期调用（例如在 `main.tsx` 中），确保测试模式在
 * 任何图表组件挂载之前生效。
 */
export function initTestModeFromUrl(): void {
  if (hasTestModeUrlParam()) {
    activateTestMode();
  }
}

export { activateTestMode as enableTestMode };
