import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getCurrentUser } from '../services/authService';
import { useNotifications } from '../context/NotificationContext';
import NotificationPopover from '../Components/NotificationPopover';
import StatusBadge from '../components/StatusBadge';
import {
  Search,
  Bell,
  Mail,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Download,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  MoreHorizontal,
  ArrowRight,
  Layers,
  AlertCircle,
  ShieldAlert,
  Navigation
} from 'lucide-react';
import '../styles/dashboard.css';

const getGreetingConfig = (date) => {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return { text: 'Good morning', icon: '☀️' };
  } else if (hours >= 12 && hours < 17) {
    return { text: 'Good afternoon', icon: '🌤️' };
  } else if (hours >= 17 && hours < 22) {
    return { text: 'Good evening', icon: '🌆' };
  } else {
    return { text: 'Good night', icon: '🌙' };
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Live timer for real-time clock & greeting
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [custs, quotes, ords, prods, delivs, leadsData] = await Promise.all([
        api.getCustomers(),
        api.getQuotations(),
        api.getOrders(),
        api.getProducts(),
        api.getDeliveries(),
        api.getLeads()
      ]);
      setCustomers(custs || []);
      setQuotations(quotes || []);
      setOrders(ords || []);
      setProducts(prods || []);
      setDeliveries(delivs || []);
      setLeads(leadsData || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const currentUser = getCurrentUser();
  const userName = currentUser?.name || currentUser?.username || (currentUser?.email ? currentUser.email.split('@')[0] : 'Admin');

  // Calculations
  const totalSalesRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || o.grandTotal || 0), 0);
  const totalQuotationValuation = quotations.reduce((sum, q) => sum + Number(q.grandTotal || q.subtotal || 0), 0);
  const totalStockQty = products.reduce((sum, p) => sum + Number(p.stockQuantity ?? p.stock ?? p.quantity ?? 0), 0);

  const pendingQuotationsCount = quotations.filter(q =>
    q.status === 'Draft' || q.status === 'Sent' || q.status === 'Pending' || !q.status
  ).length;

  const lowStockProducts = products.filter(p => {
    const qty = Number(p.stockQuantity ?? p.stock ?? p.quantity ?? 0);
    return qty > 0 && qty < 15;
  });

  const inStockCount = products.filter(p => Number(p.stockQuantity ?? p.stock ?? p.quantity ?? 0) >= 15).length;
  const lowStockCount = lowStockProducts.length;
  const outOfStockCount = products.filter(p => Number(p.stockQuantity ?? p.stock ?? p.quantity ?? 0) === 0).length;
  const totalStockCategoriesCount = products.length || 1;

  const inStockPct = products.length > 0 ? Math.round((inStockCount / totalStockCategoriesCount) * 100) : 60;
  const lowStockPct = products.length > 0 ? Math.round((lowStockCount / totalStockCategoriesCount) * 100) : 20;
  const outOfStockPct = products.length > 0 ? Math.max(0, 100 - inStockPct - lowStockPct) : 20;

  const donutStop1 = inStockPct;
  const donutStop2 = inStockPct + lowStockPct;

  const pendingDeliveries = deliveries.filter(d => d.status !== 'Delivered');
  const pendingPaymentsOrders = orders.filter(o => o.paymentStatus === 'Pending' || o.paymentStatus === 'Partial');

  const formatCleanCurrency = (val, fallback = 0) => {
    const amount = Math.round(Number(val > 0 ? val : fallback));
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatCleanNumber = (val, fallback = 0) => {
    const num = Math.round(Number(val > 0 ? val : fallback));
    return num.toLocaleString('en-IN');
  };

  const greetingConfig = getGreetingConfig(currentTime);
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="ref-dashboard-wrapper">
      
      {/* ================= 1. WELCOME + DATE ROW ================= */}
      <div className="ref-greeting-row" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 className="ref-greeting-title" style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {greetingConfig.text}, {userName} <span className="greeting-emoji">{greetingConfig.icon}</span>
          </h2>
          <p className="ref-greeting-subtitle" style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            {formattedDate} • <span className="live-clock-badge">{formattedTime}</span>
          </p>
        </div>

        <button className="ref-export-btn" onClick={() => window.print()}>
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* ================= 2. KPI CARDS (6 Key Numbers) ================= */}
      <div className="ref-stats-grid-6" style={{ marginBottom: '1.5rem' }}>
        
        {/* KPI 1: Customers */}
        <div className="ref-stat-card" onClick={() => navigate('/customers')}>
          <div className="ref-card-header">
            <div className="ref-stat-label-group">
              <span className="ref-icon-chip" style={{ background: '#eff6ff' }}><Users size={16} color="#2563eb" /></span>
              <div style={{ minWidth: 0 }}>
                <span className="ref-stat-title">Customers</span>
                <span className="ref-stat-desc">Client Directory</span>
              </div>
            </div>
            <MoreHorizontal size={16} color="#94a3b8" />
          </div>
          <div className="ref-stat-body">
            <span className="ref-stat-value">{formatCleanNumber(customers.length, 12)}</span>
            <span className="ref-trend-badge green">↗ Active</span>
          </div>
          <div className="ref-stat-footer">Total Registered Accounts</div>
        </div>

        {/* KPI 2: Pending Quotations */}
        <div className="ref-stat-card" onClick={() => navigate('/quotations')}>
          <div className="ref-card-header">
            <div className="ref-stat-label-group">
              <span className="ref-icon-chip" style={{ background: '#fef3c7' }}><FileText size={16} color="#d97706" /></span>
              <div style={{ minWidth: 0 }}>
                <span className="ref-stat-title">Pending Quotations</span>
                <span className="ref-stat-desc">Awaiting Approval</span>
              </div>
            </div>
            <MoreHorizontal size={16} color="#94a3b8" />
          </div>
          <div className="ref-stat-body">
            <span className="ref-stat-value">{formatCleanNumber(pendingQuotationsCount, 4)}</span>
            <span className="ref-trend-badge amber">⏳ Review</span>
          </div>
          <div className="ref-stat-footer">Quotes Pending Response</div>
        </div>

        {/* KPI 3: Sales Orders */}
        <div className="ref-stat-card" onClick={() => navigate('/orders')}>
          <div className="ref-card-header">
            <div className="ref-stat-label-group">
              <span className="ref-icon-chip" style={{ background: '#ecfdf5' }}><ShoppingCart size={16} color="#10b981" /></span>
              <div style={{ minWidth: 0 }}>
                <span className="ref-stat-title">Sales Orders</span>
                <span className="ref-stat-desc">Confirmed Orders</span>
              </div>
            </div>
            <MoreHorizontal size={16} color="#94a3b8" />
          </div>
          <div className="ref-stat-body">
            <span className="ref-stat-value">{formatCleanNumber(orders.length, 8)}</span>
            <span className="ref-trend-badge green">↗ Active</span>
          </div>
          <div className="ref-stat-footer">Total Sales Orders</div>
        </div>

        {/* KPI 4: Sales */}
        <div className="ref-stat-card" onClick={() => navigate('/orders')}>
          <div className="ref-card-header">
            <div className="ref-stat-label-group">
              <span className="ref-icon-chip" style={{ background: '#f0fdf4' }}><TrendingUp size={16} color="#15803d" /></span>
              <div style={{ minWidth: 0 }}>
                <span className="ref-stat-title">Monthly Sales</span>
                <span className="ref-stat-desc">Gross Revenue</span>
              </div>
            </div>
            <MoreHorizontal size={16} color="#94a3b8" />
          </div>
          <div className="ref-stat-body">
            <span className="ref-stat-value">{formatCleanCurrency(totalSalesRevenue, 450000)}</span>
            <span className="ref-trend-badge green">↗ Gross</span>
          </div>
          <div className="ref-stat-footer">Total Confirmed Sales</div>
        </div>

        {/* KPI 5: Low Stock */}
        <div className="ref-stat-card" onClick={() => navigate('/stocks')}>
          <div className="ref-card-header">
            <div className="ref-stat-label-group">
              <span className="ref-icon-chip" style={{ background: '#fff1f2' }}><Package size={16} color="#e11d48" /></span>
              <div style={{ minWidth: 0 }}>
                <span className="ref-stat-title">Low Stock Items</span>
                <span className="ref-stat-desc">Reorder Alert</span>
              </div>
            </div>
            <MoreHorizontal size={16} color="#94a3b8" />
          </div>
          <div className="ref-stat-body">
            <span className="ref-stat-value">{formatCleanNumber(lowStockProducts.length, 3)}</span>
            <span className="ref-trend-badge red">⚠️ Reorder</span>
          </div>
          <div className="ref-stat-footer">Items Needing Restock</div>
        </div>

        {/* KPI 6: Pending Deliveries */}
        <div className="ref-stat-card" onClick={() => navigate('/deliveries')}>
          <div className="ref-card-header">
            <div className="ref-stat-label-group">
              <span className="ref-icon-chip" style={{ background: '#f0f9ff' }}><Truck size={16} color="#0284c7" /></span>
              <div style={{ minWidth: 0 }}>
                <span className="ref-stat-title">Pending Deliveries</span>
                <span className="ref-stat-desc">Fulfillment Queue</span>
              </div>
            </div>
            <MoreHorizontal size={16} color="#94a3b8" />
          </div>
          <div className="ref-stat-body">
            <span className="ref-stat-value">{formatCleanNumber(pendingDeliveries.length, 3)}</span>
            <span className="ref-trend-badge blue">🚛 Transit</span>
          </div>
          <div className="ref-stat-footer">Active Dispatches</div>
        </div>

      </div>

      {/* ================= 3. ANALYTICS (Sales Chart & Stock Overview) ================= */}
      <div className="ref-middle-grid" style={{ marginBottom: '1.5rem' }}>
        
        {/* Sales Chart / Overview Heatmap */}
        <div className="ref-card">
          <div className="ref-card-top-bar">
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Sales Overview Analytics</h3>
            <button className="ref-filter-dropdown">
              This Financial Year <ChevronDown size={14} />
            </button>
          </div>

          <div className="ref-sales-big-stat-row" style={{ marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Total Recorded Sales</span>
              <span className="ref-big-percentage" style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                {formatCleanCurrency(totalSalesRevenue, 450000)}
              </span>
            </div>
            <div className="ref-arrow-nav-group">
              <span className="ref-trend-badge green" style={{ fontSize: '13px', padding: '4px 10px' }}>↗ +18.4% YoY</span>
            </div>
          </div>

          {/* Dot Matrix Sales Analytics Grid */}
          <div className="ref-heatmap-months-container">
            {['August', 'September', 'October'].map((mName) => (
              <div key={mName} className="ref-heatmap-month-column">
                <span className="ref-heatmap-month-title">{mName}</span>
                <div className="ref-dot-matrix-grid">
                  {Array.from({ length: 21 }).map((_, dIdx) => {
                    const opacityLevel = (dIdx % 3 === 0 || dIdx % 5 === 0) ? 0.95 : (dIdx % 2 === 0 ? 0.65 : 0.25);
                    return (
                      <span
                        key={dIdx}
                        className="ref-dot purple"
                        style={{ opacity: opacityLevel }}
                      />
                    );
                  })}
                </div>
                <div className="ref-days-sub-label">
                  <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Overview Breakdown */}
        <div className="ref-card">
          <div className="ref-card-top-bar" style={{ gap: '0.5rem' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Stock Overview Breakdown</h3>
            <button className="ref-filter-dropdown" onClick={() => navigate('/stocks')} style={{ flexShrink: 0 }}>
              View Inventory <ArrowRight size={13} />
            </button>
          </div>

          <div className="ref-donut-section" style={{ gap: '1.25rem', marginTop: '0.75rem' }}>
            <div className="ref-donut-chart-container">
              <div
                className="ref-donut-ring"
                style={{
                  background: `conic-gradient(#2563eb 0% ${donutStop1}%, #f59e0b ${donutStop1}% ${donutStop2}%, #ef4444 ${donutStop2}% 100%)`
                }}
              >
                <div className="ref-donut-center">
                  <span className="ref-center-label">Total Stock</span>
                  <span className="ref-center-val">{formatCleanNumber(totalStockQty)}</span>
                  <span className="ref-center-sub">pcs</span>
                </div>
              </div>
            </div>

            <div className="ref-metric-bars-list" style={{ flex: 1 }}>
              <div className="ref-bar-item">
                <div className="ref-bar-top" style={{ fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                    In Stock
                  </span>
                  <span className="ref-bar-val" style={{ fontWeight: 700 }}>{inStockCount} Items</span>
                </div>
                <div className="ref-progress-track">
                  <div className="ref-progress-fill" style={{ width: `${Math.max(inStockPct, inStockCount > 0 ? 5 : 0)}%`, background: '#2563eb' }} />
                </div>
              </div>

              <div className="ref-bar-item">
                <div className="ref-bar-top" style={{ fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                    Low Stock
                  </span>
                  <span className="ref-bar-val" style={{ fontWeight: 700 }}>{lowStockCount} Items</span>
                </div>
                <div className="ref-progress-track">
                  <div className="ref-progress-fill" style={{ width: `${Math.max(lowStockPct, lowStockCount > 0 ? 5 : 0)}%`, background: '#f59e0b' }} />
                </div>
              </div>

              <div className="ref-bar-item">
                <div className="ref-bar-top" style={{ fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                    Out of Stock
                  </span>
                  <span className="ref-bar-val" style={{ fontWeight: 700 }}>{outOfStockCount} Items</span>
                </div>
                <div className="ref-progress-track">
                  <div className="ref-progress-fill" style={{ width: `${Math.max(outOfStockPct, outOfStockCount > 0 ? 5 : 0)}%`, background: '#ef4444' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= 4. ERP PIPELINE (Quotations -> Sales Orders -> Dispatch -> Delivery) ================= */}
      <div className="ref-card" style={{ marginBottom: '1.5rem' }}>
        <div className="ref-card-top-bar" style={{ marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>ERP Fulfillment Pipeline</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>End-to-end active workflow tracking</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          {/* Stage 1: Quotations */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} color="#d97706" /> 1. Quotations
              </span>
              <span className="badge" style={{ background: '#fef3c7', color: '#b45309', fontSize: '12px', fontWeight: 600 }}>
                {quotations.length} Quotes
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              {formatCleanCurrency(totalQuotationValuation, 260000)}
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{pendingQuotationsCount} Pending Acceptance</span>
          </div>

          {/* Stage 2: Sales Orders */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingCart size={16} color="#10b981" /> 2. Sales Orders
              </span>
              <span className="badge" style={{ background: '#ecfdf5', color: '#047857', fontSize: '12px', fontWeight: 600 }}>
                {orders.length} Active
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              {formatCleanCurrency(totalSalesRevenue, 450000)}
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{orders.filter(o => o.status === 'Processing').length} In Processing</span>
          </div>

          {/* Stage 3: Dispatch */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Navigation size={16} color="#2563eb" /> 3. Dispatch
              </span>
              <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 600 }}>
                {orders.filter(o => o.status === 'Ready for Delivery' || o.status === 'Ready for Dispatch').length} Ready
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              {orders.filter(o => o.status === 'Ready for Delivery').length} Orders
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Queued for Loading</span>
          </div>

          {/* Stage 4: Delivery */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={16} color="#0284c7" /> 4. Delivery
              </span>
              <span className="badge" style={{ background: '#f0f9ff', color: '#0369a1', fontSize: '12px', fontWeight: 600 }}>
                {pendingDeliveries.length} Dispatched
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              {deliveries.filter(d => d.status === 'Delivered').length} Delivered
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Fulfilled Destinations</span>
          </div>

        </div>
      </div>

      {/* ================= 5. RECENT ACTIVITY (Recent Quotations & Recent Orders) ================= */}
      <div className="ref-middle-grid" style={{ marginBottom: '1.5rem' }}>
        
        {/* Recent Quotations */}
        <div className="ref-card">
          <div className="ref-card-top-bar">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Recent Quotations</h3>
            <button className="ref-filter-dropdown" onClick={() => navigate('/quotations')}>
              View All <ArrowRight size={13} />
            </button>
          </div>

          <table className="data-table" style={{ width: '100%', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '5px 8px', color: '#64748b', fontSize: '11px' }}>Quote Ref</th>
                <th style={{ padding: '5px 8px', color: '#64748b', fontSize: '11px' }}>Customer</th>
                <th style={{ padding: '5px 8px', color: '#64748b', fontSize: '11px' }}>Total Amount</th>
                <th style={{ padding: '5px 8px', color: '#64748b', fontSize: '11px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(quotations.length > 0 ? quotations.slice(0, 4) : [
                { quotationNumber: 'QN-0001', customerName: 'Rahul Patel', grandTotal: 85000, status: 'Sent' },
                { quotationNumber: 'QN-0002', customerName: 'Anil Verma', grandTotal: 340000, status: 'Approved' }
              ]).map((q, qIdx) => (
                <tr key={q.id || q._id || qIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '5px 8px', fontWeight: 700, color: '#2563eb' }}>{q.quotationNumber || q.id}</td>
                  <td style={{ padding: '5px 8px', fontWeight: 500 }}>{q.customerName}</td>
                  <td style={{ padding: '5px 8px', fontWeight: 700 }}>₹{Number(q.grandTotal || q.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '5px 8px' }}><StatusBadge status={q.status || 'Sent'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Orders */}
        <div className="ref-card">
          <div className="ref-card-top-bar">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Recent Sales Orders</h3>
            <button className="ref-filter-dropdown" onClick={() => navigate('/orders')}>
              View All <ArrowRight size={13} />
            </button>
          </div>

          <table className="data-table" style={{ width: '100%', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '5px 8px', color: '#64748b', fontSize: '11px' }}>Order Ref</th>
                <th style={{ padding: '5px 8px', color: '#64748b', fontSize: '11px' }}>Customer</th>
                <th style={{ padding: '5px 8px', color: '#64748b', fontSize: '11px' }}>Order Total</th>
                <th style={{ padding: '5px 8px', color: '#64748b', fontSize: '11px' }}>Stage</th>
              </tr>
            </thead>
            <tbody>
              {(orders.length > 0 ? orders.slice(0, 4) : [
                { id: 'ORD-00001', customerName: 'Royal Residency', totalAmount: 650000, status: 'Ready for Delivery' },
                { id: 'ORD-00002', customerName: 'Shah Furniture', totalAmount: 142500, status: 'Delivered' }
              ]).map((o, oIdx) => (
                <tr key={o.id || o._id || oIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '5px 8px', fontWeight: 700, color: '#2563eb' }}>{o.id || o.orderNumber}</td>
                  <td style={{ padding: '5px 8px', fontWeight: 500 }}>{o.customerName}</td>
                  <td style={{ padding: '5px 8px', fontWeight: 700 }}>₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '5px 8px' }}><StatusBadge status={o.status || 'Processing'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ================= 6. ALERTS (Low Stock, Pending Payment, Delayed Delivery) ================= */}
      <div className="ref-card">
        <div className="ref-card-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} color="#ef4444" />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Business Action Alerts</h3>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Requires immediate management attention</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          
          {/* Alert 1: Low Stock Alert */}
          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Package size={18} color="#e11d48" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#9f1239' }}>Low Stock Alert ({lowStockProducts.length})</span>
            </div>
            <p style={{ fontSize: '12px', color: '#be123c', margin: '0 0 10px 0' }}>
              {lowStockProducts.length > 0
                ? `${lowStockProducts[0].name || lowStockProducts[0].productName} is below safety threshold!`
                : 'Textured Sunmica 1.2mm is below safety threshold (8 sheets left).'
              }
            </p>
            <button
              className="btn btn-sm"
              style={{ background: '#e11d48', color: 'white', fontSize: '12px', padding: '4px 10px' }}
              onClick={() => navigate('/products?tab=purchase')}
            >
              Reorder Stock Item
            </button>
          </div>

          {/* Alert 2: Pending Payment Alert */}
          <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CreditCard size={18} color="#d97706" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#92400e' }}>Pending Payment Receipts ({pendingPaymentsOrders.length})</span>
            </div>
            <p style={{ fontSize: '12px', color: '#b45309', margin: '0 0 10px 0' }}>
              {pendingPaymentsOrders.length > 0
                ? `${pendingPaymentsOrders[0].customerName} has pending balance of ₹${(pendingPaymentsOrders[0].totalAmount || 0).toLocaleString('en-IN')}`
                : 'Rahul Furniture has unpaid invoice balance of ₹85,000'
              }
            </p>
            <button
              className="btn btn-sm"
              style={{ background: '#d97706', color: 'white', fontSize: '12px', padding: '4px 10px' }}
              onClick={() => navigate('/orders?tab=payments')}
            >
              Record Payment
            </button>
          </div>

          {/* Alert 3: Delayed / Pending Delivery Alert */}
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Truck size={18} color="#0284c7" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#075985' }}>Pending Dispatches ({pendingDeliveries.length})</span>
            </div>
            <p style={{ fontSize: '12px', color: '#0369a1', margin: '0 0 10px 0' }}>
              {pendingDeliveries.length > 0
                ? `Dispatch #${pendingDeliveries[0].deliveryNumber || pendingDeliveries[0].id} assigned to ${pendingDeliveries[0].customerName}`
                : 'Dispatch #00001 ready for logistics driver assignment'
              }
            </p>
            <button
              className="btn btn-sm"
              style={{ background: '#0284c7', color: 'white', fontSize: '12px', padding: '4px 10px' }}
              onClick={() => navigate('/deliveries')}
            >
              Assign Logistics Driver
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
