/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { ChartView } from '../../src/react/ChartView';
import type { ChartViewError } from '../../src/react/ChartView';
import type { ChartComponent } from '../../src/schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 模拟 echarts 以避免 jsdom 中的 canvas/zrender 错误
// ---------------------------------------------------------------------------

vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
  })),
}));

// ---------------------------------------------------------------------------
// 为 jsdom 填充 ResizeObserver
// ---------------------------------------------------------------------------

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as unknown as { ResizeObserver: typeof MockResizeObserver }).ResizeObserver = MockResizeObserver;

// ---------------------------------------------------------------------------
// 测试固件
// ---------------------------------------------------------------------------

function validLineComponent(): ChartComponent {
  return {
    type: 'chart',
    id: 'test-line',
    dataProperties: {
      dataType: 'static',
      data: [
        { month: 'Jan', sales: 100 },
        { month: 'Feb', sales: 200 },
      ],
      series: [
        { type: 'line', name: 'Sales', encode: { x: 'month', y: 'sales' } },
      ],
    },
    xAxis: { type: 'category', name: 'Month' },
    yAxis: { type: 'value', name: 'Sales' },
  };
}

function validBarComponent(): ChartComponent {
  return {
    type: 'chart',
    id: 'test-bar',
    dataProperties: {
      dataType: 'static',
      data: [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
      ],
      series: [
        { type: 'bar', name: 'Values', encode: { x: 'category', y: 'value' } },
      ],
    },
    xAxis: { type: 'category' },
    yAxis: { type: 'value' },
  };
}

function validPieComponent(): ChartComponent {
  return {
    type: 'chart',
    id: 'test-pie',
    dataProperties: {
      dataType: 'static',
      data: [
        { name: 'A', value: 30 },
        { name: 'B', value: 70 },
      ],
      series: [
        { type: 'pie', name: 'Distribution', encode: { name: 'name', value: 'value' } },
      ],
    },
  };
}

function invalidComponent(): ChartComponent {
  return {
    type: 'chart',
    id: 'test-invalid',
    dataProperties: {
      dataType: 'static',
      data: [],
      // 缺少 series
    },
  } as unknown as ChartComponent;
}

function datasourceComponent(): ChartComponent {
  return {
    type: 'chart',
    id: 'test-datasource',
    dataProperties: {
      dataType: 'datasource',
      sourceId: 'ds-1',
      data: [],
      series: [
        { type: 'line', name: 'S1', encode: { x: 'x', y: 'y' } },
      ],
    },
    xAxis: { type: 'category' },
    yAxis: { type: 'value' },
  } as unknown as ChartComponent;
}

// ---------------------------------------------------------------------------
// ChartView 冒烟测试
// ---------------------------------------------------------------------------

describe('ChartView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('为合法的折线图组件渲染容器 div', () => {
    const { container } = render(
      <ChartView component={validLineComponent()} />,
    );

    const div = container.firstElementChild as HTMLElement;
    expect(div).not.toBeNull();
    expect(div.tagName).toBe('DIV');
    expect(div.style.width).toBe('100%');
    expect(div.style.height).toBe('100%');
  });

  it('为合法的柱状图组件渲染容器 div', () => {
    const { container } = render(
      <ChartView component={validBarComponent()} />,
    );

    const div = container.firstElementChild as HTMLElement;
    expect(div).not.toBeNull();
  });

  it('为合法的饼图组件渲染容器 div', () => {
    const { container } = render(
      <ChartView component={validPieComponent()} />,
    );

    const div = container.firstElementChild as HTMLElement;
    expect(div).not.toBeNull();
  });

  it('验证失败时调用 onError', () => {
    const onError = vi.fn<(error: ChartViewError) => void>();

    render(
      <ChartView component={invalidComponent()} onError={onError} />,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    const error = onError.mock.calls[0][0];
    expect(error.code).toBeDefined();
    expect(typeof error.message).toBe('string');
  });

  it('dataType 不支持时调用 onError', () => {
    const onError = vi.fn<(error: ChartViewError) => void>();

    render(
      <ChartView component={datasourceComponent()} onError={onError} />,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    const error = onError.mock.calls[0][0];
    expect(error.code).toBe('UNSUPPORTED_DATASOURCE');
  });

  it('将 className 和 style 属性应用到容器', () => {
    const { container } = render(
      <ChartView
        component={validLineComponent()}
        className="my-chart"
        style={{ minHeight: 300 }}
      />,
    );

    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toBe('my-chart');
    expect(div.style.minHeight).toBe('300px');
  });

  it('未提供 onError 且验证失败时不会崩溃', () => {
    expect(() => {
      render(
        <ChartView component={invalidComponent()} />,
      );
    }).not.toThrow();
  });

  it('未提供 onError 且 datasource 不支持时不会崩溃', () => {
    expect(() => {
      render(
        <ChartView component={datasourceComponent()} />,
      );
    }).not.toThrow();
  });
});
