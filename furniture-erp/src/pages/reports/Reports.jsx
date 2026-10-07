import React, { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { api } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  FileText,
  ShoppingCart,
  Download,
  Calendar,
  Filter,
  PieChart,
  ArrowUpRight,
  CheckCircle2,
  Clock
} from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('month');
  const [reportType, setReportType] = useState('sales');

  const [orders, setOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        ordersData,
        quotationsData,
        productsData,
        customersData,
        leadsData,
        inquiriesData
      ] = await Promise.all([
        api.getOrders(),
        api.getQuotations(),
        api.getProducts(),
        api.getCustomers(),
        api.getLeads(),
        api.getInquiries()
      ]);

      setOrders(ordersData || []);
      setQuotations(quotationsData || []);
      setProducts(productsData || []);
      setCustomers(customersData || []);
      setLeads(leadsData || []);
      setInquiries(inquiriesData || []);
    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const totalSalesRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalInvoicedPaid = orders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalPendingPayments = orders.filter(o => o.paymentStatus === 'Pending' || o.paymentStatus === 'Partial').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  
  const totalQuotationsValue = quotations.reduce((sum, q) => sum + Number(q.grandTotal || q.totalAmount || 0), 0);
  const acceptedQuotationsCount = quotations.filter(q => q.status === 'Accepted' || q.status === 'Approved').length;
  const quoteWinRate = quotations.length > 0 ? Math.round((acceptedQuotationsCount / quotations.length) * 100) : 0;

  const totalInventoryValuation = products.reduce((sum, p) => {
    const qty = Number(p.quantity ?? p.stock ?? 0);
    const price = Number(p.unitPrice ?? p.price ?? 0);
    return sum + (qty * price);
  }, 0);

  const lowStockCount = products.filter(p => (Number(p.quantity ?? p.stock ?? 0)) > 0 && (Number(p.quantity ?? p.stock ?? 0)) < 15).length;
  const outOfStockCount = products.filter(p => (Number(p.quantity ?? p.stock ?? 0)) === 0).length;

  const handleExportReport = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>Reports & Executive Analytics</h1>
          <p className="page-subtitle" style={{ fontSize: '0.9rem', marginTop: '2px' }}>
            Comprehensive performance metrics for Sales, Quotation Conversions, Inventory Valuation & Payments
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="form-control"
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">Financial Year 2026</option>
          </select>

          <button className="btn btn-primary" onClick={handleExportReport} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard
          title="Total Gross Revenue"
          value={`₹${totalSalesRevenue.toLocaleString('en-IN')}`}
          change="+18.4% vs last period"
          isPositive={true}
          icon={DollarSign}
        />
        <StatCard
          title="Quotations Win Rate"
          value={`${quoteWinRate}%`}
          change={`${acceptedQuotationsCount} Accepted Quotes`}
          isPositive={quoteWinRate >= 50}
          icon={FileText}
        />
        <StatCard
          title="Total Stock Valuation"
          value={`₹${totalInventoryValuation.toLocaleString('en-IN')}`}
          change={`${products.length} Material SKUs`}
          isPositive={true}
          icon={Package}
        />
        <StatCard
          title="Pending Receivables"
          value={`₹${totalPendingPayments.toLocaleString('en-IN')}`}
          change={`${orders.filter(o => o.paymentStatus !== 'Paid').length} Unpaid Orders`}
          isPositive={false}
          icon={Clock}
        />
      </div>

      {/* Report View Selector Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--slate-200)', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => setReportType('sales')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            borderBottom: reportType === 'sales' ? '3px solid var(--primary-600)' : '3px solid transparent',
            color: reportType === 'sales' ? 'var(--primary-700)' : 'var(--slate-600)'
          }}
        >
          📈 Sales & Revenue Breakdown
        </button>
        <button
          onClick={() => setReportType('quotation')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            borderBottom: reportType === 'quotation' ? '3px solid var(--primary-600)' : '3px solid transparent',
            color: reportType === 'quotation' ? 'var(--primary-700)' : 'var(--slate-600)'
          }}
        >
          📄 Quotation & Lead Conversion
        </button>
        <button
          onClick={() => setReportType('inventory')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            borderBottom: reportType === 'inventory' ? '3px solid var(--primary-600)' : '3px solid transparent',
            color: reportType === 'inventory' ? 'var(--primary-700)' : 'var(--slate-600)'
          }}
        >
          📦 Stock & Inventory Health
        </button>
        <button
          onClick={() => setReportType('finance')}
          style={{
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            borderBottom: reportType === 'finance' ? '3px solid var(--primary-600)' : '3px solid transparent',
            color: reportType === 'finance' ? 'var(--primary-700)' : 'var(--slate-600)'
          }}
        >
          💳 Payments & Accounts Ledger
        </button>
      </div>

      {/* Main Report Table & Analytics */}
      <div className="card" style={{ padding: '1rem' }}>
        {reportType === 'sales' && (
          <div>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800)' }}>Sales Orders Breakdown</h3>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)', textAlign: 'left' }}>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Order ID</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Customer Name</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Order Date</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Amount (₹)</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Payment Status</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Fulfillment Stage</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, oIdx) => (
                  <tr key={`${o.id || o._id || 'order'}-${oIdx}`} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)' }}>{o.id || o.orderNumber}</td>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>{o.customerName}</td>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--slate-600)' }}>{o.orderDate || '2026-10-06'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.25rem 0.5rem' }}><StatusBadge status={o.paymentStatus || 'Pending'} /></td>
                    <td style={{ padding: '0.25rem 0.5rem' }}><StatusBadge status={o.status || 'Processing'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'quotation' && (
          <div>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800)' }}>Quotation & Lead Performance</h3>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)', textAlign: 'left' }}>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Quote Ref</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Customer</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Date</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Quotation Total (₹)</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q, qIdx) => (
                  <tr key={`${q.id || q._id || 'quote'}-${qIdx}`} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)' }}>{q.quotationNumber || q.id}</td>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>{q.customerName}</td>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--slate-600)' }}>{q.date || '2026-10-06'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>₹{Number(q.grandTotal || q.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.25rem 0.5rem' }}><StatusBadge status={q.status || 'Sent'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'inventory' && (
          <div>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800)' }}>Stock Inventory Summary</h3>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)', textAlign: 'left' }}>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>SKU</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Product Name</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Category</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Stock Qty</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Unit Price (₹)</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Total Asset Value (₹)</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, pIdx) => {
                  const qty = Number(p.quantity ?? p.stock ?? 0);
                  const price = Number(p.unitPrice ?? p.price ?? 0);
                  return (
                    <tr key={`${p.id || p._id || 'prod'}-${pIdx}`} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>{p.sku || p.id}</td>
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>{p.name || p.productName}</td>
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>{p.category}</td>
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>{qty} {p.unit || 'pcs'}</td>
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>₹{price.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-900)' }}>₹{(qty * price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.25rem 0.5rem' }}><StatusBadge status={p.status || (qty === 0 ? 'Out of Stock' : qty < 15 ? 'Low Stock' : 'In Stock')} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'finance' && (
          <div>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800)' }}>Financial Collections & Invoices Ledger</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Total Collected (Paid)</span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065f46', margin: '2px 0 0 0' }}>₹{totalInvoicedPaid.toLocaleString('en-IN')}</h2>
              </div>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>Outstanding Balance (Pending)</span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991b1b', margin: '2px 0 0 0' }}>₹{totalPendingPayments.toLocaleString('en-IN')}</h2>
              </div>
            </div>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)', textAlign: 'left' }}>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Order / Invoice ID</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Customer</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Invoice Date</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Total Billed (₹)</th>
                  <th style={{ padding: '0.3rem 0.5rem', fontSize: '0.625rem' }}>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, oIdx) => (
                  <tr key={`${o.id || o._id || 'ledger'}-${oIdx}`} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)' }}>{o.id || o.orderNumber}</td>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>{o.customerName}</td>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--slate-600)' }}>{o.orderDate || '2026-10-06'}</td>
                    <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.25rem 0.5rem' }}><StatusBadge status={o.paymentStatus || 'Pending'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Reports;
