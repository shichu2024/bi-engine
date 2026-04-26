# FEAT-011 Stories

## ST-001: 全局 data-theme 属性同步

**作为** Playground 用户
**我希望** 切换主题时 `data-theme` 属性自动同步到 `<html>` 元素
**以便** 所有基于 `[data-theme="dark"]` 的 CSS 选择器正确生效

### 验收标准
- 当 mode 为 `dark` 时，`document.documentElement.dataset.theme === 'dark'`
- 当 mode 为 `light` 时，`document.documentElement.dataset.theme === 'light'`
- 主题持久化后刷新页面，属性仍然正确

## ST-002: 图表引擎暗色主题预设

**作为** bi-engine 消费者
**我希望** 包内置 `DARK_THEME_TOKENS` 预设
**以便** 在暗色环境下无需手动配置所有 token 值

### 验收标准
- 导出 `DARK_THEME_TOKENS` 常量
- 暗色 tokens 使用深色背景（`#1a1a2e` 或类似）、浅色文字（`#e0e0e0`）
- `ChartThemeProvider` 的 `tokens` prop 接受 `DARK_THEME_TOKENS` 后图表在暗色背景下完全可读
- 单元测试验证暗色 tokens 结构完整

## ST-003: 图表预览跟随主题

**作为** Playground 用户
**我希望** 首页和编辑器中的图表预览自动跟随当前主题
**以便** 在暗色模式下图表不会显示白底黑字的违和效果

### 验收标准
- ChartPreview 在暗色模式下传递 `DARK_THEME_TOKENS` 给 `ChartThemeProvider`
- InteractivePreview 在暗色模式下传递 `DARK_THEME_TOKENS` 给 `ChartThemeProvider`
- 切换主题时图表即时更新（无需刷新）

## ST-004: VRT 模块暗色适配

**作为** Playground 用户
**我希望** VRT（视觉回归测试）页面在暗色模式下完全可用
**以便** 暗色环境下仍可正常使用测试功能

### 验收标准
- `Vrt.module.css` 中所有硬编码颜色替换为 CSS 变量
- VRT 页面在暗色模式下无白色残留

## ST-005: 全局页面背景跟随主题

**作为** Playground 用户
**我希望** 整个页面背景（body/html）跟随主题切换
**以便** 切换暗色模式时不会出现白色闪烁或白色边框

### 验收标准
- body/html 背景在暗色模式下为深色
- 切换主题时背景平滑过渡
- 刷新页面后无白屏闪烁（初始值正确）
