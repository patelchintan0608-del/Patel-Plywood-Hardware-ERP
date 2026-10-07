import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Plus,
  BarChart2,
  Menu,
  FileText,
  ShoppingCart,
  Users,
  Target,
  Boxes,
  CreditCard,
  X
} from 'lucide-react';
import '../styles/bottomNav.css';

const MobileBottomNav = ({ toggleSidebar }) => {
  const [showQuickSheet, setShowQuickSheet] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleActionClick = (path) => {
    setShowQuickSheet(false);
    navigate(path);
  };

  const quickActions = [
    {
      title: 'Quotation',
      desc: 'New Quote',
      path: '/quotations/create',
      icon: FileText,
      color: '#2563eb',
      bg: '#eff6ff'
    },
    {
      title: 'Sales Order',
      desc: 'Create Order',
      path: '/orders',
      icon: ShoppingCart,
      color: '#10b981',
      bg: '#ecfdf5'
    },
    {
      title: 'Customer',
      desc: 'Add Client',
      path: '/customers',
      icon: Users,
      color: '#d97706',
      bg: '#fffbeb'
    },
    {
      title: 'Lead / CRM',
      desc: 'New Lead',
      path: '/leads',
      icon: Target,
      color: '#8b5cf6',
      bg: '#f5f3ff'
    },
    {
      title: 'Add Stock',
      desc: 'Inventory',
      path: '/inventory',
      icon: Boxes,
      color: '#0284c7',
      bg: '#f0f9ff'
    },
    {
      title: 'Payments',
      desc: 'Ledger',
      path: '/reports?tab=finance',
      icon: CreditCard,
      color: '#059669',
      bg: '#ecfdf5'
    }
  ];

  return (
    <>
      <nav className="mobile-bottom-nav no-print" aria-label="Mobile Navigation Bar">
        {/* 1. Home / Dashboard */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <Home size={20} />
          </div>
          <span>Home</span>
        </NavLink>

        {/* 2. Orders */}
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive || location.pathname.includes('/orders') ? 'active' : ''}`
          }
        >
          <div className="nav-icon-wrapper">
            <Package size={20} />
          </div>
          <span>Orders</span>
        </NavLink>

        {/* 3. Floating Quick Add (+) */}
        <button
          className="bottom-nav-add-btn"
          onClick={() => setShowQuickSheet(true)}
          aria-label="Quick Create Action"
        >
          <div className="add-circle-btn">
            <Plus size={24} />
          </div>
          <span className="add-btn-label">Create</span>
        </button>

        {/* 4. Reports */}
        <NavLink
          to="/reports"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <BarChart2 size={20} />
          </div>
          <span>Reports</span>
        </NavLink>

        {/* 5. Menu / Sidebar Toggle */}
        <button
          className="bottom-nav-item"
          onClick={toggleSidebar}
          aria-label="Open Full Menu"
        >
          <div className="nav-icon-wrapper">
            <Menu size={20} />
          </div>
          <span>Menu</span>
        </button>
      </nav>

      {/* Quick Action Bottom Sheet Modal */}
      {showQuickSheet && (
        <div
          className="quick-action-backdrop no-print"
          onClick={() => setShowQuickSheet(false)}
        >
          <div
            className="quick-action-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quick-action-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#b87333" />
                <h3 className="quick-action-title">Create New Record</h3>
              </div>
              <button
                className="quick-action-close"
                onClick={() => setShowQuickSheet(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="quick-action-grid">
              {quickActions.map((action, idx) => {
                const ActionIcon = action.icon;
                return (
                  <div
                    key={idx}
                    className="quick-action-item"
                    onClick={() => handleActionClick(action.path)}
                  >
                    <div
                      className="quick-action-icon"
                      style={{ backgroundColor: action.color }}
                    >
                      <ActionIcon size={20} />
                    </div>
                    <span>{action.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
