import type { TextComponent } from '../../schema/bi-engine-models';

export const textBasic: TextComponent = {
  type: 'text',
  id: 'text-basic',
  dataProperties: {
    dataType: 'static',
    content: '这是一段文本内容，用于展示 Text 组件的基本渲染能力。',
  },
};
