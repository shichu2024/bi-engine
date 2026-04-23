import type { ValueFormat, ValueFormatType } from '../schema/bi-engine-models';
import { ValueFormatType as VFT } from '../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 字节单位量级
// ---------------------------------------------------------------------------

const BYTE_UNITS: readonly string[] = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
  'PB',
] as const;

const BYTE_SCALE = 1024;

// ---------------------------------------------------------------------------
// 内部格式化辅助函数
// ---------------------------------------------------------------------------

/**
 * 使用提供的格式模板将数值格式化为时间字符串。
 *
 * 支持的格式占位符：
 * - `YYYY` -- 完整年份
 * - `MM`   -- 补零月份 (01-12)
 * - `DD`   -- 补零日期 (01-31)
 * - `HH`   -- 补零小时 (00-23)
 * - `mm`   -- 补零分钟 (00-59)
 * - `ss`   -- 补零秒数 (00-59)
 *
 * 输入 `value` 的解释方式：
 * - **数字** -- 视为 JavaScript 时间戳（自纪元以来的毫秒数）。
 * - **字符串** -- 如果已经格式化则原样返回；否则通过 `Date.parse` 解析。
 *
 * @param value  - 待格式化的原始值。
 * @param format - 格式模板字符串。
 * @returns 格式化后的时间字符串。
 */
function formatTime(value: unknown, format: string): string {
  let date: Date;

  if (typeof value === 'number') {
    date = new Date(value);
  } else if (typeof value === 'string') {
    // 如果字符串无法解析为日期，原样返回。
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
      return value;
    }
    date = new Date(parsed);
  } else {
    return String(value);
  }

  // 防止无效日期。
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const pad2 = (n: number): string => n.toString().padStart(2, '0');

  return format
    .replace('YYYY', date.getFullYear().toString())
    .replace('MM', pad2(date.getMonth() + 1))
    .replace('DD', pad2(date.getDate()))
    .replace('HH', pad2(date.getHours()))
    .replace('mm', pad2(date.getMinutes()))
    .replace('ss', pad2(date.getSeconds()));
}

/**
 * 将数值格式化为百分比。
 *
 * @param value   - 原始数值（百分比预期为 0-1 范围，但接受任何数字）。
 * @param decimal - 小数位数（默认为 0）。
 * @param unit    - 可选的单位后缀，追加在百分号之后。
 * @returns 格式化后的百分比字符串。
 */
function formatPercentage(
  value: unknown,
  decimal: number,
  unit: string | undefined,
): string {
  const num = toNumber(value);
  const formatted = num.toFixed(decimal);
  const suffix = unit !== undefined && unit !== '' ? ` ${unit}` : '';
  return `${formatted}%${suffix}`;
}

/**
 * 使用可配置的小数位数和单位后缀格式化数值。
 *
 * @param value   - 原始值。
 * @param decimal - 小数位数（默认为 0）。
 * @param unit    - 可选的单位后缀。
 * @returns 格式化后的数字字符串。
 */
function formatNumber(
  value: unknown,
  decimal: number,
  unit: string | undefined,
): string {
  const num = toNumber(value);
  const formatted = num.toFixed(decimal);
  const suffix = unit !== undefined && unit !== '' ? ` ${unit}` : '';
  return `${formatted}${suffix}`;
}

/**
 * 将数值格式化为人类可读的字节大小。
 *
 * 值会通过连续的 1024 字节单位（B、KB、MB 等）进行缩放，
 * 直到找到最紧凑的表示方式。
 *
 * @param value   - 以字节为单位的原始值。
 * @param decimal - 小数位数（默认为 2）。
 * @param unit    - 可选的单位覆盖。提供时，值将使用该确切单位格式化，
 *                  而非自动缩放。
 * @returns 格式化后的字节字符串。
 */
function formatByte(
  value: unknown,
  decimal: number,
  unit: string | undefined,
): string {
  const raw = toNumber(value);

  // 当给出明确单位时，直接以该单位格式化。
  if (unit !== undefined && unit !== '') {
    const unitIndex = BYTE_UNITS.indexOf(unit.toUpperCase());
    if (unitIndex >= 0) {
      const scaled = raw / Math.pow(BYTE_SCALE, unitIndex);
      return `${scaled.toFixed(decimal)} ${unit}`;
    }
    // 未知单位 -- 直接追加。
    return `${raw.toFixed(decimal)} ${unit}`;
  }

  // 自动缩放到产生 >= 1 的最大单位（除非原始值为 0）。
  if (raw === 0) {
    return `0 ${BYTE_UNITS[0]}`;
  }

  let remaining = Math.abs(raw);
  let unitIndex = 0;

  while (remaining >= BYTE_SCALE && unitIndex < BYTE_UNITS.length - 1) {
    remaining /= BYTE_SCALE;
    unitIndex++;
  }

  const sign = raw < 0 ? '-' : '';
  return `${sign}${remaining.toFixed(decimal)} ${BYTE_UNITS[unitIndex]}`;
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

/**
 * 将未知值强制转换为数字。
 *
 * 对于非数值返回 `0` 而非 `NaN`。
 */
function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

// ---------------------------------------------------------------------------
// 公共 API
// ---------------------------------------------------------------------------

/**
 * 根据 {@link ValueFormat} 描述符格式化原始值。
 *
 * 这是图表引擎中值格式化的主入口点。
 * 它根据 `format.type` 分派到相应的格式化器，
 * 并应用配置的小数位数、单位后缀和时间格式。
 *
 * @param value  - 待格式化的原始数据值。
 * @param format - 来自 schema 的格式化描述符。
 * @returns 格式化后的字符串表示。
 *
 * @example
 * ```ts
 * import { formatValue } from 'bi-engine/theme';
 * import { ValueFormatType } from 'bi-engine/schema';
 *
 * formatValue(0.456, { type: ValueFormatType.percentage, decimal: 1 })
 * // => "0.5%"
 *
 * formatValue(1536, { type: ValueFormatType.byte, decimal: 1 })
 * // => "1.5 KB"
 *
 * formatValue(1700000000000, { type: ValueFormatType.time, format: 'YYYY-MM-DD' })
 * // => "2023-11-14"
 * ```
 */
export function formatValue(value: unknown, format: ValueFormat): string {
  switch (format.type) {
    case VFT.time:
      return formatTime(value, format.format);

    case VFT.percentage:
      return formatPercentage(value, format.decimal ?? 0, format.unit);

    case VFT.number:
      return formatNumber(value, format.decimal ?? 0, format.unit);

    case VFT.byte:
      return formatByte(value, format.decimal ?? 2, format.unit);

    default: {
      // 穷尽性检查 -- 如果 schema 中新增了格式化类型但此处未处理，
      // TypeScript 会标记未处理的情况。
      const _exhaustive: never = format;
      return String(value);
    }
  }
}

/**
 * 创建一个预绑定到特定 {@link ValueFormat} 的格式化函数。
 *
 * 当同一格式需要应用于多个值时非常有用（例如格式化系列中的每个数据点）。
 *
 * @param format - 格式化描述符。
 * @returns 接受原始值并返回格式化字符串的函数。
 */
export function createFormatter(
  format: ValueFormat,
): (value: unknown) => string {
  return (value: unknown): string => formatValue(value, format);
}

/**
 * 为方便起见重新导出 ValueFormatType，
 * 使消费者可以从 theme 模块导入而无需访问 schema 桶文件。
 */
export { ValueFormatType } from '../schema/bi-engine-models';
