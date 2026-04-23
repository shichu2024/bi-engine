import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FIXTURE_REGISTRY } from 'bi-engine/testing';
import { Divider } from 'antd';
import { useComponentStore } from '@/stores';
import { ComponentOverview } from '@/components/demo/ComponentOverview';
import { SceneDetail } from '@/components/demo/SceneDetail';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<string, string> = {
  line: '折线图',
  bar: '柱状图',
  pie: '饼图',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SceneDemoPage(): React.ReactElement {
  const navigate = useNavigate();

  const selectedKind = useComponentStore((s) => s.selectedComponentId);
  const selectComponent = useComponentStore((s) => s.selectComponent);

  // Auto-select first category on mount
  useEffect(() => {
    if (!selectedKind) {
      selectComponent('line');
    }
  }, [selectedKind, selectComponent]);

  // All fixtures of the selected kind
  const fixtures = useMemo(
    () => FIXTURE_REGISTRY.filter((f) => f.seriesKind === selectedKind),
    [selectedKind],
  );

  const categoryLabel = CATEGORY_LABELS[selectedKind ?? ''] ?? selectedKind ?? '';

  const handleOpenEditor = useCallback(
    (fixtureId: string) => {
      navigate(`/editor/${fixtureId}/${fixtureId}`);
    },
    [navigate],
  );

  if (!selectedKind || fixtures.length === 0) {
    return (
      <div data-testid="scene-demo-page" style={{ textAlign: 'center', padding: 48 }}>
        Loading...
      </div>
    );
  }

  return (
    <div data-testid="scene-demo-page" style={{ padding: 24 }}>
      {/* Category overview */}
      <ComponentOverview
        componentName={categoryLabel}
        description={`${categoryLabel}相关场景演示，包含 ${fixtures.length} 个示例`}
        version="v0.0.1"
        tags={[categoryLabel]}
      />

      <Divider />

      {/* One scene per fixture, stacked vertically */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
