// ============================================================================
// table-merge-columns.test.tsx — 列合并功能测试
// ============================================================================

/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableView } from '../../component-handlers/table/TableView';
import type { MergeColumnInfoView } from '../../component-handlers/table/types';
import { LocaleProvider } from '../../locale';

// Helper: wrap component with locale
function renderWithLocale(ui: React.ReactElement) {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
}

describe('TableView — merge columns', () => {
  const baseColumns = [
    { key: 'name', title: '姓名' },
    { key: 'province', title: '省' },
    { key: 'city', title: '市' },
    { key: 'address', title: '详细地址' },
    { key: 'phone', title: '电话' },
  ];

  const baseData = [
    { name: '张三', province: '广东省', city: '深圳市', address: '南山区', phone: '1380001' },
    { name: '李四', province: '北京市', city: '', address: '望京', phone: '1390002' },
    { name: '王五', province: '', city: '', address: '', phone: '1370003' },
  ];

  describe('isMergeValue=true (值合并)', () => {
    const mergeConfig: MergeColumnInfoView[] = [
      { title: '联系地址', columns: ['province', 'city', 'address'], isMergeValue: true },
    ];

    it('renders merged header spanning multiple columns', () => {
      const { container } = renderWithLocale(
        <TableView
          dataSource={baseData}
          columns={baseColumns}
          mergeColumns={mergeConfig}
        />,
      );

      // Should have "联系地址" in the header
      const ths = container.querySelectorAll('th');
      const headerTexts = Array.from(ths).map((th) => th.textContent);
      expect(headerTexts).toContain('联系地址');

      // "联系地址" header should span 3 columns
      const mergedTh = Array.from(ths).find((th) => th.textContent === '联系地址');
      expect(mergedTh?.getAttribute('colspan')).toBe('3');
    });

    it('renders merged cell values with line breaks', () => {
      const { container } = renderWithLocale(
        <TableView
          dataSource={baseData}
          columns={baseColumns}
          mergeColumns={mergeConfig}
        />,
      );

      // Row 1: 张三 — should have "广东省\n深圳市\n南山区"
      const rows = container.querySelectorAll('tbody tr');
      const row1Cells = rows[0].querySelectorAll('td');
      // Row 1 has: name, merged-address(3 cols), phone → 3 visible cells
      // The merged cell should contain the combined values
      const mergedCell = row1Cells[1];
      expect(mergedCell.textContent).toContain('广东省');
      expect(mergedCell.textContent).toContain('深圳市');
      expect(mergedCell.textContent).toContain('南山区');
    });

    it('skips empty values in merged cell', () => {
      const { container } = renderWithLocale(
        <TableView
          dataSource={baseData}
          columns={baseColumns}
          mergeColumns={mergeConfig}
        />,
      );

      // Row 2: 李四 — province=北京市, city='', address=望京
      const rows = container.querySelectorAll('tbody tr');
      const row2Cells = rows[1].querySelectorAll('td');
      const mergedCell = row2Cells[1];
      expect(mergedCell.textContent).toContain('北京市');
      expect(mergedCell.textContent).toContain('望京');
      // Empty city should not appear
      expect(mergedCell.textContent?.split('\n').length).toBeLessThanOrEqual(2);
    });

    it('renders empty merged cell when all values are empty', () => {
      const { container } = renderWithLocale(
        <TableView
          dataSource={baseData}
          columns={baseColumns}
          mergeColumns={mergeConfig}
        />,
      );

      // Row 3: 王五 — province='', city='', address=''
      const rows = container.querySelectorAll('tbody tr');
      const row3Cells = rows[2].querySelectorAll('td');
      const mergedCell = row3Cells[1];
      expect(mergedCell.textContent?.trim()).toBe('');
    });

    it('defaults to isMergeValue=true when not specified', () => {
      const defaultConfig: MergeColumnInfoView[] = [
        { title: '联系地址', columns: ['province', 'city', 'address'] },
      ];

      const { container } = renderWithLocale(
        <TableView
          dataSource={baseData}
          columns={baseColumns}
          mergeColumns={defaultConfig}
        />,
      );

      // Should behave like value merge — merged header
      const ths = container.querySelectorAll('th');
      const mergedTh = Array.from(ths).find((th) => th.textContent === '联系地址');
      expect(mergedTh?.getAttribute('colspan')).toBe('3');

      // Should have merged values in body
      const rows = container.querySelectorAll('tbody tr');
      const mergedCell = rows[0].querySelectorAll('td')[1];
      expect(mergedCell.textContent).toContain('广东省');
    });

    it('supports multiple merge rules without conflict', () => {
      const multiMergeColumns = [
        { key: 'a', title: 'A' },
        { key: 'b1', title: 'B1' },
        { key: 'b2', title: 'B2' },
        { key: 'c1', title: 'C1' },
        { key: 'c2', title: 'C2' },
      ];
      const multiMergeData = [
        { a: 'a1', b1: 'b1v', b2: 'b2v', c1: 'c1v', c2: 'c2v' },
      ];
      const multiConfig: MergeColumnInfoView[] = [
        { title: 'B组', columns: ['b1', 'b2'], isMergeValue: true },
        { title: 'C组', columns: ['c1', 'c2'], isMergeValue: true },
      ];

      const { container } = renderWithLocale(
        <TableView
          dataSource={multiMergeData}
          columns={multiMergeColumns}
          mergeColumns={multiConfig}
        />,
      );

      const ths = container.querySelectorAll('th');
      const headerTexts = Array.from(ths).map((th) => th.textContent);
      expect(headerTexts).toContain('B组');
      expect(headerTexts).toContain('C组');
    });
  });

  describe('isMergeValue=false (表头合并)', () => {
    const headerMergeColumns = [
      { key: 'name', title: '姓名' },
      { key: 'chinese', title: '语文' },
      { key: 'math', title: '数学' },
      { key: 'english', title: '英语' },
    ];

    const headerMergeData = [
      { name: '张三', chinese: 90, math: 85, english: 92 },
      { name: '李四', chinese: 88, math: 95, english: 85 },
    ];

    const headerMergeConfig: MergeColumnInfoView[] = [
      { title: '科目', columns: ['chinese', 'math', 'english'], isMergeValue: false },
    ];

    it('renders merged header spanning multiple columns', () => {
      const { container } = renderWithLocale(
        <TableView
          dataSource={headerMergeData}
          columns={headerMergeColumns}
          mergeColumns={headerMergeConfig}
        />,
      );

      const ths = container.querySelectorAll('th');
      const mergedTh = Array.from(ths).find((th) => th.textContent === '科目');
      expect(mergedTh?.getAttribute('colspan')).toBe('3');
    });

    it('renders individual columns in table body (not merged)', () => {
      const { container } = renderWithLocale(
        <TableView
          dataSource={headerMergeData}
          columns={headerMergeColumns}
          mergeColumns={headerMergeConfig}
        />,
      );

      // Body should have separate cells for each subject
      const rows = container.querySelectorAll('tbody tr');
      const row1Cells = rows[0].querySelectorAll('td');
      // name + 3 subjects = 4 cells
      expect(row1Cells.length).toBe(4);
      expect(row1Cells[1].textContent).toBe('90');
      expect(row1Cells[2].textContent).toBe('85');
      expect(row1Cells[3].textContent).toBe('92');
    });

    it('renders child column headers below merged header', () => {
      const { container } = renderWithLocale(
        <TableView
          dataSource={headerMergeData}
          columns={headerMergeColumns}
          mergeColumns={headerMergeConfig}
        />,
      );

      // Should have a second header row with child column names
      const allThs = container.querySelectorAll('thead th');
      const headerTexts = Array.from(allThs).map((th) => th.textContent);
      expect(headerTexts).toContain('语文');
      expect(headerTexts).toContain('数学');
      expect(headerTexts).toContain('英语');
    });
  });
});
