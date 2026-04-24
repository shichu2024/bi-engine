import type { ChartDataProperty, Column } from '../../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 结果类型
// ---------------------------------------------------------------------------

/** 成功解析，携带已解析的数据记录 */
export interface ResolvedData {
  /** 区分标识：成功路径始终为 `true` */
  ok: true;
  /** 已解析的数据记录。第一阶段：静态数据数组 */
  data: Record<string, unknown>[];
}

/** 结构化的不支持结果，包含错误码和消息 */
export interface UnsupportedResult {
  /** 区分标识：不支持/错误路径始终为 `false` */
  ok: false;
  /** 机器可读的错误码 */
  code: 'UNSUPPORTED_DATASOURCE' | 'UNSUPPORTED_API' | 'STATIC_DATA_MISSING' | 'STATIC_DATA_INVALID' | 'COLUMN_FIELD_MISMATCH';
  /** 人类可读的描述 */
  message: string;
  /** 关于涉及字段的可选详细信息 */
  details?: {
    missingFields?: string[];
  };
}

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

/**
 * 收集所有叶级列键（展平嵌套的 `children` 列）。
 */
function collectColumnKeys(columns: Column[]): string[] {
  const keys: string[] = [];

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    if (col.children !== undefined && col.children.length > 0) {
      const childKeys = collectColumnKeys(col.children);
      for (let j = 0; j < childKeys.length; j++) {
        keys.push(childKeys[j]);
      }
    } else {
      keys.push(col.key);
    }
  }

  return keys;
}

/**
 * 校验每个列键是否至少在数据行中出现一次。
 * 返回在任何数据行中均不存在的列键数组。
 */
function findMissingFields(
  columns: Column[],
  data: Record<string, unknown>[],
): string[] {
  if (columns.length === 0 || data.length === 0) {
    return [];
  }

  const columnKeys = collectColumnKeys(columns);

  // 构建至少在一行数据中存在的所有键的集合。
  const presentKeys: Set<string> = new Set();
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowKeys = Object.keys(row);
    for (let j = 0; j < rowKeys.length; j++) {
      presentKeys.add(rowKeys[j]);
    }
  }

  const missing: string[] = [];
  for (let i = 0; i < columnKeys.length; i++) {
    if (!presentKeys.has(columnKeys[i])) {
      missing.push(columnKeys[i]);
    }
  }

  return missing;
}

// ---------------------------------------------------------------------------
// 主解析器
// ---------------------------------------------------------------------------

/**
 * 从 `ChartDataProperty` 解析图表数据。
 *
 * 第一阶段行为：
 * - `dataType = 'static'`：在验证 `data` 存在且为数组后返回 `data` 数组，
 *   并检查列与字段的一致性。
 * - `dataType = 'datasource'`：返回结构化的 `UnsupportedResult`。
 * - `dataType = 'api'`：返回结构化的 `UnsupportedResult`。
 *
 * @param dataProperties - 待解析的图表 `ChartDataProperty`。
 * @returns 成功时返回 `ResolvedData`，失败时返回 `UnsupportedResult`。
 */
export function resolveChartData(
  dataProperties: ChartDataProperty,
): ResolvedData | UnsupportedResult {
  const dataType = dataProperties.dataType;

  if (dataType === 'datasource') {
    return {
      ok: false,
      code: 'UNSUPPORTED_DATASOURCE',
      message: 'dataType "datasource" is not supported in phase 1. Use "static" data instead.',
    };
  }

  if (dataType === 'api') {
    return {
      ok: false,
      code: 'UNSUPPORTED_API',
      message: 'dataType "api" is not supported in phase 1. Use "static" data instead.',
    };
  }

  // dataType === 'static'
  const data = dataProperties.data;

  if (data === undefined || data === null) {
    return {
      ok: false,
      code: 'STATIC_DATA_MISSING',
      message: 'dataType is "static" but dataProperties.data is not provided.',
    };
  }

  if (!Array.isArray(data)) {
    return {
      ok: false,
      code: 'STATIC_DATA_INVALID',
      message: 'dataType is "static" but dataProperties.data is not an array.',
    };
  }

  // 当提供了列信息时，校验列与字段的一致性。
  const columns = dataProperties.columns;
  if (columns !== undefined && columns.length > 0 && data.length > 0) {
    const missingFields = findMissingFields(columns, data);
    if (missingFields.length > 0) {
      return {
        ok: false,
        code: 'COLUMN_FIELD_MISMATCH',
        message: `Columns define keys that are missing from data: ${missingFields.join(', ')}.`,
        details: {
          missingFields,
        },
      };
    }
  }

  return {
    ok: true,
    data,
  };
}
