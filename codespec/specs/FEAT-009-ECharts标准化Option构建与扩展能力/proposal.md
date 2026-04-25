---
id: FEAT-009
title: ECharts 标准化 Option 构建与扩展能力
type: feature
priority: P0
dependencies: [FEAT-001, FEAT-007]
---

## Problem

- 现有 ECharts 适配器各 builder 产出的 option 无统一视觉规范，tooltip/legend/grid/字体 等样式分散在各 builder 内部硬编码
- 缺乏数据溢出、标签重叠、坐标轴超限等异常场景的统一兜底处理
- 无标准化扩展接口，外部自定义配置（AI 生成、设计器、业务定制）需通过 `mergeChartOption` 浅合并，不支持深度合并和优先级控制
- 各 builder 重复构建 tooltip/legend 等基础组件，维护成本高

## Goals

- **视觉标准化**：定义全局统一基础 option 模板（字体/配色/间距/组件），所有图表继承
- **展示健壮化**：内置空数据兜底、坐标轴自适应、标签重叠处理等防御逻辑
- **配置模板化**：为 line/bar/pie/radar/scatter/candlestick/gauge 提供独立的标准化 option 模板
- **能力扩展化**：提供深度合并工具函数，支持增量合并和全量覆盖两种模式，扩展配置优先级高于基础配置
- **维护轻量化**：基础配置集中管理，视觉规范迭代仅改核心模板

## Scope

### v1 包含

1. 全局基础 option 规范（字体、配色、grid、tooltip、legend、title）
2. 7 种图表类型的标准化 option 模板（line/bar/pie/scatter/radar/candlestick/gauge）
3. 深度合并工具函数 `deepMergeOption`，支持 `merge` 和 `override` 模式
4. 异常场景兜底（空数据提示、坐标轴自适应、标签防重叠）
5. TypeScript 类型定义
6. 单元测试覆盖

### Out of Scope

- 地图图表模板（后续迭代）
- 表格联动图表模板
- AI 自动配置生成（仅预留接口）
- 可视化设计器集成（仅预留接口）
- ECharts 主题注册

## Risks

| 风险 | 类型 | 缓解措施 |
|------|------|----------|
| 深度合并逻辑复杂度 | 技术 | 使用递归实现，限制合并深度，充分测试 |
| 现有 builder 重构可能引入回归 | 技术 | 保留原有 builder 接口不变，模板作为增强层注入 |
| 配色方案可能与宿主应用冲突 | 产品 | 使用可覆盖的默认值，支持宿主传入自定义色板 |

## Open Questions

无
