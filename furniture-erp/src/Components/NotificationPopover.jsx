import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Info,
  X,
  ExternalLink
} from 'lucide-react';
import '../styles/notificationPopover.css';

const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Just now';
  const date = new Date(isoString);
  const now = new Date();
  const diffSecs = Math.floor((now - date) / 1000);

  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getIconForType = (type) => {
  switch (type) {
    case 'stock':
      return { icon: <Package size={16} />, className: 'icon-stock', bg: '#fef3c7', color: '#d97706' };
    case 'orders':
      return { icon: <ShoppingCart size={16} />, className: 'icon-order', bg: '#eff6ff', color: '#2563eb' };
    case 'leads':
      return { icon: <Users size={16} />, className: 'icon-lead', bg: '#f3e8ff', color: '#9333ea' };
    case 'quotation':
      return { icon: <FileText size={16} />, className: 'icon-quotation', bg: '#ecfdf5', color: '#059669' };
    default:
      return { icon: <Info size={16} />, className: 'icon-system', bg: '#f1f5f9', color: '#475569' };
  }
};

const NotificationPopover = ({ onClose }) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'orders') return n.type === 'orders';
    if (activeTab === 'stock') return n.type === 'stock';
    if (activeTab === 'leads') return n.type === 'leads';
    return true;
  });

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    let targetLink = notif.link;
    if (!targetLink) {
      if (notif.type === 'orders') targetLink = '/orders';
      else if (notif.type === 'stock') targetLink = '/stocks';
      else if (notif.type === 'leads') targetLink = '/followups';
      else if (notif.type === 'quotation') targetLink = '/quotations';
      else targetLink = '/dashboard';
    }
    if (targetLink === '/leads/followups') targetLink = '/followups';
    if (targetLink === '/products') targetLink = '/stocks';

    navigate(targetLink);
    if (onClose) onClose();
  };

  return (
    <div className="notif-popover-container" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="notif-popover-header">
        <div className="notif-header-title-group">
          <Bell size={18} className="notif-bell-icon" />
          <h4 className="notif-header-title">Notifications</h4>
          {unreadCount > 0 && (
            <span className="notif-header-badge">{unreadCount} new</span>
          )}
        </div>
        <div className="notif-header-actions">
          {unreadCount > 0 && (
            <button
              className="notif-action-btn"
              onClick={markAllAsRead}
              title="Mark all as read"
            >
              <CheckCheck size={15} />
              <span>Mark read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="notif-action-btn danger"
              onClick={clearAllNotifications}
              title="Clear all notifications"
            >
              <Trash2 size={15} />
            </button>
          )}
          {onClose && (
            <button className="notif-close-btn" onClick={onClose} title="Close">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="notif-filter-tabs">
        <button
          className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`notif-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`notif-tab ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          Stock
        </button>
        <button
          className={`notif-tab ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          Leads
        </button>
      </div>

      {/* Notifications List */}
      <div className="notif-list-scroll">
        {filteredNotifications.length === 0 ? (
          <div className="notif-empty-state">
            <div className="notif-empty-icon">🔔</div>
            <p className="notif-empty-title">No notifications</p>
            <p className="notif-empty-desc">You're all caught up with your ERP activities!</p>
          </div>
        ) : (
          filteredNotifications.map(n => {
            const iconConfig = getIconForType(n.type || n.iconType);
            return (
              <div
                key={n.id}
                className={`notif-item ${!n.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(n)}
              >
                <div
                  className="notif-item-icon-box"
                  style={{ background: iconConfig.bg, color: iconConfig.color }}
                >
                  {iconConfig.icon}
                </div>

                <div className="notif-item-content">
                  <div className="notif-item-top">
                    <span className="notif-item-title">{n.title}</span>
                    <span className="notif-item-time">{formatRelativeTime(n.timestamp)}</span>
                  </div>
                  <p className="notif-item-msg">{n.message}</p>

                  {n.link && (
                    <span className="notif-item-link-hint">
                      View details <ExternalLink size={11} />
                    </span>
                  )}
                </div>

                {!n.read && <span className="notif-unread-dot" title="Unread" />}

                <button
                  className="notif-item-dismiss"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(n.id);
                  }}
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="notif-popover-footer">
        <span className="notif-footer-text">Real-time ERP Synchronization Active • 🟢 Online</span>
      </div>
    </div>
  );
};

export default NotificationPopover;
