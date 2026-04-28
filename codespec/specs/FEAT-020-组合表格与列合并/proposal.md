---
id: FEAT-020
title: 组合表格与基础表格列合并
type: feature
priority: P0
depends_on:
  - FEAT-010
  - FEAT-014
---

# 提案

## 问题

- 业务场景中需要将多个相关表格拼接为一个整体展示（如财务报表中的多个子表），但当前系统仅支持独立渲染单个表格，无法实现多子表格的无缝拼接视觉效果。
- 基础表格缺少列合并（mergeColumns）能力，无法将多列合并为单列表头或单列值展示，导致复杂表格结构无法呈现。
- 已有模型定义中 `CompositeTable` 接口和 `MergeColumnInfo` 接口仅停留在类型声明层面，无实际渲染实现。

## 目标

- 实现组合表格（compositeTable）组件，将多个基础表格无缝拼接渲染，支持主标题和子表格标题展示，全局禁用排序/过滤/列管理/分页等操作。
- 实现基础表格的列合并（mergeColumns）功能，支持两种场景：值合并（isMergeValue=true）和表头合并（isMergeValue=false）。
- 组合表格的子表格完全继承基础表格的列合并能力。

## 范围内

- `MergeColumnInfo` 接口扩展：新增 `isMergeValue` 可选字段（默认 true）
- 基础表格 `TableView` 支持解析 `mergeColumns` 配置并渲染两种合并场景
- 组合表格 `CompositeTableView` 组件实现
- 组合表格 handler（composite-table-handler）注册到组件管道
- 测试 fixtures：列合并场景 fixture、组合表格 fixture
- 单元测试覆盖两种列合并场景和组合表格渲染

## 范围外

- 组合表格内部的跨表格合并（如跨子表行合并）
- 列合并的拖拽排序
- API 数据源支持（仅支持 static）
- 设计态编辑器对列合并的交互配置

## 风险

- `MergeColumnInfo.isMergeValue` 为新增字段，需确保现有不传该字段的场景默认按值合并处理（向后兼容）
- 组合表格禁用操作功能需确保不与现有 `TableView` 的 props 耦合过深
- 列合并后表头结构变为多级表头，需与现有嵌套表头（children）机制协调

## 待确认问题

- 无
