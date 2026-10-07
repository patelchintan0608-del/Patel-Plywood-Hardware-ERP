import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowUpRight,
  TrendingUp,
  Users,
  Eye,
  Send,
  PhoneCall,
  Download,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import '../../styles/dashboard.css';
import '../../styles/employee-dashboard.css';

const QuotationDashboard = () => {
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [qRes, iRes] = await Promise.all([
          api.getQuotations().catch(() => []),
          api.getInquiries().catch(() => [])
        ]);
        setQuotations(qRes || []);
        setInquiries(iRes || []);
      } catch (e) {
        console.error('Error loading quotation dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered Quotations
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch =
      (q.quotationNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = quotations.reduce((acc, q) => acc + Number(q.totalAmount || q.total || 0), 0);
  const pendingApprovals = quotations.filter(q => q.status === 'Draft' || q.status === 'Sent' || q.status === 'Pending').length;
  const approvedQuotes = quotations.filter(q => q.status === 'Approved' || q.status === 'Accepted').length;

  return (
    <div className="emp-dashboard-container">
      
      {/* Header Banner */}
      <div className="emp-header-banner" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)' }}>
        <div className="emp-header-left">
          <div className="emp-avatar-wrapper">
            <div className="emp-card-icon" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              <FileText size={30} />
            </div>
          </div>
          <div>
            <h1 className="emp-greeting-title">
              Quotation Employee Workspace 📄
            </h1>
            <p className="emp-greeting-sub">
              Manage client inquiries, calculate sheet pricing, generate quote PDFs & track approvals.
            </p>
          </div>
        </div>

        <div className="emp-header-actions">
          <button
            onClick={() => navigate('/quotations/create')}
            className="btn-punch-in"
            style={{ background: '#2563eb', color: '#fff', border: 'none' }}
          >
            <PlusCircle size={18} />
            <span>Create New Quote</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="emp-grid-3col">
        <div className="emp-card">
          <div className="emp-card-header">
            <span className="emp-card-title">
              <span className="emp-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <FileText size={18} />
              </span>
              Total Quotes
            </span>
            <span className="att-tag ontime">Live Tally</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
            {quotations.length} Quotes Generated
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Total Value: <strong style={{ color: '#2563eb' }}>₹{totalValue.toLocaleString('en-IN')}</strong>
          </span>
        </div>

        <div className="emp-card">
          <div className="emp-card-header">
            <span className="emp-card-title">
              <span className="emp-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Clock size={18} />
              </span>
              Pending Approvals
            </span>
            <span className="att-tag late">Action Required</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
            {pendingApprovals} Quotes Pending
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Awaiting client or manager approval
          </span>
        </div>

        <div className="emp-card">
          <div className="emp-card-header">
            <span className="emp-card-title">
              <span className="emp-card-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <CheckCircle2 size={18} />
              </span>
              Approved & Accepted
            </span>
            <span className="att-tag present">Success Rate</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
            {approvedQuotes} Approved
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Converted directly into Sales Orders
          </span>
        </div>
      </div>

      {/* Main Quotations Workspace Table */}
      <div className="emp-card">
        <div className="emp-card-header">
          <h3 className="emp-card-title">
            <span className="emp-card-icon">
              <FileText size={18} />
            </span>
            Recent Quotations & Estimates
          </h3>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="emp-search-container" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '10px' }}>
              <Search size={16} style={{ color: '#64748b', marginRight: '6px' }} />
              <input
                type="text"
                placeholder="Search quote number, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem' }}
              />
            </div>

            <select
              className="emp-input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <option value="All">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Loading quotations...</p>
        ) : (
          <table className="emp-table">
            <thead>
              <tr>
                <th>Quote Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items Count</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No quotations found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map(q => (
                  <tr key={q.id || q._id}>
                    <td>
                      <span className="emp-id-pill" style={{ background: '#eff6ff', color: '#2563eb', border: 'none' }}>
                        {q.quotationNumber || `QT-${q.id}`}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{q.customerName || 'Walk-in Client'}</td>
                    <td>{q.date || q.createdDate || 'Today'}</td>
                    <td>{q.items ? q.items.length : 1} Plywood / Laminate Items</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>
                      ₹{Number(q.totalAmount || q.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`att-tag ${q.status === 'Approved' ? 'present' : q.status === 'Sent' ? 'ontime' : 'late'}`}>
                        ● {q.status || 'Draft'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => navigate(`/quotations/${q.id || q._id}`)}
                          className="btn-action-sm"
                          title="View Quotation"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => navigate(`/quotations/preview/${q.id || q._id}`)}
                          className="btn-action-sm"
                          style={{ background: '#dcfce7', borderColor: '#86efac', color: '#15803d' }}
                          title="Download PDF"
                        >
                          <Download size={14} />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default QuotationDashboard;
