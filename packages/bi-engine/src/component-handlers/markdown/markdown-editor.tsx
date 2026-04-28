// ============================================================================
// component-handlers/markdown/markdown-editor.tsx — 编辑模式组件
// ============================================================================

import { useRef, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import { useCanEditText } from '../../platform/render-mode';
import type { MarkdownSemanticModel } from './markdown-handler';
import type { RenderContext } from '../../platform/types';
import type { MarkdownComponent } from '../../schema/bi-engine-models';
import { MarkdownRenderer } from './markdown-renderer';

// ---------------------------------------------------------------------------
// 编辑器 Props
// ---------------------------------------------------------------------------

export interface MarkdownEditorProps {
  model: MarkdownSemanticModel;
  context: RenderContext;
  placeholder?: string;
  height?: number | string;
}

// ---------------------------------------------------------------------------
// 编辑器组件 — contentEditable 纯文本编辑，无边框
// ---------------------------------------------------------------------------

export const MarkdownEditor: FC<MarkdownEditorProps> = ({
  model,
  context,
  placeholder,
}) => {
  const canEdit = useCanEditText();
  const contentRef = useRef<HTMLDivElement>(null);

  // 非编辑模式降级为只读渲染
  if (!canEdit) {
    return (
      <MarkdownRenderer
        content={model.content}
        className={context.className}
        style={context.style}
        placeholder={placeholder}
      />
    );
  }

  return <EditableMarkdownContent model={model} context={context} contentRef={contentRef} />;
};

// ---------------------------------------------------------------------------
// 可编辑内容 — 与 text-handler 同模式的 contentEditable
// ---------------------------------------------------------------------------

interface EditableMarkdownContentProps {
  model: MarkdownSemanticModel;
  context: RenderContext;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

function EditableMarkdownContent({ model, context, contentRef }: EditableMarkdownContentProps): React.ReactElement {
  // 同步外部 model 变化到 DOM
  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== model.content) {
      contentRef.current.textContent = model.content;
    }
  }, [model.content, contentRef]);

  const commitChange = useCallback(() => {
    const newContent = contentRef.current?.innerText ?? '';
    const trimmedContent = newContent.trim();

    if (trimmedContent === model.content) return;
    if (trimmedContent === '') return;

    const newSchema: MarkdownComponent = {
      id: context.componentId,
      type: 'markdown',
      dataProperties: {
        dataType: 'static',
        content: trimmedContent,
      },
    };
    context.onChange?.(newSchema);
  }, [model.content, context]);

  const handleBlur = useCallback(() => {
    setTimeout(commitChange, 0);
  }, [commitChange]);

  return (
    <div
      className={context.className}
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: 'monospace',
        fontSize: 14,
        lineHeight: 1.6,
        ...context.style,
        height: undefined,
      }}
    >
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
