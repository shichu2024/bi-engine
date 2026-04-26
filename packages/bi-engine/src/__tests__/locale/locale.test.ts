import { describe, it, expect } from 'vitest';
import { resolveLocale, interpolate, zhCN, enUS } from '../../locale';
import type { BILocale } from '../../locale';

// ---------------------------------------------------------------------------
// resolveLocale
// ---------------------------------------------------------------------------

describe('resolveLocale', () => {
  it('returns zh-CN for undefined', () => {
    const result = resolveLocale(undefined);
    expect(result.chart.type.bar).toBe('柱状图');
  });

  it('returns zh-CN for "zh-CN" string', () => {
    const result = resolveLocale('zh-CN');
    expect(result.chart.type.bar).toBe('柱状图');
  });

  it('returns en-US for "en-US" string', () => {
    const result = resolveLocale('en-US');
    expect(result.chart.type.bar).toBe('Bar');
  });

  it('returns zh-CN for unknown string', () => {
    const result = resolveLocale('fr-FR' as 'zh-CN' | 'en-US');
    expect(result.chart.type.bar).toBe('柱状图');
  });

  it('returns custom locale object directly', () => {
    const custom: BILocale = {
      ...zhCN,
      chart: { ...zhCN.chart, type: { ...zhCN.chart.type, bar: 'Custom Bar' } },
    };
    const result = resolveLocale(custom);
    expect(result.chart.type.bar).toBe('Custom Bar');
  });
});

// ---------------------------------------------------------------------------
// interpolate
// ---------------------------------------------------------------------------

describe('interpolate', () => {
  it('replaces single placeholder', () => {
    expect(interpolate('共 {count} 条', { count: 42 })).toBe('共 42 条');
  });

  it('replaces multiple placeholders', () => {
    expect(interpolate('{a} and {b}', { a: 'foo', b: 'bar' })).toBe('foo and bar');
  });

  it('replaces number values', () => {
    expect(interpolate('{size} 条/页', { size: 20 })).toBe('20 条/页');
  });

  it('handles missing params gracefully', () => {
    expect(interpolate('hello {name}', {})).toBe('hello ');
  });

  it('returns original string if no placeholders', () => {
    expect(interpolate('no placeholders', { x: 1 })).toBe('no placeholders');
  });
});

// ---------------------------------------------------------------------------
// Locale key completeness
// ---------------------------------------------------------------------------

describe('locale key completeness', () => {
  it('zh-CN and en-US have the same keys', () => {
    const zhKeys = getAllLeafKeys(zhCN);
    const enKeys = getAllLeafKeys(enUS);
    expect(enKeys).toEqual(zhKeys);
  });

  it('zh-CN has all expected chart type keys', () => {
    const chartTypes = zhCN.chart.type;
    expect(chartTypes.bar).toBeTruthy();
    expect(chartTypes.line).toBeTruthy();
    expect(chartTypes.area).toBeTruthy();
    expect(chartTypes.table).toBeTruthy();
    expect(chartTypes.pie).toBeTruthy();
    expect(chartTypes.scatter).toBeTruthy();
    expect(chartTypes.radar).toBeTruthy();
    expect(chartTypes.gauge).toBeTruthy();
    expect(chartTypes.candlestick).toBeTruthy();
  });

  it('en-US has all expected chart type keys', () => {
    const chartTypes = enUS.chart.type;
    expect(chartTypes.bar).toBe('Bar');
    expect(chartTypes.line).toBe('Line');
    expect(chartTypes.area).toBe('Area');
    expect(chartTypes.table).toBe('Table');
    expect(chartTypes.pie).toBe('Pie');
  });

  it('zh-CN has all table keys', () => {
    expect(zhCN.table.filter.title).toBeTruthy();
    expect(zhCN.table.filter.placeholder).toBeTruthy();
    expect(zhCN.table.filter.confirm).toBeTruthy();
    expect(zhCN.table.columnManager.title).toBeTruthy();
    expect(zhCN.table.columnManager.available).toBeTruthy();
    expect(zhCN.table.columnManager.selected).toBeTruthy();
    expect(zhCN.table.columnManager.emptyAvailable).toBeTruthy();
    expect(zhCN.table.columnManager.emptySelected).toBeTruthy();
    expect(zhCN.table.columnManager.cancel).toBeTruthy();
    expect(zhCN.table.columnManager.confirm).toBeTruthy();
    expect(zhCN.table.pagination.total).toBeTruthy();
    expect(zhCN.table.pagination.pageSize).toBeTruthy();
    expect(zhCN.table.empty.noVisibleColumns).toBeTruthy();
    expect(zhCN.table.empty.noData).toBeTruthy();
    expect(zhCN.table.noColumnsDefined).toBeTruthy();
  });

  it('en-US has all table keys', () => {
    expect(enUS.table.filter.title).toBeTruthy();
    expect(enUS.table.pagination.total).toContain('{count}');
    expect(enUS.table.pagination.pageSize).toContain('{size}');
    expect(enUS.table.empty.noData).toBe('No data');
    expect(enUS.table.noColumnsDefined).toBe('No columns defined.');
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAllLeafKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getAllLeafKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}
