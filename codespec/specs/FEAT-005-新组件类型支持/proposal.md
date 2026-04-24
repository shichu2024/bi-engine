# FEAT-005: 新组件类型支持

## 状态: planned（待 FEAT-004 完成后启动）

## 问题

权威模型已定义 TextComponent、TableComponent、MarkdownComponent、CompositeTable，但引擎仅实现了 chart 处理器。FEAT-003 中的 table/text/markdown 骨架处理器返回 UNSUPPORTED_COMPONENT_TYPE。

## 目标

1. 实现 TableComponent 处理器（含合并单元格、多级表头）
2. 实现 TextComponent 处理器
3. 实现 MarkdownComponent 处理器（使用 markdown 渲染库）
4. CompositeTable 待评估后决定是否纳入
5. 每种组件类型包含 validate/normalize/resolve/buildModel/render 完整实现
6. 测试覆盖率 >= 80%

## 依赖

- FEAT-003（统一组件渲染平台）
- FEAT-004（图表处理器迁移，可选但推荐先完成以验证模式）

## 技术选型待定

- Markdown 渲染库选择（react-markdown / marked / 其他）
- 表格渲染方案（Ant Design Table / 自定义）

## 预估规模

- 预计 Story: 6-8 个
- 预计 Task: 20-25 个
