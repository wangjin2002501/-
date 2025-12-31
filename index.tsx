
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Critical Error: #root element not found.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Application rendering crashed:", err);
    rootElement.innerHTML = `
      <div style="background:#09090b; color:#ef4444; padding:40px; font-family:monospace; height:100vh;">
        <h1 style="font-size:18px;">应用启动失败 (Render Crash)</h1>
        <p style="color:#71717a; font-size:12px; margin-top:10px;">错误详情: ${err instanceof Error ? err.message : '未知错误'}</p>
        <p style="color:#71717a; font-size:12px;">建议: 请检查 API 凭证或浏览器控制台日志。</p>
      </div>
    `;
  }
};

// 确保在 DOM 准备就绪后运行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
