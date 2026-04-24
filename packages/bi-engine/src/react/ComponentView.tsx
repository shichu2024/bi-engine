// ============================================================================
// react/ComponentView.tsx — 统一组件视图
// ============================================================================

import { useMemo, useEffect } from 'react';
import type { BIEngineComponent } from '../schema/bi-engine-models';
import { getComponentHandler } from '../platform/component-registry';
import { defaultPipelineEngine } from '../pipeline/pipeline-engine';
import { useRenderMode, RenderMode } from '../platform/render-mode';
import { DEFAULT_THEME_TOKENS } from '../theme/theme-tokens';
import type { ComponentError, RenderContext } from '../platform/types';
import { DesignableWrapper } from './DesignableWrapper';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ComponentViewProps {
  /** 待渲染的组件（任意类型） */
  component: BIEngineComponent;
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: ComponentError) => void;
  /** 设计态选中回调 */
  onSelect?: (componentId: string) => void;
}

// ---------------------------------------------------------------------------
// ComponentView
// ---------------------------------------------------------------------------

/**
 * 统一组件视图。
 *
 * 根据 component.type 从 ComponentRegistry 获取处理器，
 * 执行管线 (validate → normalize → resolve → buildModel)，
 * 然后调用 renderer.render() 输出 React 节点。
 */
export function ComponentView({
  component,
  className,
  style,
  onError,
  onSelect,
}: ComponentViewProps): React.ReactNode {
  const mode = useRenderMode();

  // 1. 获取处理器
  const handler = useMemo(
    () => getComponentHandler(component.type),
    [component.type],
  );

  // 2. 执行管线
  const pipelineResult = useMemo(() => {
    if (handler === undefined) return null;
    return defaultPipelineEngine.execute(component);
  }, [component, handler]);

  // 3. 提取首个错误
  const firstError = useMemo((): ComponentError | null => {
    if (handler === undefined) {
      return {
        code: 'UNSUPPORTED_COMPONENT_TYPE',
        message: `Component type "${component.type}" is not registered.`,
        stage: 'rendering',
      };
    }
    if (pipelineResult === null) return null;
    return (
      pipelineResult.validation.error ??
      pipelineResult.normalization.error ??
      pipelineResult.resolution.error ??
      pipelineResult.model.error ??
      null
    );
  }, [handler, pipelineResult, component.type]);

  // 4. 触发错误回调
  useEffect(() => {
    if (firstError !== null) {
      onError?.(firstError);
    }
  }, [firstError, onError]);

  // 5. 错误解围
  if (firstError !== null) {
    return <ErrorFallback code={firstError.code} message={firstError.message} />;
  }

  // 6. 构建渲染上下文
  const renderContext: RenderContext = {
    mode,
    theme: DEFAULT_THEME_TOKENS,
    componentId: component.id,
    className,
    style,
  };

  // 7. 渲染
  const rendered = handler!.renderer.render(pipelineResult!.model.data!, renderContext);

  // 8. 设计态包装
  if (mode === RenderMode.DESIGN) {
    return (
      <DesignableWrapper
        componentId={component.id}
        className={className}
        style={style}
        onClick={onSelect}
      >
        {rendered}
      </DesignableWrapper>
    );
  }

  return <>{rendered}</>;
}

// ---------------------------------------------------------------------------
// ErrorFallback
// ---------------------------------------------------------------------------

function ErrorFallback({ code, message }: { code: string; message: string }) {
  return (
    <div style={{ padding: 16, border: '1px solid #ff4d4f', borderRadius: 4 }}>
      <div style={{ fontWeight: 'bold', color: '#ff4d4f' }}>{code}</div>
      <div style={{ marginTop: 4, color: '#666' }}>{message}</div>
    </div>
  );
}
