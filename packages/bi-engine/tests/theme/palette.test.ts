import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PALETTE,
  MIN_PALETTE_SIZE,
  isValidPalette,
  resolvePaletteColor,
} from '../../src/theme/palette';

// ---------------------------------------------------------------------------
// DEFAULT_PALETTE
// ---------------------------------------------------------------------------

describe('DEFAULT_PALETTE', () => {
  it('包含至少 MIN_PALETTE_SIZE 个条目', () => {
    expect(DEFAULT_PALETTE.length).toBeGreaterThanOrEqual(MIN_PALETTE_SIZE);
  });

  it('包含恰好 10 种颜色', () => {
    expect(DEFAULT_PALETTE).toHaveLength(10);
  });

  it('通过 isValidPalette 验证', () => {
    expect(isValidPalette(DEFAULT_PALETTE)).toBe(true);
  });

  it('仅包含十六进制颜色字符串', () => {
    for (const color of DEFAULT_PALETTE) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('包含互不相同的颜色（无重复）', () => {
    const unique = new Set(DEFAULT_PALETTE);
    expect(unique.size).toBe(DEFAULT_PALETTE.length);
  });
});

// ---------------------------------------------------------------------------
// isValidPalette
// ---------------------------------------------------------------------------

describe('isValidPalette', () => {
  it('对默认调色板返回 true', () => {
    expect(isValidPalette(DEFAULT_PALETTE)).toBe(true);
  });

  it('对恰好 MIN_PALETTE_SIZE 个条目的调色板返回 true', () => {
    const palette = Array.from({ length: MIN_PALETTE_SIZE }, (_, i) => `#00000${i}`);
    expect(isValidPalette(palette)).toBe(true);
  });

  it('对少于 MIN_PALETTE_SIZE 个条目的调色板返回 false', () => {
    const palette = ['#111111', '#222222', '#333333'];
    expect(isValidPalette(palette)).toBe(false);
  });

  it('对空调色板返回 false', () => {
    expect(isValidPalette([])).toBe(false);
  });

  it('对大于 MIN_PALETTE_SIZE 的调色板返回 true', () => {
    const palette = Array.from({ length: 20 }, (_, i) => `#00000${i}`);
    expect(isValidPalette(palette)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// resolvePaletteColor
// ---------------------------------------------------------------------------

describe('resolvePaletteColor', () => {
  it('返回给定索引处的颜色', () => {
    expect(resolvePaletteColor(DEFAULT_PALETTE, 0)).toBe('#5470C6');
    expect(resolvePaletteColor(DEFAULT_PALETTE, 1)).toBe('#91CC75');
  });

  it('索引超出调色板长度时循环回到开头', () => {
    const color = resolvePaletteColor(DEFAULT_PALETTE, 10);
    expect(color).toBe(DEFAULT_PALETTE[0]);
  });

  it('对大索引正确循环', () => {
    const color = resolvePaletteColor(DEFAULT_PALETTE, 25);
    expect(color).toBe(DEFAULT_PALETTE[5]);
  });

  it('调色板只有单个条目时返回唯一的颜色', () => {
    const palette = ['#FF0000'];
    expect(resolvePaletteColor(palette, 0)).toBe('#FF0000');
    expect(resolvePaletteColor(palette, 1)).toBe('#FF0000');
    expect(resolvePaletteColor(palette, 100)).toBe('#FF0000');
  });

  it('正确处理索引 0', () => {
    expect(resolvePaletteColor(DEFAULT_PALETTE, 0)).toBe(DEFAULT_PALETTE[0]);
  });
});
