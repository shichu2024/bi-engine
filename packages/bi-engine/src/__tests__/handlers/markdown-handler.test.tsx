/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { PipelineEngine } from '../../pipeline/pipeline-engine';
import { ComponentRegistry } from '../../platform/component-registry';
import { registerBuiltinHandlers } from '../../platform/auto-registry';
import { ComponentView } from '../../react/ComponentView';
import { markdownHandler } from '../../component-handlers/markdown';
import { MarkdownRenderer } from '../../component-handlers/markdown/markdown-renderer';
import type { MarkdownComponent } from '../../schema/bi-engine-models';
import type { MarkdownSemanticModel } from '../../component-handlers/markdown';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidMarkdown(content: string = '# Hello\n\nThis is **bold** text.'): MarkdownComponent {
  return {
    type: 'markdown',
    id: 'md-test-1',
    dataProperties: {
      dataType: 'static',
      content,
    },
  };
}

function makeEmptyMarkdown(): MarkdownComponent {
  return {
    type: 'markdown',
    id: 'md-empty',
    dataProperties: {
      dataType: 'static',
      content: '',
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('markdown-handler', () => {
  beforeEach(() => {
    ComponentRegistry.getInstance().clear();
    registerBuiltinHandlers();
  });

  afterEach(() => {
    ComponentRegistry.getInstance().clear();
  });

  // --- Pipeline execution ----------------------------------------------------

  describe('pipeline execution', () => {
    it('executes successfully for a valid markdown component', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<MarkdownSemanticModel>(makeValidMarkdown());

      expect(result.validation.ok).toBe(true);
      expect(result.normalization.ok).toBe(true);
      expect(result.resolution.ok).toBe(true);
      expect(result.model.ok).toBe(true);
      expect(result.hasFailure).toBe(false);
    });

    it('produces a model with the correct content', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<MarkdownSemanticModel>(makeValidMarkdown());

      const model = result.model.data!;
      expect(model.componentId).toBe('md-test-1');
      expect(model.content).toBe('# Hello\n\nThis is **bold** text.');
    });

    it('fails validation for empty content', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<MarkdownSemanticModel>(makeEmptyMarkdown());

      expect(result.validation.ok).toBe(false);
      expect(result.validation.error?.code).toBe('MISSING_CONTENT');
    });

    it('fails validation for wrong type', () => {
      const wrong = { type: 'text', id: 'x', dataProperties: { dataType: 'static', content: 'hi' } } as unknown as MarkdownComponent;
      // Pipeline 会根据 type 字段路由到对应 handler，所以直接测试 validator
      const result = markdownHandler.validator.validate(wrong);

      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('INVALID_COMPONENT_TYPE');
    });
  });

  // --- Validator ---------------------------------------------------------------

  describe('validator', () => {
    it('accepts valid markdown component', () => {
      const result = markdownHandler.validator.validate(makeValidMarkdown());
      expect(result.ok).toBe(true);
    });

    it('rejects empty content', () => {
      const result = markdownHandler.validator.validate(makeEmptyMarkdown());
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('MISSING_CONTENT');
    });
  });

  // --- Normalizer --------------------------------------------------------------

  describe('normalizer', () => {
    it('normalizes to correct structure', () => {
      const result = markdownHandler.normalizer.normalize(makeValidMarkdown());
      expect(result.ok).toBe(true);
      expect(result.data!.id).toBe('md-test-1');
      expect(result.data!.type).toBe('markdown');
      expect(result.data!.properties.content).toBe('# Hello\n\nThis is **bold** text.');
    });
  });

  // --- Resolver ----------------------------------------------------------------

  describe('resolver', () => {
    it('resolves to static data', () => {
      const result = markdownHandler.resolver.resolve(makeValidMarkdown());
      expect(result.ok).toBe(true);
      expect(result.data!.dataType).toBe('static');
      expect(result.data!.data).toBe('# Hello\n\nThis is **bold** text.');
    });
  });

  // --- ModelBuilder ------------------------------------------------------------

  describe('modelBuilder', () => {
    it('builds semantic model', () => {
      const normalized = {
        id: 'md-test-1',
        type: 'markdown' as const,
        properties: { content: '# Test' },
      };
      const resolved = { dataType: 'static' as const, data: '# Test' };
      const result = markdownHandler.modelBuilder.build(normalized, resolved, makeValidMarkdown('# Test'));

      expect(result.ok).toBe(true);
      expect(result.data!.componentId).toBe('md-test-1');
      expect(result.data!.content).toBe('# Test');
    });
  });

  // --- Renderer (read-only) ----------------------------------------------------

  describe('renderer (read-only)', () => {
    it('renders markdown content as formatted HTML', () => {
      const model: MarkdownSemanticModel = {
        componentId: 'md-1',
        content: '# Hello World\n\nThis is **bold** and *italic*.',
      };

      const { container } = render(
        <ComponentView
          component={makeValidMarkdown(model.content)}
        />
      );

      // 应渲染 h1 标题
      const h1 = container.querySelector('h1');
      expect(h1).not.toBeNull();
      expect(h1?.textContent).toContain('Hello World');

      // 应渲染 bold
      const strong = container.querySelector('strong');
      expect(strong).not.toBeNull();
      expect(strong?.textContent).toBe('bold');

      // 应渲染 italic
      const em = container.querySelector('em');
      expect(em).not.toBeNull();
      expect(em?.textContent).toBe('italic');
    });

    it('renders empty content with placeholder', () => {
      const { container } = render(
        <MarkdownRenderer content="" placeholder="暂无内容" />
      );

      // 空内容不应报错，渲染占位
      expect(container.textContent).toContain('暂无内容');
    });

    it('renders lists correctly', () => {
      const content = '- Item 1\n- Item 2\n- Item 3';
      const { container } = render(
        <ComponentView component={makeValidMarkdown(content)} />
      );

      const ul = container.querySelector('ul');
      expect(ul).not.toBeNull();
      const items = container.querySelectorAll('li');
      expect(items.length).toBe(3);
    });

    it('renders ordered lists correctly', () => {
      const content = '1. First\n2. Second\n3. Third';
      const { container } = render(
        <ComponentView component={makeValidMarkdown(content)} />
      );

      const ol = container.querySelector('ol');
      expect(ol).not.toBeNull();
      const items = container.querySelectorAll('li');
      expect(items.length).toBe(3);
    });

    it('renders blockquote correctly', () => {
      const content = '> This is a quote';
      const { container } = render(
        <ComponentView component={makeValidMarkdown(content)} />
      );

      const bq = container.querySelector('blockquote');
      expect(bq).not.toBeNull();
      expect(bq?.textContent).toContain('This is a quote');
    });

    it('renders horizontal rule', () => {
      const content = 'Above\n\n---\n\nBelow';
      const { container } = render(
        <ComponentView component={makeValidMarkdown(content)} />
      );

      const hr = container.querySelector('hr');
      expect(hr).not.toBeNull();
    });

    it('renders inline code', () => {
      const content = 'Use `console.log` to debug';
      const { container } = render(
        <ComponentView component={makeValidMarkdown(content)} />
      );

      const code = container.querySelector('code');
      expect(code).not.toBeNull();
      expect(code?.textContent).toBe('console.log');
    });

    it('renders links', () => {
      const content = '[OpenAI](https://openai.com)';
      const { container } = render(
        <ComponentView component={makeValidMarkdown(content)} />
      );

      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      expect(link?.getAttribute('href')).toBe('https://openai.com');
      expect(link?.textContent).toBe('OpenAI');
    });
  });

  // --- Registry integration ---------------------------------------------------

  describe('registry integration', () => {
    it('is registered as markdown handler', () => {
      const handler = ComponentRegistry.getInstance().get('markdown');
      expect(handler).toBeDefined();
      expect(handler?.type).toBe('markdown');
    });
  });
});
