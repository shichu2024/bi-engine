// ============================================================================
// option-merge.ts — 深度合并工具与扩展接口
// ============================================================================

import type { EChartsOption } from './build-line-option';

// ---------------------------------------------------------------------------
// 合并模式
// ---------------------------------------------------------------------------

/**
 * 配置合并模式。
 *
 * - `'merge'`：增量合并，extension 的属性覆盖 base 的同名属性，
 *   base 中未指定的属性保留。对象类型递归合并。
 * - `'override'`：全量覆盖，直接返回 extension，忽略 base。
 */
export type MergeMode = 'merge' | 'override';

// ---------------------------------------------------------------------------
// deepMergeOption
// ---------------------------------------------------------------------------

/**
 * 将扩展配置与基础配置深度合并。
 *
 * 合并规则：
 * 1. `override` 模式直接返回 extension（全量覆盖）。
 * 2. `merge` 模式递归合并对象：
 *    - extension 中的属性覆盖 base 的同名属性
 *    - base 中未在 extension 中出现的属性保留
 *    - 数组类型直接用 extension 的值替换（不按索引合并）
 *    - 原始类型直接用 extension 的值替换
 * 3. extension 优先级 > base。
 *
 * @param base - 基础配置（标准化模板）
 * @param extension - 扩展配置（外部自定义）
 * @param mode - 合并模式，默认 `'merge'`
 * @returns 合并后的 ECharts Option
 */
export function deepMergeOption(
  base: EChartsOption,
  extension: EChartsOption,
  mode: MergeMode = 'merge',
): EChartsOption {
  if (mode === 'override') {
    return { ...extension };
  }

  return deepMerge(base, extension) as EChartsOption;
}

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

/**
 * 递归深度合并两个对象。
 *
 * - 普通对象：递归合并
 * - 数组：直接用 source 的值替换
 * - 原始类型：直接用 source 的值替换
 * - null/undefined source：保留 target
 */
function deepMerge(
  target: unknown,
  source: unknown,
): unknown {
  if (source === null || source === undefined) {
    return target;
  }

  if (target === null || target === undefined) {
    return source;
  }

  // 数组：直接替换
  if (Array.isArray(source)) {
    return source;
  }

  // 两个都是普通对象：递归合并
  if (isPlainObject(target) && isPlainObject(source)) {
    const result: Record<string, unknown> = { ...(target as Record<string, unknown>) };
    const sourceKeys = Object.keys(source as Record<string, unknown>);

    for (let i = 0; i < sourceKeys.length; i++) {
      const key = sourceKeys[i];
      const targetValue = (target as Record<string, unknown>)[key];
      const sourceValue = (source as Record<string, unknown>)[key];

      result[key] = deepMerge(targetValue, sourceValue);
    }

    return result;
  }

  // 原始类型或其他：直接替换
  return source;
}

/**
 * 判断值是否为普通对象（非数组、非 null）。
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
