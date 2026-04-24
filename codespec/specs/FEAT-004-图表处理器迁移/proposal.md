# FEAT-004: 图表处理器迁移

## 状态: planned（待 FEAT-003 完成后启动）

## 问题

FEAT-003 创建了统一平台层，但图表处理器仍以骨架形式委托给 `core/` 下的原有函数。需要将图表专用代码迁移到 `component-handlers/chart/` 下，使其成为符合 ComponentHandler 接口的一等公民。

## 目标

1. 将 `core/` 下 5 个图表专用文件迁移到 `component-handlers/chart/`
2. 每个文件实现对应策略接口（validator/normalizer/resolver/modelBuilder/renderer）
3. 删除 `core/` 目录（标记为空或保留空 barrel）
4. ChartView 内部改为委托给 ComponentView
5. 所有现有测试继续通过

## 依赖

- FEAT-003（统一组件渲染平台）

## 预估规模

- 迁移文件: 5-6 个
- 新增测试: 补齐迁移后的策略级测试
- 预计 Story: 3-4 个
