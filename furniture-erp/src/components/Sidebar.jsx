import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Sun,
  Moon,
  User,
  ChevronDown
} from 'lucide-react';
import sidebarSections from '../config/sidebarItems';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../services/authService';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useAuth();
  const currentUser = getCurrentUser();
  const user = authContext?.user || currentUser;
  const hasPermission = authContext?.hasPermission || (() => true);
  const logout = authContext?.logout || (() => {});

  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of PATEL PLYWOOD & HARDWARE ERP?')) {
      logout();
      navigate('/login');
    }
  };

  const toggleTheme = (mode) => {
    setIsDarkMode(mode === 'dark');
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleSection = (sectionTitle) => {
    if (!sectionTitle) return;
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const userRole = (user?.role || currentUser?.role || '').toLowerCase();
  const userEmail = (user?.email || currentUser?.email || '').toLowerCase();

  const isAdmin =
    !user ||
    userRole === 'admin' ||
    userRole === 'superadmin' ||
    userRole === 'administrator' ||
    userRole.includes('admin') ||
    userEmail === 'patelchintan0608@gmail.com' ||
    userEmail === 'admin@patelplywood.com' ||
    userEmail === 'chintan.patel@patelplywood.com';

  const isQuotationEmp = !isAdmin && (userRole === 'quotation_employee' || (user?.employeeType || '').toLowerCase() === 'quotation_employee');
  const isDeliveryEmp = !isAdmin && (userRole === 'delivery_employee' || (user?.employeeType || '').toLowerCase() === 'delivery_employee');

  const dashboardTarget = isQuotationEmp
    ? '/quotation-dashboard'
    : isDeliveryEmp
    ? '/delivery-dashboard'
    : '/';

  // Helper to check permission for an item
  const checkPermission = (perm) => {
    if (isAdmin) return true;
    if (!perm) return true;
    if (hasPermission(perm)) return true;
    return false;
  };

  const sectionsList = Array.isArray(sidebarSections) ? sidebarSections : [];

  return (
    <aside id="sidebar" className={`sidebar erp-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>

      {/* Sidebar Header / Logo */}
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <div
            className="brand-icon"
            onClick={toggleCollapse}
            style={{ cursor: 'pointer' }}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <img src="/Furniture Erp Log.jpg" alt="Patel Plywood & Hardware" className="brand-img" />
            <span className="brand-live-dot" />
          </div>
          {!isCollapsed && (
            <div className="brand-details brand-text">
              <span className="brand-title">PATEL PLYWOOD </span>
              <span className="brand-subtitle-1">& HARDWARE</span>
              <span className="brand-subtitle-2">ERP</span>
            </div>
          )}
        </div>

        <button
          className="sidebar-toggle-btn"
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Quick Search Filter */}
      {!isCollapsed && (
        <div className="sidebar-search-container">
          <div className="search-input-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="menu-search-input"
            />
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="sidebar-nav" id="navigation-container">
        {sectionsList.map((sec, secIdx) => {
          const items = Array.isArray(sec?.items) ? sec.items : [];
          
          // Filter items based on permissions and search query
          const validItems = items.filter((item) => {
            if (!item) return false;
            if (!checkPermission(item.permission)) return false;
            if (searchQuery.trim()) {
              return item.label && item.label.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return true;
          });

          if (validItems.length === 0) return null;

          const sectionKey = sec.title ? `sec-${sec.title}` : `sec-standalone-${secIdx}`;

          // If standalone item (e.g. Dashboard)
          if (!sec.title) {
            return (
              <div key={sectionKey} className="nav-section">
                {validItems.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const targetPath = item.path === '/' ? dashboardTarget : item.path;
                  const itemKey = `item-standalone-${item.label || itemIdx}`;
                  return (
                    <NavLink
                      key={itemKey}
                      to={targetPath}
                      end={item.path === '/'}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="nav-item-content">
                        {Icon && (
                          <div className="nav-icon menu-icon">
                            <Icon size={18} />
                          </div>
                        )}
                        {!isCollapsed && <span className="menu-label">{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className="badge badge-live">{item.badge}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          }

          const isSectionFolded = !searchQuery.trim() && Boolean(collapsedSections[sec.title]);

          return (
            <div key={sectionKey} className="nav-section">
              {!isCollapsed && (
                <div
                  className="nav-section-header"
                  onClick={() => toggleSection(sec.title)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '0.4rem 0.75rem 0.25rem'
                  }}
                >
                  <span className="nav-section-label section-title" style={{ padding: 0 }}>
                    {sec.title}
                  </span>
                  <ChevronDown
                    size={12}
                    style={{
                      color: '#94a3b8',
                      transition: 'transform 0.2s ease',
                      transform: isSectionFolded ? 'rotate(-90deg)' : 'rotate(0deg)'
                    }}
                  />
                </div>
              )}

              {!isSectionFolded && (
                <div className="nav-section-items" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {validItems.map((item, itemIdx) => {
                    const Icon = item.icon;
                    const targetPath = item.path || '/';
                    const currentFullPath = location.pathname + location.search;

                    let isActive = false;
                    if (targetPath.includes('?')) {
                      isActive = currentFullPath === targetPath;
                    } else if (targetPath === '/employees') {
                      isActive = location.pathname === '/employees' && (!location.search || location.search.includes('tab=list'));
                    } else {
                      isActive = location.pathname === targetPath || (targetPath !== '/' && location.pathname.startsWith(targetPath.split('?')[0]) && targetPath.split('?')[0] !== '/');
                    }

                    const itemKey = `item-${sec.title}-${item.label || itemIdx}`;

                    return (
                      <NavLink
                        key={itemKey}
                        to={targetPath}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div className="nav-item-content">
                          {Icon && (
                            <div className="nav-icon menu-icon">
                              <Icon size={16} />
                            </div>
                          )}
                          {!isCollapsed && <span className="menu-label">{item.label}</span>}
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* SYSTEM SECTION */}
        <div className="nav-section" key="sec-system">
          {!isCollapsed && <p className="nav-section-label section-title" style={{ marginTop: '0.5rem' }}>SYSTEM</p>}

          <NavLink
            key="item-system-profile"
            to="/my-profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? 'My Profile' : undefined}
          >
            <div className="nav-item-content">
              <div className="nav-icon menu-icon">
                <User size={18} />
              </div>
              {!isCollapsed && <span className="menu-label">My Profile</span>}
            </div>
          </NavLink>
        </div>
      </div>

      {/* Footer / Theme & User Profile */}
      <div className="sidebar-footer">

        {/* Dark / Light Mode Switcher */}
        {!isCollapsed && (
          <div className="theme-switcher-container">
            <button
              onClick={() => toggleTheme('light')}
              className={`theme-btn ${!isDarkMode ? 'active' : ''}`}
            >
              <Sun size={14} />
              <span>Light</span>
            </button>
            <button
              onClick={() => toggleTheme('dark')}
              className={`theme-btn ${isDarkMode ? 'active' : ''}`}
            >
              <Moon size={14} />
              <span>Dark</span>
            </button>
          </div>
        )}

        {/* User Profile Card */}
        <div className="user-profile-card">
          <div className="user-avatar-wrapper" onClick={() => navigate('/my-profile')} style={{ cursor: 'pointer' }}>
            <div className="user-avatar" style={{ padding: 0, overflow: 'hidden' }} title={isCollapsed ? `${user?.name || 'User'}` : undefined}>
              <img
                src={
                  user?.avatar ||
                  user?.photo ||
                  user?.profilePhoto ||
                  (userEmail === 'rp2568@gmail.com' ? '/RP_profile.jpg' : '/Chintan06image.jpeg')
                }
                alt={user?.name || 'user profile'}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = userEmail === 'rp2568@gmail.com' ? '/RP_profile.jpg' : '/Chintan06image.jpeg';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <span className="online-indicator" />
          </div>
          {!isCollapsed && (
            <div className="user-info brand-text" onClick={() => navigate('/my-profile')} style={{ cursor: 'pointer' }}>
              <h4 className="user-name">{user?.name || (userEmail === 'rp2568@gmail.com' ? 'Rahul Patel' : 'Chintan Patel')}</h4>
              <p className="user-role" style={{ textTransform: 'capitalize' }}>
                {user?.role ? user.role.replace(/_/g, ' ') : 'Sales Executive'}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="logout-btn"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>

      </div>

    </aside>
  );
};

export default Sidebar;
