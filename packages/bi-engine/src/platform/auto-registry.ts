// ============================================================================
// platform/auto-registry.ts — 内置组件处理器自动注册
// ============================================================================

import { ComponentRegistry } from './component-registry';
import { chartHandler } from '../component-handlers/chart';
import { textHandler } from '../component-handlers/text';
import { tableHandler } from '../component-handlers/table';
import { compositeTableHandler } from '../component-handlers/composite-table';
import { markdownHandler } from '../component-handlers/markdown';
import { createUnsupportedHandler } from '../component-handlers/unsupported-handler';

/**
 * 注册所有内置组件处理器。
 *
 * chart / text / table / compositeTable / markdown — 完整实现
 */
export function registerBuiltinHandlers(): void {
  const registry = ComponentRegistry.getInstance();

  registry.registerOrReplace('chart', chartHandler);
  registry.registerOrReplace('text', textHandler);
  registry.registerOrReplace('table', tableHandler);
  registry.registerOrReplace('compositeTable', compositeTableHandler);
  registry.registerOrReplace('markdown', markdownHandler);
}
