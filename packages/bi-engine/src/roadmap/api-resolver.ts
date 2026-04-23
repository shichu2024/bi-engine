import type { Column } from '../schema/bi-engine-models';

// ============================================================================
// ApiResolver -- 未来扩展契约
// ============================================================================
//
// 用途：
//   定义当 `ChartDataProperty.dataType === 'api'` 时解析图表数据的接口。
//
// 第一阶段限制：
//   引擎仅支持 `dataType: 'static'`。当组件指定 `dataType: 'api'` 时，
//   校验器和数据解析器均返回 `UNSUPPORTED_API` 错误。此契约存在是为了
//   未来实现可以在不改变渲染管道的情况下插入。
//
// 与权威模型的对齐：
//   - `url` 和 `method` 来自 `DataProperty.url` 和 `DataProperty.method`。
//   - `autoRefresh` 和 `refreshInterval` 来自 `DataProperty`。
//   - `columns` 来自 `ChartDataProperty.columns`。
// ============================================================================

/** API 解析器接受的 HTTP 方法，映射 `DataProperty.method` */
export type ApiRequestMethod = 'GET' | 'POST';

/** 当 `dataType === 'api'` 时从 `ChartDataProperty` 提取的参数 */
export interface ApiResolveParams {
  /** 获取数据的 URL。映射到 `DataProperty.url` */
  url: string;

  /** HTTP 方法。映射到 `DataProperty.method`。默认为 `'GET'` */
  method?: ApiRequestMethod;

  /**
   * 宿主是否应以固定间隔自动重新获取数据。
   * 映射到 `DataProperty.autoRefresh`。
   *
   * 解析器本身是无状态的，不管理定时器。宿主
   * （如 React `ChartView`）预期读取此标志并设置
   * 一个刷新循环来反复调用 `resolve()`。
   */
  autoRefresh?: boolean;

  /**
   * 自动刷新之间的间隔（毫秒）。
   * 仅在 `autoRefresh` 为 `true` 时有意义。
   * 映射到 `DataProperty.refreshInterval`。
   */
  refreshInterval?: number;

  /**
   * 可选的列元数据。
   * 未来实现可以使用此信息来验证返回的数据结构，
   * 或提供格式化提示，就像当前静态路径所做的那样。
   */
  columns?: Column[];
}

/**
 * `dataType: 'api'` 的解析器。
 *
 * 预期行为（将在未来阶段实现）：
 * 1. 接收 URL、方法和可选的刷新配置。
 * 2. 执行 HTTP 请求（带有适当的错误处理、超时，
 *    以及可能的认证头注入）。
 * 3. 将响应体解析为 JSON，并返回为记录数组，
 *    其键与列定义匹配。
 * 4. 失败时（网络错误、非 2xx 状态、无效响应体），
 *    抛出结构化错误（如带有
 *    `ChartRenderErrorCategory.DATA` 的 `ChartRenderError`），
 *    以便渲染管道可以展示错误状态。
 *
 * 刷新生命周期：
 *   解析器执行单次获取。宿主负责读取 `autoRefresh` / `refreshInterval`
 *   并在定时器上调用 `resolve()`。这种分离使解析器保持无状态且可测试。
 */
export interface ApiResolver {
  /**
   * 从远程 API 端点解析数据记录。
   *
   * @param params - API 端点配置和可选的列元数据。
   * @returns 记录数组，其中每个键对应一个列键。
   * @throws {ChartRenderError} 当请求失败、响应不是
   *   有效 JSON、或数据结构与期望的列不匹配时。
   */
  resolve(params: ApiResolveParams): Promise<Record<string, unknown>[]>;
}
