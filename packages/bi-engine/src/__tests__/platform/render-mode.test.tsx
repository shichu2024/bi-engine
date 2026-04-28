/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import {
  RenderModeProvider,
  useRenderMode,
  useIsEditMode,
  useCanSwitchChart,
  useCanEditText,
} from '../../platform/render-mode';
import { RenderMode } from '../../platform/types';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useRenderMode', () => {
  it('returns VIEW by default (no provider)', () => {
    const { result } = renderHook(() => useRenderMode());

    expect(result.current).toBe(RenderMode.VIEW);
  });
});

describe('RenderModeProvider', () => {
  it('injects CHAT mode to children', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.CHAT}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useRenderMode(), { wrapper });

    expect(result.current).toBe(RenderMode.CHAT);
  });

  it('injects EDIT mode to children', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.EDIT}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useRenderMode(), { wrapper });

    expect(result.current).toBe(RenderMode.EDIT);
  });

  it('injects VIEW mode to children', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.VIEW}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useRenderMode(), { wrapper });

    expect(result.current).toBe(RenderMode.VIEW);
  });
});

describe('useIsEditMode', () => {
  it('returns false when mode is VIEW', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.VIEW}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useIsEditMode(), { wrapper });

    expect(result.current).toBe(false);
  });

  it('returns true when mode is EDIT', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.EDIT}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useIsEditMode(), { wrapper });

    expect(result.current).toBe(true);
  });

  it('returns false when no provider is present (defaults to VIEW)', () => {
    const { result } = renderHook(() => useIsEditMode());

    expect(result.current).toBe(false);
  });
});

describe('useCanSwitchChart', () => {
  it('returns true for CHAT mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.CHAT}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useCanSwitchChart(), { wrapper });

    expect(result.current).toBe(true);
  });

  it('returns true for EDIT mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.EDIT}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useCanSwitchChart(), { wrapper });

    expect(result.current).toBe(true);
  });

  it('returns false for VIEW mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.VIEW}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useCanSwitchChart(), { wrapper });

    expect(result.current).toBe(false);
  });
});

describe('useCanEditText', () => {
  it('returns false for CHAT mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.CHAT}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useCanEditText(), { wrapper });

    expect(result.current).toBe(false);
  });

  it('returns true for EDIT mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.EDIT}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useCanEditText(), { wrapper });

    expect(result.current).toBe(true);
  });

  it('returns false for VIEW mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RenderModeProvider mode={RenderMode.VIEW}>
        {children}
      </RenderModeProvider>
    );

    const { result } = renderHook(() => useCanEditText(), { wrapper });

    expect(result.current).toBe(false);
  });
});
