/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import {
  RenderModeProvider,
  useRenderMode,
  useIsDesignMode,
} from '../../platform/render-mode';
import { RenderMode } from '../../platform/types';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useRenderMode', () => {
  it('returns RUNTIME by default (no provider)', () => {
    const { result } = renderHook(() => useRenderMode());

    expect(result.current).toBe(RenderMode.RUNTIME);
  });
});

describe('RenderModeProvider', () => {
  it('injects DESIGN mode to children', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.DESIGN}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useRenderMode(), { wrapper });

    expect(result.current).toBe(RenderMode.DESIGN);
  });

  it('injects RUNTIME mode to children', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.RUNTIME}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useRenderMode(), { wrapper });

    expect(result.current).toBe(RenderMode.RUNTIME);
  });
});

describe('useIsDesignMode', () => {
  it('returns false when mode is RUNTIME', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.RUNTIME}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useIsDesignMode(), { wrapper });

    expect(result.current).toBe(false);
  });

  it('returns true when mode is DESIGN', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.DESIGN}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useIsDesignMode(), { wrapper });

    expect(result.current).toBe(true);
  });

  it('returns false when no provider is present (defaults to RUNTIME)', () => {
    const { result } = renderHook(() => useIsDesignMode());

    expect(result.current).toBe(false);
  });
});
