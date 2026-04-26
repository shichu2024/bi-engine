import { describe, it, expect } from 'vitest';
import {
  DEFAULT_BACKGROUND_TOKENS,
  DEFAULT_FONT_TOKENS,
  DEFAULT_SPACING_TOKENS,
  DEFAULT_BORDER_TOKENS,
  DEFAULT_SEMANTIC_TOKENS,
  DEFAULT_TABLE_TOKENS,
  DEFAULT_THEME_TOKENS,
  DARK_BACKGROUND_TOKENS,
  DARK_FONT_TOKENS,
  DARK_BORDER_TOKENS,
  DARK_SEMANTIC_TOKENS,
  DARK_TABLE_TOKENS,
  DARK_THEME_TOKENS,
} from '../../src/theme/theme-tokens';
import type {
  BackgroundTokens,
  FontTokens,
  SpacingTokens,
  BorderTokens,
  SemanticTokens,
  TableTokens,
  ThemeTokens,
} from '../../src/theme/theme-tokens';

// ---------------------------------------------------------------------------
// 浅色令牌
// ---------------------------------------------------------------------------

describe('DEFAULT_BACKGROUND_TOKENS', () => {
  it('具有 chart、tooltip 和 legend 属性', () => {
    expect(DEFAULT_BACKGROUND_TOKENS.chart).toBe('#FFFFFF');
    expect(DEFAULT_BACKGROUND_TOKENS.tooltip).toBe('rgba(255, 255, 255, 0.96)');
    expect(DEFAULT_BACKGROUND_TOKENS.legend).toBe('transparent');
  });

  it('满足 BackgroundTokens 接口', () => {
    const tokens: BackgroundTokens = DEFAULT_BACKGROUND_TOKENS;
    expect(typeof tokens.chart).toBe('string');
    expect(typeof tokens.tooltip).toBe('string');
    expect(typeof tokens.legend).toBe('string');
  });
});

describe('DEFAULT_FONT_TOKENS', () => {
  it('具有所有必需的字体属性', () => {
    expect(DEFAULT_FONT_TOKENS.family).toContain('Helvetica Neue');
    expect(DEFAULT_FONT_TOKENS.size).toBe(12);
    expect(DEFAULT_FONT_TOKENS.titleSize).toBe(16);
    expect(DEFAULT_FONT_TOKENS.axisLabelSize).toBe(11);
    expect(DEFAULT_FONT_TOKENS.color).toBe('#333333');
    expect(DEFAULT_FONT_TOKENS.secondaryColor).toBe('#999999');
    expect(DEFAULT_FONT_TOKENS.tertiaryColor).toBe('#BBBBBB');
  });

  it('满足 FontTokens 接口', () => {
    const tokens: FontTokens = DEFAULT_FONT_TOKENS;
    expect(typeof tokens.family).toBe('string');
    expect(typeof tokens.size).toBe('number');
    expect(typeof tokens.color).toBe('string');
    expect(typeof tokens.secondaryColor).toBe('string');
    expect(typeof tokens.tertiaryColor).toBe('string');
  });
});

describe('DEFAULT_SPACING_TOKENS', () => {
  it('具有所有必需的间距属性', () => {
    expect(DEFAULT_SPACING_TOKENS.padding).toBe(16);
    expect(DEFAULT_SPACING_TOKENS.legendGap).toBe(12);
    expect(DEFAULT_SPACING_TOKENS.tooltipPaddingH).toBe(12);
    expect(DEFAULT_SPACING_TOKENS.tooltipPaddingV).toBe(8);
  });

  it('所有间距值为正数', () => {
    expect(DEFAULT_SPACING_TOKENS.padding).toBeGreaterThan(0);
    expect(DEFAULT_SPACING_TOKENS.legendGap).toBeGreaterThan(0);
    expect(DEFAULT_SPACING_TOKENS.tooltipPaddingH).toBeGreaterThan(0);
    expect(DEFAULT_SPACING_TOKENS.tooltipPaddingV).toBeGreaterThan(0);
  });
});

describe('DEFAULT_BORDER_TOKENS', () => {
  it('具有所有必需的边框属性', () => {
    expect(DEFAULT_BORDER_TOKENS.radius).toBe(4);
    expect(DEFAULT_BORDER_TOKENS.axisLineColor).toBe('#CCCCCC');
    expect(DEFAULT_BORDER_TOKENS.splitLineColor).toBe('#EEEEEE');
    expect(DEFAULT_BORDER_TOKENS.tooltipBorderColor).toBe('#E8E8E8');
    expect(DEFAULT_BORDER_TOKENS.gridColor).toBe('#F0F0F0');
    expect(DEFAULT_BORDER_TOKENS.selectedColor).toBe('#1890FF');
    expect(DEFAULT_BORDER_TOKENS.dividerColor).toBe('#E8E8E8');
  });

  it('满足 BorderTokens 接口', () => {
    const tokens: BorderTokens = DEFAULT_BORDER_TOKENS;
    expect(typeof tokens.radius).toBe('number');
    expect(typeof tokens.axisLineColor).toBe('string');
    expect(typeof tokens.gridColor).toBe('string');
    expect(typeof tokens.selectedColor).toBe('string');
    expect(typeof tokens.dividerColor).toBe('string');
  });
});

describe('DEFAULT_SEMANTIC_TOKENS', () => {
  it('具有 error、warning、success、info 属性', () => {
    expect(DEFAULT_SEMANTIC_TOKENS.error).toBe('#FF4D4F');
    expect(DEFAULT_SEMANTIC_TOKENS.warning).toBe('#FAAD14');
    expect(DEFAULT_SEMANTIC_TOKENS.success).toBe('#52C41A');
    expect(DEFAULT_SEMANTIC_TOKENS.info).toBe('#1890FF');
  });

  it('满足 SemanticTokens 接口', () => {
    const tokens: SemanticTokens = DEFAULT_SEMANTIC_TOKENS;
    expect(typeof tokens.error).toBe('string');
    expect(typeof tokens.warning).toBe('string');
    expect(typeof tokens.success).toBe('string');
    expect(typeof tokens.info).toBe('string');
  });
});

describe('DEFAULT_TABLE_TOKENS', () => {
  it('具有所有必需的表格属性', () => {
    expect(DEFAULT_TABLE_TOKENS.headerBg).toBe('#FAFAFA');
    expect(DEFAULT_TABLE_TOKENS.headerBorder).toBe('#E8E8E8');
    expect(DEFAULT_TABLE_TOKENS.cellBorder).toBe('#F0F0F0');
    expect(DEFAULT_TABLE_TOKENS.rowHoverBg).toBe('#E6F7FF');
    expect(DEFAULT_TABLE_TOKENS.modalBg).toBe('#FFFFFF');
    expect(DEFAULT_TABLE_TOKENS.primaryButtonBg).toBe('#1890FF');
  });

  it('满足 TableTokens 接口', () => {
    const tokens: TableTokens = DEFAULT_TABLE_TOKENS;
    expect(typeof tokens.headerBg).toBe('string');
    expect(typeof tokens.modalMask).toBe('string');
    expect(typeof tokens.primaryButtonColor).toBe('string');
  });
});

describe('DEFAULT_THEME_TOKENS', () => {
  it('包含全部六个令牌类别', () => {
    expect(DEFAULT_THEME_TOKENS.background).toBe(DEFAULT_BACKGROUND_TOKENS);
    expect(DEFAULT_THEME_TOKENS.font).toBe(DEFAULT_FONT_TOKENS);
    expect(DEFAULT_THEME_TOKENS.spacing).toBe(DEFAULT_SPACING_TOKENS);
    expect(DEFAULT_THEME_TOKENS.border).toBe(DEFAULT_BORDER_TOKENS);
    expect(DEFAULT_THEME_TOKENS.semantic).toBe(DEFAULT_SEMANTIC_TOKENS);
    expect(DEFAULT_THEME_TOKENS.table).toBe(DEFAULT_TABLE_TOKENS);
  });

  it('满足 ThemeTokens 接口', () => {
    const tokens: ThemeTokens = DEFAULT_THEME_TOKENS;
    expect(tokens.background).toBeDefined();
    expect(tokens.font).toBeDefined();
    expect(tokens.spacing).toBeDefined();
    expect(tokens.border).toBeDefined();
    expect(tokens.semantic).toBeDefined();
    expect(tokens.table).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 暗色令牌
// ---------------------------------------------------------------------------

describe('DARK_BACKGROUND_TOKENS', () => {
  it('使用深色背景', () => {
    expect(DARK_BACKGROUND_TOKENS.chart).toBe('#1A1A2E');
    expect(DARK_BACKGROUND_TOKENS.tooltip).toBe('rgba(30, 30, 50, 0.9)');
    expect(DARK_BACKGROUND_TOKENS.legend).toBe('transparent');
  });
});

describe('DARK_FONT_TOKENS', () => {
  it('使用浅色文字', () => {
    expect(DARK_FONT_TOKENS.color).toBe('#E0E0E0');
    expect(DARK_FONT_TOKENS.secondaryColor).toBe('#B0B0B0');
    expect(DARK_FONT_TOKENS.tertiaryColor).toBe('#666666');
  });
});

describe('DARK_BORDER_TOKENS', () => {
  it('使用深色边框', () => {
    expect(DARK_BORDER_TOKENS.axisLineColor).toBe('#555555');
    expect(DARK_BORDER_TOKENS.splitLineColor).toBe('#333333');
    expect(DARK_BORDER_TOKENS.gridColor).toBe('#303030');
    expect(DARK_BORDER_TOKENS.selectedColor).toBe('#177DDC');
    expect(DARK_BORDER_TOKENS.dividerColor).toBe('#3A3A3A');
  });
});

describe('DARK_SEMANTIC_TOKENS', () => {
  it('使用暗色模式语义色', () => {
    expect(DARK_SEMANTIC_TOKENS.error).toBe('#FF7875');
    expect(DARK_SEMANTIC_TOKENS.warning).toBe('#FFC53D');
    expect(DARK_SEMANTIC_TOKENS.success).toBe('#73D13D');
    expect(DARK_SEMANTIC_TOKENS.info).toBe('#177DDC');
  });
});

describe('DARK_TABLE_TOKENS', () => {
  it('使用深色表格样式', () => {
    expect(DARK_TABLE_TOKENS.headerBg).toBe('#1F1F1F');
    expect(DARK_TABLE_TOKENS.headerBorder).toBe('#3A3A3A');
    expect(DARK_TABLE_TOKENS.cellBorder).toBe('#303030');
    expect(DARK_TABLE_TOKENS.rowHoverBg).toBe('#111B26');
    expect(DARK_TABLE_TOKENS.modalBg).toBe('#1F1F1F');
    expect(DARK_TABLE_TOKENS.primaryButtonBg).toBe('#177DDC');
  });
});

describe('DARK_THEME_TOKENS', () => {
  it('包含全部六个令牌类别', () => {
    expect(DARK_THEME_TOKENS.background).toBe(DARK_BACKGROUND_TOKENS);
    expect(DARK_THEME_TOKENS.font).toBe(DARK_FONT_TOKENS);
    expect(DARK_THEME_TOKENS.spacing).toBe(DEFAULT_SPACING_TOKENS);
    expect(DARK_THEME_TOKENS.border).toBe(DARK_BORDER_TOKENS);
    expect(DARK_THEME_TOKENS.semantic).toBe(DARK_SEMANTIC_TOKENS);
    expect(DARK_THEME_TOKENS.table).toBe(DARK_TABLE_TOKENS);
  });

  it('间距令牌与默认值共享', () => {
    expect(DARK_THEME_TOKENS.spacing).toBe(DEFAULT_SPACING_TOKENS);
  });

  it('满足 ThemeTokens 接口', () => {
    const tokens: ThemeTokens = DARK_THEME_TOKENS;
    expect(tokens.background).toBeDefined();
    expect(tokens.font).toBeDefined();
    expect(tokens.spacing).toBeDefined();
    expect(tokens.border).toBeDefined();
    expect(tokens.semantic).toBeDefined();
    expect(tokens.table).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 亮暗对比一致性
// ---------------------------------------------------------------------------

describe('亮暗令牌结构一致性', () => {
  it('background 结构一致', () => {
    expect(Object.keys(DEFAULT_BACKGROUND_TOKENS)).toEqual(Object.keys(DARK_BACKGROUND_TOKENS));
  });

  it('font 结构一致', () => {
    expect(Object.keys(DEFAULT_FONT_TOKENS)).toEqual(Object.keys(DARK_FONT_TOKENS));
  });

  it('border 结构一致', () => {
    expect(Object.keys(DEFAULT_BORDER_TOKENS)).toEqual(Object.keys(DARK_BORDER_TOKENS));
  });

  it('semantic 结构一致', () => {
    expect(Object.keys(DEFAULT_SEMANTIC_TOKENS)).toEqual(Object.keys(DARK_SEMANTIC_TOKENS));
  });

  it('table 结构一致', () => {
    expect(Object.keys(DEFAULT_TABLE_TOKENS)).toEqual(Object.keys(DARK_TABLE_TOKENS));
  });

  it('theme 组合结构一致', () => {
    expect(Object.keys(DEFAULT_THEME_TOKENS)).toEqual(Object.keys(DARK_THEME_TOKENS));
  });
});
