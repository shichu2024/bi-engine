/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ComponentRegistry } from '../../platform/component-registry';
import { registerBuiltinHandlers } from '../../platform/auto-registry';
import { ComponentView } from '../../react/ComponentView';
import { RenderModeProvider, RenderMode } from '../../platform/render-mode';
import { SelectionProvider } from '../../design/selection-context';
import { ChartThemeProvider } from '../../theme/chart-theme-context';
import { textBasic } from '../../testing/fixtures/text-basic';
import { textWithTitle } from '../../testing/fixtures/text-with-title';
import type { BIEngineComponent } from '../../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// Wrapper helper
// ---------------------------------------------------------------------------

function DesignWrapper({
  component,
  onChange,
}: {
  component: BIEngineComponent;
  onChange?: (newSchema: BIEngineComponent) => void;
}): React.ReactElement {
  return (
    <ChartThemeProvider>
      <SelectionProvider>
        <RenderModeProvider mode={RenderMode.DESIGN}>
          <ComponentView component={component} onChange={onChange} />
        </RenderModeProvider>
      </SelectionProvider>
    </ChartThemeProvider>
  );
}

function RuntimeWrapper({
  component,
  onChange,
}: {
  component: BIEngineComponent;
  onChange?: (newSchema: BIEngineComponent) => void;
}): React.ReactElement {
  return (
    <ChartThemeProvider>
      <SelectionProvider>
        <RenderModeProvider mode={RenderMode.RUNTIME}>
          <ComponentView component={component} onChange={onChange} />
        </RenderModeProvider>
      </SelectionProvider>
    </ChartThemeProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('text-handler design mode editing', () => {
  beforeEach(() => {
    ComponentRegistry.getInstance().clear();
    registerBuiltinHandlers();
  });

  afterEach(() => {
    ComponentRegistry.getInstance().clear();
  });

  it('renders contentEditable elements in design mode with onChange', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <DesignWrapper component={textWithTitle} onChange={handleChange} />,
    );

    const editables = container.querySelectorAll('[contenteditable]');
    expect(editables.length).toBeGreaterThanOrEqual(2);
    expect(container.textContent).toContain('文本标题');
    expect(container.textContent).toContain('带标题的文本内容');
  });

  it('calls onChange when content is edited and blurred', async () => {
    const handleChange = vi.fn();
    const { container } = render(
      <DesignWrapper component={textBasic} onChange={handleChange} />,
    );

    const contentEditable = container.querySelector('[data-field="content"]') as HTMLElement;
    expect(contentEditable).not.toBeNull();

    contentEditable.textContent = '编辑后的新内容';
    fireEvent.blur(contentEditable);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    const newSchema = handleChange.mock.calls[0][0];
    expect(newSchema.type).toBe('text');
    expect(newSchema.dataProperties.content).toBe('编辑后的新内容');
  });

  it('calls onChange when title is edited and blurred', async () => {
    const handleChange = vi.fn();
    const { container } = render(
      <DesignWrapper component={textWithTitle} onChange={handleChange} />,
    );

    const titleEditable = container.querySelector('[data-field="title"]') as HTMLElement;
    expect(titleEditable).not.toBeNull();

    titleEditable.textContent = '新标题';
    fireEvent.blur(titleEditable);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    const newSchema = handleChange.mock.calls[0][0];
    expect(newSchema.dataProperties.title).toBe('新标题');
  });

  it('does not call onChange when content unchanged on blur', async () => {
    const handleChange = vi.fn();
    const { container } = render(
      <DesignWrapper component={textBasic} onChange={handleChange} />,
    );

    const contentEditable = container.querySelector('[data-field="content"]') as HTMLElement;
    fireEvent.blur(contentEditable);

    // Wait a tick to ensure setTimeout fires
    await waitFor(() => {
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  it('renders read-only in runtime mode even with onChange', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <RuntimeWrapper component={textBasic} onChange={handleChange} />,
    );

    const editables = container.querySelectorAll('[contenteditable]');
    expect(editables.length).toBe(0);

    expect(container.textContent).toContain(textBasic.dataProperties.content);
  });
});
