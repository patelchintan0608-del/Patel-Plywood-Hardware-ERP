import React, { useState, useEffect } from 'react';
import { Search, Bell, Clock, Menu, PlusCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import NotificationPopover from './NotificationPopover';
import '../styles/topbar.css';

const Topbar = ({ toggleSidebar }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="erp-topbar">
      <div className="topbar-left">
        <button className="icon-btn no-print" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={20} />
        </button>

        {/* Mobile Header Brand Title */}
        <div className="mobile-header-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'none', alignItems: 'center', gap: '6px' }}>
          <img src="/Furniture Erp Log.jpg" alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }} />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', letterSpacing: '-0.01em' }}>Patel ERP</span>
        </div>

        <div className="search-bar no-print">
          <Search className="search-icon" size={20} />
          <input type="text" placeholder="Search orders, quotes, customers..." />
        </div>
      </div>

      <div className="topbar-right no-print">
        <div className="topbar-time">
          <Clock size={18} />
          <span>{time}</span>
        </div>

        <button
          className="btn btn-primary topbar-new-quote-btn"
          onClick={() => navigate('/quotations/create')}
        >
          <PlusCircle size={18} />
          <span>New Quote</span>
        </button>

        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="badge-dot-count">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationPopover onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Mobile Profile Icon Button */}
        <button
          className="icon-btn mobile-profile-btn"
          onClick={() => navigate('/my-profile')}
          title="My Profile"
          aria-label="My Profile"
          style={{ display: 'none' }}
        >
          <User size={19} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
