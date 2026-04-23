/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import {
  ChartThemeProvider,
  useChartTheme,
} from '../../src/theme/chart-theme-context';
import type { ChartThemeContextValue } from '../../src/theme/chart-theme-context';
import { DEFAULT_THEME_TOKENS } from '../../src/theme/theme-tokens';
import { DEFAULT_PALETTE } from '../../src/theme/palette';

// ---------------------------------------------------------------------------
// 无 Provider 时的 useChartTheme
// ---------------------------------------------------------------------------

describe('useChartTheme 无 Provider', () => {
  it('没有 provider 时返回默认主题', () => {
    const { result } = renderHook(() => useChartTheme());

    expect(result.current.tokens).toEqual(DEFAULT_THEME_TOKENS);
    expect(result.current.palette).toEqual(DEFAULT_PALETTE);
  });
});

// ---------------------------------------------------------------------------
// ChartThemeProvider
// ---------------------------------------------------------------------------

describe('ChartThemeProvider', () => {
  it('未提供覆盖时提供默认令牌', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChartThemeProvider>{children}</ChartThemeProvider>
    );

    const { result } = renderHook(() => useChartTheme(), { wrapper });

    expect(result.current.tokens.background).toEqual(DEFAULT_THEME_TOKENS.background);
    expect(result.current.tokens.font).toEqual(DEFAULT_THEME_TOKENS.font);
    expect(result.current.tokens.spacing).toEqual(DEFAULT_THEME_TOKENS.spacing);
    expect(result.current.tokens.border).toEqual(DEFAULT_THEME_TOKENS.border);
    expect(result.current.palette).toEqual(DEFAULT_PALETTE);
  });

  it('提供时覆盖调色板', () => {
    const customPalette = [
      '#a', '#b', '#c', '#d', '#e', '#f', '#g', '#h', '#i', '#j',
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChartThemeProvider palette={customPalette}>{children}</ChartThemeProvider>
    );

    const { result } = renderHook(() => useChartTheme(), { wrapper });

    expect(result.current.palette).toEqual(customPalette);
  });

  it('合并部分字体令牌覆盖', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChartThemeProvider tokens={{ font: { family: 'Inter', size: 14 } }}>
        {children}
      </ChartThemeProvider>
    );

    const { result } = renderHook(() => useChartTheme(), { wrapper });

    const font = result.current.tokens.font;
    expect(font.family).toBe('Inter');
    expect(font.size).toBe(14);
    // 未覆盖的字段应保持默认值
    expect(font.titleSize).toBe(DEFAULT_THEME_TOKENS.font.titleSize);
    expect(font.axisLabelSize).toBe(DEFAULT_THEME_TOKENS.font.axisLabelSize);
    expect(font.color).toBe(DEFAULT_THEME_TOKENS.font.color);
    expect(font.secondaryColor).toBe(DEFAULT_THEME_TOKENS.font.secondaryColor);
  });

  it('合并部分背景令牌覆盖', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChartThemeProvider tokens={{ background: { chart: '#F5F5F5' } }}>
        {children}
      </ChartThemeProvider>
    );

    const { result } = renderHook(() => useChartTheme(), { wrapper });

    const bg = result.current.tokens.background;
    expect(bg.chart).toBe('#F5F5F5');
    // 未覆盖的字段应保持默认值
    expect(bg.tooltip).toBe(DEFAULT_THEME_TOKENS.background.tooltip);
    expect(bg.legend).toBe(DEFAULT_THEME_TOKENS.background.legend);
  });

  it('合并部分间距令牌覆盖', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChartThemeProvider tokens={{ spacing: { padding: 32 } }}>
        {children}
      </ChartThemeProvider>
    );

    const { result } = renderHook(() => useChartTheme(), { wrapper });

    const spacing = result.current.tokens.spacing;
    expect(spacing.padding).toBe(32);
    expect(spacing.legendGap).toBe(DEFAULT_THEME_TOKENS.spacing.legendGap);
    expect(spacing.tooltipPaddingH).toBe(DEFAULT_THEME_TOKENS.spacing.tooltipPaddingH);
    expect(spacing.tooltipPaddingV).toBe(DEFAULT_THEME_TOKENS.spacing.tooltipPaddingV);
  });

  it('合并部分边框令牌覆盖', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChartThemeProvider tokens={{ border: { radius: 8 } }}>
        {children}
      </ChartThemeProvider>
    );

    const { result } = renderHook(() => useChartTheme(), { wrapper });

    const border = result.current.tokens.border;
    expect(border.radius).toBe(8);
    expect(border.axisLineColor).toBe(DEFAULT_THEME_TOKENS.border.axisLineColor);
    expect(border.splitLineColor).toBe(DEFAULT_THEME_TOKENS.border.splitLineColor);
    expect(border.tooltipBorderColor).toBe(DEFAULT_THEME_TOKENS.border.tooltipBorderColor);
  });

  it('同时应用多个令牌类别覆盖', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChartThemeProvider
        tokens={{
          font: { size: 14 },
          background: { chart: '#111' },
        }}
      >
        {children}
      </ChartThemeProvider>
    );

    const { result } = renderHook(() => useChartTheme(), { wrapper });

    expect(result.current.tokens.font.size).toBe(14);
    expect(result.current.tokens.background.chart).toBe('#111');
    // 未覆盖的类别应完全保持默认值
    expect(result.current.tokens.spacing).toEqual(DEFAULT_THEME_TOKENS.spacing);
    expect(result.current.tokens.border).toEqual(DEFAULT_THEME_TOKENS.border);
  });
});
