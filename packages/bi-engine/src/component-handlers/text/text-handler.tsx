// ============================================================================
// component-handlers/text/text-handler.tsx — 文本组件处理器
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
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
    if (context.onChange) {
      return (
        <EditableTextRenderer model={model} context={context} />
      );
    }

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
// EditableTextRenderer — edit 模式：contentEditable 直接编辑 title 和 content
// ---------------------------------------------------------------------------

interface EditableTextRendererProps {
  model: TextSemanticModel;
  context: RenderContext;
}

function EditableTextRenderer({ model, context }: EditableTextRendererProps): React.ReactElement {
  // 通过 hook 判断是否可编辑：仅 edit 模式允许
  const canEdit = useCanEditText();

  if (!canEdit) {
    // chat/view 模式：只读渲染
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
  }
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 同步外部 model 变化到 DOM
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== (model.title ?? '')) {
      titleRef.current.textContent = model.title ?? '';
    }
  }, [model.title]);

  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== model.content) {
      contentRef.current.textContent = model.content;
    }
  }, [model.content]);

  const commitChange = useCallback(() => {
    const newTitle = titleRef.current?.textContent ?? '';
    const newContent = contentRef.current?.textContent ?? '';
    const trimmedTitle = newTitle.trim();
    const trimmedContent = newContent.trim();

    if (trimmedTitle === (model.title ?? '') && trimmedContent === model.content) return;
    if (trimmedContent === '') return;

    const newSchema: TextComponent = {
      id: context.componentId,
      type: 'text',
      dataProperties: {
        dataType: 'static',
        title: trimmedTitle || undefined,
        content: trimmedContent,
      },
    };
    context.onChange?.(newSchema);
  }, [model, context]);

  const handleBlur = useCallback(() => {
    // 使用 setTimeout 确保relatedTarget已设置（点击另一个editable时不会误触发）
    setTimeout(commitChange, 0);
  }, [commitChange]);

  return (
    <div
      className={context.className}
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...context.style,
        height: undefined,
      }}
    >
      {/* title — 仅在有内容时渲染 */}
      {model.title !== undefined && model.title !== '' && (
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          data-field="title"
          style={{
            fontWeight: 'bold',
            fontSize: 16,
            marginBottom: 8,
            outline: 'none',
            cursor: 'text',
          }}
        >
          {model.title}
        </div>
      )}
      {/* content — contentEditable */}
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        data-field="content"
        style={{
          outline: 'none',
          cursor: 'text',
        }}
      >
        {model.content}
      </div>
    </div>
  );
}

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
