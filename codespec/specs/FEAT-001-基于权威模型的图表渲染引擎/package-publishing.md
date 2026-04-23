# npm 包发布规划

## 1. 目标

首阶段只提供一个 `@your-scope/bi-engine`，并且它必须严格围绕 [模型定义汇总.ts](./模型定义汇总.ts) 组织导出。

原因：

- 现在最需要验证的是“权威模型 -> 渲染结果”的能力闭环
- 多包会放大发布、联调、版本同步和文档成本
- 模型边界已经由权威文件给定，首阶段不需要再用拆包制造边界

所以首阶段策略是：

- 一个 publishable package：`bi-engine`
- 一个宿主应用：`bi-playground`
- 一套测试与视觉回归工具脚本

命名原因：

- 权威模型顶层是 `BIEngineComponent`
- 长期不仅承载 chart，也承载 text、table、markdown、compositeTable
- 首阶段虽然只强支持图表渲染，但包名应提前对齐长期引擎语义

## 2. 单包内部分层

虽然只发一个包，但内部仍然要保持清晰分层。

建议目录：

```text
packages/
  bi-engine/
    src/
      schema/
      validator/
      model/
      data/
      adapters/
      react/
      theme/
      formatters/
      errors/
      testing/
```

这样可以同时满足两件事：

- 外部消费简单，只装一个包
- 内部演进有边界，不会变成一锅粥

## 3. 推荐导出策略

### 3.1 schema 导出

根导出建议至少 re-export：

- `BIEngineComponent`
- `ChartComponent`
- `ChartDataProperty`
- `Series`
- `Axis`
- `ChartOption`
- `Column`
- `Dashboard`
- `Report`
- `PPT`

原因不是首阶段都要执行，而是要保证“模型定义”和“运行时实现”仍然指向同一份类型世界。

### 3.2 运行时导出

根导出还建议包含：

- `validateChartComponent`
- `ChartView`
- `ChartStateView`
- `ChartThemeProvider`
- `ChartRenderError`

### 3.3 测试导出

如有必要，可以提供单包子路径导出：

- `@your-scope/bi-engine/testing`

用于暴露：

- fixture registry
- examples
- test helpers

这仍然是一个 npm 包，只是导出面向不同用途。

## 4. playground 的位置

`playground` 建议作为 `apps/bi-playground`，而不是发成 npm 包。

原因：

- 它是宿主应用，不是库
- 它承担调试、演示和黑盒测试承载职责
- 它的截图基线和 diff 产物不应该混进 npm 发布物

## 5. 构建与发布建议

### 5.1 工作区

建议使用：

- `pnpm workspace`
- `TypeScript project references`
- `tsup` 或 `rollup` 生成构建产物
- `changesets` 做版本和发布管理

### 5.2 包产物

`bi-engine` 至少输出：

- ESM
- CJS
- `.d.ts`
- `exports` 字段
- `sideEffects` 声明

### 5.3 发布入口

建议保留统一命令：

- `pnpm build`
- `pnpm test`
- `pnpm changeset`
- `pnpm release`

## 6. 外部消费验证

不能只验证 monorepo 内部互相 import 成功，还需要有一个“外部消费 smoke check”：

- 新建最小 demo 或临时 smoke app
- 只通过 `package.json dependency` 安装 `bi-engine`
- 验证 `ChartView + ChartComponent` 能跑通

如果这一步不过，说明还不能算真正“可发布”。

## 7. 未来何时再拆包

只有出现下面这些真实压力时，才建议把单包拆成多包：

- 非 React 消费方明显增多，且不希望引入 React 相关依赖
- 需要同时提供多个 framework 宿主层
- 包体积、安装体积或构建时间成为明显问题
- schema/core/react 的发布节奏已经显著分化

在这些信号出现之前，保持单包更符合第一阶段目标。

## 8. 第一阶段完成定义

包发布能力达标时，应满足：

- `bi-playground` 通过安装工作区 `bi-engine` 包工作
- 外部 smoke app 可以成功消费 `bi-engine`
- CI 能产出构建产物
- 单包内部模块边界清晰
- 导出与 [模型定义汇总.ts](./模型定义汇总.ts) 对齐
- 截图基线与 diff 产物不进入 npm 发布内容
