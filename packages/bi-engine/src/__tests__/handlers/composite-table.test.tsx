// ============================================================================
// composite-table.test.tsx — 组合表格组件测试
// ============================================================================

/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompositeTableView } from '../../component-handlers/composite-table/CompositeTableView';
import { CompositeTable } from '../../schema/bi-engine-models';
import { compositeTableHandler } from '../../component-handlers/composite-table';
import { LocaleProvider } from '../../locale';
import { compositeTableBasic } from '../../testing/fixtures/composite-table-basic';
import { DEFAULT_THEME_TOKENS } from '../../theme/theme-tokens';

// Helper: wrap component with locale
function renderWithLocale(ui: React.ReactElement) {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
}

describe('CompositeTableView', () => {
  const subTables = [
    {
      title: '销售部',
      columns: [
        { key: 'name', title: '姓名' },
        { key: 'performance', title: '业绩(万)' },
      ],
      data: [
        { name: '张伟', performance: 520 },
        { name: '李娜', performance: 380 },
      ],
    },
    {
      title: '技术部',
      columns: [
        { key: 'name', title: '姓名' },
        { key: 'projects', title: '项目数' },
      ],
      data: [
        { name: '赵敏', projects: 8 },
      ],
    },
  ];

  it('renders main title', () => {
    const { container } = renderWithLocale(
      <CompositeTableView
        title="2024年度汇总"
        tables={subTables}
      />,
    );

    expect(container.textContent).toContain('2024年度汇总');
  });

  it('renders sub-table titles with gray background', () => {
    const { container } = renderWithLocale(
      <CompositeTableView
        title="汇总"
        tables={subTables}
      />,
    );

    expect(container.textContent).toContain('销售部');
    expect(container.textContent).toContain('技术部');

    // Check sub-table title elements exist
    const titleElements = container.querySelectorAll('div[style*="text-align: center"]');
    expect(titleElements.length).toBeGreaterThanOrEqual(2);
  });

  it('renders all sub-table data', () => {
    const { container } = renderWithLocale(
      <CompositeTableView
        title="汇总"
        tables={subTables}
      />,
    );

    expect(container.textContent).toContain('张伟');
    expect(container.textContent).toContain('520');
    expect(container.textContent).toContain('李娜');
    expect(container.textContent).toContain('380');
    expect(container.textContent).toContain('赵敏');
    expect(container.textContent).toContain('8');
  });

  it('renders multiple tables without sort/filter/pagination controls', () => {
    const { container } = renderWithLocale(
      <CompositeTableView
        title="汇总"
        tables={subTables}
      />,
    );

    // No pagination
    const paginationElements = container.querySelectorAll('select');
    expect(paginationElements.length).toBe(0);

    // No filter dropdowns
    const inputs = container.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBe(0);

    // No column manager gear icon (no modal)
    const modals = container.querySelectorAll('div[style*="position: fixed"]');
    expect(modals.length).toBe(0);
  });

  it('supports mergeColumns in sub-tables', () => {
    const mergedSubTables = [
      {
        title: '人员表',
        columns: [
          { key: 'name', title: '姓名' },
          { key: 'province', title: '省' },
          { key: 'city', title: '市' },
        ],
        data: [
          { name: '张三', province: '广东省', city: '深圳市' },
        ],
        mergeColumns: [
          { title: '地区', columns: ['province', 'city'], isMergeValue: true },
        ],
      },
    ];

    const { container } = renderWithLocale(
      <CompositeTableView
        title="合并测试"
        tables={mergedSubTables}
      />,
    );

    // Should have merged header
    const ths = container.querySelectorAll('th');
    const headerTexts = Array.from(ths).map((th) => th.textContent);
    expect(headerTexts).toContain('地区');
  });
});

describe('composite-table-handler', () => {
  it('validates compositeTable type', () => {
    const result = compositeTableHandler.validator.validate(compositeTableBasic);
    expect(result.ok).toBe(true);
  });

  it('rejects invalid type', () => {
    const invalid = { type: 'chart', id: 'test', tables: [] } as unknown as CompositeTable;
    const result = compositeTableHandler.validator.validate(invalid);
    expect(result.ok).toBe(false);
  });

  it('rejects empty tables', () => {
    const empty = { type: 'compositeTable', id: 'test', tables: [] } as CompositeTable;
    const result = compositeTableHandler.validator.validate(empty);
    expect(result.ok).toBe(false);
  });

  it('normalizes compositeTable component', () => {
    const result = compositeTableHandler.normalizer.normalize(compositeTableBasic);
    expect(result.ok).toBe(true);
    expect(result.data?.type).toBe('compositeTable');
    expect(result.data?.properties.title).toBe('2024年度部门绩效汇总');
  });

  it('resolves data as static', () => {
    const result = compositeTableHandler.resolver.resolve(compositeTableBasic);
    expect(result.ok).toBe(true);
    expect(result.data?.dataType).toBe('static');
  });

  it('builds semantic model with sub-tables', () => {
    const normalized = compositeTableHandler.normalizer.normalize(compositeTableBasic);
    const resolved = compositeTableHandler.resolver.resolve(compositeTableBasic);
    const model = compositeTableHandler.modelBuilder.build(
      normalized.data!,
      resolved.data!,
      compositeTableBasic,
    );
    expect(model.ok).toBe(true);
    expect(model.data?.title).toBe('2024年度部门绩效汇总');
    expect(model.data?.tables.length).toBe(2);
    expect(model.data?.tables[0].title).toBe('销售部');
    expect(model.data?.tables[1].title).toBe('技术部');
  });

  it('renders through the pipeline', () => {
    const normalized = compositeTableHandler.normalizer.normalize(compositeTableBasic);
    const resolved = compositeTableHandler.resolver.resolve(compositeTableBasic);
    const model = compositeTableHandler.modelBuilder.build(
      normalized.data!,
      resolved.data!,
      compositeTableBasic,
    );

    const { container } = renderWithLocale(
      <>{compositeTableHandler.renderer.render(model.data!, {
        mode: 'view' as never,
        theme: DEFAULT_THEME_TOKENS,
        componentId: 'test',
      })}</>,
    );

    expect(container.textContent).toContain('2024年度部门绩效汇总');
    expect(container.textContent).toContain('销售部');
    expect(container.textContent).toContain('技术部');
  });
});
