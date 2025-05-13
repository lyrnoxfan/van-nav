```tsx
// src/App.tsx
import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { Spin } from 'antd';
import { decodeTheme, initTheme } from './utils/theme';
import './index.css'; // 全局样式，其中定义了 --bg-url 变量

// 懒加载页面组件
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const AdminPage = React.lazy(
  () => import('./pages/admin').then(module => ({ default: module.AdminPage }))
);
const Tools = React.lazy(
  () => import('./pages/admin/tabs/Tools').then(module => ({ default: module.Tools }))
);
const Catelog = React.lazy(
  () => import('./pages/admin/tabs/Catelog').then(module => ({ default: module.Catelog }))
);
const ApiToken = React.lazy(
  () => import('./pages/admin/tabs/ApiToken').then(module => ({ default: module.ApiToken }))
);
const Setting = React.lazy(
  () => import('./pages/admin/tabs/Setting').then(module => ({ default: module.Setting }))
);

// 加载中的占位组件，支持暗/亮主题
const LoadingFallback: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = initTheme();
    const decoded = decodeTheme(theme);
    setIsDarkMode(decoded.includes('dark'));

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.target instanceof HTMLElement) {
          setIsDarkMode(mutation.target.classList.contains('dark-mode'));
        }
      });
    });

    const bodyEl = document.querySelector('body');
    if (bodyEl) {
      observer.observe(bodyEl, { attributes: true, attributeFilter: ['class'] });
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : '#272e3b',
      }}
    >
      <Spin size="large" tip="加载中..." />
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // PC 端和移动端背景图 API
    const URL_PC = 'https://www.loliapi.com/acg/';      // PC 端背景图
    const URL_MOBILE = 'https://www.loliapi.com/acg/';  // 移动端背景图

    const apiUrl = window.innerWidth <= 768 ? URL_MOBILE : URL_PC;

    async function fetchBg() {
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        // 假设接口返回 JSON 数组
        const imgs: string[] = Array.isArray(data) ? data : data.urls;
        const randomUrl = imgs[Math.floor(Math.random() * imgs.length)];
        document.documentElement.style.setProperty(
          '--bg-url',
          `url('${randomUrl}')`
        );
      } catch (err) {
        console.error('加载背景失败', err);
      }
    }
    fetchBg();

    // 可选：监听窗口尺寸变化，重新加载背景
    const handleResize = () => {
      fetchBg();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AntApp>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminPage />}
            >
              <Route index element={<Tools />} />
              <Route path="tools" element={<Tools />} />
              <Route path="categories" element={<Catelog />} />
              <Route path="api-token" element={<ApiToken />} />
              <Route path="settings" element={<Setting />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AntApp>
  );
};

export default App;
```
