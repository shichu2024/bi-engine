import { describe, it, expect } from 'vitest';
import {
  isGridLayout,
  isAbsoluteLayout,
  getComponentDisplayName,
  getComponentIcon,
} from '../../design/utils';
import { LayoutType } from '../../schema/bi-engine-models';
import type { ChartComponent, TextComponent, TableComponent } from '../../schema/bi-engine-models';

describe('design/utils', () => {
  describe('isGridLayout', () => {
    it('returns true for grid layout', () => {
      expect(isGridLayout({ type: LayoutType.GRID, gx: 0, gy: 0, gw: 4, gh: 3 })).toBe(true);
    });

    it('returns false for non-grid layout', () => {
      expect(isGridLayout({ type: LayoutType.FLOW })).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isGridLayout(undefined)).toBe(false);
    });
  });

  describe('isAbsoluteLayout', () => {
    it('returns true for absolute layout', () => {
      expect(isAbsoluteLayout({ type: LayoutType.ABSOLUTE, x: 0, y: 0, w: 100, h: 50 })).toBe(true);
    });

    it('returns false for grid layout', () => {
      expect(isAbsoluteLayout({ type: LayoutType.GRID, gx: 0, gy: 0, gw: 4, gh: 3 })).toBe(false);
    });
  });

  describe('getComponentDisplayName', () => {
    it('returns Chinese names for known types', () => {
      const chart = { type: 'chart' } as ChartComponent;
      const table = { type: 'table' } as TableComponent;
      const text = { type: 'text' } as TextComponent;
      expect(getComponentDisplayName(chart)).toBe('图表');
      expect(getComponentDisplayName(table)).toBe('表格');
      expect(getComponentDisplayName(text)).toBe('文本');
    });

    it('returns raw type for unknown', () => {
      expect(getComponentDisplayName({ type: 'markdown' } as any)).toBe('Markdown');
    });
  });

  describe('getComponentIcon', () => {
    it('returns icons for known types', () => {
      const chart = { type: 'chart' } as ChartComponent;
      expect(getComponentIcon(chart)).toBe('📊');
    });
  });
});
