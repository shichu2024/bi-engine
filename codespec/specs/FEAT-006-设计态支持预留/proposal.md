# FEAT-006: 设计态支持预留

## 状态: planned（待设计器需求明确后启动）

## 问题

FEAT-003 已预留 DesignableWrapper 骨架和 SelectionContext。后续需要配合设计器需求，完善设计态交互能力。

## 目标

1. 拖拽调整组件位置和大小
2. 属性面板联动（选中组件后展示可编辑属性）
3. 组件树管理（添加/删除/排序）
4. 撤销/重做支持
5. 设计态与运行态实时预览切换

## 依赖

- FEAT-003（RenderModeProvider, DesignableWrapper 骨架）
- 设计器产品需求文档（待提供）

## 预估规模

- 预计 Story: 8-12 个
- 预计 Task: 30-40 个
- 可能需要引入第三方拖拽库（dnd-kit / react-rnd）

## 注意

此 Feature 需要产品侧提供设计器需求文档后再细化。当前仅在 FEAT-003 中预留扩展点。
