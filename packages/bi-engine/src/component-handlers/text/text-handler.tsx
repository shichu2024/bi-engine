// ============================================================================
// component-handlers/text/text-handler.tsx — 文本组件处理器
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
import type { TextComponent } from '../../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 语义模型
// ---------------------------------------------------------------------------

export interface TextSemanticModel {
  componentId: string;
  title: string | undefined;
  content: string;
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

const textValidator: ComponentValidator<TextComponent> = {
  validate(component: TextComponent): PipelineResult<ValidationOutput> {
    if (component.type !== 'text') {
      return {
        ok: false,
        error: { code: 'INVALID_COMPONENT_TYPE', message: 'Expected type "text".', stage: 'validation' },
      };
    }
    if (component.dataProperties.content === undefined || component.dataProperties.content === '') {
      return {
        ok: false,
        error: { code: 'MISSING_CONTENT', message: 'TextComponent requires dataProperties.content.', stage: 'validation' },
      };
    }
    return { ok: true, data: { warnings: [] } };
  },
};

// ---------------------------------------------------------------------------
// Normalizer
// ---------------------------------------------------------------------------

const textNormalizer: ComponentNormalizer<TextComponent> = {
  normalize(component: TextComponent): PipelineResult<NormalizedComponent> {
    return {
      ok: true,
      data: {
        id: component.id,
        type: 'text',
        properties: {
          title: component.dataProperties.title,
          content: component.dataProperties.content,
        },
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

const textResolver: ComponentResolver<TextComponent> = {
  resolve(component: TextComponent): PipelineResult<ResolvedData> {
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

const textModelBuilder: ComponentModelBuilder<TextComponent, TextSemanticModel> = {
  build(
    normalized: NormalizedComponent,
    _resolved: ResolvedData,
    _component: TextComponent,
  ): PipelineResult<TextSemanticModel> {
    return {
      ok: true,
      data: {
        componentId: normalized.id,
        title: normalized.properties.title as string | undefined,
        content: normalized.properties.content as string,
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

const textRenderer: ComponentRenderer<TextComponent, TextSemanticModel> = {
  render(model: TextSemanticModel, context: RenderContext): React.ReactNode {
    return (
      <div
        className={context.className}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', ...context.style }}
      >
        {model.title !== undefined && (
          <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{model.title}</div>
        )}
        <div>{model.content}</div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// 导出
// ---------------------------------------------------------------------------

export const textHandler: ComponentHandler<TextComponent, TextSemanticModel> = {
  type: 'text',
  validator: textValidator,
  normalizer: textNormalizer,
  resolver: textResolver,
  modelBuilder: textModelBuilder,
  renderer: textRenderer,
};
