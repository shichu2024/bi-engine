import { useEffect, useRef, useCallback } from 'react';
import { getTestRenderConfig } from './test-render-config';

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

/**
 * ECharts 选项对象的最小表示。
 *
 * 在本地重新声明以避免导入适配器内部类型，
 * 同时保持宿主组件不直接了解适配器。
 * 此类型映射 `echarts.setOption()` 期望的形状。
 */
export interface ChartOptionInput {
  [key: string]: unknown;
}

/**
 * `useChartInstance` 钩子接受的参数。
 */
export interface UseChartInstanceParams {
  /**
   * 提供 HTMLDivElement 作为 ECharts 容器的 React ref 或回调 ref。
   * 当 ref 解析为元素时，钩子初始化（或重新初始化）图表实例。
   */
  containerRef: React.RefObject<HTMLDivElement | null>;

  /**
   * 已计算的 ECharts 选项。当此引用变化时，
   * 钩子以 `notMerge = true` 调用 `instance.setOption(option)`，
   * 完全替换之前的选项。
   */
  option: ChartOptionInput | null;
}

// ---------------------------------------------------------------------------
// 动态 echarts 导入类型
// ---------------------------------------------------------------------------

/**
 * 钩子使用的 echarts API 表面子集。
 *
 * 内联定义类型，使钩子文件只需要 `@types/react` 作为类型级依赖。
 * 实际的 `echarts` 模块在运行时动态导入。
 */
interface EChartsInstance {
  setOption(option: Record<string, unknown>, opts?: { notMerge?: boolean }): void;
  resize(opts?: { width?: number; height?: number }): void;
  dispose(): void;
}

interface EChartsInitOpts {
  renderer?: 'canvas' | 'svg';
  devicePixelRatio?: number;
}

interface EChartsModule {
  init(el: HTMLDivElement, theme?: string, opts?: EChartsInitOpts): EChartsInstance;
}

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

/**
 * 当测试模式激活时，将 `animation: false` 合并到选项中，
 * 使 ECharts 跳过所有过渡动画。这确保截图始终反映最终视觉状态。
 *
 * 返回新对象；原始选项不会被修改。
 */
function applyTestModeOverrides(option: ChartOptionInput): Record<string, unknown> {
  const renderConfig = getTestRenderConfig();
  if (renderConfig.animation) {
    return option as Record<string, unknown>;
  }
  return { ...option, animation: false };
}

// ---------------------------------------------------------------------------
// 钩子
// ---------------------------------------------------------------------------

/**
 * 在 React 组件内管理 ECharts 实例的生命周期。
 *
 * 生命周期：
 * 1. **挂载 / 容器就绪** -- 动态导入 `echarts`，调用
 *    `echarts.init(container)`，并应用初始选项。
 * 2. **选项变化** -- 调用 `instance.setOption(newOption, { notMerge: true })`。
 * 3. **容器尺寸变化** -- 使用 `ResizeObserver` 检测尺寸变化
 *    并调用 `instance.resize()`。
 * 4. **卸载** -- 销毁实例并断开观察器。
 *
 * 钩子从不自行创建容器 div；宿主组件拥有 DOM 元素
 * 并通过 ref 传递。
 *
 * @param params - 参见 {@link UseChartInstanceParams}。
 */
export function useChartInstance(params: UseChartInstanceParams): void {
  const { containerRef, option } = params;

  // 将实例和观察器存储在可变 ref 中，使其在渲染间持久存在
  // 且不触发重新渲染。
  const instanceRef = useRef<EChartsInstance | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  // 保持最新选项的可变引用，以便初始化路径
  // 始终可以读取当前值，而无需将其作为 effect 依赖
  // （否则会导致不必要的销毁/重新初始化循环）。
  const optionRef = useRef(option);
  optionRef.current = option;

  // -----------------------------------------------------------------------
  // 初始化辅助函数 -- 幂等操作；可以安全地多次调用。
  // -----------------------------------------------------------------------
  const initInstance = useCallback(async (container: HTMLDivElement): Promise<void> => {
    // 如果该容器已存在实例，先销毁。
    if (instanceRef.current !== null) {
      instanceRef.current.dispose();
      instanceRef.current = null;
    }

    // 断开之前的观察器。
    if (observerRef.current !== null) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    let echarts: EChartsModule;
    try {
      // echarts 导出 `init` 作为命名导出（无默认导出）。
      // 动态导入直接解析为模块命名空间。
      const mod = await import('echarts') as unknown as EChartsModule;
      echarts = mod;
    } catch {
      // 如果 echarts 不可用，静默退出。
      // 宿主组件可以通过渲染输出的缺失来检测此情况。
      return;
    }

    const renderConfig = getTestRenderConfig();

    const instance = echarts.init(container, undefined, {
      renderer: renderConfig.renderer,
    });
    instanceRef.current = instance;

    // 应用最新选项（如可用）。
    const currentOption = optionRef.current;
    if (currentOption !== null) {
      instance.setOption(applyTestModeOverrides(currentOption), { notMerge: true });
    }

    // 设置 ResizeObserver 使图表随容器调整大小。
    const observer = new ResizeObserver((entries) => {
      // 防护：实例可能在观察和回调之间已被销毁。
      if (instanceRef.current === null) {
        return;
      }

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          instanceRef.current.resize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    observer.observe(container);
    observerRef.current = observer;
  }, []);

  // -----------------------------------------------------------------------
  // Effect：根据容器可用性初始化/销毁。
  // -----------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }

    // 此处有意不 await -- effect 回调不能是 async。
    // 初始化辅助函数内部自行管理其生命周期。
    const initPromise = initInstance(container);

    return (): void => {
      // 卸载或容器变化时销毁。
      if (instanceRef.current !== null) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
      if (observerRef.current !== null) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // 组件在初始化期间卸载时抑制未处理的 promise。
      initPromise.catch(() => { /* 有意的空操作 */ });
    };
  }, [containerRef, initInstance]);

  // -----------------------------------------------------------------------
  // Effect：选项变化时更新。
  // -----------------------------------------------------------------------
  useEffect(() => {
    const instance = instanceRef.current;
    if (instance === null || option === null) {
      return;
    }

    instance.setOption(applyTestModeOverrides(option), { notMerge: true });
  }, [option]);
}
