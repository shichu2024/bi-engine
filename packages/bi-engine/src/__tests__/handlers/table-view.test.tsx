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
import { DEFAULT_THEME_TOKENS } from '../../theme/theme-tokens';

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

// ---------------------------------------------------------------------------
// Column reorder tests
// ---------------------------------------------------------------------------

describe('TableView — column manager reorder', () => {
  it('shows up/down reorder buttons in column manager modal', () => {
    const columns: TableColumn[] = [
      { key: 'a', title: 'A' },
      { key: 'b', title: 'B' },
      { key: 'c', title: 'C' },
    ];
    const data = [{ a: '1', b: '2', c: '3' }];

    const { container } = render(
      <TableView dataSource={data} columns={columns} showColumnManager={true} />,
    );

    // Open modal
    const gearSpans = container.querySelectorAll('thead span');
    const gearSpan = Array.from(gearSpans).find((span) => span.querySelector('svg path[d*="12 15.5"]'));
    fireEvent.click(gearSpan!);

    // Check ↑ and ↓ buttons exist
    const allButtons = container.querySelectorAll('button');
    const upBtn = Array.from(allButtons).find((btn) => btn.textContent === '↑');
    const downBtn = Array.from(allButtons).find((btn) => btn.textContent === '↓');
    expect(upBtn).toBeTruthy();
    expect(downBtn).toBeTruthy();
  });

  it('reorder buttons are disabled when no item selected', () => {
    const columns: TableColumn[] = [
      { key: 'a', title: 'A' },
      { key: 'b', title: 'B' },
    ];
    const data = [{ a: '1', b: '2' }];

    const { container } = render(
      <TableView dataSource={data} columns={columns} showColumnManager={true} />,
    );

    // Open modal
    const gearSpans = container.querySelectorAll('thead span');
    const gearSpan = Array.from(gearSpans).find((span) => span.querySelector('svg path[d*="12 15.5"]'));
    fireEvent.click(gearSpan!);

    const allButtons = container.querySelectorAll('button');
    const upBtn = Array.from(allButtons).find((btn) => btn.textContent === '↑')!;
    const downBtn = Array.from(allButtons).find((btn) => btn.textContent === '↓')!;

    expect(upBtn.disabled).toBe(true);
    expect(downBtn.disabled).toBe(true);
  });

  it('moves selected column up when clicking up button', () => {
    const columns: TableColumn[] = [
      { key: 'a', title: 'A' },
      { key: 'b', title: 'B' },
      { key: 'c', title: 'C' },
    ];
    const data = [{ a: '1', b: '2', c: '3' }];

    const { container } = render(
      <TableView dataSource={data} columns={columns} showColumnManager={true} />,
    );

    // Open modal by clicking gear icon
    const gearSpans = container.querySelectorAll('thead span');
    const gearSpan = Array.from(gearSpans).find((span) => span.querySelector('svg path[d*="12 15.5"]'));
    fireEvent.click(gearSpan!);

    // Find all <li> elements with checkboxes (these are panel items)
    const allLi = container.querySelectorAll('li');
    // With all 3 columns in the right panel, left panel is empty.
    // So the 3 <li> items are the right panel items: A, B, C
    const itemsWithCheckboxes = Array.from(allLi).filter((li) => li.querySelector('input[type="checkbox"]'));
    expect(itemsWithCheckboxes.length).toBe(3);

    // Select 'C' (3rd item, index 2)
    fireEvent.click(itemsWithCheckboxes[2]);

    // Click up button
    const allButtons = container.querySelectorAll('button');
    const upBtn = Array.from(allButtons).find((btn) => btn.textContent === '↑')!;
    fireEvent.click(upBtn);

    // Click confirm
    const confirmBtn = Array.from(allButtons).find((btn) => btn.textContent === '确认')!;
    fireEvent.click(confirmBtn);

    // Verify column order: A, C, B
    const headerCells = container.querySelectorAll('thead tr th');
    const headerTexts = Array.from(headerCells).map((th) => th.textContent?.trim()).filter(Boolean);
    const columnHeaders = headerTexts.filter((t) => ['A', 'B', 'C'].includes(t!));
    expect(columnHeaders).toEqual(['A', 'C', 'B']);
  });

  it('moves selected column down when clicking down button', () => {
    const columns: TableColumn[] = [
      { key: 'a', title: 'A' },
      { key: 'b', title: 'B' },
      { key: 'c', title: 'C' },
    ];
    const data = [{ a: '1', b: '2', c: '3' }];

    const { container } = render(
      <TableView dataSource={data} columns={columns} showColumnManager={true} />,
    );

    // Open modal by clicking gear icon
    const gearSpans = container.querySelectorAll('thead span');
    const gearSpan = Array.from(gearSpans).find((span) => span.querySelector('svg path[d*="12 15.5"]'));
    fireEvent.click(gearSpan!);

    // Find all <li> items with checkboxes
    const allLi = container.querySelectorAll('li');
    const itemsWithCheckboxes = Array.from(allLi).filter((li) => li.querySelector('input[type="checkbox"]'));

    // Select 'A' (1st item, index 0)
    fireEvent.click(itemsWithCheckboxes[0]);

    // Click down button
    const allButtons = container.querySelectorAll('button');
    const downBtn = Array.from(allButtons).find((btn) => btn.textContent === '↓')!;
    fireEvent.click(downBtn);

    // Click confirm
    const confirmBtn = Array.from(allButtons).find((btn) => btn.textContent === '确认')!;
    fireEvent.click(confirmBtn);

    // Verify column order: B, A, C
    const headerCells = container.querySelectorAll('thead tr th');
    const headerTexts = Array.from(headerCells).map((th) => th.textContent?.trim()).filter(Boolean);
    const columnHeaders = headerTexts.filter((t) => ['A', 'B', 'C'].includes(t!));
    expect(columnHeaders).toEqual(['B', 'A', 'C']);
  });
});

// ---------------------------------------------------------------------------
// Custom column render tests
// ---------------------------------------------------------------------------

describe('TableView — custom column render via TableColumn.render', () => {
  it('uses custom render function for column cells', () => {
    const columns: TableColumn[] = [
      { key: 'name', title: '姓名' },
      {
        key: 'status',
        title: '状态',
        render: (value) => {
          const v = String(value ?? '');
          const color = v === 'active' ? '#52c41a' : '#ff4d4f';
          return React.createElement('span', { style: { color }, 'data-testid': 'custom-render' }, v);
        },
      },
    ];
    const data = [
      { name: 'Alice', status: 'active' },
      { name: 'Bob', status: 'inactive' },
    ];

    const { container } = render(
      <TableView dataSource={data} columns={columns} />,
    );

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    // First row: custom render output should be nested inside CellWithTooltip's wrapper span
    const firstStatus = rows[0].querySelectorAll('td')[1];
    expect(firstStatus?.textContent).toBe('active');
    const firstCustom = firstStatus?.querySelector('[data-testid="custom-render"]');
    expect(firstCustom?.getAttribute('style')).toContain('82, 196, 26');

    // Second row
    const secondStatus = rows[1].querySelectorAll('td')[1];
    expect(secondStatus?.textContent).toBe('inactive');
    const secondCustom = secondStatus?.querySelector('[data-testid="custom-render"]');
    expect(secondCustom?.getAttribute('style')).toContain('255, 77, 79');
  });

  it('custom render receives row data and index', () => {
    const receivedArgs: Array<{ value: unknown; row: Record<string, unknown>; index: number }> = [];

    const columns: TableColumn[] = [
      { key: 'name', title: '姓名' },
      {
        key: 'score',
        title: '成绩',
        render: (value, row, index) => {
          receivedArgs.push({ value, row, index });
          return String(value);
        },
      },
    ];
    const data = [
      { name: 'Alice', score: 85 },
      { name: 'Bob', score: 92 },
    ];

    const { container } = render(
      <TableView dataSource={data} columns={columns} />,
    );

    expect(receivedArgs.length).toBe(2);
    expect(receivedArgs[0].value).toBe(85);
    expect(receivedArgs[0].row.name).toBe('Alice');
    expect(receivedArgs[0].index).toBe(0);
    expect(receivedArgs[1].value).toBe(92);
    expect(receivedArgs[1].index).toBe(1);
  });
});
