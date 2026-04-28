// ============================================================================
// component-handlers/markdown/markdown-handler.tsx — Markdown 组件处理器
// ============================================================================

import type {
  ComponentHandler,
  ComponentValidator,
  ComponentNormalizer,
  ComponentResolver,
  ComponentModelBuilder,
  ComponentRenderer,
  PipelineResult,
  ValidationOutput,
  NormalizedComponent,
  ResolvedData,
  RenderContext,
} from '../../platform/types';
import { useCanEditText } from '../../platform/render-mode';
import type { MarkdownComponent } from '../../schema/bi-engine-models';
import { MarkdownRenderer } from './markdown-renderer';
import { MarkdownEditor } from './markdown-editor';

// ---------------------------------------------------------------------------
// 语义模型
// ---------------------------------------------------------------------------

export interface MarkdownSemanticModel {
  componentId: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

const markdownValidator: ComponentValidator<MarkdownComponent> = {
  validate(component: MarkdownComponent): PipelineResult<ValidationOutput> {
    if (component.type !== 'markdown') {
      return {
        ok: false,
        error: { code: 'INVALID_COMPONENT_TYPE', message: 'Expected type "markdown".', stage: 'validation' },
      };
    }
    if (component.dataProperties.content === undefined || component.dataProperties.content === '') {
      return {
        ok: false,
        error: { code: 'MISSING_CONTENT', message: 'MarkdownComponent requires dataProperties.content.', stage: 'validation' },
      };
    }
    return { ok: true, data: { warnings: [] } };
  },
};

// ---------------------------------------------------------------------------
// Normalizer
// ---------------------------------------------------------------------------

const markdownNormalizer: ComponentNormalizer<MarkdownComponent> = {
  normalize(component: MarkdownComponent): PipelineResult<NormalizedComponent> {
    return {
      ok: true,
      data: {
        id: component.id,
        type: 'markdown',
        properties: {
          content: component.dataProperties.content,
        },
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

const markdownResolver: ComponentResolver<MarkdownComponent> = {
  resolve(component: MarkdownComponent): PipelineResult<ResolvedData> {
    return {
      ok: true,
      data: {
        dataType: 'static',
        data: component.dataProperties.content,
      },
    };
  },
};

// ---------------------------------------------------------------------------
// ModelBuilder
// ---------------------------------------------------------------------------

const markdownModelBuilder: ComponentModelBuilder<MarkdownComponent, MarkdownSemanticModel> = {
  build(
    normalized: NormalizedComponent,
    _resolved: ResolvedData,
    _component: MarkdownComponent,
  ): PipelineResult<MarkdownSemanticModel> {
    return {
      ok: true,
      data: {
        componentId: normalized.id,
        content: normalized.properties.content as string,
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Renderer — 根据是否有 onChange 和 edit 模式选择渲染路径
// ---------------------------------------------------------------------------

function MarkdownRendererWrapper({
  model,
  context,
}: {
  model: MarkdownSemanticModel;
  context: RenderContext;
}): React.ReactElement {
  const canEdit = useCanEditText();

  if (context.onChange && canEdit) {
    const height = context.style?.height as number | string | undefined;
    return <MarkdownEditor model={model} context={context} height={height} />;
  }

  return (
    <MarkdownRenderer
      content={model.content}
      className={context.className}
      style={context.style}
    />
  );
}

const markdownRenderer: ComponentRenderer<MarkdownComponent, MarkdownSemanticModel> = {
  render(model: MarkdownSemanticModel, context: RenderContext): React.ReactNode {
    return <MarkdownRendererWrapper model={model} context={context} />;
  },
};

// ---------------------------------------------------------------------------
// 导出
// ---------------------------------------------------------------------------

export const markdownHandler: ComponentHandler<MarkdownComponent, MarkdownSemanticModel> = {
  type: 'markdown',
  validator: markdownValidator,
  normalizer: markdownNormalizer,
  resolver: markdownResolver,
  modelBuilder: markdownModelBuilder,
  renderer: markdownRenderer,
};
