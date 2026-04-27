# FEAT-018: 环形图中心文本居中优化 — 任务拆解

## 背景

环形图（ring pie）的中心文本和副文本目前使用 ECharts `graphic` 元素（`type: 'text'`）实现，
通过百分比定位 `left/top` 模拟居中。这种方式存在以下问题：

1. **定位不准确** — `graphic` 元素的定位相对于容器，而非饼图圆心，当图例/容器尺寸变化时偏移
2. **无法自动适配** — 主/副文本的 Y 轴偏移（`46%`/`54%`）是硬编码的，字体大小变化时会错位
3. **维护复杂** — 两套定位系统（`graphic.elements` + `series.center`）需要手动同步

用户提供的方案使用 ECharts 原生 `series.label` + `rich` 富文本，`position: 'center'` 天然居中。

## 方案决策

**采用 `series[0].label` 方案替代 `graphic` 方案**

理由：
- ECharts 饼图 `label.position = 'center'` 天然定位在 `series.center` 处
- `rich` 富文本支持多行、多样式（主文本大号粗体 + 副文本小号），一行 `formatter` 搞定
- 无需维护两套定位（`graphic.left/top` + `series.center`）
- 模板层 `getRingOptionTemplate` 和语义模型层 `buildPieOption` 都需要同步改造

### 关键约束

- **只改环形图**（`subType === 'ring'`），普通饼图不受影响
- **模型不变** — `PieSeries.centerText / subCenterText` 接口保持不变
- **样式保持一致** — 主文本 20px bold primary 色，副文本 12px tertiary 色（与当前一致）
- **第一个数据切片的 label 显示中心文本** — 其余切片隐藏 label（`show: false`）

---

## 任务列表

### T-001: 改造 `build-pie-option.ts` 中心文本实现

**目标**: 将 `buildRingGraphic()` 的 `graphic` 方案替换为 `series.label` + `rich` 方案

**做什么**:
1. 删除 `buildRingGraphic()` 函数
2. 删除 `PIE_CENTER` 常量中用于 graphic 定位的相关逻辑
3. 在环形图分支中，为 `series[0]`（第一个系列）注入 `label` 配置：
   - `show: true`
   - `position: 'center'`
   - `formatter`: 使用 `{title|xxx}\n{value|xxx}` 格式
   - `rich`: 定义 `title`（20px, bold, primary 色）和 `value`（12px, tertiary 色）两种富文本样式
4. 其余环形图系列的 label 设为 `show: false`（或不设，保持默认外部 label）
5. 删除 `option.graphic` 的赋值逻辑
6. 调整第一个数据切片的 `label` 配置显示中心文本，其余切片 `label.show = false`

**改哪些文件**:
- `packages/bi-engine/src/adapters/echarts/build-pie-option.ts`

**读哪些上下文**:
- `packages/bi-engine/src/adapters/echarts/option-templates/base-option.ts`（FONT_SIZE, TEXT_COLOR, FONT_FAMILY）
- `packages/bi-engine/src/schema/bi-engine-models.ts`（PieSeries 类型定义）

**与谁集成**:
- 被 `index.ts` 的 `buildEChartsOption()` 通过 `buildBaseOption()` 调用
- 输出被 `deepMergeOption(template, dataOption)` 合并

**怎样验证**:
- 运行现有测试 `echarts-integration.test.ts` 中的 ring chart 相关用例（需要同步更新断言）
- 手动验证：环形图中心文本在主/副文本同时存在、只有主文本、只有副文本三种场景均居中

**什么不做**:
- 不修改 `PieSeries` 类型定义
- 不修改 `ChartOption` 类型
- 不处理普通饼图（非 ring）的 label 逻辑
- 不修改模板层（T-002 负责）

---

### T-002: 改造 `getRingOptionTemplate()` 模板层

**目标**: 将模板层 `graphic.elements` 替换为 `series[0].label` + `rich` 方案

**做什么**:
1. 删除 `graphicItems` 构建逻辑
2. 删除返回值中的 `graphic` 属性
3. 在 `series[0]` 上添加默认 `label` 结构：
   ```typescript
   label: {
     show: false, // 默认关闭，由 builder 层在有 centerText 时开启
     position: 'center',
     formatter: '{title|}\n{value|}',
     rich: {
       title: { fontSize: 20, fontWeight: 700, color: t.font.color, fontFamily: t.font.family, lineHeight: 20, align: 'center' },
       value: { fontSize: t.font.size, color: t.font.tertiaryColor, fontFamily: t.font.family, lineHeight: 35, align: 'center' },
     }
   }
   ```
4. 调整 `series[0].center` 为 `['40%', '50%']`（保持为图例留空间）
5. 添加 `emphasis: { label: { show: true } }` 配置
6. 移除各数据切片在环形图中的外部 label 显示（或保持默认行为）

**改哪些文件**:
- `packages/bi-engine/src/adapters/echarts/option-templates/pie-option-template.ts`

**读哪些上下文**:
- `packages/bi-engine/src/adapters/echarts/option-templates/base-option.ts`（主题令牌）
- `packages/bi-engine/src/theme/theme-tokens.ts`（ThemeTokens 类型）

**与谁集成**:
- 被 `index.ts` 的 `getTemplate()` 调用
- 输出作为 `deepMergeOption` 的 base 与 builder 结果合并

**怎样验证**:
- 运行 `option-templates.test.ts` 中的 `getRingOptionTemplate` 测试用例（需同步更新断言）
- 验证模板输出不包含 `graphic`，而是包含 `series[0].label.rich`

**什么不做**:
- 不修改 `getPieOptionTemplate()`
- 不修改其他图表类型的模板

---

### T-003: 更新测试断言

**目标**: 更新所有因方案变更而失败的测试用例

**做什么**:
1. **`echarts-integration.test.ts`**:
   - 更新 `'ring chart shows center text from model centerText/subCenterText'` 用例
     - 断言 `option.graphic` 为 `undefined`
     - 断言 `series[0].label.show === true`
     - 断言 `series[0].label.position === 'center'`
     - 断言 `series[0].label.rich` 包含 `title` 和 `value` 样式定义
     - 断言 `series[0].label.formatter` 包含 `{title|Total}` 和 `{value|$100K}`
   - 更新 `'ring chart without centerText has no graphic'` 用例
     - 断言 `series[0].label.show === false` 或无 label
   - 更新 `'ring chart legend is on right with 10% distance'` 用例（可能不受影响）

2. **`option-templates.test.ts`**:
   - 更新 `'getRingOptionTemplate'` 测试组：
     - `'supports center title text'` — 改为验证 `series[0].label` 而非 `graphic.elements`
     - `'omits center text when no params provided'` — 改为验证 `graphic === undefined` 且 `label.show === false`

3. 如有 snapshot 测试，更新 snapshot

**改哪些文件**:
- `packages/bi-engine/src/adapters/echarts/__tests__/echarts-integration.test.ts`
- `packages/bi-engine/src/adapters/echarts/__tests__/option-templates.test.ts`

**读哪些上下文**:
- T-001 和 T-002 的变更结果

**依赖**: T-001, T-002

**怎样验证**:
- `pnpm test` 全部通过
- 无跳过的测试用例

**什么不做**:
- 不新增测试用例（保持现有覆盖范围即可）
- 不修改与 ring 无关的测试

---

## 依赖关系

```
T-001 (build-pie-option.ts) ──┐
                               ├── T-003 (更新测试)
T-002 (pie-option-template.ts) ┘
```

- T-001 和 T-002 **可并行执行**（write_paths 不重叠）
- T-003 依赖 T-001 + T-002 完成

## 并行条件

| Task | write_paths | 与谁可并行 |
|------|------------|-----------|
| T-001 | `adapters/echarts/build-pie-option.ts` | T-002 |
| T-002 | `adapters/echarts/option-templates/pie-option-template.ts` | T-001 |
| T-003 | `adapters/echarts/__tests__/*.test.ts` | 无（依赖 T-001, T-002） |

## 接口契约

### Series label 结构（T-001 和 T-002 共享）

```typescript
// 环形图第一个系列的 label 配置
interface RingCenterLabel {
  show: boolean;
  position: 'center';
  formatter: string;  // '{title|主文本}\n{value|副文本}'
  rich: {
    title: {
      fontSize: number;    // 20
      fontWeight: number;  // 700
      color: string;       // TEXT_COLOR.primary
      fontFamily: string;  // FONT_FAMILY
      lineHeight: number;  // 24
      align: 'center';
    };
    value: {
      fontSize: number;    // FONT_SIZE.subtitle (12)
      color: string;       // TEXT_COLOR.tertiary
      fontFamily: string;  // FONT_FAMILY
      lineHeight: number;  // 30
      align: 'center';
    };
  };
}
```

### 数据切片 label 行为

- 第一个数据切片：继承系列的 label 配置（显示中心文本）
- 其余数据切片：`label.show = false`（不在中心显示，也不显示外部 label）

## 风险控制

1. **合并冲突** — 模板层 `label` 和 builder 层 `label` 可能冲突，需要确保 `deepMergeOption` 正确合并
2. **多系列环形图** — 目前只处理第一个 ring 系列，与当前行为一致
3. **主题色值** — rich 样式使用硬编码字号而非 theme token，需与模板层保持一致
