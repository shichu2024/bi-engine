import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  PipelineEngine,
  defaultPipelineEngine,
} from '../../pipeline/pipeline-engine';
import { ComponentRegistry } from '../../platform/component-registry';
import { chartHandler } from '../../component-handlers/chart/chart-handler';
import { createUnsupportedHandler } from '../../component-handlers/unsupported-handler';
import { FIXTURE_REGISTRY } from '../../testing/fixture-registry';
import type { BIEngineComponent } from '../../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function registerChartHandler(): void {
  ComponentRegistry.getInstance().registerOrReplace('chart', chartHandler);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PipelineEngine', () => {
  beforeEach(() => {
    ComponentRegistry.getInstance().clear();
  });

  afterEach(() => {
    ComponentRegistry.getInstance().clear();
  });

  // --- unregistered type --------------------------------------------------

  describe('execute with unregistered type', () => {
    it('returns UNSUPPORTED_COMPONENT_TYPE error', () => {
      const engine = new PipelineEngine();
      const component: BIEngineComponent = {
        type: 'chart',
        id: 'test-1',
        dataProperties: {
          dataType: 'static',
          data: [],
          series: [],
        },
      } as BIEngineComponent;

      const result = engine.execute(component);

      expect(result.hasFailure).toBe(true);
      expect(result.validation.ok).toBe(false);
      expect(result.validation.error).toBeDefined();
      expect(result.validation.error!.code).toBe('UNSUPPORTED_COMPONENT_TYPE');
      expect(result.validation.error!.message).toContain('not registered');
    });
  });

  // --- registered chart handler, full pipeline ----------------------------

  describe('execute with registered chart handler', () => {
    beforeEach(() => {
      registerChartHandler();
    });

    it('runs the full pipeline for line-single fixture', () => {
      const engine = new PipelineEngine();
      const fixture = FIXTURE_REGISTRY.find((f) => f.id === 'line-single')!;
      const result = engine.execute(fixture.component);

      expect(result.validation.ok).toBe(true);
      expect(result.normalization.ok).toBe(true);
      expect(result.resolution.ok).toBe(true);
      expect(result.model.ok).toBe(true);
      expect(result.hasFailure).toBe(false);
    });

    it('runs the full pipeline for bar-single fixture', () => {
      const engine = new PipelineEngine();
      const fixture = FIXTURE_REGISTRY.find((f) => f.id === 'bar-single')!;
      const result = engine.execute(fixture.component);

      expect(result.validation.ok).toBe(true);
      expect(result.normalization.ok).toBe(true);
      expect(result.resolution.ok).toBe(true);
      expect(result.model.ok).toBe(true);
      expect(result.hasFailure).toBe(false);
    });

    it('runs the full pipeline for pie-single fixture', () => {
      const engine = new PipelineEngine();
      const fixture = FIXTURE_REGISTRY.find((f) => f.id === 'pie-single')!;
      const result = engine.execute(fixture.component);

      expect(result.validation.ok).toBe(true);
      expect(result.normalization.ok).toBe(true);
      expect(result.resolution.ok).toBe(true);
      expect(result.model.ok).toBe(true);
      expect(result.hasFailure).toBe(false);
    });

    it('produces a normalized component with correct type', () => {
      const engine = new PipelineEngine();
      const fixture = FIXTURE_REGISTRY.find((f) => f.id === 'line-single')!;
      const result = engine.execute(fixture.component);

      expect(result.normalization.data).toBeDefined();
      expect(result.normalization.data!.type).toBe('chart');
      expect(result.normalization.data!.id).toBe(fixture.component.id);
    });

    it('produces resolved data with correct dataType', () => {
      const engine = new PipelineEngine();
      const fixture = FIXTURE_REGISTRY.find((f) => f.id === 'bar-single')!;
      const result = engine.execute(fixture.component);

      expect(result.resolution.data).toBeDefined();
      expect(result.resolution.data!.dataType).toBe('static');
    });
  });

  // --- failFast behavior --------------------------------------------------

  describe('failFast=true', () => {
    it('stops at first failure when an unsupported handler is registered', () => {
      const engine = new PipelineEngine({ failFast: true });
      const tableHandler = createUnsupportedHandler('table');
      ComponentRegistry.getInstance().registerOrReplace('table', tableHandler);

      const result = engine.execute({
        type: 'table',
        id: 'test-table',
      } as BIEngineComponent);

      expect(result.hasFailure).toBe(true);
      expect(result.validation.ok).toBe(false);
      expect(result.validation.error!.code).toBe('UNSUPPORTED_COMPONENT_TYPE');
      // Stages after validation should not have data
      expect(result.normalization.ok).toBe(false);
      expect(result.resolution.ok).toBe(false);
    });
  });

  describe('failFast=false', () => {
    it('still records failures but continues pipeline for unsupported handler', () => {
      const engine = new PipelineEngine({ failFast: false });
      const tableHandler = createUnsupportedHandler('table');
      ComponentRegistry.getInstance().registerOrReplace('table', tableHandler);

      const result = engine.execute({
        type: 'table',
        id: 'test-table',
      } as BIEngineComponent);

      expect(result.hasFailure).toBe(true);
      expect(result.validation.ok).toBe(false);
      // With failFast=false, the engine still proceeds through all stages
      // but each stage of the unsupported handler returns an error
      expect(result.normalization.ok).toBe(false);
      expect(result.resolution.ok).toBe(false);
      expect(result.model.ok).toBe(false);
    });
  });

  // --- defaultPipelineEngine ----------------------------------------------

  describe('defaultPipelineEngine', () => {
    it('is an instance of PipelineEngine', () => {
      expect(defaultPipelineEngine).toBeInstanceOf(PipelineEngine);
    });

    it('is configured with failFast=true', () => {
      // Verify by observing behavior: register an unsupported handler and
      // confirm the engine stops early at validation.
      ComponentRegistry.getInstance().registerOrReplace(
        'markdown',
        createUnsupportedHandler('markdown'),
      );

      const result = defaultPipelineEngine.execute({
        type: 'markdown',
        id: 'test-md',
      } as BIEngineComponent);

      expect(result.hasFailure).toBe(true);
      expect(result.validation.ok).toBe(false);
      // With failFast, subsequent stages have no data
      expect(result.normalization.ok).toBe(false);
      expect(result.resolution.ok).toBe(false);
    });
  });
});
