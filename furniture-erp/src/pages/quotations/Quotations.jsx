import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../Components/StatusBadge';
import Modal from '../../Components/Modal';
import StatCard from '../../components/StatCard';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, Eye, Edit, Printer, ShoppingBag, Trash2, FileText, CheckCircle2, Clock, AlertTriangle, ArrowUpDown, Filter, RefreshCw } from 'lucide-react';

const WhatsAppIcon = ({ size = 22 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <path 
      d="M24 4C12.95 4 4 12.95 4 24C4 27.95 5.15 31.63 7.15 34.75L4 44L13.5 41C16.5 42.85 20.15 44 24 44C35.05 44 44 35.05 44 24C44 12.95 35.05 4 24 4Z" 
      fill="#25D366"
    />
    <path 
      d="M35.2 29.15C34.7 28.9 32.2 27.65 31.75 27.5C31.3 27.35 30.95 27.25 30.65 27.75C30.35 28.25 29.5 29.25 29.25 29.55C29 29.85 28.75 29.9 28.25 29.65C27.75 29.4 26.15 28.87 24.25 27.18C22.75 25.85 21.75 24.2 21.45 23.7C21.15 23.2 21.42 22.93 21.67 22.68C21.9 22.45 22.18 22.08 22.43 21.78C22.68 21.48 22.76 21.26 22.93 20.91C23.1 20.56 23.01 20.26 22.88 20.01C22.75 19.76 21.65 17.06 21.2 15.96C20.76 14.89 20.31 15.04 19.98 15.02C19.67 15 19.32 15 18.97 15C18.62 15 18.05 15.13 17.57 15.65C17.09 16.17 15.74 17.43 15.74 20C15.74 22.57 17.61 25.05 17.87 25.4C18.13 25.75 21.55 30.99 26.78 33.25C28.02 33.79 28.99 34.11 29.74 34.35C30.98 34.74 32.11 34.69 33.01 34.55C34.01 34.4 36.09 33.29 36.52 32.08C36.95 30.87 36.95 29.84 36.82 29.63C36.7 29.42 36.35 29.3 35.85 29.05L35.2 29.15Z" 
      fill="white"
    />
  </svg>
);

const Quotations = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'total', 'client'
  
  // Delete modal state
  const [deleteModalQuote, setDeleteModalQuote] = useState(null);

  const fetchQuotations = async () => {
    try {
      const [data, custs] = await Promise.all([
        api.getQuotations(),
        api.getCustomers()
      ]);
      setQuotations(data || []);
      setCustomers(custs || []);
    } catch (err) {
      console.error("Fetch quotations error:", err);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleSendWhatsApp = (row) => {
    const client = customers.find(c => c.id === row.customerId || c._id === row.customerId || c.name === row.customerName);
    const phone = client?.phone || row.phone || row.customerPhone || '9876543210';
    const cleanPhone = String(phone).replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const itemsSummary = (row.items || [])
      .map((item, idx) => `${idx + 1}. *${item.productName || item.name}* (Qty: ${item.quantity || item.qty}) - ₹${(item.total || (item.quantity || item.qty || 1) * (item.unitPrice || item.price || 0)).toLocaleString('en-IN')}`)
      .join('\n');

    const message = `*WOODCRAFT FURNITURE ERP - COMMERCIAL QUOTATION* 📄\n\n` +
      `Hello *${row.customerName}*,\n\n` +
      `Here is the pricing breakdown for your quotation request:\n\n` +
      `🔹 *Quotation Ref*: ${row.id}\n` +
      `📅 *Date*: ${row.date}\n` +
      `⏳ *Valid Until*: ${row.validUntil}\n` +
      `📌 *Status*: ${row.status}\n\n` +
      `*ORDER ITEMS*:\n${itemsSummary || 'Custom Hardwood Joinery & Commercial Furniture'}\n\n` +
      `💰 *Grand Total*: ₹${row.grandTotal?.toLocaleString('en-IN')}\n\n` +
      `Please let us know if you would like to proceed or confirm this order!\n\n` +
      `Regards,\n*WoodCraft Commercial Furniture Team*`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleStatusChange = async (id, newStatus) => {
    const targetQuote = quotations.find(q => q.id === id || q._id === id);
    if (newStatus === 'Accepted' && targetQuote?.status !== 'Accepted') {
      try {
        await api.acceptQuotation(targetQuote?._id || targetQuote?.id || id);
        alert(`Quotation ${targetQuote?.id || id} accepted and Sales Order created automatically!`);
        fetchQuotations();
      } catch (err) {
        console.error("Failed to convert quotation to order:", err);
        alert(err.response?.data?.message || "Failed to create Sales Order");
      }
    } else {
      const updated = await api.updateQuotationStatus(id, newStatus);
      setQuotations(updated || []);
    }
  };

  const confirmDelete = async () => {
    if (deleteModalQuote) {
      const updated = await api.deleteQuotation(deleteModalQuote.id || deleteModalQuote._id);
      setQuotations(updated || []);
      setDeleteModalQuote(null);
    }
  };

  const handleConvertToOrder = async (quote) => {
    try {
      await api.acceptQuotation(quote._id || quote.id);
      alert(`Quotation ${quote.id} accepted and Sales Order created automatically!`);
      navigate('/orders');
    } catch (err) {
      console.error("Failed to convert quotation to order:", err);
      alert(err.response?.data?.message || "Failed to create Sales Order");
    }
  };

  // KPI calculations
  const totalQuotes = quotations.length;
  const acceptedQuotes = quotations.filter(q => q.status === 'Accepted');
  const acceptedValue = acceptedQuotes.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
  const pendingQuotes = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft');
  const pendingValue = pendingQuotes.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

  // Filter & Sorting
  const filteredQuotations = quotations.filter(q => {
    if (statusFilter !== 'All' && q.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date || 0) - new Date(a.date || 0);
    if (sortBy === 'total') return (b.grandTotal || 0) - (a.grandTotal || 0);
    if (sortBy === 'client') return (a.customerName || '').localeCompare(b.customerName || '');
    return 0;
  });

  const columns = [
    {
      header: 'Quote Ref',
      accessor: 'id',
      minWidth: '100px',
      noWrap: true,
      render: (row) => (
        <span 
          style={{ fontWeight: '700', color: 'var(--primary-700)', cursor: 'pointer', fontSize: '0.85rem' }}
          onClick={() => navigate(`/quotations/${row.id}`)}
        >
          {row.id}
        </span>
      )
    },
    {
      header: 'Client / Company',
      accessor: 'customerName',
      minWidth: '170px',
      render: (row) => (
        <div style={{ lineHeight: 1.25 }}>
          <div 
            style={{ fontWeight: '700', color: '#0f172a', cursor: 'pointer', fontSize: '0.875rem' }}
            onClick={() => row.customerId && navigate(`/customers/${row.customerId}`)}
          >
            {row.customerName}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            {row.items?.length || 0} line item(s)
          </div>
        </div>
      )
    },
    {
      header: 'Issue Date',
      accessor: 'date',
      minWidth: '100px',
      noWrap: true,
      render: (row) => <span style={{ fontSize: '0.8125rem', color: '#334155', whiteSpace: 'nowrap' }}>{row.date}</span>
    },
    {
      header: 'Valid Until',
      accessor: 'validUntil',
      minWidth: '100px',
      noWrap: true,
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: '#d97706', fontWeight: '600', whiteSpace: 'nowrap' }}>
          {row.validUntil || '—'}
        </span>
      )
    },
    {
      header: 'Grand Total (₹)',
      accessor: 'grandTotal',
      minWidth: '115px',
      noWrap: true,
      render: (row) => (
        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
          ₹{row.grandTotal?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      minWidth: '110px',
      noWrap: true,
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Quotation Management</h1>
          <p className="page-subtitle">Commercial furniture pricing, custom joinery costing, status tracking & PDF exports</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => navigate('/quotations/create')} style={{ padding: '0.35rem 0.7rem', fontSize: '0.78125rem' }}>
            <PlusCircle size={14} /> Create Quotation
          </button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="stats-grid">
        <StatCard
          title="Total Quotations"
          value={totalQuotes.toString()}
          icon={<FileText size={16} />}
          iconBg="#eff6ff"
          iconColor="#2563eb"
          change={`${acceptedQuotes.length} Accepted`}
          positive={true}
        />
        <StatCard
          title="Accepted Quotes Value"
          value={`₹${acceptedValue.toLocaleString('en-IN')}`}
          icon={<CheckCircle2 size={16} />}
          iconBg="#ecfdf5"
          iconColor="#10b981"
          change="Converted to Revenue"
          positive={true}
        />
        <StatCard
          title="Pending Proposal Pipeline"
          value={`₹${pendingValue.toLocaleString('en-IN')}`}
          icon={<Clock size={16} />}
          iconBg="#fffbeb"
          iconColor="#d97706"
          change={`${pendingQuotes.length} Active Quotes`}
          positive={true}
        />
      </div>

      {/* Filter & Sorting Controls */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={13} color="var(--primary-600)" /> Status:
            </span>
            {['All', 'Pending', 'Accepted', 'Declined', 'Expired'].map(st => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
            <ArrowUpDown size={13} color="var(--slate-500)" />
            <span style={{ color: 'var(--slate-600)', fontWeight: '600' }}>Sort By:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.25rem 0.55rem', fontSize: '0.75rem', borderRadius: '6px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Newest Date</option>
              <option value="total">Highest Grand Total</option>
              <option value="client">Client Name (A-Z)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Quotations Data Table */}
      <DataTable
        title={`Quotation Registry (${filteredQuotations.length})`}
        columns={columns}
        data={filteredQuotations}
        searchPlaceholder="Search quote ref, client name..."
        actions={(row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => navigate(`/quotations/${row.id}`)} 
              title="View Details"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <Eye size={13} /> View
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => navigate(`/quotations/edit/${row.id}`)} 
              title="Edit Quotation"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <Edit size={13} /> Edit
            </button>
            <button 
              className="btn btn-sm" 
              onClick={() => handleSendWhatsApp(row)} 
              title={`Send Quotation ${row.id} to ${row.customerName} via WhatsApp`}
              style={{ 
                padding: '2px 4px', 
                backgroundColor: 'transparent', 
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
            >
              <WhatsAppIcon size={20} />
            </button>
            {row.status === 'Accepted' && hasPermission('salesOrders.create') && (
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => handleConvertToOrder(row)} 
                title="Convert to Sales Order"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ShoppingBag size={13} /> Convert to Sales Order
              </button>
            )}
            <button 
              className="btn btn-outline btn-sm" 
              onClick={() => navigate(`/quotations/preview/${row.id}`)} 
              title="Print / Export PDF"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <Printer size={13} /> PDF
            </button>
            <button 
              className="btn btn-sm btn-outline-danger" 
              onClick={() => setDeleteModalQuote(row)} 
              title="Delete Quotation"
              style={{ padding: '0.3rem 0.6rem', color: 'var(--danger)', border: '1px solid var(--danger-light)' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalQuote && (
        <Modal
          isOpen={!!deleteModalQuote}
          onClose={() => setDeleteModalQuote(null)}
          title="Confirm Quotation Deletion"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ color: '#991b1b', margin: 0, fontSize: '0.95rem' }}>Are you sure you want to delete this quotation?</h4>
                <p style={{ color: '#7f1d1d', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Quotation Ref: <strong>{deleteModalQuote.id}</strong> • Client: <strong>{deleteModalQuote.customerName}</strong>
                </p>
                <p style={{ color: '#991b1b', fontSize: '0.8rem', marginTop: '6px' }}>
                  Grand Total: ₹{deleteModalQuote.grandTotal?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModalQuote(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete Quotation
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default Quotations;
