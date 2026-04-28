# CodeSpec

## 概览

- 项目：bi-engine2
- 负责人：
- 当前激活的功能：FEAT-020-组合表格与列合并
- 最后更新时间：2026-04-28T10:00:00Z

## 术语

- `Feature`：一个自包含的产品能力，存放在 `codespec/specs/<feature>/` 下
- `Story`：带有明确验收标准的用户价值切片
- `Task`：用于路由、归属和执行的工程单元
- `Validation`：对一个或多个 story 的验证结果
- `Traceability`：story、验收标准、task 与验证结果之间的映射关系
- `ACL`：角色或 task 允许读取与写入的路径范围

## 流程

- `pm -> ra -> ta -> dev -> qa`
- 共享存储，隔离角色上下文
- `pm` 负责路由与运行时状态
- 项目根目录 `AGENT.md` 负责协作约束，`codespec/` 负责规格与状态

## Feature 索引

| ID | 标题 | 状态 | 优先级 | 路径 |
|----|------|------|--------|------|
| FEAT-001 | 基于权威模型的图表渲染引擎 | done | P0 | specs/FEAT-001-基于权威模型的图表渲染引擎/ |
| FEAT-002 | Playground重构 | done | P0 | specs/FEAT-002-Playground重构/ |
| FEAT-003 | 统一组件渲染平台 | done | P0 | specs/FEAT-003-统一组件渲染平台/ |
| FEAT-004 | 图表处理器迁移 | done | P1 | specs/FEAT-004-图表处理器迁移/ |
| FEAT-005 | 新组件类型支持 | done | P1 | specs/FEAT-005-新组件类型支持/ |
| FEAT-006 | 设计态支持预留 | done | P2 | specs/FEAT-006-设计态支持预留/ |
| FEAT-007 | 新图表类型与BIEngine公共API重构 | done | P1 | specs/FEAT-007-新图表类型与BIEngine公共API重构/ |
| FEAT-009 | ECharts标准化Option构建与扩展能力 | done | P0 | specs/FEAT-009-ECharts标准化Option构建与扩展能力/ |
| FEAT-010 | 原生React表格组件 | done | P0 | specs/FEAT-010-原生React表格组件/ |
| FEAT-011 | 深色与浅色主题支持 | done | P1 | specs/FEAT-011-深色与浅色主题支持/ |
| FEAT-012 | 多系列图表支持 | done | P0 | specs/FEAT-012-多系列图表支持/ |
| FEAT-013 | axisGroup数据分组处理 | done | P0 | specs/FEAT-013-axisGroup数据分组处理/ |
| FEAT-014 | 表格交互增强 | done | P0 | specs/FEAT-014-表格交互增强/ |
| FEAT-015 | 图表切换工具栏 | done | P0 | specs/FEAT-015-图表切换工具栏/ |
| FEAT-016 | 国际化机制与多语言支持 | done | P1 | specs/FEAT-016-国际化机制与多语言支持/ |
| FEAT-017 | 文本编辑onChange与设计态切换 | done | P0 | specs/FEAT-017-文本编辑onChange与设计态切换/ |
| FEAT-019 | 模式系统重构与主题简化 | done | P0 | specs/FEAT-019-模式系统重构与主题简化/ |
| FEAT-020 | 组合表格与基础表格列合并 | done | P0 | specs/FEAT-020-组合表格与列合并/ |

## Feature 依赖关系

```
FEAT-001 (done) ──→ FEAT-002 (done)

FEAT-003 (done)
  ├──→ FEAT-004 (done)
  ├──→ FEAT-005 (done)
  ├──→ FEAT-006 (done)
  └──→ FEAT-007 (done)

FEAT-001 (done) ──→ FEAT-009 (done)

FEAT-003 (done) ──→ FEAT-010 (done)

FEAT-009 (done) ──→ FEAT-011 (done)

FEAT-003 (done) ──→ FEAT-017 (proposal)
FEAT-006 (done) ──→ FEAT-017 (proposal)
FEAT-015 (done) ──→ FEAT-017 (proposal)
```

## 状态说明

### Feature 状态

- `proposal`：正在定义问题和范围
- `stories`：正在定义用户价值切片和验收标准
- `planning`：正在准备 task 和执行边界
- `implementing`：一个或多个 task 正在执行
- `validating`：QA 正在验证结果
- `done`：feature 已验收完成
- `planned`：已识别但尚未启动
- `blocked`：feature 受依赖或决策阻塞

### 运行时状态

- `idle`：当前没有激活的 task，等待派发

## 状态流转

- `planned -> proposal` 表示启动一个新 feature
- `proposal -> stories -> planning -> implementing -> validating -> done`
- 任意活动状态都可以进入 `blocked`
- `blocked` 解除后回到阻塞前状态
- `validating -> implementing` 表示验证失败或按需返工

## ID 规则

- `Feature` 使用 `FEAT-001` 这类稳定编号
- `Story` 使用 `ST-001` 这类稳定编号
- `Task` 使用 `T-001` 这类稳定编号
- 新编号通过扫描现有产物递增生成，不复用旧编号
