import { describe, it, expect } from 'vitest';
import { resolveChartData } from '../../src/core/resolve-chart-data';
import type { ChartDataProperty } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// resolveChartData 测试
// ---------------------------------------------------------------------------

describe('resolveChartData', () => {
  // =========================================================================
  // 静态数据路径 —— 成功
  // =========================================================================

  describe('静态数据路径', () => {
    it('为合法的静态 dataProperties 返回已解析的数据', () => {
      const dp: ChartDataProperty = {
        dataType: 'static',
        data: [
          { month: 'Jan', sales: 100 },
          { month: 'Feb', sales: 200 },
        ],
      };

      const result = resolveChartData(dp);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toEqual({ month: 'Jan', sales: 100 });
        expect(result.data[1]).toEqual({ month: 'Feb', sales: 200 });
      }
    });

    it('返回的已解析数据为同一引用（不复制）', () => {
      const data = [{ a: 1 }];
      const dp: ChartDataProperty = {
        dataType: 'static',
        data,
      };

      const result = resolveChartData(dp);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBe(data);
      }
    });

    it('静态数据为空时返回空数组', () => {
      const dp: ChartDataProperty = {
        dataType: 'static',
        data: [],
      };

      const result = resolveChartData(dp);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual([]);
      }
    });

    it('当列与数据键匹配时通过列字段一致性检查', () => {
      const dp: ChartDataProperty = {
        dataType: 'static',
        columns: [
          { title: 'Month', key: 'month' },
          { title: 'Sales', key: 'sales' },
        ],
        data: [
          { month: 'Jan', sales: 100 },
        ],
      };

      const result = resolveChartData(dp);
      expect(result.ok).toBe(true);
    });

    it('列存在但数据为空时通过（不可能不匹配）', () => {
      const dp: ChartDataProperty = {
        dataType: 'static',
        columns: [
          { title: 'Month', key: 'month' },
        ],
        data: [],
      };

      const result = resolveChartData(dp);
      expect(result.ok).toBe(true);
    });

    it('数据存在但列为空时通过', () => {
      const dp: ChartDataProperty = {
        dataType: 'static',
        columns: [],
        data: [{ month: 'Jan' }],
      };

      const result = resolveChartData(dp);
      expect(result.ok).toBe(true);
    });

    it('列为 undefined 时通过', () => {
      const dp: ChartDataProperty = {
        dataType: 'static',
        data: [{ month: 'Jan' }],
      };

      const result = resolveChartData(dp);
      expect(result.ok).toBe(true);
    });

    it('处理嵌套列子级（展平键用于一致性检查）', () => {
      const dp: ChartDataProperty = {
        dataType: 'static',
        columns: [
          {
            title: 'Group',
            key: 'group',
            children: [
              { title: 'Sub A', key: 'subA' },
              { title: 'Sub B', key: 'subB' },
            ],
          },
          { title: 'Total', key: 'total' },
        ],
        data: [
          { subA: 10, subB: 20, total: 30 },
        ],
      };

      const result = resolveChartData(dp);
      expect(result.ok).toBe(true);
    });
  });

  // =========================================================================
  // 静态数据路径 —— 错误
  // =========================================================================

  describe('静态数据错误', () => {
    it('当 data 为 undefined 时返回 STATIC_DATA_MISSING', () => {
      const dp: ChartDataProperty = {
        dataType: 'static',
      };

      const result = resolveChartData(dp);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('STATIC_DATA_MISSING');
        expect(result.message).toContain('not provided');
      }
    });

    it('当 data 为 null 时返回 STATIC_DATA_MISSING', () => {
      const dp = {
        dataType: 'static' as const,
        data: null,
      };

      const result = resolveChartData(dp as ChartDataProperty);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('STATIC_DATA_MISSING');
      }
    });

    it('当 data 不是数组时返回 STATIC_DATA_INVALID', () => {
      const dp = {
        dataType: 'static' as const,
        data: 'not an array',
      };

      const result = resolveChartData(dp as ChartDataProperty);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('STATIC_DATA_INVALID');
        expect(result.message).toContain('not an array');
      }
    });

    it('当列键不在数据中时返回 COLUMN_FIELD_MISMATCH', () => {
      const dp: ChartDataProperty = {
        dataType: 'static',
        columns: [
          { title: 'Month', key: 'month' },
          { title: 'Sales', key: 'sales' },
          { title: 'Missing Column', key: 'nonexistent' },
        ],
        data: [
          { month: 'Jan', sales: 100 },
        ],
      };

      const result = resolveChartData(dp);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('COLUMN_FIELD_MISMATCH');
        expect(result.message).toContain('nonexistent');
        expect(result.details?.missingFields).toEqual(['nonexistent']);
      }
    });

    it('在 COLUMN_FIELD_MISMATCH 中报告所有缺失字段', () => {
      const dp: ChartDataProperty = {
        dataType: 'static',
        columns: [
          { title: 'A', key: 'a' },
          { title: 'B', key: 'b' },
          { title: 'C', key: 'c' },
        ],
        data: [
          { x: 1, y: 2 },
        ],
      };

      const result = resolveChartData(dp);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('COLUMN_FIELD_MISMATCH');
        expect(result.details?.missingFields).toEqual(['a', 'b', 'c']);
      }
    });

    it('检测嵌套列子级中的缺失字段', () => {
      const dp: ChartDataProperty = {
        dataType: 'static',
        columns: [
          {
            title: 'Group',
            key: 'group',
            children: [
              { title: 'Sub A', key: 'subA' },
              { title: 'Sub B', key: 'subB' },
            ],
          },
        ],
        data: [
          { total: 30 },
        ],
      };

      const result = resolveChartData(dp);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('COLUMN_FIELD_MISMATCH');
        expect(result.details?.missingFields).toEqual(['subA', 'subB']);
      }
    });
  });

  // =========================================================================
  // 不支持的 dataType 路径
  // =========================================================================

  describe('datasource 数据类型', () => {
    it('返回 UNSUPPORTED_DATASOURCE', () => {
      const dp: ChartDataProperty = {
        dataType: 'datasource',
        sourceId: 'some-ds-id',
      };

      const result = resolveChartData(dp);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('UNSUPPORTED_DATASOURCE');
        expect(result.message).toContain('datasource');
        expect(result.message).toContain('phase 1');
      }
    });
  });

  describe('api 数据类型', () => {
    it('返回 UNSUPPORTED_API', () => {
      const dp: ChartDataProperty = {
        dataType: 'api',
        url: 'https://example.com/data',
        method: 'GET',
      };

      const result = resolveChartData(dp);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('UNSUPPORTED_API');
        expect(result.message).toContain('api');
        expect(result.message).toContain('phase 1');
      }
    });
  });
});
