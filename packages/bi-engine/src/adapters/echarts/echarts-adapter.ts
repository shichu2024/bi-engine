// ============================================================================
// adapters/echarts/echarts-adapter.ts — ECharts 适配器实现
// ============================================================================

import type { RefObject } from 'react';
import type { ChartAdapter, ChartAdapterHandle } from '../adapter-registry';
import type { ChartSemanticModel } from '../../core/chart-semantic-model';
import type { ThemeTokens } from '../../theme/theme-tokens';
import { buildEChartsOption } from './index';
import type { EChartsOption } from './build-line-option';

// ---------------------------------------------------------------------------
// EChartsAdapter
// ---------------------------------------------------------------------------

/**
 * ECharts 图表适配器。
 *
 * 将 ChartSemanticModel 转换为 ECharts option，
 * 并通过动态 import 管理 ECharts 实例生命周期。
 */
export class EChartsAdapter implements ChartAdapter<ChartSemanticModel, EChartsOption> {
  readonly name = 'echarts';
  readonly version = '1.0.0';

  adapt(model: ChartSemanticModel, theme?: ThemeTokens): EChartsOption {
    return buildEChartsOption(model, theme);
  }

  mount(
    container: RefObject<HTMLElement | null>,
    config: EChartsOption,
  ): ChartAdapterHandle<EChartsOption> {
    let instance: EChartsInstance | null = null;
    let observer: ResizeObserver | null = null;

    const initPromise = (async () => {
      const el = container.current;
      if (el === null) return;

      const echarts = await import('echarts') as unknown as EChartsModule;
      instance = echarts.init(el as HTMLDivElement);

      instance.setOption(config, { notMerge: true });

      observer = new ResizeObserver((entries) => {
        if (instance === null) return;
        for (const entry of entries) {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            instance.resize({
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            });
          }
        }
      });
      observer.observe(el);
    })();

    initPromise.catch(() => { /* echarts unavailable */ });

    return {
      update(newConfig: EChartsOption): void {
        instance?.setOption(newConfig, { notMerge: true });
      },
      resize(width: number, height: number): void {
        instance?.resize({ width, height });
      },
      dispose(): void {
        observer?.disconnect();
        instance?.dispose();
        instance = null;
        observer = null;
      },
    };
  }
}

/** 默认 ECharts 适配器实例 */
export const echartsAdapter = new EChartsAdapter();

// ---------------------------------------------------------------------------
// 内联类型（避免适配器层直接依赖 echarts 类型）
// ---------------------------------------------------------------------------

interface EChartsInstance {
  setOption(option: Record<string, unknown>, opts?: { notMerge?: boolean }): void;
  resize(opts?: { width?: number; height?: number }): void;
  dispose(): void;
}

interface EChartsModule {
  init(el: HTMLDivElement): EChartsInstance;
}
