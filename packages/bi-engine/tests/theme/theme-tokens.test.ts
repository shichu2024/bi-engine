import { describe, it, expect } from 'vitest';
import {
  DEFAULT_BACKGROUND_TOKENS,
  DEFAULT_FONT_TOKENS,
  DEFAULT_SPACING_TOKENS,
  DEFAULT_BORDER_TOKENS,
  DEFAULT_THEME_TOKENS,
} from '../../src/theme/theme-tokens';
import type {
  BackgroundTokens,
  FontTokens,
  SpacingTokens,
  BorderTokens,
  ThemeTokens,
} from '../../src/theme/theme-tokens';

// ---------------------------------------------------------------------------
// 背景令牌
// ---------------------------------------------------------------------------

describe('DEFAULT_BACKGROUND_TOKENS', () => {
  it('具有 chart、tooltip 和 legend 属性', () => {
    expect(DEFAULT_BACKGROUND_TOKENS.chart).toBe('#FFFFFF');
    expect(DEFAULT_BACKGROUND_TOKENS.tooltip).toBe('rgba(50, 50, 50, 0.9)');
    expect(DEFAULT_BACKGROUND_TOKENS.legend).toBe('transparent');
  });

  it('满足 BackgroundTokens 接口', () => {
    const tokens: BackgroundTokens = DEFAULT_BACKGROUND_TOKENS;
    expect(typeof tokens.chart).toBe('string');
    expect(typeof tokens.tooltip).toBe('string');
    expect(typeof tokens.legend).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// 字体令牌
// ---------------------------------------------------------------------------

describe('DEFAULT_FONT_TOKENS', () => {
  it('具有所有必需的字体属性', () => {
    expect(DEFAULT_FONT_TOKENS.family).toContain('Helvetica Neue');
    expect(DEFAULT_FONT_TOKENS.size).toBe(12);
    expect(DEFAULT_FONT_TOKENS.titleSize).toBe(16);
    expect(DEFAULT_FONT_TOKENS.axisLabelSize).toBe(11);
    expect(DEFAULT_FONT_TOKENS.color).toBe('#333333');
    expect(DEFAULT_FONT_TOKENS.secondaryColor).toBe('#999999');
  });

  it('满足 FontTokens 接口', () => {
    const tokens: FontTokens = DEFAULT_FONT_TOKENS;
    expect(typeof tokens.family).toBe('string');
    expect(typeof tokens.size).toBe('number');
    expect(typeof tokens.titleSize).toBe('number');
    expect(typeof tokens.axisLabelSize).toBe('number');
    expect(typeof tokens.color).toBe('string');
    expect(typeof tokens.secondaryColor).toBe('string');
  });

  it('titleSize 大于基础字号', () => {
    expect(DEFAULT_FONT_TOKENS.titleSize).toBeGreaterThan(DEFAULT_FONT_TOKENS.size);
  });

  it('axisLabelSize 小于或等于基础字号', () => {
    expect(DEFAULT_FONT_TOKENS.axisLabelSize).toBeLessThanOrEqual(DEFAULT_FONT_TOKENS.size);
  });
});

// ---------------------------------------------------------------------------
// 间距令牌
// ---------------------------------------------------------------------------

describe('DEFAULT_SPACING_TOKENS', () => {
  it('具有所有必需的间距属性', () => {
    expect(DEFAULT_SPACING_TOKENS.padding).toBe(16);
    expect(DEFAULT_SPACING_TOKENS.legendGap).toBe(12);
    expect(DEFAULT_SPACING_TOKENS.tooltipPaddingH).toBe(12);
    expect(DEFAULT_SPACING_TOKENS.tooltipPaddingV).toBe(8);
  });

  it('满足 SpacingTokens 接口', () => {
    const tokens: SpacingTokens = DEFAULT_SPACING_TOKENS;
    expect(typeof tokens.padding).toBe('number');
    expect(typeof tokens.legendGap).toBe('number');
    expect(typeof tokens.tooltipPaddingH).toBe('number');
    expect(typeof tokens.tooltipPaddingV).toBe('number');
  });

  it('所有间距值为正数', () => {
    expect(DEFAULT_SPACING_TOKENS.padding).toBeGreaterThan(0);
    expect(DEFAULT_SPACING_TOKENS.legendGap).toBeGreaterThan(0);
    expect(DEFAULT_SPACING_TOKENS.tooltipPaddingH).toBeGreaterThan(0);
    expect(DEFAULT_SPACING_TOKENS.tooltipPaddingV).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 边框令牌
// ---------------------------------------------------------------------------

describe('DEFAULT_BORDER_TOKENS', () => {
  it('具有所有必需的边框属性', () => {
    expect(DEFAULT_BORDER_TOKENS.radius).toBe(4);
    expect(DEFAULT_BORDER_TOKENS.axisLineColor).toBe('#CCCCCC');
    expect(DEFAULT_BORDER_TOKENS.splitLineColor).toBe('#EEEEEE');
    expect(DEFAULT_BORDER_TOKENS.tooltipBorderColor).toBe('#333333');
  });

  it('满足 BorderTokens 接口', () => {
    const tokens: BorderTokens = DEFAULT_BORDER_TOKENS;
    expect(typeof tokens.radius).toBe('number');
    expect(typeof tokens.axisLineColor).toBe('string');
    expect(typeof tokens.splitLineColor).toBe('string');
    expect(typeof tokens.tooltipBorderColor).toBe('string');
  });

  it('radius 为非负数', () => {
    expect(DEFAULT_BORDER_TOKENS.radius).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_THEME_TOKENS（组合）
// ---------------------------------------------------------------------------

describe('DEFAULT_THEME_TOKENS', () => {
  it('包含全部四个令牌类别', () => {
    expect(DEFAULT_THEME_TOKENS.background).toBe(DEFAULT_BACKGROUND_TOKENS);
    expect(DEFAULT_THEME_TOKENS.font).toBe(DEFAULT_FONT_TOKENS);
    expect(DEFAULT_THEME_TOKENS.spacing).toBe(DEFAULT_SPACING_TOKENS);
    expect(DEFAULT_THEME_TOKENS.border).toBe(DEFAULT_BORDER_TOKENS);
  });

  it('满足 ThemeTokens 接口', () => {
    const tokens: ThemeTokens = DEFAULT_THEME_TOKENS;
    expect(tokens.background).toBeDefined();
    expect(tokens.font).toBeDefined();
    expect(tokens.spacing).toBeDefined();
    expect(tokens.border).toBeDefined();
  });

  it('背景令牌引用稳定', () => {
    // 同一引用——无意外重新创建
    expect(DEFAULT_THEME_TOKENS.background).toBe(DEFAULT_BACKGROUND_TOKENS);
  });

  it('字体令牌引用稳定', () => {
    expect(DEFAULT_THEME_TOKENS.font).toBe(DEFAULT_FONT_TOKENS);
  });

  it('间距令牌引用稳定', () => {
    expect(DEFAULT_THEME_TOKENS.spacing).toBe(DEFAULT_SPACING_TOKENS);
  });

  it('边框令牌引用稳定', () => {
    expect(DEFAULT_THEME_TOKENS.border).toBe(DEFAULT_BORDER_TOKENS);
  });
});
