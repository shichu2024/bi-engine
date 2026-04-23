import type { Monaco } from '@monaco-editor/react';
import { dslSchema } from './dsl-schema';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DSL_SCHEMA_URI = 'bi-engine-dsl-schema.json';

// Track whether setup has already run to avoid re-registration.
let registered = false;

// ---------------------------------------------------------------------------
// setupMonacoDsl
// ---------------------------------------------------------------------------

/**
 * Register the BI Engine DSL JSON schema with Monaco so the editor provides
 * validation, hover descriptions and auto-completion based on the schema.
 *
 * Call this inside the `onMount` or `beforeMount` callback of the Monaco
 * `<Editor>` component (see DslEditor.tsx).
 */
export function setupMonacoDsl(monaco: Monaco): void {
  if (registered) {
    return;
  }
  registered = true;

  // ---- JSON validation via schema ----
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    schemas: [
      {
        uri: DSL_SCHEMA_URI,
        fileMatch: ['*'],
        schema: dslSchema as Record<string, unknown>,
      },
    ],
  });

  // ---- Additional completion items ----
  monaco.languages.registerCompletionItemProvider('json', {
    triggerCharacters: ['"', '.'],
    provideCompletionItems(
      model: Monaco['editor']['ITextModel'],
      position: Monaco['Position'],
    ) {
      const lineContent = model.getLineContent(position.lineNumber);
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const suggestions: Monaco['languages']['CompletionItem'][] = [];

      // Top-level key completions: suggest when user is typing a key inside the root object
      const isInsideRootKey =
        lineContent.trimStart().startsWith('"') &&
        !lineContent.includes(':');

      if (isInsideRootKey) {
        const topLevelKeys = [
          { key: 'type', doc: '组件类型（必填）' },
          { key: 'id', doc: '组件唯一标识符' },
          { key: 'layout', doc: '组件布局信息' },
          { key: 'dataProperties', doc: '组件数据属性配置' },
          { key: 'columns', doc: '数据列配置' },
          { key: 'series', doc: '图表系列配置' },
          { key: 'xAxis', doc: 'X 轴配置' },
          { key: 'yAxis', doc: 'Y 轴配置' },
          { key: 'options', doc: '图表扩展配置' },
          { key: 'interactions', doc: '交互配置列表' },
          { key: 'tables', doc: '子表格列表（compositeTable）' },
          { key: 'axisGroup', doc: '坐标轴分组键值' },
          { key: 'basicProperties', doc: '组件基础配置' },
          { key: 'advanceProperties', doc: '组件高级配置' },
        ];

        for (const { key, doc } of topLevelKeys) {
          suggestions.push({
            label: key,
            kind: monaco.languages.CompletionItemKind.Property,
            documentation: doc,
            insertText: `"${key}": `,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          });
        }
      }

      // Suggest chart sub-type values when the cursor is inside a "type" value
      const typeValueMatch = textUntilPosition.match(
        /"type"\s*:\s*"[^"]*$/,
      );
      if (typeValueMatch) {
        const typeValues = [
          'text',
          'table',
          'chart',
          'markdown',
          'compositeTable',
        ];
        for (const val of typeValues) {
          suggestions.push({
            label: val,
            kind: monaco.languages.CompletionItemKind.Value,
            documentation: `组件类型: ${val}`,
            insertText: `${val}"`,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          });
        }
      }

      // Suggest series type values
      const seriesTypeMatch = textUntilPosition.match(
        /"series"\s*:\s*\[[\s\S]*?"type"\s*:\s*"[^"]*$/,
      );
      if (seriesTypeMatch) {
        const seriesTypes = [
          'line',
          'bar',
          'pie',
          'scatter',
          'radar',
          'gauge',
          'candlestick',
        ];
        for (const val of seriesTypes) {
          suggestions.push({
            label: val,
            kind: monaco.languages.CompletionItemKind.Value,
            documentation: `系列类型: ${val}`,
            insertText: `${val}"`,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          });
        }
      }

      return { suggestions };
    },
  });
}
