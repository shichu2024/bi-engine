// ============================================================================
// test-render-config.ts
// ============================================================================
//
// 为视觉回归测试提供确定性的渲染配置。
//
// 测试模式激活时：
//   - 使用 SVG 渲染器替代默认的 canvas 渲染器，消除不同 DPR / GPU 环境下
//     的 canvas 光栅化噪声。
//   - 禁用所有动画，使截图始终在最终视觉状态下捕获，
//     不受时间相关差异的影响。
//
// 测试模式可通过以下方式激活：
//   1. 设置环境变量 BI_ENGINE_TEST_MODE=1（Node / CI）
//   2. 从 playground 的 test-mode 模块调用 enableTestMode()（浏览器）
//   3. 在 playground URL 中添加 ?testMode=true（浏览器）
//
// ============================================================================

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

/**
 * 控制图表渲染器在测试模式中行为的配置。
 *
 * 所有字段为只读，防止启动后被意外修改。
 */
export interface TestRenderConfig {
  /** 测试模式当前是否激活 */
  readonly enabled: boolean;

  /**
   * 要使用的 ECharts 渲染器类型。
   *
   * 测试模式下强制为 `'svg'`，产生确定性矢量输出，
   * 避免 canvas 光栅化差异。
   */
  readonly renderer: 'canvas' | 'svg';

  /**
   * 是否应禁用 ECharts 动画。
   *
   * 当为 `false` 时，图表在 `setOption` 后同步达到最终视觉状态，
   * 消除帧相关的截图噪声。
   */
  readonly animation: boolean;
}

// ---------------------------------------------------------------------------
// 内部状态（模块级单例）
// ---------------------------------------------------------------------------

let testModeActive = false;

/**
 * 检查 BI_ENGINE_TEST_MODE 环境变量是否已设置。
 *
 * 通过 `globalThis` 访问 `process.env` 以避免直接的 `process` 引用
 * （后者需要 `@types/node`）。在浏览器环境中 `globalThis.process`
 * 通常不存在，因此函数安全返回 `false`。
 */
function detectEnvironmentFlag(): boolean {
  const g = globalThis as Record<string, unknown>;
  const proc = g['process'] as Record<string, unknown> | undefined;
  if (typeof proc !== 'undefined' && typeof proc['env'] !== 'undefined') {
    const env = proc['env'] as Record<string, string | undefined>;
    const value = env['BI_ENGINE_TEST_MODE'];
    return value === '1' || value === 'true';
  }
  return false;
}

// ---------------------------------------------------------------------------
// 公共 API
// ---------------------------------------------------------------------------

/**
 * 以编程方式激活测试模式。
 *
 * 从 playground 的 test-mode 引导代码或测试工具中，
 * 在挂载图表组件之前调用此函数。
 */
export function enableTestMode(): void {
  testModeActive = true;
}

/**
 * 以编程方式停用测试模式。
 *
 * 主要用于在测试运行之间重置状态。
 */
export function disableTestMode(): void {
  testModeActive = false;
}

/**
 * 当测试模式激活时返回 `true`（通过环境变量或之前调用 {@link enableTestMode}）。
 */
export function isTestMode(): boolean {
  return testModeActive || detectEnvironmentFlag();
}

/**
 * 以冻结快照的形式返回当前的测试渲染配置。
 *
 * 在需要读取配置的时机调用，使值始终反映最新的测试模式状态。
 */
export function getTestRenderConfig(): TestRenderConfig {
  const active = isTestMode();
  return Object.freeze({
    enabled: active,
    renderer: active ? 'svg' : 'canvas',
    animation: !active,
  });
}

/**
 * 默认（非测试）配置的便捷常量。
 *
 * 对于动态感知测试模式的用法，优先调用
 * {@link getTestRenderConfig}，它每次返回全新快照。
 */
export const TEST_RENDER_CONFIG: TestRenderConfig = getTestRenderConfig();
