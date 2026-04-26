# FEAT-013: axisGroup 数据分组处理

## 问题

BI 场景中经常出现窄表（long format）数据：多组测试数据共用相同的 x 轴字段，通过额外字段（如"测试名称"、"测试维度"）区分系列。当前引擎不支持这种数据格式，需要用户自行将数据转换为宽表。

## 目标

1. 支持 `axisGroup` 字段，自动将窄表数据透视为宽表
2. 动态生成多系列配置（每组合键值对生成一个 series）
3. 保留扩展性：后续可添加更多数据处理场景（排序、过滤、聚合等）

## 范围

### 包含
- `chartGroupProcess` 纯函数实现
- 在 pipeline 中正确集成（resolve → buildModel 之间）
- Schema 中 `axisGroup` 字段已存在，补充验证
- Fixture 和测试
- Playground 示例

### 不包含
- 动态数据源 (datasource/api) 的 axisGroup 支持
- 非笛卡尔图表类型（pie/scatter/radar/gauge/candlestick）的分组
- 数据聚合（sum/avg/count 等）

## 架构决策

### Pipeline 位置

```
validate → normalize → resolve → [NEW: chartGroupProcess] → buildSemanticModel
```

- 验证发生在转换前（验证输入 schema）
- 数据转换在 resolve 之后、模型构建之前
- 当前实现在 `chartModelBuilder.build()` 内部调用，不需要修改 `PipelineEngine` 基础设施
- 后续可演化为独立 processor registry

### 函数签名

```typescript
export function chartGroupProcess(chartConfig: {
  series: Series[];
  axisGroup?: string[];
  chartData: Record<string, unknown>[];
}): {
  renderData: Record<string, unknown>[];
  renderSeries: Series[];
}
```

### 转换规则

1. 按 `series[0].encode.x` 的 key 分组（行分组）
2. 按 `axisGroup` 的 key 组合生成新列名（列分组）
   - 多个 axisGroup: 用 `-` 连接值 → `"test1-测试维度1"`
   - 单个 axisGroup: 直接用值 → `"test1"`
   - axisGroup 为 `['None']`: 不做转换，原样返回
3. y 值映射到对应新列名
4. 每个新列名生成一个 series，encode.y 指向新列名

## 风险

| 风险 | 影响 | 缓解 |
|------|------|------|
| 大数据量分组性能 | O(n×m) 其中 n=行数 m=分组数 | 当前仅 static 小数据，后续可优化 |
| 列名冲突 | 值组合生成的列名可能与已有列冲突 | 用唯一分隔符 `-` 降低风险 |
| 空值/缺失分组 | 数据中某些行缺少 axisGroup 字段 | 输入验证前置 |

## 用户价值

用户无需预处理数据，直接传入窄表即可自动渲染多系列图表。降低使用门槛，匹配 BI 报表常见数据格式。
