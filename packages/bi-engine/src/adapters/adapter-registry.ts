// ============================================================================
// adapters/adapter-registry.ts — 图表适配器抽象接口与注册表
// ============================================================================

import type { RefObject } from 'react';

// ---------------------------------------------------------------------------
// ChartAdapter 接口
// ---------------------------------------------------------------------------

/**
 * 图表适配器接口。
 *
 * 抽象不同图表库（ECharts、AntV 等）的渲染实现。
 * 适配器负责：将语义模型转换为目标库的配置 + 管理渲染生命周期。
 */
export interface ChartAdapter<TModel = unknown, TOutput = unknown> {
  readonly name: string;
  readonly version: string;

  /** 将语义模型转换为目标库配置 */
  adapt(model: TModel): TOutput;

  /** 创建渲染并返回生命周期控制句柄 */
  mount(
    container: RefObject<HTMLElement | null>,
    config: TOutput,
  ): ChartAdapterHandle<TOutput>;
}

/** 适配器渲染句柄 */
export interface ChartAdapterHandle<TOutput = unknown> {
  update(newConfig: TOutput): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

// ---------------------------------------------------------------------------
// ChartAdapterRegistry
// ---------------------------------------------------------------------------

export class ChartAdapterRegistry {
  private static instance: ChartAdapterRegistry | null = null;
  private readonly adapters = new Map<string, ChartAdapter>();

  private constructor() {}

  static getInstance(): ChartAdapterRegistry {
    if (ChartAdapterRegistry.instance === null) {
      ChartAdapterRegistry.instance = new ChartAdapterRegistry();
    }
    return ChartAdapterRegistry.instance;
  }

  register<TModel, TOutput>(name: string, adapter: ChartAdapter<TModel, TOutput>): void {
    this.adapters.set(name, adapter as ChartAdapter);
  }

  get<TModel, TOutput>(name: string): ChartAdapter<TModel, TOutput> | undefined {
    return this.adapters.get(name) as ChartAdapter<TModel, TOutput> | undefined;
  }

  has(name: string): boolean {
    return this.adapters.has(name);
  }

  clear(): void {
    this.adapters.clear();
  }
}
