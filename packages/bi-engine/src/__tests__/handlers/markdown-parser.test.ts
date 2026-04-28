import { describe, it, expect } from 'vitest';
import { parseMarkdown, parseInline } from '../../component-handlers/markdown/markdown-parser';

describe('parseInline', () => {
  it('parses plain text', () => {
    const nodes = parseInline('hello world');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('text');
    if (nodes[0].type === 'text') expect(nodes[0].content).toBe('hello world');
  });

  it('parses bold text', () => {
    const nodes = parseInline('this is **bold** text');
    expect(nodes).toHaveLength(3);
    expect(nodes[0].type).toBe('text');
    expect(nodes[1].type).toBe('bold');
    expect(nodes[2].type).toBe('text');
  });

  it('parses italic text', () => {
    const nodes = parseInline('this is *italic* text');
    const italic = nodes.find(n => n.type === 'italic');
    expect(italic).toBeDefined();
  });

  it('parses inline code', () => {
    const nodes = parseInline('use `code` here');
    const code = nodes.find(n => n.type === 'code');
    expect(code).toBeDefined();
    if (code?.type === 'code') expect(code.content).toBe('code');
  });

  it('parses links', () => {
    const nodes = parseInline('[text](https://example.com)');
    const link = nodes.find(n => n.type === 'link');
    expect(link).toBeDefined();
    if (link?.type === 'link') {
      expect(link.text).toBe('text');
      expect(link.url).toBe('https://example.com');
    }
  });

  it('rejects javascript: links for XSS prevention', () => {
    const nodes = parseInline('[click](javascript:alert(1))');
    const link = nodes.find(n => n.type === 'link');
    expect(link).toBeUndefined();
    // Should fall back to text
    const text = nodes.find(n => n.type === 'text');
    expect(text).toBeDefined();
  });

  it('escapes HTML in text', () => {
    const nodes = parseInline('<script>alert(1)</script>');
    expect(nodes).toHaveLength(1);
    if (nodes[0].type === 'text') {
      expect(nodes[0].content).not.toContain('<script>');
      expect(nodes[0].content).toContain('&lt;script&gt;');
    }
  });

  it('handles multiple inline elements', () => {
    const nodes = parseInline('**a** and *b* and `c`');
    expect(nodes.some(n => n.type === 'bold')).toBe(true);
    expect(nodes.some(n => n.type === 'italic')).toBe(true);
    expect(nodes.some(n => n.type === 'code')).toBe(true);
  });
});

describe('parseMarkdown', () => {
  it('returns empty array for empty string', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown('   ')).toEqual([]);
  });

  it('parses headings', () => {
    const blocks = parseMarkdown('# Title\n## Subtitle\n### Sub3');
    expect(blocks).toHaveLength(3);
    expect(blocks[0].type).toBe('heading');
    if (blocks[0].type === 'heading') {
      expect(blocks[0].level).toBe(1);
    }
    if (blocks[1].type === 'heading') {
      expect(blocks[1].level).toBe(2);
    }
    if (blocks[2].type === 'heading') {
      expect(blocks[2].level).toBe(3);
    }
  });

  it('parses paragraph', () => {
    const blocks = parseMarkdown('This is a paragraph.');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('paragraph');
  });

  it('merges consecutive lines into paragraph', () => {
    const blocks = parseMarkdown('Line one\nLine two\nLine three');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('paragraph');
    if (blocks[0].type === 'paragraph') {
      const text = blocks[0].children.map(c =>
        c.type === 'text' ? c.content : ''
      ).join('');
      expect(text).toContain('Line one Line two Line three');
    }
  });

  it('parses unordered list', () => {
    const blocks = parseMarkdown('- one\n- two\n- three');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('unordered-list');
    if (blocks[0].type === 'unordered-list') {
      expect(blocks[0].items).toHaveLength(3);
    }
  });

  it('parses ordered list', () => {
    const blocks = parseMarkdown('1. first\n2. second');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('ordered-list');
    if (blocks[0].type === 'ordered-list') {
      expect(blocks[0].items).toHaveLength(2);
    }
  });

  it('parses blockquote', () => {
    const blocks = parseMarkdown('> This is a quote\n> Second line');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('blockquote');
  });

  it('parses horizontal rule', () => {
    const blocks = parseMarkdown('---');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('hr');
  });

  it('parses mixed content', () => {
    const md = [
      '# Title',
      '',
      'Paragraph text.',
      '',
      '- item 1',
      '- item 2',
      '',
      '---',
      '',
      '> quote',
    ].join('\n');

    const blocks = parseMarkdown(md);
    expect(blocks).toHaveLength(5);
    expect(blocks.map(b => b.type)).toEqual([
      'heading', 'paragraph', 'unordered-list', 'hr', 'blockquote',
    ]);
  });

  it('handles heading levels 1-6', () => {
    const md = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
    const blocks = parseMarkdown(md);
    expect(blocks).toHaveLength(6);
    blocks.forEach((b, i) => {
      expect(b.type).toBe('heading');
      if (b.type === 'heading') {
        expect(b.level).toBe(i + 1);
      }
    });
  });

  it('handles special characters safely', () => {
    const md = '<img src=x onerror=alert(1)>';
    const blocks = parseMarkdown(md);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('paragraph');
    // The content should be escaped
    if (blocks[0].type === 'paragraph') {
      const text = blocks[0].children[0];
      if (text.type === 'text') {
        expect(text.content).not.toContain('<img');
        expect(text.content).toContain('&lt;img');
      }
    }
  });
});
