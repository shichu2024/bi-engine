import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ComponentRegistry,
  registerComponentHandler,
  getComponentHandler,
} from '../../platform/component-registry';
import type { ComponentHandler } from '../../platform/types';
import { createUnsupportedHandler } from '../../component-handlers/unsupported-handler';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeHandler(type: string): ComponentHandler {
  return createUnsupportedHandler(type as never);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = ComponentRegistry.getInstance();
    registry.clear();
  });

  afterEach(() => {
    registry.clear();
  });

  // --- Singleton ----------------------------------------------------------

  describe('getInstance', () => {
    it('returns the same instance on every call', () => {
      const a = ComponentRegistry.getInstance();
      const b = ComponentRegistry.getInstance();
      expect(a).toBe(b);
    });
  });

  // --- register -----------------------------------------------------------

  describe('register', () => {
    it('adds a handler to the registry', () => {
      const handler = makeHandler('chart');
      registry.register('chart', handler);

      expect(registry.has('chart')).toBe(true);
      expect(registry.get('chart')).toBe(handler);
    });

    it('throws when registering a duplicate type', () => {
      registry.register('chart', makeHandler('chart'));

      expect(() => {
        registry.register('chart', makeHandler('chart'));
      }).toThrow(/already registered/);
    });
  });

  // --- registerOrReplace --------------------------------------------------

  describe('registerOrReplace', () => {
    it('overwrites an existing handler without throwing', () => {
      const first = makeHandler('chart');
      const second = makeHandler('chart');

      registry.register('chart', first);
      registry.registerOrReplace('chart', second);

      expect(registry.get('chart')).toBe(second);
    });

    it('adds a new handler when the type is not yet registered', () => {
      const handler = makeHandler('table');
      registry.registerOrReplace('table', handler);

      expect(registry.has('table')).toBe(true);
      expect(registry.get('table')).toBe(handler);
    });
  });

  // --- get ----------------------------------------------------------------

  describe('get', () => {
    it('returns the handler when registered', () => {
      const handler = makeHandler('chart');
      registry.register('chart', handler);

      expect(registry.get('chart')).toBe(handler);
    });

    it('returns undefined when not registered', () => {
      expect(registry.get('chart')).toBeUndefined();
    });
  });

  // --- getOrThrow ---------------------------------------------------------

  describe('getOrThrow', () => {
    it('returns the handler when registered', () => {
      const handler = makeHandler('chart');
      registry.register('chart', handler);

      expect(registry.getOrThrow('chart')).toBe(handler);
    });

    it('throws when not registered', () => {
      expect(() => {
        registry.getOrThrow('chart');
      }).toThrow(/not registered/);
    });
  });

  // --- has ----------------------------------------------------------------

  describe('has', () => {
    it('returns true for a registered type', () => {
      registry.register('chart', makeHandler('chart'));
      expect(registry.has('chart')).toBe(true);
    });

    it('returns false for an unregistered type', () => {
      expect(registry.has('chart')).toBe(false);
    });
  });

  // --- getRegisteredTypes -------------------------------------------------

  describe('getRegisteredTypes', () => {
    it('returns an empty array when nothing is registered', () => {
      expect(registry.getRegisteredTypes()).toEqual([]);
    });

    it('returns all registered types', () => {
      registry.register('chart', makeHandler('chart'));
      registry.registerOrReplace('table', makeHandler('table'));
      registry.registerOrReplace('text', makeHandler('text'));

      const types = registry.getRegisteredTypes();
      expect(types).toContain('chart');
      expect(types).toContain('table');
      expect(types).toContain('text');
      expect(types).toHaveLength(3);
    });
  });

  // --- clear --------------------------------------------------------------

  describe('clear', () => {
    it('empties the registry', () => {
      registry.register('chart', makeHandler('chart'));
      registry.registerOrReplace('table', makeHandler('table'));

      registry.clear();

      expect(registry.getRegisteredTypes()).toEqual([]);
      expect(registry.has('chart')).toBe(false);
      expect(registry.has('table')).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// Convenience functions
// ---------------------------------------------------------------------------

describe('convenience functions', () => {
  beforeEach(() => {
    ComponentRegistry.getInstance().clear();
  });

  afterEach(() => {
    ComponentRegistry.getInstance().clear();
  });

  describe('registerComponentHandler', () => {
    it('registers a handler via the singleton', () => {
      const handler = makeHandler('chart');
      registerComponentHandler('chart', handler);

      expect(ComponentRegistry.getInstance().has('chart')).toBe(true);
    });
  });

  describe('getComponentHandler', () => {
    it('returns the handler from the singleton', () => {
      const handler = makeHandler('chart');
      registerComponentHandler('chart', handler);

      expect(getComponentHandler('chart')).toBe(handler);
    });

    it('returns undefined when not registered', () => {
      expect(getComponentHandler('chart')).toBeUndefined();
    });
  });
});
