import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header/BaseHeader';
import { Sidebar } from './Sider/BaseSider';
import { useUI } from '@/redux/hooks/useUI';


export const Layout: React.FC = () => {
  const { theme } = useUI();

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto transition-all duration-200 ease-in-out bg-background">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
