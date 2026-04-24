// ============================================================================
// platform/auto-registry.ts — 内置组件处理器自动注册
// ============================================================================

import { ComponentRegistry } from './component-registry';
import { chartHandler } from '../component-handlers/chart';
import { textHandler } from '../component-handlers/text';
import { tableHandler } from '../component-handlers/table';
import { createUnsupportedHandler } from '../component-handlers/unsupported-handler';

/**
 * 注册所有内置组件处理器。
 *
 * chart / text / table — 完整实现
 * markdown — 占位处理器，返回 UNSUPPORTED_COMPONENT_TYPE
 */
export function registerBuiltinHandlers(): void {
  const registry = ComponentRegistry.getInstance();

  registry.registerOrReplace('chart', chartHandler);
  registry.registerOrReplace('text', textHandler);
  registry.registerOrReplace('table', tableHandler);
  registry.registerOrReplace('markdown', createUnsupportedHandler('markdown'));
}
