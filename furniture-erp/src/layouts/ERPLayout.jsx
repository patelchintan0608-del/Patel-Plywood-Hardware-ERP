import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Topbar from '../Components/Topbar';
import MobileBottomNav from '../Components/MobileBottomNav';
import '../styles/layout.css';
import '../styles/responsive.css';

const ERPLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('woodcraft_sidebar_collapsed') === 'true';
  });
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('woodcraft_sidebar_collapsed', String(next));
      return next;
    });
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('woodcraft_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className={`erp-layout ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
          className="mobile-sidebar-backdrop"
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />
      
      <div className="main-content erp-main-wrapper">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="erp-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile-first bottom navigation bar */}
      <MobileBottomNav toggleSidebar={toggleSidebar} />
    </div>
  );
};

export default ERPLayout;
