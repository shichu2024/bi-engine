import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUnifiedFixturesByKind } from 'bi-engine/testing';
import { useComponentStore } from '@/stores';
import { SceneDetail } from '@/components/demo/SceneDetail';

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

const VALID_KINDS = new Set(['line', 'bar', 'pie', 'scatter', 'radar', 'candlestick', 'gauge', 'table', 'text']);
const DEFAULT_KIND = 'line';

// ---------------------------------------------------------------------------
// 主页面组件
// ---------------------------------------------------------------------------

export function SceneDemoPage(): React.ReactElement {
  const navigate = useNavigate();
  const { kind } = useParams<{ readonly kind: string }>();

  const selectedKind = useComponentStore((s) => s.selectedComponentId);
  const selectComponent = useComponentStore((s) => s.selectComponent);

  // 从 URL 解析 kind，回退到默认值
  const activeKind = (kind && VALID_KINDS.has(kind)) ? kind : DEFAULT_KIND;

  // 同步 URL → store
  useEffect(() => {
    if (selectedKind !== activeKind) {
      selectComponent(activeKind);
    }
  }, [activeKind, selectedKind, selectComponent]);

  // 重定向 "/" → "/line"
  useEffect(() => {
    if (!kind || !VALID_KINDS.has(kind)) {
      navigate(`/${DEFAULT_KIND}`, { replace: true });
    }
  }, [kind, navigate]);

  const fixtures = useMemo(
    () => getUnifiedFixturesByKind(activeKind as 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'candlestick' | 'gauge' | 'table'),
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
