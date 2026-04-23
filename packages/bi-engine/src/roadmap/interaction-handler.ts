import type {
  Interaction,
  InteractionAction,
  InteractionTarget,
} from '../schema/bi-engine-models';

// ============================================================================
// InteractionHandler -- 未来扩展契约
// ============================================================================
//
// 用途：
//   定义处理通过 `BasicComponent.interactions` 声明的组件级交互的接口。
//
// 第一阶段限制：
//   引擎不执行交互。`interactions` 字段在标准化过程中被保留，
//   但不附加任何行为。此契约存在是为了未来实现可以接入
//   渲染管道（或宿主层），而无需重新定义模型。
//
// 与权威模型的对齐：
//   - `Interaction`、`InteractionTrigger`、`InteractionTarget` 和
//     `InteractionAction` 均从权威模型导入。
//   - 不引入新的动作类型或目标类型。
// ============================================================================

/**
 * 当触发器触发时提供给交互处理器的上下文。
 *
 * 携带交互时可用的运行时数据，
 * 例如点击了哪个数据点和来源组件。
 */
export interface InteractionContext {
  /** 交互来源组件的 ID */
  sourceComponentId: string;

  /** 触发交互的动作 */
  action: InteractionAction;

  /**
   * 与交互事件关联的数据。
   *
   * 对于图表交互，通常包含用户点击或悬停的数据点。
   * 对于表格交互，可能包含行数据和 `InteractionTrigger.field` 中的字段名。
   */
  eventData: Record<string, unknown>;
}

/**
 * 将交互分派到单个目标的结果。
 *
 * 处理器可能产生副作用（如过滤另一个组件、
 * 导航到不同页面、或高亮元素），并报告分派是否成功。
 */
export interface InteractionDispatchResult {
  /** 被操作的目标组件 ID */
  targetComponentId: string;

  /** 来自 `InteractionTarget.type` 的目标类型 */
  targetType: InteractionTarget['type'];

  /** 此目标的分派是否成功 */
  success: boolean;

  /** 当 `success` 为 `false` 时的可选错误消息 */
  errorMessage?: string;
}

/**
 * 组件交互处理器。
 *
 * 预期行为（将在未来阶段实现）：
 * 1. 接收权威模型中的完整 `Interaction` 配置。
 * 2. 在渲染组件上注册匹配 `InteractionTrigger.action`
 *    （以及可选的 `InteractionTrigger.field`）的事件监听器。
 * 3. 触发时，构建 `InteractionContext` 并根据其 `type` 分派到
 *    每个 `InteractionTarget`：
 *    - `'filter'`：使用 `params` 对目标组件应用过滤。
 *    - `'jump'`：使用 `params` 导航到另一个视图或 URL。
 *    - `'highlight'`：在目标组件上高亮匹配的数据点。
 * 4. 为每个目标返回结果，以便宿主展示错误。
 *
 * 集成点：
 *   处理器预期被注入到宿主层（如 React `ChartView` 或共享交互总线），
 *   而非引擎内部。引擎仅保留 `interactions` 数组；宿主激活它们。
 */
export interface InteractionHandler {
  /**
   * 为给定组件注册交互监听器。
   *
   * 处理器应在渲染输出上设置事件委托或直接监听器，
   * 并在触发器触发时调用 `dispatch`。
   *
   * @param interactions - 组件的交互配置。
   * @param componentId - 要附加监听器的组件 ID。
   * @returns 清除所有已注册监听器的清理函数。
   */
  register(
    interactions: Interaction[],
    componentId: string,
  ): () => void;

  /**
   * 将触发的交互分派到所有已配置的目标。
   *
   * @param interaction - 触发器已触发的交互。
   * @param context - 包含事件数据的运行时上下文。
   * @returns `interaction.targets` 中每个目标的结果。
   */
  dispatch(
    interaction: Interaction,
    context: InteractionContext,
  ): Promise<InteractionDispatchResult[]>;
}
