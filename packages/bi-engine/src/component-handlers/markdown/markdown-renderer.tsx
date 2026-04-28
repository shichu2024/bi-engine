// ============================================================================
// component-handlers/markdown/markdown-renderer.tsx — 只读渲染组件
// ============================================================================

import { useMemo } from 'react';
import type { FC } from 'react';
import type { BlockNode, InlineNode } from './markdown-parser';
import { parseMarkdown } from './markdown-parser';
import {
  rootStyle,
  headingStyles,
  paragraphStyle,
  codeStyle,
  linkStyle,
  unorderedListStyle,
  orderedListStyle,
  listItemStyle,
  blockquoteStyle,
  hrStyle,
  placeholderStyle,
} from './markdown-styles';

// ---------------------------------------------------------------------------
// 内联节点渲染
// ---------------------------------------------------------------------------

function renderInlineNode(node: InlineNode, key: number): React.ReactNode {
  switch (node.type) {
    case 'text':
      return <span key={key}>{node.content}</span>;
    case 'bold':
      return <strong key={key}>{node.children.map((c, i) => renderInlineNode(c, i))}</strong>;
    case 'italic':
      return <em key={key}>{node.children.map((c, i) => renderInlineNode(c, i))}</em>;
    case 'code':
      return <code key={key} style={codeStyle}>{node.content}</code>;
    case 'link':
      return (
        <a key={key} href={node.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          {node.text}
        </a>
      );
  }
}

// ---------------------------------------------------------------------------
// 块级节点渲染
// ---------------------------------------------------------------------------

function renderBlock(block: BlockNode, key: number): React.ReactNode {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as keyof React.JSX.IntrinsicElements;
      return (
        <Tag key={key} style={headingStyles[block.level] ?? headingStyles[6]}>
          {block.children.map((c, i) => renderInlineNode(c, i))}
        </Tag>
      );
    }
    case 'paragraph':
      return (
        <p key={key} style={paragraphStyle}>
          {block.children.map((c, i) => renderInlineNode(c, i))}
        </p>
      );
    case 'unordered-list':
      return (
        <ul key={key} style={unorderedListStyle}>
          {block.items.map((item, i) => (
            <li key={i} style={listItemStyle}>
              {item.map((c, j) => renderInlineNode(c, j))}
            </li>
          ))}
        </ul>
      );
    case 'ordered-list':
      return (
        <ol key={key} style={orderedListStyle}>
          {block.items.map((item, i) => (
            <li key={i} style={listItemStyle}>
              {item.map((c, j) => renderInlineNode(c, j))}
            </li>
          ))}
        </ol>
      );
    case 'blockquote':
      return (
        <blockquote key={key} style={blockquoteStyle}>
          {block.children.map((c, i) => renderInlineNode(c, i))}
        </blockquote>
      );
    case 'hr':
      return <hr key={key} style={hrStyle} />;
  }
}

// ---------------------------------------------------------------------------
// 只读渲染器
// ---------------------------------------------------------------------------

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

export const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  content,
  className,
  style,
  placeholder,
}) => {
  if (!content || content.trim() === '') {
    return (
      <div className={className} style={{ ...rootStyle, ...style }}>
        {placeholder && <span style={placeholderStyle}>{placeholder}</span>}
      </div>
    );
  }

  const blocks = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div className={className} style={{ ...rootStyle, ...style }}>
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
};
