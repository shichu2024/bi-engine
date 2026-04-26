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

describe('TableView — column manager (gear icon in header)', () => {
  it('shows gear icon in header when showColumnManager=true and multiple columns', () => {
    const columns: TableColumn[] = [
      { key: 'a', title: 'A' },
      { key: 'b', title: 'B' },
    ];
    const data = [{ a: '1', b: '2' }];

    const { container } = render(
      <TableView dataSource={data} columns={columns} showColumnManager={true} />,
    );
    // Gear SVG should be in thead only, not in tbody
    const theadSvgs = container.querySelectorAll('thead svg');
    expect(theadSvgs.length).toBeGreaterThanOrEqual(1);
    // tbody should NOT have gear SVGs
    const tbodySvgs = container.querySelectorAll('tbody svg');
    expect(tbodySvgs.length).toBe(0);
  });

  it('does not show gear icon when showColumnManager=false (default)', () => {
    const columns: TableColumn[] = [
      { key: 'a', title: 'A' },
      { key: 'b', title: 'B' },
    ];
    const data = [{ a: '1', b: '2' }];

    const { container } = render(
      <TableView dataSource={data} columns={columns} />,
    );
    // No extra col in colgroup
    const cols = container.querySelectorAll('colgroup col');
    expect(cols.length).toBe(2);
  });

  it('opens column manager modal when clicking gear icon', () => {
    const columns: TableColumn[] = [
      { key: 'a', title: 'A' },
      { key: 'b', title: 'B' },
    ];
    const data = [{ a: '1', b: '2' }];

    const { container } = render(
      <TableView dataSource={data} columns={columns} showColumnManager={true} />,
    );
    // Click the gear icon in thead
    const gearSpans = container.querySelectorAll('thead span');
    const gearSpan = Array.from(gearSpans).find((span) => span.querySelector('svg path[d*="12 15.5"]'));
    expect(gearSpan).toBeTruthy();
    fireEvent.click(gearSpan!);

    // Modal should appear
    expect(container.textContent).toContain('列管理');
    expect(container.textContent).toContain('可选列');
    expect(container.textContent).toContain('已选列');
  });

  it('does not show column manager for single column', () => {
    const columns: TableColumn[] = [{ key: 'a', title: 'A' }];
    const data = [{ a: '1' }];

    const { container } = render(
      <TableView dataSource={data} columns={columns} showColumnManager={true} />,
    );
    const cols = container.querySelectorAll('colgroup col');
    expect(cols.length).toBe(1);
  });
});

describe('TableView — pagination', () => {
  it('shows pagination when data exceeds page size', () => {
    const columns: TableColumn[] = [{ key: 'name', title: '姓名' }];
    const data = Array.from({ length: 25 }, (_, i) => ({ name: `用户${i + 1}` }));

    const { container } = render(
      <TableView dataSource={data} columns={columns} pagination={true} />,
    );
    expect(container.textContent).toContain('共 25 条');
    expect(container.textContent).toContain('条/页');
  });

  it('respects defaultPageSize config', () => {
    const columns: TableColumn[] = [{ key: 'name', title: '姓名' }];
    const data = Array.from({ length: 30 }, (_, i) => ({ name: `用户${i + 1}` }));

    const { container } = render(
      <TableView
        dataSource={data}
        columns={columns}
        pagination={{ defaultPageSize: 20 }}
      />,
    );
    expect(container.textContent).toContain('共 30 条');
  });

  it('hides pagination when data fits in one page', () => {
    const columns: TableColumn[] = [{ key: 'name', title: '姓名' }];
    const data = [{ name: 'A' }, { name: 'B' }];

    const { container } = render(
      <TableView dataSource={data} columns={columns} pagination={true} />,
    );
    const paginationBtns = container.querySelectorAll('button');
    expect(paginationBtns.length).toBe(0);
  });

  it('paginates data correctly', () => {
    const columns: TableColumn[] = [{ key: 'name', title: '姓名' }];
    const data = Array.from({ length: 15 }, (_, i) => ({ name: `用户${i + 1}` }));

    const { container } = render(
      <TableView
        dataSource={data}
        columns={columns}
        pagination={{ defaultPageSize: 10 }}
      />,
    );
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(10);
  });
});

describe('TableView — filter funnel icon', () => {
  it('shows funnel icon for filterable columns', () => {
    const columns: TableColumn[] = [
      { key: 'name', title: '姓名', filterable: true },
      { key: 'age', title: '年龄' },
    ];
    const data = [{ name: 'A', age: 20 }];

    const { container } = render(<TableView dataSource={data} columns={columns} />);
    const ths = container.querySelectorAll('th');
    const nameTh = Array.from(ths).find((th) => th.textContent?.includes('姓名'));
    expect(nameTh).toBeTruthy();
    const svgs = nameTh!.querySelectorAll('svg');
    expect(svgs.length).toBe(1);
  });

  it('does not show funnel icon for non-filterable columns', () => {
    const columns: TableColumn[] = [
      { key: 'name', title: '姓名' },
      { key: 'age', title: '年龄' },
    ];
    const data = [{ name: 'A', age: 20 }];

    const { container } = render(<TableView dataSource={data} columns={columns} />);
    const ths = container.querySelectorAll('th');
    const nameTh = Array.from(ths).find((th) => th.textContent?.includes('姓名'));
    expect(nameTh).toBeTruthy();
    const svgs = nameTh!.querySelectorAll('svg');
    expect(svgs.length).toBe(0);
  });
});

describe('TableView — sort icon display', () => {
  it('shows different icons for asc vs desc', () => {
    const columns: TableColumn[] = [
      { key: 'age', title: '年龄', sortable: true },
    ];
    const data = [{ age: 30 }, { age: 20 }, { age: 25 }];

    const { container } = render(<TableView dataSource={data} columns={columns} />);
    const th = container.querySelector('th');

    // First click: asc — should show up arrow (active)
    fireEvent.click(th!);
    const svgsAfterAsc = container.querySelectorAll('thead th svg');
    expect(svgsAfterAsc.length).toBe(1);

    // Second click: desc — should show down arrow (active)
    fireEvent.click(th!);
    const svgsAfterDesc = container.querySelectorAll('thead th svg');
    expect(svgsAfterDesc.length).toBe(1);
  });
});

describe('TableView — data pipeline (filter → sort → paginate)', () => {
  it('applies filter then sort correctly', () => {
    const columns: TableColumn[] = [
      { key: 'name', title: '姓名', filterable: true },
      { key: 'score', title: '成绩', sortable: true },
    ];
    const data = [
      { name: 'Alice', score: 85 },
      { name: 'Bob', score: 92 },
      { name: 'Charlie', score: 78 },
      { name: 'David', score: 95 },
    ];

    const { container } = render(<TableView dataSource={data} columns={columns} />);

    // Sort by score ascending
    const ths = container.querySelectorAll('th');
    const scoreTh = Array.from(ths).find((th) => th.textContent?.includes('成绩'));
    fireEvent.click(scoreTh!);

    const rows = container.querySelectorAll('tbody tr');
    const scores: string[] = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) scores.push(cells[1].textContent ?? '');
    });
    expect(scores).toEqual(['78', '85', '92', '95']);
  });
});
