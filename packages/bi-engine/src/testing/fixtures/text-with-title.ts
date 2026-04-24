import type { TextComponent } from '../../schema/bi-engine-models';

export const textWithTitle: TextComponent = {
  type: 'text',
  id: 'text-with-title',
  dataProperties: {
    dataType: 'static',
    title: '文本标题',
    content: '带标题的文本内容。',
  },
};
