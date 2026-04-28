import type { MarkdownComponent } from '../../schema/bi-engine-models';

export const markdownBasic: MarkdownComponent = {
  type: 'markdown',
  id: 'markdown-basic',
  dataProperties: {
    dataType: 'static',
    content: [
      '# Markdown 示例',
      '',
      '这是一段 **加粗** 和 *斜体* 文本。',
      '',
      '## 列表',
      '',
      '- 无序列表项 1',
      '- 无序列表项 2',
      '',
      '1. 有序列表项 1',
      '2. 有序列表项 2',
      '',
      '> 这是一段引用文本',
      '',
      '---',
      '',
      '行内代码：`const x = 1`',
      '',
      '链接：[OpenAI](https://openai.com)',
    ].join('\n'),
  },
};
