import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('woodcraft_erp_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cached notifications:', e);
    }
    return [
      {
        id: 'notif-1',
        title: 'New Sales Order Received',
        message: 'Order #00001 confirmed by Prestige Hospitality.',
        type: 'orders',
        iconType: 'order',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        read: false,
        link: '/orders'
      },
      {
        id: 'notif-2',
        title: 'Low Stock Alert',
        message: 'Royal Teak Sunmica Sheet 8x4ft stock level below minimum threshold (8 left).',
        type: 'stock',
        iconType: 'stock',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        read: false,
        link: '/stocks'
      },
      {
        id: 'notif-3',
        title: 'Upcoming Lead Follow-up',
        message: 'Scheduled site visit with Rahul Patel at 01:30 PM today.',
        type: 'leads',
        iconType: 'lead',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        read: false,
        link: '/followups'
      },
      {
        id: 'notif-4',
        title: 'Quotation QN-0002 Issued',
        message: 'Quotation worth ₹1,45,000 generated for Modern Workspaces.',
        type: 'quotation',
        iconType: 'quotation',
        timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
        read: true,
        link: '/quotations'
      }
    ];
  });

  const [unreadCount, setUnreadCount] = useState(0);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('woodcraft_erp_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Fetch real-time data from backend to generate dynamic notifications
  const refreshNotifications = useCallback(async () => {
    try {
      const [orders, products, leads, quotes] = await Promise.all([
        api.getOrders().catch(() => []),
        api.getProducts().catch(() => []),
        api.getLeads().catch(() => []),
        api.getQuotations().catch(() => [])
      ]);

      const liveNotifs = [];

      // Check low stock
      const lowStockProducts = (products || []).filter(p => {
        const qty = Number(p.stockQuantity ?? p.stock ?? p.quantity ?? 0);
        return qty > 0 && qty <= 10;
      });

      lowStockProducts.slice(0, 3).forEach(p => {
        const id = `stock-${p.id || p._id}`;
        liveNotifs.push({
          id,
          title: `Low Stock: ${p.name || p.productName || 'Product'}`,
          message: `Only ${p.stockQuantity ?? p.stock ?? 5} units left in main warehouse.`,
          type: 'stock',
          iconType: 'stock',
          timestamp: new Date().toISOString(),
          read: false,
          link: '/stocks'
        });
      });

      // Check recent pending orders
      const pendingOrders = (orders || []).filter(o => o.status === 'Pending' || o.status === 'Dispatched');
      pendingOrders.slice(0, 3).forEach(o => {
        const id = `order-${o.id || o._id}`;
        liveNotifs.push({
          id,
          title: `Order #${o.orderNumber || o.id} (${o.status})`,
          message: `${o.customerName} - Total: ₹${Number(o.totalAmount || 0).toLocaleString('en-IN')}`,
          type: 'orders',
          iconType: 'order',
          timestamp: new Date().toISOString(),
          read: false,
          link: '/orders'
        });
      });

      // Check leads with upcoming follow-ups
      const leadsWithFollowups = (leads || []).filter(l => l.nextFollowUp || (l.followUps && l.followUps.length > 0));
      leadsWithFollowups.slice(0, 2).forEach(l => {
        const id = `lead-${l.id || l._id}`;
        liveNotifs.push({
          id,
          title: `Follow-up: ${l.contactPerson || l.leadName}`,
          message: `Interest: ${l.productInterest || 'Furniture'} • Status: ${l.status}`,
          type: 'leads',
          iconType: 'lead',
          timestamp: new Date().toISOString(),
          read: false,
          link: '/followups'
        });
      });

      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newItems = liveNotifs.filter(n => !existingIds.has(n.id));
        if (newItems.length === 0) return prev;
        return [...newItems, ...prev];
      });
    } catch (err) {
      console.error('Error in refreshNotifications:', err);
    }
  }, []);

  // Poll for new live notifications every 20 seconds
  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 20000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const addNotification = (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
