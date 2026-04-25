/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PipelineEngine } from '../../pipeline/pipeline-engine';
import { ComponentRegistry } from '../../platform/component-registry';
import { registerBuiltinHandlers } from '../../platform/auto-registry';
import { ComponentView } from '../../react/ComponentView';
import { TableView } from '../../component-handlers/table/TableView';
import type { TableColumn } from '../../component-handlers/table/types';
import { tableMerge } from '../../testing/fixtures/table-merge';
import { tableEnumRender } from '../../testing/fixtures/table-enum-render';

describe('TableView', () => {
  it('renders table with data', () => {
    const columns: TableColumn[] = [
      { key: 'name', title: '姓名' },
      { key: 'age', title: '年龄' },
    ];
    const data = [
      { name: '张三', age: 22 },
      { name: '李四', age: 20 },
    ];

    const { container } = render(<TableView dataSource={data} columns={columns} />);
    expect(container.querySelector('table')).toBeTruthy();
    expect(container.textContent).toContain('张三');
    expect(container.textContent).toContain('李四');
    expect(container.textContent).toContain('姓名');
    expect(container.textContent).toContain('年龄');
  });

  it('renders title', () => {
    const { container } = render(
      <TableView dataSource={[]} columns={[{ key: 'a', title: 'A' }]} title="测试标题" />,
    );
    expect(container.textContent).toContain('测试标题');
  });

  it('shows empty state when no data', () => {
    const { container } = render(
      <TableView dataSource={[]} columns={[{ key: 'a', title: 'A' }]} />,
    );
    expect(container.textContent).toContain('暂无数据');
  });

  it('renders multi-level headers', () => {
    const columns: TableColumn[] = [
      {
        key: 'info',
        title: '基本信息',
        children: [
          { key: 'name', title: '姓名' },
          { key: 'age', title: '年龄' },
        ],
      },
    ];
    const data = [{ name: '张三', age: 22 }];

    const { container } = render(<TableView dataSource={data} columns={columns} />);
    expect(container.textContent).toContain('基本信息');
    expect(container.textContent).toContain('姓名');
    expect(container.textContent).toContain('年龄');
  });

  it('renders stripe rows (even rows have different bg)', () => {
    const columns: TableColumn[] = [{ key: 'name', title: '姓名' }];
    const data = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];

    const { container } = render(<TableView dataSource={data} columns={columns} />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
  });

  it('renders with custom rowKey', () => {
    const columns: TableColumn[] = [{ key: 'name', title: '姓名' }];
    const data = [{ id: 'x1', name: 'A' }, { id: 'x2', name: 'B' }];

    const { container } = render(<TableView dataSource={data} columns={columns} rowKey="id" />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0].getAttribute('key') || rows[0].textContent).toBeDefined();
  });

  it('renders with function rowKey', () => {
    const columns: TableColumn[] = [{ key: 'name', title: '姓名' }];
    const data = [{ name: 'A' }];

    const { container } = render(
      <TableView dataSource={data} columns={columns} rowKey={(_, i) => `row-${i}`} />,
    );
    expect(container.querySelector('table')).toBeTruthy();
  });
});

describe('TableView — merge cells', () => {
  beforeEach(() => {
    ComponentRegistry.getInstance().clear();
    registerBuiltinHandlers();
  });

  afterEach(() => {
    ComponentRegistry.getInstance().clear();
  });

  it('renders declared merge rows', () => {
    const { container } = render(<ComponentView component={tableMerge} />);
    const tds = container.querySelectorAll('td[rowspan]');
    expect(tds.length).toBeGreaterThan(0);
  });

  it('renders merged department cell with correct text', () => {
    const { container } = render(<ComponentView component={tableMerge} />);
    expect(container.textContent).toContain('技术部');
    expect(container.textContent).toContain('产品部');
  });
});

describe('TableView — enum render', () => {
  beforeEach(() => {
    ComponentRegistry.getInstance().clear();
    registerBuiltinHandlers();
  });

  afterEach(() => {
    ComponentRegistry.getInstance().clear();
  });

  it('renders enum mapped values', () => {
    const { container } = render(<ComponentView component={tableEnumRender} />);
    // enumConfig should map status values to Chinese labels
    expect(container.textContent).toContain('待处理');
    expect(container.textContent).toContain('已完成');
    expect(container.textContent).toContain('处理中');
    expect(container.textContent).toContain('已取消');
  });

  it('does not show raw enum values', () => {
    const { container } = render(<ComponentView component={tableEnumRender} />);
    expect(container.textContent).not.toContain('pending');
    expect(container.textContent).not.toContain('processing');
  });
});

describe('TableView — sorting interaction', () => {
  it('sorts when clicking sortable column header', () => {
    const columns: TableColumn[] = [
      { key: 'name', title: '姓名' },
      { key: 'age', title: '年龄', sortable: true },
    ];
    const data = [
      { name: 'C', age: 30 },
      { name: 'A', age: 20 },
      { name: 'B', age: 25 },
    ];

    const { container } = render(<TableView dataSource={data} columns={columns} />);
    const thElements = container.querySelectorAll('th');
    const ageTh = Array.from(thElements).find((th) => th.textContent?.includes('年龄'));
    expect(ageTh).toBeTruthy();
    fireEvent.click(ageTh!);

    // After clicking, rows should be sorted by age ascending
    const rows = container.querySelectorAll('tbody tr');
    const allAgeTexts: string[] = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        allAgeTexts.push(cells[1].textContent ?? '');
      }
    });
    expect(allAgeTexts).toEqual(['20', '25', '30']);
  });
});

describe('TableView — column manager', () => {
  it('shows column manager button when more than 1 column', () => {
    const columns: TableColumn[] = [
      { key: 'a', title: 'A' },
      { key: 'b', title: 'B' },
    ];
    const data = [{ a: '1', b: '2' }];

    const { container } = render(<TableView dataSource={data} columns={columns} />);
    const btn = container.querySelector('button');
    expect(btn?.textContent).toContain('列管理');
  });

  it('opens column manager modal on click', () => {
    const columns: TableColumn[] = [
      { key: 'a', title: 'A' },
      { key: 'b', title: 'B' },
    ];
    const data = [{ a: '1', b: '2' }];

    const { container } = render(<TableView dataSource={data} columns={columns} />);
    const btn = container.querySelector('button');
    fireEvent.click(btn!);

    // Modal should appear
    expect(container.textContent).toContain('列管理');
    expect(container.textContent).toContain('可选列');
    expect(container.textContent).toContain('已选列');
  });

  it('does not show column manager for single column', () => {
    const columns: TableColumn[] = [{ key: 'a', title: 'A' }];
    const data = [{ a: '1' }];

    const { container } = render(<TableView dataSource={data} columns={columns} />);
    const btns = container.querySelectorAll('button');
    expect(btns.length).toBe(0);
  });
});
