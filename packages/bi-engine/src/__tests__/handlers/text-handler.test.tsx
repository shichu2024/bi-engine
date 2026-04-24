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
import { textBasic } from '../../testing/fixtures/text-basic';
import { textWithTitle } from '../../testing/fixtures/text-with-title';
import type { TextComponent } from '../../schema/bi-engine-models';
import type { TextSemanticModel } from '../../component-handlers/text';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeInvalidTextComponent(): TextComponent {
  return {
    type: 'text',
    id: 'text-invalid',
    dataProperties: {
      dataType: 'static',
      content: '',
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('text-handler', () => {
  beforeEach(() => {
    ComponentRegistry.getInstance().clear();
    registerBuiltinHandlers();
  });

  afterEach(() => {
    ComponentRegistry.getInstance().clear();
  });

  // --- Pipeline execution ----------------------------------------------------

  describe('pipeline execution', () => {
    it('executes successfully for a valid text component', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<TextSemanticModel>(textBasic);

      expect(result.validation.ok).toBe(true);
      expect(result.normalization.ok).toBe(true);
      expect(result.resolution.ok).toBe(true);
      expect(result.model.ok).toBe(true);
      expect(result.hasFailure).toBe(false);
    });

    it('produces a model with the correct content', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<TextSemanticModel>(textBasic);

      expect(result.model.data).toBeDefined();
      expect(result.model.data!.componentId).toBe('text-basic');
      expect(result.model.data!.content).toBe(textBasic.dataProperties.content);
    });

    it('returns a validation error for missing content', () => {
      const engine = new PipelineEngine();
      const invalidComponent = makeInvalidTextComponent();
      const result = engine.execute<TextSemanticModel>(invalidComponent);

      expect(result.validation.ok).toBe(false);
      expect(result.validation.error).toBeDefined();
      expect(result.validation.error!.code).toBe('MISSING_CONTENT');
    });
  });

  // --- Title handling --------------------------------------------------------

  describe('title handling', () => {
    it('renders title when present', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<TextSemanticModel>(textWithTitle);

      expect(result.model.data).toBeDefined();
      expect(result.model.data!.title).toBe('文本标题');
      expect(result.model.data!.content).toBe('带标题的文本内容。');
    });

    it('title is undefined when not provided', () => {
      const engine = new PipelineEngine();
      const result = engine.execute<TextSemanticModel>(textBasic);

      expect(result.model.data!.title).toBeUndefined();
    });
  });

  // --- Renderer output -------------------------------------------------------

  describe('renderer output', () => {
    it('renders a div containing the text content', () => {
      const { container } = render(
        <ComponentView component={textBasic} />,
      );

      expect(container.textContent).toContain(textBasic.dataProperties.content);
    });

    it('renders title element when title is present', () => {
      const { container } = render(
        <ComponentView component={textWithTitle} />,
      );

      expect(container.textContent).toContain('文本标题');
      expect(container.textContent).toContain('带标题的文本内容。');
    });

    it('does not render a title element when title is absent', () => {
      const { container } = render(
        <ComponentView component={textBasic} />,
      );

      const boldElements = container.querySelectorAll('div[style*="font-weight"]');
      // The content div does not have fontWeight: bold; only the title div does.
      // Since textBasic has no title, no bold-weight div should appear.
      const titleDivs = Array.from(boldElements).filter((el) =>
        (el as HTMLElement).style.fontWeight === 'bold',
      );
      expect(titleDivs).toHaveLength(0);
    });

    it('renders error fallback for invalid text component', () => {
      const invalidComponent = makeInvalidTextComponent();
      const { container } = render(
        <ComponentView component={invalidComponent} />,
      );

      expect(container.textContent).toContain('MISSING_CONTENT');
    });
  });
});
