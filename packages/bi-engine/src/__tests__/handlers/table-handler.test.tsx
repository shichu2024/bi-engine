/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { PipelineEngine } from '../../pipeline/pipeline-engine';
import { ComponentRegistry } from '../../platform/component-registry';
import { registerBuiltinHandlers } from '../../platform/auto-registry';
import { ComponentView } from '../../react/ComponentView';
import { tableBasic } from '../../testing/fixtures/table-basic';
import { tableMultiHeader } from '../../testing/fixtures/table-multi-header';
import type { TableComponent } from '../../schema/bi-engine-models';
import type { TableSemanticModel } from '../../component-handlers/table';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEmptyTableComponent(): TableComponent {
  return {
    type: 'table',
    id: 'table-empty',
    dataProperties: {
      dataType: 'static',
      columns: [],
      data: [],
    },
  };
}

function makeTableWithoutColumns(): TableComponent {
  return {
    type: 'table',
    id: 'table-no-columns',
    dataProperties: {
      dataType: 'static',
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('table-handler', () => {
  beforeEach(() => {
    ComponentRegistry.getInstance().clear();
    registerBuiltinHandlers();
  });

  afterEach(() => {
    ComponentRegistry.getInstance().clear();
  });

  // --- Pipeline execution (basic table) -------------------------------------

  describe('pipeline execution with basic table', () => {
    it('executes successfully for a basic table component', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<TableSemanticModel>(tableBasic);

      expect(result.validation.ok).toBe(true);
      expect(result.normalization.ok).toBe(true);
      expect(result.resolution.ok).toBe(true);
      expect(result.model.ok).toBe(true);
      expect(result.hasFailure).toBe(false);
    });

    it('produces a model with correct columns and data', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<TableSemanticModel>(tableBasic);

      expect(result.model.data).toBeDefined();
      expect(result.model.data!.componentId).toBe('table-basic');
      expect(result.model.data!.columns).toHaveLength(3);
      expect(result.model.data!.data).toHaveLength(3);
    });

    it('model contains the correct column titles', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<TableSemanticModel>(tableBasic);

      const columnTitles = result.model.data!.columns.map((col) => col.title);
      expect(columnTitles).toEqual(['月份', '销售额', '同比增长']);
    });

    it('model title matches the fixture title', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<TableSemanticModel>(tableBasic);

      expect(result.model.data!.title).toBe('销售数据');
    });
  });

  // --- Pipeline execution (multi-level header) ------------------------------

  describe('pipeline execution with multi-level header table', () => {
    it('executes successfully for a multi-level header table', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<TableSemanticModel>(tableMultiHeader);

      expect(result.validation.ok).toBe(true);
      expect(result.normalization.ok).toBe(true);
      expect(result.resolution.ok).toBe(true);
      expect(result.model.ok).toBe(true);
      expect(result.hasFailure).toBe(false);
    });

    it('preserves hierarchical column structure', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<TableSemanticModel>(tableMultiHeader);

      const columns = result.model.data!.columns;
      // Two top-level groups: 基本信息, 成绩
      expect(columns).toHaveLength(2);
      expect(columns[0].title).toBe('基本信息');
      expect(columns[0].children).toBeDefined();
      expect(columns[0].children!).toHaveLength(2);
      expect(columns[1].title).toBe('成绩');
      expect(columns[1].children).toBeDefined();
      expect(columns[1].children!).toHaveLength(3);
    });

    it('model data contains the expected rows', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<TableSemanticModel>(tableMultiHeader);

      expect(result.model.data!.data).toHaveLength(2);
    });
  });

  // --- Empty / edge cases ---------------------------------------------------

  describe('edge cases', () => {
    it('renders without crash for an empty table (no columns, no data)', () => {
      const emptyTable = makeEmptyTableComponent();
      const { container } = render(
        <ComponentView component={emptyTable} />,
      );

      // Empty table shows the "No columns defined." fallback
      expect(container.textContent).toContain('No columns defined.');
    });

    it('table without columns property defaults to empty columns', () => {
      const noColumns = makeTableWithoutColumns();
      const engine = new PipelineEngine();
      const result = engine.execute<TableSemanticModel>(noColumns);

      // Pipeline succeeds; normalizer defaults columns to []
      expect(result.validation.ok).toBe(true);
      expect(result.normalization.ok).toBe(true);
      expect(result.model.ok).toBe(true);
      expect(result.model.data!.columns).toHaveLength(0);
    });
  });

  // --- Renderer output (basic table) ----------------------------------------

  describe('renderer output for basic table', () => {
    it('renders a grid with header cells', () => {
      const { container } = render(
        <ComponentView component={tableBasic} />,
      );

      // Header cells should contain column titles
      expect(container.textContent).toContain('月份');
      expect(container.textContent).toContain('销售额');
      expect(container.textContent).toContain('同比增长');
    });

    it('renders data cells with row values', () => {
      const { container } = render(
        <ComponentView component={tableBasic} />,
      );

      // Check first row values
      expect(container.textContent).toContain('1月');
      expect(container.textContent).toContain('1200');
      expect(container.textContent).toContain('12%');
      // Check second row
      expect(container.textContent).toContain('2月');
      expect(container.textContent).toContain('1500');
      expect(container.textContent).toContain('25%');
    });

    it('renders the title when present', () => {
      const { container } = render(
        <ComponentView component={tableBasic} />,
      );

      expect(container.textContent).toContain('销售数据');
    });

    it('uses CSS grid layout', () => {
      const { container } = render(
        <ComponentView component={tableBasic} />,
      );

      const gridEl = container.querySelector('div[style*="grid"]');
      expect(gridEl).not.toBeNull();
    });
  });

  // --- Renderer output (multi-level header) ---------------------------------

  describe('renderer output for multi-level header table', () => {
    it('renders group headers and leaf headers', () => {
      const { container } = render(
        <ComponentView component={tableMultiHeader} />,
      );

      // Group headers
      expect(container.textContent).toContain('基本信息');
      expect(container.textContent).toContain('成绩');
      // Leaf headers under groups
      expect(container.textContent).toContain('姓名');
      expect(container.textContent).toContain('语文');
      expect(container.textContent).toContain('数学');
      expect(container.textContent).toContain('英语');
    });

    it('renders data rows for multi-level header table', () => {
      const { container } = render(
        <ComponentView component={tableMultiHeader} />,
      );

      expect(container.textContent).toContain('张三');
      expect(container.textContent).toContain('李四');
      expect(container.textContent).toContain('90');
      expect(container.textContent).toContain('95');
    });
  });
});
