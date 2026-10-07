import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Building,
  FileText,
  Package
} from 'lucide-react';
import { api } from '../../services/api';
import DataTable from '../../components/DataTable';
import '../../styles/leads.css';
import '../../styles/inquiries.css';

const FollowUps = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Pending');

  const loadFollowUps = async () => {
    setLoading(true);
    try {
      const [leadsData, prodsData, custsData, quotesData] = await Promise.all([
        api.getLeads(),
        api.getProducts(),
        api.getCustomers(),
        api.getQuotations()
      ]);
      setLeads(leadsData || []);
      setProducts(prodsData || []);
      setCustomers(custsData || []);
      setQuotations(quotesData || []);
    } catch (err) {
      console.error("Error loading leads for followups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowUps();
  }, []);

  // Extract all follow-ups from all leads
  const allFollowUps = [];
  leads.forEach(lead => {
    if (lead.followUps && lead.followUps.length > 0) {
      lead.followUps.forEach(f => {
        const matchedProd = products.find(p => (p.id || p._id || p.sku) === lead.productId || (p.productName || p.name) === lead.productInterest);
        const sQty = matchedProd ? Number(matchedProd.stockQuantity ?? matchedProd.stock ?? matchedProd.quantity ?? 0) : 25;

        allFollowUps.push({
          ...f,
          leadId: lead.leadId,
          leadDbId: lead._id || lead.id,
          leadName: lead.leadName,
          companyName: lead.companyName,
          contactPerson: lead.contactPerson,
          phone: lead.phone,
          email: lead.email,
          productId: lead.productId || (matchedProd ? (matchedProd.id || matchedProd._id) : ''),
          productInterest: lead.productInterest,
          convertedCustomerId: lead.convertedCustomerId,
          stockQty: sQty
        });
      });
    }
  });

  const filteredFollowUps = allFollowUps.filter(f => {
    const matchesType = typeFilter === 'All' || f.followUpType === typeFilter;
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const handleToggleStatus = async (leadDbId, followupId, currentStatus) => {
    const nextStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    try {
      await api.updateFollowUpStatus(leadDbId, followupId, { status: nextStatus });
      loadFollowUps();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const columns = [
    {
      header: 'Follow-up Schedule',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.followUpDate}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>⏰ {row.followUpTime}</div>
        </div>
      )
    },
    {
      header: 'Lead / Customer',
      accessor: (row) => (
        <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/leads/${row.leadDbId}`)}>
          <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.75rem' }}>{row.leadId}</span>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.leadName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.contactPerson} ({row.phone})</div>
        </div>
      )
    },
    {
      header: 'Product Stock & Interest',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8125rem' }}>
            📦 {row.productInterest}
          </div>
          <div style={{ fontSize: '0.75rem', color: row.stockQty > 0 ? '#059669' : '#dc2626', fontWeight: 700, marginTop: 2 }}>
            {row.stockQty > 0 ? `In Stock (${row.stockQty} available)` : 'Out of Stock'}
          </div>
        </div>
      )
    },
    {
      header: 'Type & Employee',
      accessor: (row) => (
        <div>
          <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
            {row.followUpType}
          </span>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            Assigned: {row.assignedEmployee || 'Sales'}
          </div>
        </div>
      )
    },
    {
      header: 'Remarks',
      accessor: (row) => (
        <div style={{ maxWidth: '200px', fontSize: '0.8125rem', color: '#334155' }}>
          {row.remarks || 'No remark entered.'}
        </div>
      )
    },
    {
      header: 'Status & Action',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => handleToggleStatus(row.leadDbId, row._id || row.id, row.status)}
            style={{
              border: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              background: row.status === 'Completed' ? '#dcfce7' : '#fef3c7',
              color: row.status === 'Completed' ? '#15803d' : '#b45309'
            }}
          >
            {row.status === 'Completed' ? '✓ Completed' : '⏳ Mark Done'}
          </button>

          <button
            className="action-btn"
            title="Create Quotation"
            onClick={() => {
              const custId = row.convertedCustomerId || '';
              navigate(`/quotations/create?customerId=${custId}&customerName=${encodeURIComponent(row.companyName || row.leadName)}&productId=${row.productId || ''}`);
            }}
            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #93c5fd', background: '#eff6ff', cursor: 'pointer' }}
          >
            <FileText size={14} color="#2563eb" />
          </button>

          <button
            className="action-btn"
            title="View Lead"
            onClick={() => navigate(`/leads/${row.leadDbId}`)}
            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
          >
            <Eye size={14} color="#3b82f6" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="followups-container erp-page">
      {/* Header */}
      <div className="crm-header">
        <div className="crm-title-group">
          <h1><Calendar size={26} color="#2563eb" /> Follow-up Management</h1>
          <p className="crm-subtitle">Track today's scheduled phone calls, WhatsApp messages, meetings, and site visits across all leads.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Follow-ups</option>
            <option value="Completed">Completed Follow-ups</option>
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Follow-up Types</option>
            <option value="Phone Call">Phone Call</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
            <option value="Site Visit">Site Visit</option>
            <option value="Product Demo">Product Demo</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredFollowUps}
        loading={loading}
        emptyMessage="No follow-up tasks found matching criteria."
      />
    </div>
  );
};

export default FollowUps;
