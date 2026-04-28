// ============================================================================
// component-handlers/markdown/markdown-parser.ts — 轻量 Markdown 解析器
// ============================================================================
//
// 将 Markdown 文本解析为结构化 AST，用于 React 渲染。
// 不依赖外部库，避免增大包体积。
// 支持：标题、加粗、斜体、列表、引用、分割线、行内代码、链接。
// ============================================================================

// ---------------------------------------------------------------------------
// AST 节点类型
// ---------------------------------------------------------------------------

export type InlineNode =
  | { type: 'text'; content: string }
  | { type: 'bold'; children: InlineNode[] }
  | { type: 'italic'; children: InlineNode[] }
  | { type: 'code'; content: string }
  | { type: 'link'; text: string; url: string };

export type BlockNode =
  | { type: 'heading'; level: number; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'unordered-list'; items: InlineNode[][] }
  | { type: 'ordered-list'; items: InlineNode[][] }
  | { type: 'blockquote'; children: InlineNode[] }
  | { type: 'hr' };

// ---------------------------------------------------------------------------
// 内联解析
// ---------------------------------------------------------------------------

/** HTML 特殊字符转义，防止 XSS */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 校验 URL 协议安全性，仅允许 http/https */
function isSafeUrl(url: string): boolean {
  return /^https?:\/\/[^\s/$.?#].[^\s]*/i.test(url);
}

/** 单行内联文本最大长度，防止 ReDoS */
const MAX_INLINE_LENGTH = 10_000;

/**
 * 解析内联 Markdown 语法，返回 InlineNode 数组。
 *
 * 支持的语法：
 * - `**bold**` → bold
 * - `*italic*` → italic
 * - `` `code` `` → code
 * - `[text](url)` → link
 */
export function parseInline(text: string): InlineNode[] {
  if (text.length > MAX_INLINE_LENGTH) {
    return [{ type: 'text', content: escapeHtml(text.slice(0, MAX_INLINE_LENGTH)) + '...' }];
  }

  const nodes: InlineNode[] = [];
  // 使用正则一次性匹配所有内联语法
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+?)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // match 前的纯文本
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', content: escapeHtml(text.slice(lastIndex, match.index)) });
    }

    if (match[1]) {
      // **bold**
      nodes.push({ type: 'bold', children: [{ type: 'text', content: escapeHtml(match[2]) }] });
    } else if (match[3]) {
      // *italic*
      nodes.push({ type: 'italic', children: [{ type: 'text', content: escapeHtml(match[4]) }] });
    } else if (match[5]) {
      // `code`
      nodes.push({ type: 'code', content: escapeHtml(match[6]) });
    } else if (match[7]) {
      // [text](url)
      const url = match[9];
      // 仅允许 http/https 链接，防止 javascript: XSS
      if (isSafeUrl(url)) {
        nodes.push({ type: 'link', text: escapeHtml(match[8]), url });
      } else {
        nodes.push({ type: 'text', content: escapeHtml(match[0]) });
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // 剩余纯文本
  if (lastIndex < text.length) {
    nodes.push({ type: 'text', content: escapeHtml(text.slice(lastIndex)) });
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// 块级解析
// ---------------------------------------------------------------------------

/**
 * 将 Markdown 文本解析为 BlockNode 数组。
 */
export function parseMarkdown(source: string): BlockNode[] {
  if (!source || source.trim() === '') {
    return [];
  }

  const lines = source.split('\n');
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 空行跳过
    if (line.trim() === '') {
      i++;
      continue;
    }

    // 标题: # ~ ######
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      blocks.push({ type: 'heading', level, children: parseInline(content) });
      i++;
      continue;
    }

    // 分割线: --- / *** / ___
    if (/^[-*_]{3,}\s*$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 引用: > text
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: 'blockquote', children: parseInline(quoteLines.join(' ')) });
      continue;
    }

    // 无序列表: - item / * item
    if (/^[-*]\s+/.test(line)) {
      const items: InlineNode[][] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^[-*]\s+/, '')));
        i++;
      }
      blocks.push({ type: 'unordered-list', items });
      continue;
    }

    // 有序列表: 1. item
    if (/^\d+\.\s+/.test(line)) {
      const items: InlineNode[][] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\d+\.\s+/, '')));
        i++;
      }
      blocks.push({ type: 'ordered-list', items });
      continue;
    }

    // 段落：连续非空行合并
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('> ') &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^[-*_]{3,}\s*$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', children: parseInline(paraLines.join(' ')) });
    }
  }

  return blocks;
}
