import { describe, it, expect } from 'vitest';
import {
  getBaseOption,
  FONT_FAMILY,
  FONT_SIZE,
  TEXT_COLOR,
  COLOR_PALETTE,
  SPACING,
  getLineOptionTemplate,
  getBarOptionTemplate,
  getPieOptionTemplate,
  getRingOptionTemplate,
  getRadarOptionTemplate,
  getScatterOptionTemplate,
  getCandlestickOptionTemplate,
  getGaugeOptionTemplate,
  getEmptyDataOption,
  isDatasetEmpty,
  getCartesianAxisDefaults,
} from '../option-templates';

// ============================================================================
// getBaseOption
// ============================================================================

describe('getBaseOption', () => {
  it('returns a non-null option object', () => {
    const option = getBaseOption();
    expect(option).toBeDefined();
    expect(typeof option).toBe('object');
  });

  it('includes color palette with at least 8 colors', () => {
    const option = getBaseOption();
    const colors = option.color as string[];
    expect(Array.isArray(colors)).toBe(true);
    expect(colors.length).toBeGreaterThanOrEqual(8);
  });

  it('includes textStyle with fontFamily', () => {
    const option = getBaseOption();
    const textStyle = option.textStyle as Record<string, unknown>;
    expect(textStyle.fontFamily).toBe(FONT_FAMILY);
    expect(textStyle.fontSize).toBe(FONT_SIZE.axisLabel);
    expect(textStyle.color).toBe(TEXT_COLOR.primary);
  });

  it('includes standardized title config', () => {
    const option = getBaseOption();
    const title = option.title as Record<string, unknown>;
    expect(title.show).toBe(false);
    expect(title.left).toBe('center');
    const titleStyle = title.textStyle as Record<string, unknown>;
    expect(titleStyle.fontSize).toBe(FONT_SIZE.title);
    expect(titleStyle.fontWeight).toBe(600);
  });

  it('includes standardized tooltip config', () => {
    const option = getBaseOption();
    const tooltip = option.tooltip as Record<string, unknown>;
    expect(tooltip.backgroundColor).toBe('rgba(255, 255, 255, 0.96)');
    expect(tooltip.borderColor).toBe('#E8E8E8');
    expect(tooltip.confine).toBe(true);
  });

  it('includes standardized legend config with text truncation', () => {
    const option = getBaseOption();
    const legend = option.legend as Record<string, unknown>;
    expect(legend.show).toBe(false);
    expect(legend.bottom).toBe(0);
    expect(legend.orient).toBe('horizontal');
    expect(legend.type).toBe('scroll');
    // 超长文本截断
    expect(typeof legend.formatter).toBe('function');
    const textStyle = legend.textStyle as Record<string, unknown>;
    expect(textStyle.overflow).toBe('truncate');
    expect(textStyle.ellipsis).toBe('...');
    expect(textStyle.width).toBe(100);
    // 图例 tooltip（悬浮显示全名）
    const legendTooltip = legend.tooltip as Record<string, unknown>;
    expect(legendTooltip.show).toBe(true);
  });

  it('includes standardized grid config', () => {
    const option = getBaseOption();
    const grid = option.grid as Record<string, unknown>;
    expect(grid.left).toBe(SPACING.gridLeft);
    expect(grid.right).toBe(SPACING.gridRight);
    expect(grid.top).toBe(SPACING.gridTop);
    expect(grid.bottom).toBe(SPACING.gridBottom);
    expect(grid.containLabel).toBe(true);
  });

  it('returns a fresh copy on each call (immutability)', () => {
    const a = getBaseOption();
    const b = getBaseOption();
    (a.color as string[]).push('#fake');
    expect((b.color as string[]).length).not.toBe((a.color as string[]).length);
  });
});

// ============================================================================
// Chart Type Templates
// ============================================================================

describe('getLineOptionTemplate', () => {
  it('includes tooltip with trigger "axis"', () => {
    const option = getLineOptionTemplate();
    const tooltip = option.tooltip as Record<string, unknown>;
    expect(tooltip.trigger).toBe('axis');
  });

  it('includes series with line defaults', () => {
    const option = getLineOptionTemplate();
    const series = option.series as Record<string, unknown>[];
    expect(series[0].type).toBe('line');
    expect(series[0].smooth).toBe(false);
    expect(series[0].connectNulls).toBe(true);
  });
});

describe('getBarOptionTemplate', () => {
  it('includes bar series with max width and border radius', () => {
    const option = getBarOptionTemplate();
    const series = option.series as Record<string, unknown>[];
    expect(series[0].type).toBe('bar');
    expect(series[0].barMaxWidth).toBe(40);
    const itemStyle = series[0].itemStyle as Record<string, unknown>;
    expect(itemStyle.borderRadius).toEqual([4, 4, 0, 0]);
  });
});

describe('getPieOptionTemplate', () => {
  it('includes pie series with avoidLabelOverlap', () => {
    const option = getPieOptionTemplate();
    const series = option.series as Record<string, unknown>[];
    expect(series[0].type).toBe('pie');
    expect(series[0].avoidLabelOverlap).toBe(true);
    expect(series[0].radius).toBe('70%');
  });

  it('tooltip triggers on item', () => {
    const option = getPieOptionTemplate();
    const tooltip = option.tooltip as Record<string, unknown>;
    expect(tooltip.trigger).toBe('item');
  });

  it('legend is on the right side, vertical', () => {
    const option = getPieOptionTemplate();
    const legend = option.legend as Record<string, unknown>;
    expect(legend.orient).toBe('vertical');
    expect(legend.right).toBe('10%');
    expect(legend.top).toBe('middle');
  });
});

describe('getRingOptionTemplate', () => {
  it('uses ring radius [50%, 75%]', () => {
    const option = getRingOptionTemplate();
    const series = option.series as Record<string, unknown>[];
    expect(series[0].radius).toEqual(['50%', '75%']);
  });

  it('legend is on the right side, vertical, with 10% distance', () => {
    const option = getRingOptionTemplate();
    const legend = option.legend as Record<string, unknown>;
    expect(legend.orient).toBe('vertical');
    expect(legend.right).toBe('10%');
  });

  it('supports center title text', () => {
    const option = getRingOptionTemplate('1,234', '总计');
    const graphic = option.graphic as Record<string, unknown>;
    const elements = graphic.elements as Record<string, unknown>[];
    expect(elements.length).toBe(2);
    expect((elements[0].style as Record<string, unknown>).text).toBe('1,234');
    expect((elements[1].style as Record<string, unknown>).text).toBe('总计');
  });

  it('omits center text when no params provided', () => {
    const option = getRingOptionTemplate();
    expect(option.graphic).toBeUndefined();
  });
});

describe('getRadarOptionTemplate', () => {
  it('includes radar config with polygon shape', () => {
    const option = getRadarOptionTemplate();
    const radar = option.radar as Record<string, unknown>;
    expect(radar.shape).toBe('polygon');
  });

  it('includes series with areaStyle', () => {
    const option = getRadarOptionTemplate();
    const series = option.series as Record<string, unknown>[];
    expect(series[0].type).toBe('radar');
    expect(series[0].areaStyle).toBeDefined();
  });
});

describe('getScatterOptionTemplate', () => {
  it('includes scatter series with symbolSize 10', () => {
    const option = getScatterOptionTemplate();
    const series = option.series as Record<string, unknown>[];
    expect(series[0].type).toBe('scatter');
    expect(series[0].symbolSize).toBe(10);
  });

  it('xAxis and yAxis are value type', () => {
    const option = getScatterOptionTemplate();
    const xAxis = option.xAxis as Record<string, unknown>;
    const yAxis = option.yAxis as Record<string, unknown>;
    expect(xAxis.type).toBe('value');
    expect(yAxis.type).toBe('value');
  });
});

describe('getCandlestickOptionTemplate', () => {
  it('includes candlestick series with red/green colors', () => {
    const option = getCandlestickOptionTemplate();
    const series = option.series as Record<string, unknown>[];
    expect(series[0].type).toBe('candlestick');
    const itemStyle = series[0].itemStyle as Record<string, unknown>;
    expect(itemStyle.color).toBe('#EC0000');
    expect(itemStyle.color0).toBe('#00DA3C');
  });
});

describe('getGaugeOptionTemplate', () => {
  it('includes gauge series with pointer and axisLine', () => {
    const option = getGaugeOptionTemplate();
    const series = option.series as Record<string, unknown>[];
    expect(series[0].type).toBe('gauge');
    expect(series[0].pointer).toBeDefined();
    expect(series[0].axisLine).toBeDefined();
  });
});

// ============================================================================
// Empty Data Option
// ============================================================================

describe('getEmptyDataOption', () => {
  it('shows "暂无数据" text', () => {
    const option = getEmptyDataOption();
    const graphic = option.graphic as Record<string, unknown>;
    const style = graphic.style as Record<string, unknown>;
    expect(style.text).toBe('暂无数据');
  });

  it('hides tooltip, legend, axes', () => {
    const option = getEmptyDataOption();
    expect((option.tooltip as Record<string, unknown>).show).toBe(false);
    expect((option.legend as Record<string, unknown>).show).toBe(false);
    expect((option.xAxis as Record<string, unknown>).show).toBe(false);
    expect((option.yAxis as Record<string, unknown>).show).toBe(false);
  });
});

describe('isDatasetEmpty', () => {
  it('returns true for empty array', () => {
    expect(isDatasetEmpty([])).toBe(true);
  });

  it('returns false for non-empty array', () => {
    expect(isDatasetEmpty([{ a: 1 }])).toBe(false);
  });
});

// ============================================================================
// Cartesian Axis Label Truncation
// ============================================================================

describe('getCartesianAxisDefaults', () => {
  it('xAxis label has truncation + tooltip', () => {
    const { xAxis } = getCartesianAxisDefaults();
    const axisLabel = xAxis.axisLabel as Record<string, unknown>;
    expect(axisLabel.overflow).toBe('truncate');
    expect(axisLabel.ellipsis).toBe('...');
    expect(axisLabel.width).toBe(80);
    const labelTooltip = axisLabel.tooltip as Record<string, unknown>;
    expect(labelTooltip.show).toBe(true);
  });

  it('xAxis name has truncation + tooltip', () => {
    const { xAxis } = getCartesianAxisDefaults();
    const axisName = xAxis.axisName as Record<string, unknown>;
    expect(axisName.overflow).toBe('truncate');
    expect(axisName.ellipsis).toBe('...');
    expect(axisName.width).toBe(80);
    const nameTooltip = axisName.tooltip as Record<string, unknown>;
    expect(nameTooltip.show).toBe(true);
  });

  it('yAxis label has truncation + tooltip', () => {
    const { yAxis } = getCartesianAxisDefaults();
    const axisLabel = yAxis.axisLabel as Record<string, unknown>;
    expect(axisLabel.overflow).toBe('truncate');
    expect(axisLabel.ellipsis).toBe('...');
    expect(axisLabel.width).toBe(60);
    const labelTooltip = axisLabel.tooltip as Record<string, unknown>;
    expect(labelTooltip.show).toBe(true);
  });

  it('yAxis name has truncation + tooltip', () => {
    const { yAxis } = getCartesianAxisDefaults();
    const axisName = yAxis.axisName as Record<string, unknown>;
    expect(axisName.overflow).toBe('truncate');
    expect(axisName.ellipsis).toBe('...');
    expect(axisName.width).toBe(60);
    const nameTooltip = axisName.tooltip as Record<string, unknown>;
    expect(nameTooltip.show).toBe(true);
  });
});

// ============================================================================
// Legend Formatter (text truncation)
// ============================================================================

describe('Legend formatter truncation', () => {
  it('truncates legend names longer than 12 characters', () => {
    const option = getBaseOption();
    const legend = option.legend as Record<string, unknown>;
    const formatter = legend.formatter as (name: string) => string;

    expect(formatter('短名称')).toBe('短名称');
    expect(formatter('这是一个非常长的图例名称测试')).toBe('这是一个非常长的图例名称...');
  });
});

// ============================================================================
// Design Tokens
// ============================================================================

describe('Design Tokens', () => {
  it('COLOR_PALETTE has 8 colors', () => {
    expect(COLOR_PALETTE.length).toBe(8);
  });

  it('FONT_SIZE has all required levels', () => {
    expect(FONT_SIZE.title).toBe(16);
    expect(FONT_SIZE.legend).toBe(12);
    expect(FONT_SIZE.axisLabel).toBe(11);
  });

  it('TEXT_COLOR has primary, secondary, tertiary', () => {
    expect(TEXT_COLOR.primary).toBeDefined();
    expect(TEXT_COLOR.secondary).toBeDefined();
    expect(TEXT_COLOR.tertiary).toBeDefined();
  });
});
