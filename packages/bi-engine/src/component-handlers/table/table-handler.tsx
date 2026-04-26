// ============================================================================
// component-handlers/table/table-handler.tsx — 表格组件处理器
// ============================================================================

import type {
  ComponentHandler,
  ComponentValidator,
  ComponentNormalizer,
  ComponentResolver,
  ComponentModelBuilder,
  ComponentRenderer,
  PipelineResult,
  ValidationOutput,
  NormalizedComponent,
  ResolvedData,
  RenderContext,
} from '../../platform/types';
import type {
  TableComponent,
  Column,
  MergeRowConfig,
} from '../../schema/bi-engine-models';
import { TableView } from './TableView';
import type { TableColumn } from './types';

// ---------------------------------------------------------------------------
// 语义模型
// ---------------------------------------------------------------------------

export interface TableSemanticModel {
  componentId: string;
  title: string | undefined;
  columns: Column[];
  data: Record<string, unknown>[];
  mergeRows: MergeRowConfig[];
  hasMerge: boolean;
  showColumnManager?: boolean;
  pagination?: boolean;
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

const tableValidator: ComponentValidator<TableComponent> = {
  validate(component: TableComponent): PipelineResult<ValidationOutput> {
    if (component.type !== 'table') {
      return {
        ok: false,
        error: { code: 'INVALID_COMPONENT_TYPE', message: 'Expected type "table".', stage: 'validation' },
      };
    }
    return { ok: true, data: { warnings: [] } };
  },
};

// ---------------------------------------------------------------------------
// Normalizer
// ---------------------------------------------------------------------------

const tableNormalizer: ComponentNormalizer<TableComponent> = {
  normalize(component: TableComponent): PipelineResult<NormalizedComponent> {
    const dp = component.dataProperties;
    return {
      ok: true,
      data: {
        id: component.id,
        type: 'table',
        properties: {
          title: dp.title,
          columns: dp.columns ?? [],
          data: dp.data ?? [],
          mergeRows: dp.mergeRows ?? [],
          hasMerge: dp.hasMerge ?? false,
        },
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

const tableResolver: ComponentResolver<TableComponent> = {
  resolve(component: TableComponent): PipelineResult<ResolvedData> {
    const dp = component.dataProperties;
    return {
      ok: true,
      data: {
        dataType: 'static',
        data: dp.data ?? [],
      },
    };
  },
};

// ---------------------------------------------------------------------------
// ModelBuilder
// ---------------------------------------------------------------------------

const tableModelBuilder: ComponentModelBuilder<TableComponent, TableSemanticModel> = {
  build(
    normalized: NormalizedComponent,
    _resolved: ResolvedData,
    component: TableComponent,
  ): PipelineResult<TableSemanticModel> {
    return {
      ok: true,
      data: {
        componentId: normalized.id,
        title: normalized.properties.title as string | undefined,
        columns: (normalized.properties.columns as Column[]) ?? [],
        data: (normalized.properties.data as Record<string, unknown>[]) ?? [],
        mergeRows: (normalized.properties.mergeRows as MergeRowConfig[]) ?? [],
        hasMerge: (normalized.properties.hasMerge as boolean) ?? false,
        showColumnManager: component.basicProperties?.showColumnManager as boolean | undefined,
        pagination: component.basicProperties?.pagination as boolean | undefined,
      },
    };
  },
};

// ---------------------------------------------------------------------------
// DSL-to-Props 转换 — Column.sortable / Column.filterable / Column.width
// ---------------------------------------------------------------------------

function dslToTableColumns(columns: Column[]): TableColumn[] {
  return columns.map((col) => {
    const tc: TableColumn = {
      key: col.key,
      title: col.title,
      width: col.width,
      sortable: col.sortable,
      filterable: col.filterable,
    };

    // Enum config mapping — auto-render enum values
    if (col.enumConfig && col.enumConfig.length > 0) {
      const enumMap = new Map<string, string>();
      for (const ev of col.enumConfig) {
        enumMap.set(ev.value, ev.title);
      }
      tc.render = (value: unknown) => {
        const strVal = String(value ?? '');
        return enumMap.get(strVal) ?? strVal;
      };
    }

    // Multi-level header
    if (col.children && col.children.length > 0) {
      tc.children = dslToTableColumns(col.children);
    }

    return tc;
  });
}

// ---------------------------------------------------------------------------
// Renderer — 使用 TableView 组件
// ---------------------------------------------------------------------------

const tableRenderer: ComponentRenderer<TableComponent, TableSemanticModel> = {
  render(model: TableSemanticModel, context: RenderContext): React.ReactNode {
    const { columns, data, mergeRows } = model;

    if (columns.length === 0) {
      return <div className={context.className} style={context.style}>No columns defined.</div>;
    }

    const tableColumns = dslToTableColumns(columns);

    return (
      <TableView
        dataSource={data}
        columns={tableColumns}
        title={model.title}
        className={context.className}
        style={context.style}
        theme={context.theme}
        showColumnManager={model.showColumnManager}
        pagination={model.pagination}
        declaredMerges={mergeRows.map((m) => ({
          startRowIndex: m.startRowIndex,
          rowSpan: m.rowSpan,
          columnKey: m.columnKey,
        }))}
      />
    );
  },
};

// ---------------------------------------------------------------------------
// 导出
// ---------------------------------------------------------------------------

export const tableHandler: ComponentHandler<TableComponent, TableSemanticModel> = {
  type: 'table',
  validator: tableValidator,
  normalizer: tableNormalizer,
  resolver: tableResolver,
  modelBuilder: tableModelBuilder,
  renderer: tableRenderer,
};
