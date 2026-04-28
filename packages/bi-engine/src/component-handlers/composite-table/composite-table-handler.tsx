// ============================================================================
// component-handlers/composite-table/composite-table-handler.tsx — 组合表格处理器
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
  CompositeTable,
  Column,
  MergeColumnInfo,
} from '../../schema/bi-engine-models';
import { CompositeTableView } from './CompositeTableView';
import type { SubTableConfig, CompositeTableViewProps } from './CompositeTableView';
import type { TableColumn } from '../table/types';

// ---------------------------------------------------------------------------
// 语义模型
// ---------------------------------------------------------------------------

export interface CompositeTableSemanticModel {
  componentId: string;
  title: string | undefined;
  tables: SubTableConfig[];
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

const compositeTableValidator: ComponentValidator<CompositeTable> = {
  validate(component: CompositeTable): PipelineResult<ValidationOutput> {
    if (component.type !== 'compositeTable') {
      return {
        ok: false,
        error: { code: 'INVALID_COMPONENT_TYPE', message: 'Expected type "compositeTable".', stage: 'validation' },
      };
    }
    if (!component.tables || component.tables.length === 0) {
      return {
        ok: false,
        error: { code: 'MISSING_TABLES', message: 'compositeTable must have at least one sub-table.', stage: 'validation' },
      };
    }
    return { ok: true, data: { warnings: [] } };
  },
};

// ---------------------------------------------------------------------------
// Normalizer
// ---------------------------------------------------------------------------

const compositeTableNormalizer: ComponentNormalizer<CompositeTable> = {
  normalize(component: CompositeTable): PipelineResult<NormalizedComponent> {
    const dp = component.dataProperties;
    return {
      ok: true,
      data: {
        id: component.id,
        type: 'compositeTable',
        properties: {
          title: dp?.title,
          tables: component.tables,
        },
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

const compositeTableResolver: ComponentResolver<CompositeTable> = {
  resolve(component: CompositeTable): PipelineResult<ResolvedData> {
    return {
      ok: true,
      data: {
        dataType: 'static',
        data: component.tables,
      },
    };
  },
};

// ---------------------------------------------------------------------------
// DSL-to-Props: Column conversion (reuses table's dslToTableColumns logic)
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

    if (col.children && col.children.length > 0) {
      tc.children = dslToTableColumns(col.children);
    }

    return tc;
  });
}

function convertMergeColumns(mergeColumns?: MergeColumnInfo[]): MergeColumnInfoView[] | undefined {
  if (!mergeColumns || mergeColumns.length === 0) return undefined;
  return mergeColumns.map((mc) => ({
    title: mc.title,
    columns: mc.columns,
    isMergeValue: mc.isMergeValue,
  }));
}

// ---------------------------------------------------------------------------
// ModelBuilder
// ---------------------------------------------------------------------------

const compositeTableModelBuilder: ComponentModelBuilder<CompositeTable, CompositeTableSemanticModel> = {
  build(
    normalized: NormalizedComponent,
    _resolved: ResolvedData,
  ): PipelineResult<CompositeTableSemanticModel> {
    const tables = (normalized.properties.tables as CompositeTable['tables']) ?? [];

    const subTables: SubTableConfig[] = tables.map((t) => ({
      title: t.dataProperties?.title,
      columns: dslToTableColumns(t.dataProperties?.columns ?? []),
      data: t.dataProperties?.data ?? [],
      mergeColumns: convertMergeColumns(t.dataProperties?.mergeColumns),
    }));

    return {
      ok: true,
      data: {
        componentId: normalized.id,
        title: normalized.properties.title as string | undefined,
        tables: subTables,
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

const compositeTableRenderer: ComponentRenderer<CompositeTable, CompositeTableSemanticModel> = {
  render(model: CompositeTableSemanticModel, context: RenderContext): React.ReactNode {
    return (
      <CompositeTableView
        title={context.hideTitle ? undefined : model.title}
        tables={model.tables}
        theme={context.theme}
        className={context.className}
        style={context.style}
      />
    );
  },
};

// ---------------------------------------------------------------------------
// 导出
// ---------------------------------------------------------------------------

export const compositeTableHandler: ComponentHandler<CompositeTable, CompositeTableSemanticModel> = {
  type: 'compositeTable',
  validator: compositeTableValidator,
  normalizer: compositeTableNormalizer,
  resolver: compositeTableResolver,
  modelBuilder: compositeTableModelBuilder,
  renderer: compositeTableRenderer,
};
