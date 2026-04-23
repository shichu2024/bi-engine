import { describe, it, expect } from 'vitest';
import {
  formatValue,
  createFormatter,
  ValueFormatType,
} from '../../src/theme/value-formatter';
import type { ValueFormat } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// formatValue -- 时间
// ---------------------------------------------------------------------------

describe('formatValue - 时间', () => {
  const format: ValueFormat = { type: ValueFormatType.time, format: 'YYYY-MM-DD HH:mm:ss' };

  it('格式化数字时间戳', () => {
    // 使用本地时间以匹配格式化器的行为（Date 使用本地时区）
    const date = new Date(2023, 10, 14, 12, 30, 45);
    const ts = date.getTime();
    const result = formatValue(ts, format);
    expect(result).toBe('2023-11-14 12:30:45');
  });

  it('格式化 ISO 日期字符串', () => {
    const result = formatValue('2023-06-15T08:00:00.000Z', format);
    // 结果取决于本地时区；仅验证其包含年/月/日
    expect(result).toContain('2023');
    expect(result).toContain('06');
    expect(result).toContain('15');
  });

  it('无法解析为日期时原样返回字符串', () => {
    const result = formatValue('not-a-date', format);
    expect(result).toBe('not-a-date');
  });

  it('对非数字、非字符串输入返回字符串表示', () => {
    const result = formatValue(true, format);
    expect(result).toBe('true');
  });

  it('使用 YYYY-MM-DD 模板格式化', () => {
    const fmt: ValueFormat = { type: ValueFormatType.time, format: 'YYYY-MM-DD' };
    const ts = new Date(Date.UTC(2024, 0, 15, 0, 0, 0)).getTime();
    const result = formatValue(ts, fmt);
    expect(result).toBe('2024-01-15');
  });

  it('补零个位数的月份和日期', () => {
    const fmt: ValueFormat = { type: ValueFormatType.time, format: 'MM-DD' };
    const ts = new Date(Date.UTC(2024, 2, 5, 0, 0, 0)).getTime();
    const result = formatValue(ts, fmt);
    expect(result).toBe('03-05');
  });
});

// ---------------------------------------------------------------------------
// formatValue -- 百分比
// ---------------------------------------------------------------------------

describe('formatValue - 百分比', () => {
  it('使用默认 0 位小数格式化', () => {
    const fmt: ValueFormat = { type: ValueFormatType.percentage };
    const result = formatValue(0.456, fmt);
    expect(result).toBe('0%');
  });

  it('使用指定小数位数格式化', () => {
    const fmt: ValueFormat = { type: ValueFormatType.percentage, decimal: 2 };
    const result = formatValue(0.456, fmt);
    expect(result).toBe('0.46%');
  });

  it('提供单位时追加单位', () => {
    const fmt: ValueFormat = { type: ValueFormatType.percentage, decimal: 1, unit: 'growth' };
    const result = formatValue(12.5, fmt);
    expect(result).toBe('12.5% growth');
  });

  it('单位为空字符串时不追加单位', () => {
    const fmt: ValueFormat = { type: ValueFormatType.percentage, unit: '' };
    const result = formatValue(50, fmt);
    expect(result).toBe('50%');
  });

  it('将字符串输入强制转换为数字', () => {
    const fmt: ValueFormat = { type: ValueFormatType.percentage, decimal: 1 };
    const result = formatValue('75.5', fmt);
    expect(result).toBe('75.5%');
  });

  it('对非数字字符串返回 0%', () => {
    const fmt: ValueFormat = { type: ValueFormatType.percentage };
    const result = formatValue('abc', fmt);
    expect(result).toBe('0%');
  });

  it('对布尔值输入返回 0%', () => {
    const fmt: ValueFormat = { type: ValueFormatType.percentage };
    const result = formatValue(true, fmt);
    expect(result).toBe('0%');
  });
});

// ---------------------------------------------------------------------------
// formatValue -- 数值
// ---------------------------------------------------------------------------

describe('formatValue - 数值', () => {
  it('使用默认 0 位小数格式化', () => {
    const fmt: ValueFormat = { type: ValueFormatType.number };
    const result = formatValue(1234.567, fmt);
    expect(result).toBe('1235');
  });

  it('使用指定小数位数格式化', () => {
    const fmt: ValueFormat = { type: ValueFormatType.number, decimal: 2 };
    const result = formatValue(1234.567, fmt);
    expect(result).toBe('1234.57');
  });

  it('提供单位时追加单位', () => {
    const fmt: ValueFormat = { type: ValueFormatType.number, decimal: 0, unit: 'USD' };
    const result = formatValue(100, fmt);
    expect(result).toBe('100 USD');
  });

  it('单位为空字符串时不追加单位', () => {
    const fmt: ValueFormat = { type: ValueFormatType.number, unit: '' };
    const result = formatValue(42, fmt);
    expect(result).toBe('42');
  });

  it('将字符串输入强制转换为数字', () => {
    const fmt: ValueFormat = { type: ValueFormatType.number, decimal: 1 };
    const result = formatValue('99.9', fmt);
    expect(result).toBe('99.9');
  });

  it('对非数字字符串返回 0', () => {
    const fmt: ValueFormat = { type: ValueFormatType.number };
    const result = formatValue('invalid', fmt);
    expect(result).toBe('0');
  });

  it('处理零值', () => {
    const fmt: ValueFormat = { type: ValueFormatType.number, decimal: 2 };
    const result = formatValue(0, fmt);
    expect(result).toBe('0.00');
  });

  it('处理负值', () => {
    const fmt: ValueFormat = { type: ValueFormatType.number, decimal: 1 };
    const result = formatValue(-42.5, fmt);
    expect(result).toBe('-42.5');
  });
});

// ---------------------------------------------------------------------------
// formatValue -- 字节
// ---------------------------------------------------------------------------

describe('formatValue - 字节', () => {
  it('格式化 0 字节', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte };
    const result = formatValue(0, fmt);
    expect(result).toBe('0 B');
  });

  it('自动缩放到 KB', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte, decimal: 2 };
    const result = formatValue(1536, fmt);
    expect(result).toBe('1.50 KB');
  });

  it('自动缩放到 MB', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte, decimal: 2 };
    const result = formatValue(1048576, fmt);
    expect(result).toBe('1.00 MB');
  });

  it('自动缩放到 GB', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte, decimal: 2 };
    const result = formatValue(1073741824, fmt);
    expect(result).toBe('1.00 GB');
  });

  it('自动缩放到 TB', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte, decimal: 2 };
    const result = formatValue(1099511627776, fmt);
    expect(result).toBe('1.00 TB');
  });

  it('提供显式单位时使用该单位', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte, decimal: 0, unit: 'MB' };
    const result = formatValue(2097152, fmt);
    expect(result).toBe('2 MB');
  });

  it('对未知显式单位直接追加', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte, decimal: 0, unit: 'XYZ' };
    const result = formatValue(1024, fmt);
    // XYZ 不在 BYTE_UNITS 列表中，因此直接追加
    expect(result).toBe('1024 XYZ');
  });

  it('处理负值', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte, decimal: 1 };
    const result = formatValue(-1024, fmt);
    expect(result).toBe('-1.0 KB');
  });

  it('值小于 1024 时格式化为原始字节', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte, decimal: 0 };
    const result = formatValue(512, fmt);
    expect(result).toBe('512 B');
  });

  it('默认为 2 位小数', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte };
    const result = formatValue(1500, fmt);
    expect(result).toBe('1.46 KB'); // 1500/1024 = 1.4648...
  });

  it('将字符串输入强制转换为数字', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte, decimal: 0 };
    const result = formatValue('1024', fmt);
    expect(result).toBe('1 KB');
  });

  it('对非数字输入返回 0 B', () => {
    const fmt: ValueFormat = { type: ValueFormatType.byte };
    const result = formatValue('invalid', fmt);
    expect(result).toBe('0 B');
  });
});

// ---------------------------------------------------------------------------
// createFormatter 工厂函数
// ---------------------------------------------------------------------------

describe('createFormatter', () => {
  it('返回一个格式化值的函数', () => {
    const fmt: ValueFormat = { type: ValueFormatType.number, decimal: 2 };
    const formatter = createFormatter(fmt);

    expect(formatter(42)).toBe('42.00');
    expect(formatter(0)).toBe('0.00');
  });

  it('返回绑定到给定格式的函数', () => {
    const byteFmt: ValueFormat = { type: ValueFormatType.byte, decimal: 1 };
    const formatter = createFormatter(byteFmt);

    expect(formatter(1536)).toBe('1.5 KB');
  });

  it('返回处理时间格式的函数', () => {
    const fmt: ValueFormat = { type: ValueFormatType.time, format: 'YYYY-MM-DD' };
    const formatter = createFormatter(fmt);
    const ts = new Date(Date.UTC(2024, 0, 1, 0, 0, 0)).getTime();

    expect(formatter(ts)).toBe('2024-01-01');
  });

  it('返回处理百分比格式的函数', () => {
    const fmt: ValueFormat = { type: ValueFormatType.percentage, decimal: 1 };
    const formatter = createFormatter(fmt);

    expect(formatter(0.5)).toBe('0.5%');
  });
});
