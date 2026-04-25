import { describe, it, expect } from 'vitest';
import { deepMergeOption } from '../option-merge';
import type { MergeMode } from '../option-merge';
import type { EChartsOption } from '../build-line-option';

// ============================================================================
// deepMergeOption
// ============================================================================

describe('deepMergeOption', () => {
  // -------------------------------------------------------------------------
  // override mode
  // -------------------------------------------------------------------------

  describe('override mode', () => {
    it('returns a shallow copy of extension', () => {
      const base: EChartsOption = { color: ['red'] };
      const ext: EChartsOption = { color: ['blue'] };
      const result = deepMergeOption(base, ext, 'override');
      expect(result.color).toEqual(['blue']);
    });

    it('ignores base entirely', () => {
      const base: EChartsOption = { grid: { left: 100 } };
      const ext: EChartsOption = { tooltip: { trigger: 'item' } };
      const result = deepMergeOption(base, ext, 'override');
      expect((result as Record<string, unknown>).grid).toBeUndefined();
      expect((result as Record<string, unknown>).tooltip).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // merge mode (default)
  // -------------------------------------------------------------------------

  describe('merge mode (default)', () => {
    it('merges flat properties', () => {
      const base: EChartsOption = { animation: true };
      const ext: EChartsOption = { animation: false };
      const result = deepMergeOption(base, ext);
      expect(result.animation).toBe(false);
    });

    it('keeps base properties not in extension', () => {
      const base: EChartsOption = { color: ['red'], animation: true } as EChartsOption;
      const ext: EChartsOption = { animation: false } as EChartsOption;
      const result = deepMergeOption(base, ext);
      expect(result.animation).toBe(false);
      expect(result.color).toEqual(['red']);
    });

    it('deep merges nested objects', () => {
      const base: EChartsOption = {
        tooltip: {
          backgroundColor: '#fff',
          borderColor: '#e0e0e0',
          trigger: 'axis',
        },
      };
      const ext: EChartsOption = {
        tooltip: {
          trigger: 'item',
        },
      };
      const result = deepMergeOption(base, ext);
      const tooltip = result.tooltip as Record<string, unknown>;
      expect(tooltip.trigger).toBe('item');
      expect(tooltip.backgroundColor).toBe('#fff');
      expect(tooltip.borderColor).toBe('#e0e0e0');
    });

    it('replaces arrays instead of merging by index', () => {
      const base: EChartsOption = {
        color: ['#5470C6', '#91CC75', '#FAC858'],
      };
      const ext: EChartsOption = {
        color: ['#ff0000', '#00ff00'],
      };
      const result = deepMergeOption(base, ext);
      expect(result.color).toEqual(['#ff0000', '#00ff00']);
    });

    it('does not mutate base or extension', () => {
      const base: EChartsOption = {
        tooltip: { backgroundColor: '#fff' },
      };
      const ext: EChartsOption = {
        tooltip: { borderColor: '#000' },
      };
      deepMergeOption(base, ext);
      expect((base.tooltip as Record<string, unknown>).borderColor).toBeUndefined();
      expect((ext.tooltip as Record<string, unknown>).backgroundColor).toBeUndefined();
    });

    it('handles null/undefined extension values gracefully', () => {
      const base: EChartsOption = { color: ['red'] };
      const ext = { color: undefined } as unknown as EChartsOption;
      const result = deepMergeOption(base, ext);
      // undefined should keep base value
      expect(result.color).toEqual(['red']);
    });

    it('adds new properties from extension', () => {
      const base: EChartsOption = { animation: true };
      const ext: EChartsOption = { grid: { left: 80 } } as EChartsOption;
      const result = deepMergeOption(base, ext);
      expect(result.animation).toBe(true);
      const grid = result.grid as Record<string, unknown>;
      expect(grid.left).toBe(80);
    });

    it('handles three-level deep nesting', () => {
      const base: EChartsOption = {
        title: {
          textStyle: {
            fontSize: 14,
            color: '#333',
          },
        },
      };
      const ext: EChartsOption = {
        title: {
          textStyle: {
            color: '#666',
          },
        },
      };
      const result = deepMergeOption(base, ext);
      const titleTextStyle = (result.title as Record<string, unknown>).textStyle as Record<string, unknown>;
      expect(titleTextStyle.fontSize).toBe(14);
      expect(titleTextStyle.color).toBe('#666');
    });
  });

  // -------------------------------------------------------------------------
  // default mode
  // -------------------------------------------------------------------------

  describe('default mode', () => {
    it('defaults to merge mode when mode is not specified', () => {
      const base: EChartsOption = { color: ['red'] };
      const ext: EChartsOption = { animation: false };
      const result = deepMergeOption(base, ext);
      expect(result.color).toEqual(['red']);
      expect(result.animation).toBe(false);
    });
  });
});
