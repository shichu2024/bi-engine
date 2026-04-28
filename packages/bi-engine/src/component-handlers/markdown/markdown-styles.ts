// ============================================================================
// component-handlers/markdown/markdown-styles.ts — Markdown 渲染内联样式
// ============================================================================
//
// 使用内联样式对象替代外部 CSS 文件，确保库包可独立使用。
// ============================================================================

import type { CSSProperties } from 'react';

/** 根容器 */
export const rootStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.7,
  color: '#333',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
};

/** 标题样式映射 */
export const headingStyles: Record<number, CSSProperties> = {
  1: { fontSize: 28, fontWeight: 700, margin: '20px 0 12px', lineHeight: 1.3 },
  2: { fontSize: 24, fontWeight: 600, margin: '18px 0 10px', lineHeight: 1.3 },
  3: { fontSize: 20, fontWeight: 600, margin: '16px 0 8px', lineHeight: 1.4 },
  4: { fontSize: 17, fontWeight: 600, margin: '14px 0 6px', lineHeight: 1.4 },
  5: { fontSize: 15, fontWeight: 600, margin: '12px 0 4px', lineHeight: 1.5 },
  6: { fontSize: 14, fontWeight: 600, margin: '10px 0 4px', lineHeight: 1.5, color: '#666' },
};

/** 段落 */
export const paragraphStyle: CSSProperties = {
  margin: '0 0 12px',
};

/** 行内代码 */
export const codeStyle: CSSProperties = {
  background: '#f5f5f5',
  border: '1px solid #e8e8e8',
  borderRadius: 3,
  padding: '1px 6px',
  fontSize: 13,
  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  color: '#d56161',
};

/** 链接 */
export const linkStyle: CSSProperties = {
  color: '#1890ff',
  textDecoration: 'none',
};

/** 无序列表 */
export const unorderedListStyle: CSSProperties = {
  margin: '0 0 12px',
  paddingLeft: 24,
  listStyleType: 'disc',
};

/** 有序列表 */
export const orderedListStyle: CSSProperties = {
  margin: '0 0 12px',
  paddingLeft: 24,
  listStyleType: 'decimal',
};

/** 列表项 */
export const listItemStyle: CSSProperties = {
  marginBottom: 4,
};

/** 引用 */
export const blockquoteStyle: CSSProperties = {
  margin: '0 0 12px',
  padding: '8px 16px',
  borderLeft: '4px solid #1890ff',
  background: '#f0f7ff',
  color: '#555',
};

/** 分割线 */
export const hrStyle: CSSProperties = {
  border: 'none',
  borderTop: '1px solid #e8e8e8',
  margin: '16px 0',
};

/** 占位文案 */
export const placeholderStyle: CSSProperties = {
  color: '#bfbfbf',
  fontStyle: 'italic',
};
