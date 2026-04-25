---
# Task Index
---

| ID | Story | Title | Status | Dependencies | Owner |
|----|-------|-------|--------|-------------|-------|
| T-001 | ST-001 | 创建全局标准化基础 Option 模板 | todo | | dev |
| T-002 | ST-002 | 创建分图表类型标准化 Option 模板 | todo | T-001 | dev |
| T-003 | ST-003 | 创建深度合并工具与扩展接口 | todo | T-001 | dev |
| T-004 | ST-004 | 实现异常场景兜底逻辑 | todo | T-001, T-002 | dev |
| T-005 | ST-005 | 集成到现有构建流程与编写测试 | todo | T-002, T-003, T-004 | dev |

---

---
id: T-001
story_id: ST-001
title: 创建全局标准化基础 Option 模板
owner_role: dev
status: todo
dependencies: []
---

## Read paths

- `packages/bi-engine/src/adapters/echarts/*.ts`

## Write paths

- `packages/bi-engine/src/adapters/echarts/option-templates/base-option.ts`
- `packages/bi-engine/src/adapters/echarts/option-templates/index.ts`

## Verify

```bash
cd packages/bi-engine && npx vitest run --reporter=verbose
```

## Goal

1. 创建 `base-option.ts`，定义全局统一的字体、配色、间距、tooltip、legend、grid、title 标准化配置
2. 导出 `getBaseOption()` 函数返回标准化基础 option 对象
3. 所有配置项集中管理，注释清晰

## Deliverables

- `base-option.ts`：含 getBaseOption() 及所有标准化配置常量
- `index.ts`：barrel export

---

---
id: T-002
story_id: ST-002
title: 创建分图表类型标准化 Option 模板
owner_role: dev
status: todo
dependencies: [T-001]
---

## Read paths

- `packages/bi-engine/src/adapters/echarts/build-*-option.ts`
- `packages/bi-engine/src/adapters/echarts/option-templates/base-option.ts`

## Write paths

- `packages/bi-engine/src/adapters/echarts/option-templates/line-option-template.ts`
- `packages/bi-engine/src/adapters/echarts/option-templates/bar-option-template.ts`
- `packages/bi-engine/src/adapters/echarts/option-templates/pie-option-template.ts`
- `packages/bi-engine/src/adapters/echarts/option-templates/radar-option-template.ts`
- `packages/bi-engine/src/adapters/echarts/option-templates/scatter-option-template.ts`
- `packages/bi-engine/src/adapters/echarts/option-templates/candlestick-option-template.ts`
- `packages/bi-engine/src/adapters/echarts/option-templates/gauge-option-template.ts`
- `packages/bi-engine/src/adapters/echarts/option-templates/index.ts`

## Verify

```bash
cd packages/bi-engine && npx vitest run --reporter=verbose
```

## Goal

1. 为 7 种图表类型各创建一个模板文件
2. 每个模板导出 `getXxxOptionTemplate()` 函数
3. 模板继承全局基础配置并补充图表特有配置

## Deliverables

- 7 个图表类型模板文件
- 更新 `index.ts` barrel export

---

---
id: T-003
story_id: ST-003
title: 创建深度合并工具与扩展接口
owner_role: dev
status: todo
dependencies: [T-001]
---

## Read paths

- `packages/bi-engine/src/adapters/echarts/merge-chart-option.ts`
- `packages/bi-engine/src/adapters/echarts/option-templates/base-option.ts`

## Write paths

- `packages/bi-engine/src/adapters/echarts/option-merge.ts`
- `packages/bi-engine/src/adapters/echarts/merge-chart-option.ts`

## Verify

```bash
cd packages/bi-engine && npx vitest run --reporter=verbose
```

## Goal

1. 创建 `deepMergeOption()` 函数，支持递归深度合并
2. 数组类型直接替换
3. 支持 `'merge'` 和 `'override'` 两种模式
4. TypeScript 类型完整

## Deliverables

- `option-merge.ts`：深度合并工具
- 更新 `merge-chart-option.ts`：使用深度合并替代浅合并

---

---
id: T-004
story_id: ST-004
title: 实现异常场景兜底逻辑
owner_role: dev
status: todo
dependencies: [T-001, T-002]
---

## Read paths

- `packages/bi-engine/src/adapters/echarts/option-templates/*.ts`

## Write paths

- `packages/bi-engine/src/adapters/echarts/option-templates/empty-data-option.ts`
- `packages/bi-engine/src/adapters/echarts/option-templates/index.ts`

## Verify

```bash
cd packages/bi-engine && npx vitest run --reporter=verbose
```

## Goal

1. 创建空数据兜底 option（graphic 层显示"暂无数据"）
2. 坐标轴 min/max 自适应逻辑整合进模板
3. 标签防重叠配置整合进饼图/雷达图模板

## Deliverables

- `empty-data-option.ts`：空数据兜底配置
- 更新相关模板文件

---

---
id: T-005
story_id: ST-005
title: 集成到现有构建流程与编写测试
owner_role: dev
status: todo
dependencies: [T-002, T-003, T-004]
---

## Read paths

- `packages/bi-engine/src/adapters/echarts/*.ts`
- `packages/bi-engine/src/**/*.test.ts`

## Write paths

- `packages/bi-engine/src/adapters/echarts/index.ts`
- `packages/bi-engine/src/adapters/echarts/build-line-option.ts`
- `packages/bi-engine/src/adapters/echarts/build-pie-option.ts`
- `packages/bi-engine/src/adapters/echarts/build-scatter-option.ts`
- `packages/bi-engine/src/adapters/echarts/build-radar-option.ts`
- `packages/bi-engine/src/adapters/echarts/build-candlestick-option.ts`
- `packages/bi-engine/src/adapters/echarts/build-gauge-option.ts`
- `packages/bi-engine/src/adapters/echarts/__tests__/option-templates.test.ts`
- `packages/bi-engine/src/adapters/echarts/__tests__/option-merge.test.ts`

## Verify

```bash
cd packages/bi-engine && pnpm build && npx vitest run --reporter=verbose
```

## Goal

1. 各 builder 集成标准化模板，输出包含基础配置的 option
2. mergeChartOption 改用深度合并
3. 编写模板、合并工具、异常兜底的单元测试
4. 确保原有 53 个测试全部通过
5. 更新 index.ts 导出新 API

## Deliverables

- 更新后的 6 个 builder 文件
- 更新后的 `index.ts`
- 新增测试文件
