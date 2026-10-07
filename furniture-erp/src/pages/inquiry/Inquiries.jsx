import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileQuestion,
  Plus,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  Clock,
  UserCheck,
  Building,
  Phone,
  Mail,
  IndianRupee,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X,
  Send
} from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../../Components/Modal';
import DataTable from '../../Components/DataTable';
import '../../styles/inquiries.css';

const INQUIRY_SOURCES = [
  "Website",
  "WhatsApp",
  "Instagram",
  "Facebook",
  "Google",
  "Referral",
  "Phone Call",
  "Email",
  "Exhibition",
  "Walk-in",
  "Existing Customer",
  "Advertisement"
];

const INQUIRY_CATEGORIES = [
  "Office Furniture",
  "Furniture",
  "Sunmica",
  "Plywood",
  "MDF",
  "Hardware"
];

const INQUIRY_STATUSES = [
  "New",
  "Contacted",
  "Under Review",
  "Qualified",
  "Converted to Lead",
  "On Hold",
  "Not Interested",
  "Rejected",
  "Closed"
];

const Inquiries = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    inquiryId: '',
    customerName: '',
    companyName: '',
    phone: '',
    email: '',
    source: 'Website',
    product: '',
    category: 'Office Furniture',
    quantity: 1,
    estimatedBudget: '',
    requirement: '',
    priority: 'Medium',
    assignedTo: 'Sales Executive',
    status: 'New',
    expectedDate: '',
    remarks: ''
  });

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const data = await api.getInquiries();
      setInquiries(data);
    } catch (err) {
      console.error("Error loading inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  // Compute Dashboard Metrics
  const totalInquiriesCount = inquiries.length || 248;
  const newInquiriesCount = inquiries.filter(i => i.status === 'New').length;
  const inProgressCount = inquiries.filter(i => ['Contacted', 'Under Review', 'Qualified'].includes(i.status)).length;
  const convertedCount = inquiries.filter(i => i.status === 'Converted to Lead' || i.convertedToLead).length;

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedInquiry(null);
    setFormData({
      inquiryId: `INQ-${String(inquiries.length + 1).padStart(5, '0')}`,
      customerName: '',
      companyName: '',
      phone: '',
      email: '',
      source: 'Website',
      product: '',
      category: 'Office Furniture',
      quantity: 1,
      estimatedBudget: '',
      requirement: '',
      priority: 'Medium',
      assignedTo: 'Sales Executive',
      status: 'New',
      expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      remarks: ''
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (inq) => {
    setIsEditing(true);
    setSelectedInquiry(inq);
    setFormData({
      ...inq,
      quantity: inq.quantity || 1,
      estimatedBudget: inq.estimatedBudget || '',
      expectedDate: inq.expectedDate ? inq.expectedDate.split('T')[0] : ''
    });
    setIsFormModalOpen(true);
  };

  const handleOpenViewModal = (inq) => {
    setSelectedInquiry(inq);
    setIsViewModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.saveInquiry(formData);
      setIsFormModalOpen(false);
      loadInquiries();
    } catch (err) {
      alert("Failed to save inquiry. Please check required fields.");
    }
  };

  const handleConvertToLead = async (inquiryId) => {
    if (window.confirm("Convert this Inquiry into a Lead? This will create a Lead record LD-XXXXX in CRM!")) {
      try {
        const createdLead = await api.convertInquiryToLead(inquiryId);
        alert(`Successfully converted to Lead ${createdLead.leadId || ''}!`);
        setIsViewModalOpen(false);
        loadInquiries();
        navigate(`/leads/${createdLead._id || createdLead.id || ''}`);
      } catch (err) {
        alert("Failed to convert inquiry to lead.");
      }
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (window.confirm("Are you sure you want to delete this Inquiry?")) {
      try {
        await api.deleteInquiry(id);
        loadInquiries();
      } catch (err) {
        alert("Failed to delete inquiry.");
      }
    }
  };

  // Filtered List
  const filteredInquiries = inquiries.filter(inq => {
    const matchesQuery = searchQuery === '' ||
      (inq.customerName && inq.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inq.companyName && inq.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inq.inquiryId && inq.inquiryId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inq.product && inq.product.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || inq.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || inq.source === sourceFilter;

    return matchesQuery && matchesStatus && matchesSource;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return <span className="badge-inquiry-status badge-status-new"><Clock size={12} /> New</span>;
      case 'Contacted':
        return <span className="badge-inquiry-status badge-status-contacted"><Phone size={12} /> Contacted</span>;
      case 'Under Review':
        return <span className="badge-inquiry-status badge-status-under-review"><Eye size={12} /> Under Review</span>;
      case 'Qualified':
        return <span className="badge-inquiry-status badge-status-qualified"><CheckCircle size={12} /> Qualified</span>;
      case 'Converted to Lead':
        return <span className="badge-inquiry-status badge-status-converted"><Sparkles size={12} /> Converted to Lead</span>;
      default:
        return <span className="badge-inquiry-status badge-status-lost">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || 'Medium').toLowerCase();
    return <span className={`priority-tag priority-${p}`}>{priority || 'Medium'}</span>;
  };

  const columns = [
    {
      header: 'Inquiry Details',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.8125rem' }}>{row.inquiryId}</div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.customerName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.companyName}</div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      accessor: (row) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div><Phone size={12} style={{ display: 'inline', marginRight: 4 }} /> {row.phone}</div>
          {row.email && <div style={{ color: '#64748b' }}><Mail size={12} style={{ display: 'inline', marginRight: 4 }} /> {row.email}</div>}
        </div>
      )
    },
    {
      header: 'Product Request',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.product || 'Custom Furniture'}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Qty: {row.quantity} | {row.category}
          </div>
        </div>
      )
    },
    {
      header: 'Source & Budget',
      accessor: (row) => (
        <div>
          <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{row.source}</span>
          <div style={{ fontWeight: 700, color: '#059669', marginTop: 4 }}>
            ₹{Number(row.estimatedBudget || 0).toLocaleString('en-IN')}
          </div>
        </div>
      )
    },
    {
      header: 'Status & Priority',
      accessor: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
          {getStatusBadge(row.status)}
          {getPriorityBadge(row.priority)}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className="action-btn"
            title="View Inquiry Details"
            onClick={() => handleOpenViewModal(row)}
            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
          >
            <Eye size={14} color="#3b82f6" />
          </button>
          <button
            className="action-btn"
            title="Edit Inquiry"
            onClick={() => handleOpenEditModal(row)}
            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
          >
            <Edit2 size={14} color="#64748b" />
          </button>

          {!row.convertedToLead && row.status !== 'Converted to Lead' ? (
            <button
              className="btn-convert-lead"
              title="Convert this inquiry to a Lead"
              onClick={() => handleConvertToLead(row._id || row.id)}
            >
              <ArrowRight size={13} /> Convert to Lead
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
              ✓ Converted
            </span>
          )}

          <button
            className="action-btn"
            title="Delete Inquiry"
            onClick={() => handleDeleteInquiry(row._id || row.id)}
            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fff5f5', cursor: 'pointer' }}
          >
            <Trash2 size={14} color="#ef4444" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="inquiries-container erp-page">
      {/* Header */}
      <div className="crm-header">
        <div className="crm-title-group">
          <h1><FileQuestion size={26} color="#2563eb" /> Inquiry Management</h1>
          <p className="crm-subtitle">Capture, track, and convert initial customer requests into CRM Leads.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/leads')} style={{ padding: '0.35rem 0.7rem', fontSize: '0.78125rem' }}>
            <TrendingUp size={14} /> Go to Leads Pipeline
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ padding: '0.35rem 0.7rem', fontSize: '0.78125rem' }}>
            <Plus size={14} /> New Inquiry
          </button>
        </div>
      </div>

      {/* Process Flow Banner */}
      <div style={{ background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
          <span style={{ background: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem' }}>ERP CRM Flow</span>
          <span style={{ fontWeight: 600 }}>INQUIRY</span>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ opacity: 0.7 }}>Lead</span>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ opacity: 0.7 }}>Customer</span>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ opacity: 0.7 }}>Quotation</span>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ opacity: 0.7 }}>Sales Order</span>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ opacity: 0.7 }}>Dispatch & Delivery</span>
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="inquiry-stats-grid">
        <div className="inquiry-stat-card">
          <div>
            <div className="stat-info-title">Total Inquiries</div>
            <div className="stat-info-val">{totalInquiriesCount}</div>
          </div>
          <div className="stat-icon-badge stat-icon-blue">
            <FileQuestion size={24} />
          </div>
        </div>

        <div className="inquiry-stat-card">
          <div>
            <div className="stat-info-title">New Inquiries</div>
            <div className="stat-info-val">{newInquiriesCount}</div>
          </div>
          <div className="stat-icon-badge stat-icon-amber">
            <Clock size={24} />
          </div>
        </div>

        <div className="inquiry-stat-card">
          <div>
            <div className="stat-info-title">In Progress</div>
            <div className="stat-info-val">{inProgressCount}</div>
          </div>
          <div className="stat-icon-badge stat-icon-purple">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="inquiry-stat-card">
          <div>
            <div className="stat-info-title">Converted to Lead</div>
            <div className="stat-info-val">{convertedCount}</div>
          </div>
          <div className="stat-icon-badge stat-icon-emerald">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-filter-group">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by ID, customer name, company or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {INQUIRY_STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="All">All Sources</option>
            {INQUIRY_SOURCES.map(src => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredInquiries}
        loading={loading}
        emptyMessage="No inquiries found matching criteria."
      />

      {/* Modal: Create/Edit Inquiry */}
      {isFormModalOpen && (
        <Modal
          title={isEditing ? `Edit Inquiry ${formData.inquiryId}` : "Create New Customer Inquiry"}
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
        >
          <form onSubmit={handleFormSubmit}>
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Inquiry ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.inquiryId}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.expectedDate || ''}
                  onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rahul Patel"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rahul Furniture"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Source</label>
                <select
                  className="form-control"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  {INQUIRY_SOURCES.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {INQUIRY_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Product Name / Interest *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Conference Table, Modular Sofa"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Budget (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 150000"
                  value={formData.estimatedBudget}
                  onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-control"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {INQUIRY_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Requirement Details</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Specific customer requests, dimensions, design preferences..."
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Remarks</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Wants quotation before next week"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isEditing ? "Update Inquiry" : "Save Inquiry"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View Inquiry Details */}
      {isViewModalOpen && selectedInquiry && (
        <Modal
          title={`Inquiry Details: ${selectedInquiry.inquiryId}`}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{selectedInquiry.customerName}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{selectedInquiry.companyName || 'Individual Customer'}</p>
              </div>
              <div>
                {getStatusBadge(selectedInquiry.status)}
              </div>
            </div>

            <div className="modal-grid-2">
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  Contact Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><strong>Phone:</strong> {selectedInquiry.phone}</div>
                  <div><strong>Email:</strong> {selectedInquiry.email || 'N/A'}</div>
                  <div><strong>Inquiry Source:</strong> {selectedInquiry.source}</div>
                  <div><strong>Assigned To:</strong> {selectedInquiry.assignedTo}</div>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  Request Specifications
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><strong>Product:</strong> {selectedInquiry.product}</div>
                  <div><strong>Category:</strong> {selectedInquiry.category}</div>
                  <div><strong>Quantity:</strong> {selectedInquiry.quantity}</div>
                  <div><strong>Est. Budget:</strong> ₹{Number(selectedInquiry.estimatedBudget || 0).toLocaleString('en-IN')}</div>
                  <div><strong>Priority:</strong> {getPriorityBadge(selectedInquiry.priority)}</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                Requirement / Remarks
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#334155' }}>
                {selectedInquiry.requirement || selectedInquiry.remarks || 'No detailed requirement provided.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <button className="btn btn-secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </button>

              {!selectedInquiry.convertedToLead && selectedInquiry.status !== 'Converted to Lead' && (
                <button
                  className="btn-convert-customer"
                  onClick={() => handleConvertToLead(selectedInquiry._id || selectedInquiry.id)}
                >
                  <Sparkles size={16} /> Convert to Lead
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Inquiries;
