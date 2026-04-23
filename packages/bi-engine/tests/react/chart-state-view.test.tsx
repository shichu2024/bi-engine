/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ChartStateView } from '../../src/react/ChartStateView';
import type { ChartState } from '../../src/react/ChartStateView';
import {
  ChartRenderError,
  ChartRenderErrorCategory,
} from '../../src/core/chart-render-error';

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

function renderState(state: ChartState, error?: ChartRenderError): ReturnType<typeof render> {
  return render(
    <ChartStateView state={state} error={error}>
      <div data-testid="child">chart content</div>
    </ChartStateView>,
  );
}

// ---------------------------------------------------------------------------
// 测试
// ---------------------------------------------------------------------------

describe('ChartStateView', () => {
  // --- 加载中 ---

  it('在加载状态下渲染旋转器', () => {
    const { container } = renderState('loading');

    // 容器应包含 SVG 旋转器元素
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('在加载状态下不渲染子组件', () => {
    renderState('loading');
    expect(screen.queryByTestId('child')).toBeNull();
  });

  // --- 空状态 ---

  it('在空状态下渲染 "No data available"', () => {
    renderState('empty');
    expect(screen.getByText('No data available')).not.toBeNull();
  });

  it('在空状态下不渲染子组件', () => {
    renderState('empty');
    expect(screen.queryByTestId('child')).toBeNull();
  });

  // --- 错误 ---

  it('提供错误时渲染错误消息和错误码', () => {
    const error = new ChartRenderError(
      'MISSING_SERIES',
      'dataProperties.series is required.',
      ChartRenderErrorCategory.VALIDATION,
    );

    renderState('error', error);

    expect(screen.getByText('dataProperties.series is required.')).not.toBeNull();
    expect(screen.getByText('MISSING_SERIES')).not.toBeNull();
  });

  it('未提供错误时渲染回退消息', () => {
    renderState('error');

    expect(screen.getByText('An unexpected error occurred.')).not.toBeNull();
  });

  it('在错误状态下不渲染子组件', () => {
    renderState('error');
    expect(screen.queryByTestId('child')).toBeNull();
  });

  it('错误为 undefined 时不渲染错误码', () => {
    renderState('error');
    // 仅应存在回退消息，不应有错误码元素
    const container = renderState('error').container;
    // 重新渲染以避免双重挂载；检查没有错误码 span 可见
    const spans = container.querySelectorAll('span');
    let hasCode = false;
    spans.forEach((span) => {
      if (span.textContent === 'MISSING_SERIES' || span.textContent === 'TEST_CODE') {
        hasCode = true;
      }
    });
    expect(hasCode).toBe(false);
  });

  // --- 成功 ---

  it('在成功状态下渲染子组件', () => {
    renderState('success');
    expect(screen.getByTestId('child')).not.toBeNull();
    expect(screen.getByText('chart content')).not.toBeNull();
  });

  it('成功状态且无子组件时返回 null', () => {
    const { container } = render(
      <ChartStateView state="success" />,
    );
    expect(container.innerHTML).toBe('');
  });

  // --- className / style 透传 ---

  it('将 className 和 style 属性应用到容器', () => {
    const { container } = render(
      <ChartStateView
        state="empty"
        className="my-chart"
        style={{ minHeight: 200 }}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toBe('my-chart');
    expect(wrapper.style.minHeight).toBe('200px');
  });
});
