import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { initTestModeFromUrl } from './test-mode';

// 在 React 渲染之前激活测试模式，使图表组件
// 在首次挂载时就使用 SVG 渲染器并禁用动画。
initTestModeFromUrl();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
