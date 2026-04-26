/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BIEngine } from '../react/BIEngine';
import type { BIEngineComponent, ChartComponent, TextComponent } from '../schema/bi-engine-models';
import { textBasic } from '../testing/fixtures/text-basic';
import { lineSingleFixture } from '../testing/fixtures/line-single';
import { ComponentRegistry } from '../platform/component-registry';
import { registerBuiltinHandlers } from '../platform/auto-registry';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BIEngine onChange integration', () => {
  beforeEach(() => {
    ComponentRegistry.getInstance().clear();
    registerBuiltinHandlers();
  });

  afterEach(() => {
    ComponentRegistry.getInstance().clear();
  });

  describe('text editing triggers onChange', () => {
    it('fires onChange when text content is edited in design mode', async () => {
      const handleChange = vi.fn();
      const { container } = render(
        <BIEngine
          schema={textBasic}
          mode="design"
          onChange={handleChange}
        />,
      );

      const contentEditable = container.querySelector('[data-field="content"]') as HTMLElement;
      expect(contentEditable).not.toBeNull();

      contentEditable.textContent = '新的文本内容';
      fireEvent.blur(contentEditable);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledTimes(1);
      });

      const newSchema = handleChange.mock.calls[0][0] as TextComponent;
      expect(newSchema.type).toBe('text');
      expect(newSchema.dataProperties.content).toBe('新的文本内容');
    });
  });

  describe('chart switch triggers onChange', () => {
    it('fires onChange when chart type is switched', () => {
      const handleChange = vi.fn();
      const handleChartTypeChange = vi.fn();

      const { container } = render(
        <BIEngine
          schema={lineSingleFixture}
          onChange={handleChange}
          onChartTypeChange={handleChartTypeChange}
        />,
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      const switchButton = Array.from(buttons).find(
        (btn) => btn.textContent && btn.textContent !== 'line',
      );

      if (switchButton) {
        fireEvent.click(switchButton);

        expect(handleChartTypeChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledTimes(1);

        const onChangeSchema = handleChange.mock.calls[0][0] as ChartComponent;
        expect(onChangeSchema.type).toBe('chart');
      }
    });
  });

  describe('non-controlled mode without onChange', () => {
    it('works without onChange in runtime mode', () => {
      const { container } = render(
        <BIEngine schema={textBasic} mode="runtime" />,
      );

      expect(container.textContent).toContain(textBasic.dataProperties.content);
    });

    it('works without onChange in design mode (read-only fallback)', () => {
      const { container } = render(
        <BIEngine schema={textBasic} mode="design" />,
      );

      expect(container.textContent).toContain(textBasic.dataProperties.content);
    });
  });
});
