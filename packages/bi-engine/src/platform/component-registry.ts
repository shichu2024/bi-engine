// ============================================================================
// platform/component-registry.ts — 组件处理器注册表（单例）
// ============================================================================

import type { BIEngineComponent, ComponentHandler, ComponentType } from './types';

// ---------------------------------------------------------------------------
// ComponentRegistry
// ---------------------------------------------------------------------------

/**
 * 组件处理器注册表。
 *
 * 单例模式，管理所有组件类型的处理器。
 * 通过 component.type 字符串分发到对应 Handler。
 */
export class ComponentRegistry {
  private static instance: ComponentRegistry | null = null;
  private readonly handlers = new Map<ComponentType, ComponentHandler>();

  private constructor() {}

  static getInstance(): ComponentRegistry {
    if (ComponentRegistry.instance === null) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  /** 注册处理器，重复注册抛错 */
  register<TComponent extends BIEngineComponent>(
    type: ComponentType,
    handler: ComponentHandler<TComponent>,
  ): void {
    if (this.handlers.has(type)) {
      throw new Error(`Component type "${type}" is already registered.`);
    }
    this.handlers.set(type, handler as ComponentHandler);
  }

  /** 注册或替换处理器 */
  registerOrReplace<TComponent extends BIEngineComponent>(
    type: ComponentType,
    handler: ComponentHandler<TComponent>,
  ): void {
    this.handlers.set(type, handler as ComponentHandler);
  }

  /** 获取处理器，未注册返回 undefined */
  get<TComponent extends BIEngineComponent>(
    type: ComponentType,
  ): ComponentHandler<TComponent> | undefined {
    return this.handlers.get(type) as ComponentHandler<TComponent> | undefined;
  }

  /** 获取处理器，未注册抛错 */
  getOrThrow<TComponent extends BIEngineComponent>(
    type: ComponentType,
  ): ComponentHandler<TComponent> {
    const handler = this.get<TComponent>(type);
    if (handler === undefined) {
      throw new Error(`Component type "${type}" is not registered.`);
    }
    return handler;
  }

  /** 检查是否已注册 */
  has(type: ComponentType): boolean {
    return this.handlers.has(type);
  }

  /** 获取所有已注册类型 */
  getRegisteredTypes(): ComponentType[] {
    return Array.from(this.handlers.keys());
  }

  /** 清空注册表（测试用） */
  clear(): void {
    this.handlers.clear();
  }
}

// ---------------------------------------------------------------------------
// 便捷函数
// ---------------------------------------------------------------------------

export function registerComponentHandler<TComponent extends BIEngineComponent>(
  type: ComponentType,
  handler: ComponentHandler<TComponent>,
): void {
  ComponentRegistry.getInstance().register(type, handler);
}

export function getComponentHandler<TComponent extends BIEngineComponent>(
  type: ComponentType,
): ComponentHandler<TComponent> | undefined {
  return ComponentRegistry.getInstance().get<TComponent>(type);
}
