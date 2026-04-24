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
    _component: TableComponent,
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
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Renderer — CSS Grid 自绘表格
// ---------------------------------------------------------------------------

const tableRenderer: ComponentRenderer<TableComponent, TableSemanticModel> = {
  render(model: TableSemanticModel, context: RenderContext): React.ReactNode {
    const { columns, data } = model;
    if (columns.length === 0) {
      return <div className={context.className} style={context.style}>No columns defined.</div>;
    }

    const leafColumns = collectLeafColumns(columns);
    const colCount = leafColumns.length;
    const mergeMap = buildMergeMap(model.mergeRows);

    return (
      <div className={context.className} style={{ width: '100%', overflowX: 'auto', ...context.style }}>
        {model.title !== undefined && (
          <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{model.title}</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, minmax(80px, 1fr))`, border: '1px solid #e8e8e8', borderRadius: 4 }}>
          {/* Multi-level header rows */}
          {renderHeaderRows(columns, colCount)}
          {/* Data rows */}
          {data.map((row, rowIdx) =>
            leafColumns.map((col, colIdx) => {
              const merge = mergeMap[`${rowIdx}:${col.key}`];
              if (merge !== undefined && merge.hidden) return null;
              return (
                <div
                  key={`${rowIdx}-${col.key}`}
                  style={{
                    padding: '8px 12px',
                    borderTop: '1px solid #e8e8e8',
                    borderLeft: colIdx > 0 ? '1px solid #f0f0f0' : undefined,
                    fontSize: 14,
                    ...(merge !== undefined ? {
                      gridRow: `span ${merge.rowSpan}`,
                    } : {}),
                  }}
                >
                  {formatCellValue(row[col.key], col)}
                </div>
              );
            }),
          )}
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

interface LeafColumn {
  key: string;
  title: string;
  type?: string;
}

function collectLeafColumns(columns: Column[]): LeafColumn[] {
  const result: LeafColumn[] = [];
  for (const col of columns) {
    if (col.children !== undefined && col.children.length > 0) {
      const childLeaves = collectLeafColumns(col.children);
      result.push(...childLeaves);
    } else {
      result.push({ key: col.key, title: col.title, type: col.type });
    }
  }
  return result;
}

interface MergeInfo {
  rowSpan: number;
  hidden: boolean;
}

function buildMergeMap(mergeRows: MergeRowConfig[]): Record<string, MergeInfo> {
  const map: Record<string, MergeInfo> = {};
  for (const merge of mergeRows) {
    map[`${merge.startRowIndex}:${merge.columnKey}`] = { rowSpan: merge.rowSpan, hidden: false };
    for (let i = 1; i < merge.rowSpan; i++) {
      map[`${merge.startRowIndex + i}:${merge.columnKey}`] = { rowSpan: 1, hidden: true };
    }
  }
  return map;
}

function formatCellValue(value: unknown, col: LeafColumn): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  return String(value);
}

function renderHeaderRows(columns: Column[], totalLeafCount: number): React.ReactNode[] {
  const maxDepth = getMaxDepth(columns);
  const rows: React.ReactNode[] = [];

  for (let level = 0; level < maxDepth; level++) {
    const cells: React.ReactNode[] = [];
    fillHeaderRow(columns, level, 0, cells, totalLeafCount);
    rows.push(...cells);
  }

  return rows;
}

function fillHeaderRow(
  columns: Column[],
  targetLevel: number,
  currentLevel: number,
  cells: React.ReactNode[],
  totalLeafCount: number,
): number {
  let leafCount = 0;
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const hasChildren = col.children !== undefined && col.children.length > 0;

    if (currentLevel === targetLevel) {
      const span = hasChildren ? countLeaves(col) : 1;
      const depth = hasChildren ? 1 : (getMaxDepth(columns) - currentLevel);
      cells.push(
        <div
          key={`header-${cells.length}`}
          style={{
            padding: '8px 12px',
            fontWeight: 'bold',
            backgroundColor: '#fafafa',
            borderBottom: '1px solid #e8e8e8',
            borderLeft: cells.length > 0 ? '1px solid #f0f0f0' : undefined,
            gridColumn: `span ${span}`,
            ...(currentLevel === 0 && !hasChildren ? { gridRow: `span ${depth}` } : {}),
            fontSize: 13,
          }}
        >
          {col.title}
        </div>,
      );
      leafCount += span;
    } else if (hasChildren) {
      leafCount += fillHeaderRow(col.children!, targetLevel, currentLevel + 1, cells, totalLeafCount);
    } else if (currentLevel < targetLevel) {
      // This column doesn't go deeper, it's already been rendered at a higher level
      leafCount += 1;
    }
  }
  return leafCount;
}

function countLeaves(col: Column): number {
  if (col.children === undefined || col.children.length === 0) return 1;
  let count = 0;
  for (const child of col.children) {
    count += countLeaves(child);
  }
  return count;
}

function getMaxDepth(columns: Column[]): number {
  let max = 1;
  for (const col of columns) {
    if (col.children !== undefined && col.children.length > 0) {
      const childDepth = getMaxDepth(col.children);
      if (childDepth + 1 > max) max = childDepth + 1;
    }
  }
  return max;
}

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
