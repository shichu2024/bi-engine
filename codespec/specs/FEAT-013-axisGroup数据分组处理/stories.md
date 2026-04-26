# FEAT-013 Stories

## ST-001: chartGroupProcess 核心转换函数

**用户价值**: 将窄表数据透视为宽表，自动生成多系列。

**验收标准**:
- [ ] 实现 `chartGroupProcess` 纯函数，输入 `{ series, axisGroup?, chartData }`，输出 `{ renderData, renderSeries }`
- [ ] 多 axisGroup 场景：值用 `-` 连接作为新列名
- [ ] 单 axisGroup 场景：值直接作为新列名
- [ ] axisGroup 为 `['None']` 或 undefined：原样返回（不转换）
- [ ] 每个 axisGroup 值组合生成一个 series，`encode.y` 指向新列名
- [ ] 纯函数，无副作用

## ST-002: Pipeline 集成

**用户价值**: axisGroup 处理自动融入现有渲染管线。

**验收标准**:
- [ ] 在 `chartModelBuilder.build()` 中调用 `chartGroupProcess`
- [ ] 当 axisGroup 有值且非 `['None']` 时，用转换后的 data 和 series 构建语义模型
- [ ] 当 axisGroup 无值或为 `['None']` 时，走原有逻辑
- [ ] 现有测试全部通过（无回归）

## ST-003: Fixture 与 Playground 集成

**用户价值**: 用户可以在 Playground 中看到 axisGroup 分组效果。

**验收标准**:
- [ ] 新增 `line-axis-group` fixture，展示双 axisGroup 分组
- [ ] 新增 `bar-axis-group` fixture，展示单 axisGroup 分组
- [ ] 注册到 FIXTURE_REGISTRY
- [ ] Playground 自动继承（通过 `getUnifiedFixturesByKind`）
- [ ] 渲染正确：多系列图表按分组展开

## ST-004: 测试覆盖

**用户价值**: 确保转换逻辑正确且可维护。

**验收标准**:
- [ ] `chartGroupProcess` 单元测试覆盖：
  - 多 axisGroup 分组
  - 单 axisGroup 分组
  - axisGroup = ['None'] 透传
  - 无 axisGroup 透传
  - 空 chartData 处理
- [ ] Pipeline 集成测试验证端到端渲染
- [ ] 覆盖率 >= 80%
