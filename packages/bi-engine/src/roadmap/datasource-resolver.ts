import type { Column } from '../schema/bi-engine-models';

// ============================================================================
// DatasourceResolver -- 未来扩展契约
// ============================================================================
//
// 用途：
//   定义当 `ChartDataProperty.dataType === 'datasource'` 时解析图表数据的接口。
//
// 第一阶段限制：
//   引擎仅支持 `dataType: 'static'`。当组件指定 `dataType: 'datasource'` 时，
//   校验器和数据解析器均返回 `UNSUPPORTED_DATASOURCE` 错误。此契约存在是为了
//   未来实现可以在不改变渲染管道的情况下插入。
//
// 与权威模型的对齐：
//   - `sourceId` 来自 `DataProperty.sourceId`。
//   - `columns` 来自 `ChartDataProperty.columns`。
//   - 返回形状映射数据解析层的 `ResolvedData.data`。
// ============================================================================

/** 当 `dataType === 'datasource'` 时从 `ChartDataProperty` 提取的参数 */
export interface DatasourceResolveParams {
  /** 引用已配置的数据源。映射到 `DataProperty.sourceId` */
  sourceId: string;

  /**
   * 可选的列元数据。
   * 未来实现可以使用此信息来验证返回的数据结构，
   * 或提供格式化提示，就像当前静态路径所做的那样。
   */
  columns?: Column[];
}

/**
 * `dataType: 'datasource'` 的解析器。
 *
 * 预期行为（将在未来阶段实现）：
 * 1. 接收 `sourceId` 并从注册表或外部配置存储查找对应的数据源配置。
 * 2. 执行该数据源定义的查询（SQL、API 调用或其他机制）。
 * 3. 将结果作为普通记录数组返回，其键与列定义匹配。
 * 4. 失败时抛出结构化错误（如带有
 *    `ChartRenderErrorCategory.DATA` 的 `ChartRenderError`），
 *    以便渲染管道可以展示错误状态。
 */
export interface DatasourceResolver {
  /**
   * 从命名数据源解析数据记录。
   *
   * @param params - 数据源引用和可选的列元数据。
   * @returns 记录数组，其中每个键对应一个列键。
   * @throws {ChartRenderError} 当数据源无法找到、查询失败，
   *   或返回的数据与期望的列不匹配时。
   */
  resolve(params: DatasourceResolveParams): Promise<Record<string, unknown>[]>;
}
