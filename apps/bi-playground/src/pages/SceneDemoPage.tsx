import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FIXTURE_REGISTRY } from 'bi-engine/testing';
import { useComponentStore } from '@/stores';
import { SceneDetail } from '@/components/demo/SceneDetail';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_KINDS = new Set(['line', 'bar', 'pie']);
const DEFAULT_KIND = 'line';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SceneDemoPage(): React.ReactElement {
  const navigate = useNavigate();
  const { kind } = useParams<{ readonly kind: string }>();

  const selectedKind = useComponentStore((s) => s.selectedComponentId);
  const selectComponent = useComponentStore((s) => s.selectComponent);

  // Resolve kind from URL, fallback to default
  const activeKind = (kind && VALID_KINDS.has(kind)) ? kind : DEFAULT_KIND;

  // Sync URL → store
  useEffect(() => {
    if (selectedKind !== activeKind) {
      selectComponent(activeKind);
    }
  }, [activeKind, selectedKind, selectComponent]);

  // Redirect "/" → "/line"
  useEffect(() => {
    if (!kind || !VALID_KINDS.has(kind)) {
      navigate(`/${DEFAULT_KIND}`, { replace: true });
    }
  }, [kind, navigate]);

  const fixtures = useMemo(
    () => FIXTURE_REGISTRY.filter((f) => f.seriesKind === activeKind),
    [activeKind],
  );

  const handleOpenEditor = useCallback(
    (fixtureId: string) => {
      navigate(`/editor/${fixtureId}/${fixtureId}`);
    },
    [navigate],
  );

  if (fixtures.length === 0) {
    return (
      <div data-testid="scene-demo-page" style={{ textAlign: 'center', padding: 48 }}>
        Loading...
      </div>
    );
  }

  return (
    <div data-testid="scene-demo-page">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {fixtures.map((fixture) => (
          <SceneDetail
            key={fixture.id}
            component={fixture.component}
            description={fixture.description}
            dsl={JSON.stringify(fixture.component, null, 2)}
            sceneId={fixture.id}
            componentId={fixture.id}
            onOpenEditor={() => handleOpenEditor(fixture.id)}
          />
        ))}
      </div>
    </div>
  );
}
