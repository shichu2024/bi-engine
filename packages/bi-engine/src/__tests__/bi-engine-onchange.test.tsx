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
    it('fires onChange when text content is edited in edit mode', async () => {
      const handleChange = vi.fn();
      const { container } = render(
        <BIEngine
          schema={textBasic}
          mode="edit"
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

    it('does not render editable in chat mode', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <BIEngine
          schema={textBasic}
          mode="chat"
          onChange={handleChange}
        />,
      );

      const editables = container.querySelectorAll('[contenteditable]');
      expect(editables.length).toBe(0);
    });

    it('does not render editable in view mode', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <BIEngine
          schema={textBasic}
          mode="view"
          onChange={handleChange}
        />,
      );

      const editables = container.querySelectorAll('[contenteditable]');
      expect(editables.length).toBe(0);
    });
  });

  describe('chart switch triggers onChange', () => {
    it('fires onChange when chart type is switched in edit mode', () => {
      const handleChange = vi.fn();
      const handleChartTypeChange = vi.fn();

      const { container } = render(
        <BIEngine
          schema={lineSingleFixture}
          mode="edit"
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

    it('fires onChange when chart type is switched in chat mode', () => {
      const handleChange = vi.fn();
      const handleChartTypeChange = vi.fn();

      const { container } = render(
        <BIEngine
          schema={lineSingleFixture}
          mode="chat"
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
      }
    });

    it('does not show chart switch toolbar in view mode', () => {
      const handleChange = vi.fn();
      const handleChartTypeChange = vi.fn();

      const { container } = render(
        <BIEngine
          schema={lineSingleFixture}
          mode="view"
          onChange={handleChange}
          onChartTypeChange={handleChartTypeChange}
        />,
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });
  });

  describe('non-controlled mode without onChange', () => {
    it('works without onChange in view mode', () => {
      const { container } = render(
        <BIEngine schema={textBasic} mode="view" />,
      );

      expect(container.textContent).toContain(textBasic.dataProperties.content);
    });

    it('works without onChange in edit mode (read-only fallback)', () => {
      const { container } = render(
        <BIEngine schema={textBasic} mode="edit" />,
      );

      expect(container.textContent).toContain(textBasic.dataProperties.content);
    });
  });

  describe('theme API', () => {
    it('accepts theme="dark"', () => {
      const { container } = render(
        <BIEngine schema={textBasic} mode="view" theme="dark" />,
      );

      expect(container.textContent).toContain(textBasic.dataProperties.content);
    });

    it('accepts theme="light"', () => {
      const { container } = render(
        <BIEngine schema={textBasic} mode="view" theme="light" />,
      );

      expect(container.textContent).toContain(textBasic.dataProperties.content);
    });
  });
});
