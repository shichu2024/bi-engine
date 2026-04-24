import { describe, it, expect } from 'vitest';
import { createUnsupportedHandler } from '../../component-handlers/unsupported-handler';
import type { ComponentHandler } from '../../platform/types';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createUnsupportedHandler', () => {
  const handler: ComponentHandler = createUnsupportedHandler('table');

  it('has the correct type property', () => {
    expect(handler.type).toBe('table');
  });

  // --- validator ----------------------------------------------------------

  describe('validator', () => {
    it('returns UNSUPPORTED_COMPONENT_TYPE error', () => {
      const result = handler.validator.validate({ type: 'table' } as never);

      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe('UNSUPPORTED_COMPONENT_TYPE');
      expect(result.error!.message).toContain('table');
      expect(result.error!.stage).toBe('validation');
    });
  });

  // --- normalizer ---------------------------------------------------------

  describe('normalizer', () => {
    it('returns UNSUPPORTED_COMPONENT_TYPE error', () => {
      const result = handler.normalizer.normalize({ type: 'table' } as never);

      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe('UNSUPPORTED_COMPONENT_TYPE');
      expect(result.error!.message).toContain('table');
      expect(result.error!.stage).toBe('validation');
    });
  });

  // --- resolver -----------------------------------------------------------

  describe('resolver', () => {
    it('returns UNSUPPORTED_COMPONENT_TYPE error', () => {
      const result = handler.resolver.resolve({ type: 'table' } as never);

      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe('UNSUPPORTED_COMPONENT_TYPE');
      expect(result.error!.message).toContain('table');
      expect(result.error!.stage).toBe('validation');
    });
  });

  // --- modelBuilder -------------------------------------------------------

  describe('modelBuilder', () => {
    it('returns UNSUPPORTED_COMPONENT_TYPE error', () => {
      const result = handler.modelBuilder.build(
        {} as never,
        {} as never,
        { type: 'table' } as never,
      );

      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe('UNSUPPORTED_COMPONENT_TYPE');
    });
  });

  // --- renderer -----------------------------------------------------------

  describe('renderer', () => {
    it('returns null', () => {
      const node = handler.renderer.render({} as never, {} as never);
      expect(node).toBeNull();
    });
  });

  // --- different types ----------------------------------------------------

  it('produces distinct error messages for different types', () => {
    const textHandler = createUnsupportedHandler('text');
    const markdownHandler = createUnsupportedHandler('markdown');

    const textResult = textHandler.validator.validate({ type: 'text' } as never);
    const mdResult = markdownHandler.validator.validate({ type: 'markdown' } as never);

    expect(textResult.error!.message).toContain('text');
    expect(mdResult.error!.message).toContain('markdown');
    expect(textResult.error!.message).not.toBe(mdResult.error!.message);
  });
});
