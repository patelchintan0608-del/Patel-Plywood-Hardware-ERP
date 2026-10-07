import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  Kanban,
  Table as TableIcon,
  TrendingUp,
  Award,
  AlertCircle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  IndianRupee,
  ChevronRight,
  UserCheck,
  Calendar,
  Building,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../../Components/Modal';
import DataTable from '../../Components/DataTable';
import '../../styles/leads.css';
import '../../styles/inquiries.css';

const LEAD_SOURCES = [
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
  "Advertisement",
  "Other"
];

const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal / Quotation",
  "Negotiation",
  "Won",
  "Lost",
  "Not Interested",
  "On Hold",
  "Invalid"
];

const PIPELINE_STAGES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal / Quotation",
  "Negotiation",
  "Won"
];

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [activeMobileStage, setActiveMobileStage] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [formData, setFormData] = useState({
    leadId: '',
    leadName: '',
    contactPerson: '',
    companyName: '',
    phone: '',
    email: '',
    source: 'Website',
    productId: '',
    productInterest: 'Modular Sofa',
    category: 'Furniture',
    estimatedValue: '',
    assignedTo: 'Sales Executive',
    status: 'New',
    priority: 'Medium',
    expectedClosingDate: '',
    notes: ''
  });

  const loadAllData = async () => {
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
      console.error("Error loading leads & ERP catalog data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute Metrics
  const totalLeadsCount = leads.length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;
  const contactedCount = leads.filter(l => l.status === 'Contacted').length;
  const qualifiedCount = leads.filter(l => l.status === 'Qualified').length;
  const wonCount = leads.filter(l => l.status === 'Won').length;
  const lostCount = leads.filter(l => ['Lost', 'Not Interested', 'Invalid'].includes(l.status)).length;
  const totalPipelineVal = leads.reduce((acc, l) => acc + Number(l.estimatedValue || 0), 0);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedLead(null);
    const defaultProd = products.length > 0 ? products[0] : null;
    const defaultEst = defaultProd ? Number(defaultProd.unitPrice || defaultProd.price || 85000) : 85000;
    
    setFormData({
      leadId: `LD-${String(leads.length + 1).padStart(5, '0')}`,
      leadName: '',
      contactPerson: '',
      companyName: '',
      phone: '',
      email: '',
      source: 'Website',
      productId: defaultProd ? (defaultProd.id || defaultProd._id) : '',
      productInterest: defaultProd ? (defaultProd.productName || defaultProd.name) : 'Modular Sofa',
      category: defaultProd ? (defaultProd.category || 'Furniture') : 'Furniture',
      estimatedValue: defaultEst,
      assignedTo: 'Sales Executive',
      status: 'New',
      priority: 'High',
      expectedClosingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Interested in real stock inventory'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead) => {
    setIsEditing(true);
    setSelectedLead(lead);
    setFormData({
      ...lead,
      expectedClosingDate: lead.expectedClosingDate ? lead.expectedClosingDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.saveLead(formData);
      setIsModalOpen(false);
      loadAllData();
    } catch (err) {
      alert("Failed to save lead details.");
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await api.deleteLead(id);
        loadAllData();
      } catch (err) {
        alert("Failed to delete lead.");
      }
    }
  };

  const handleConvertToCustomer = async (leadId) => {
    if (window.confirm("Convert this Lead into an active Customer record in ERP?")) {
      try {
        const res = await api.convertLeadToCustomer(leadId);
        alert(`Lead successfully converted to Customer ${res.data?.customerId || ''}!`);
        loadAllData();
      } catch (err) {
        alert("Failed to convert lead to customer.");
      }
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchesQuery = searchQuery === '' ||
      (l.leadName && l.leadName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.contactPerson && l.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.companyName && l.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.leadId && l.leadId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.productInterest && l.productInterest.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || l.source === sourceFilter;
    const matchesPriority = priorityFilter === 'All' || l.priority === priorityFilter;

    return matchesQuery && matchesStatus && matchesSource && matchesPriority;
  });

  const getPriorityBadge = (priority) => {
    const p = (priority || 'Medium').toLowerCase();
    return <span className={`priority-tag priority-${p}`}>{priority || 'Medium'}</span>;
  };

  const columns = [
    {
      header: 'Lead Details',
      accessor: (row) => (
        <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/leads/${row._id || row.id}`)}>
          <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.8125rem' }}>{row.leadId}</div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.leadName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Contact: {row.contactPerson}</div>
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
      header: 'Product Interest',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.productInterest}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.category}</div>
        </div>
      )
    },
    {
      header: 'Source & Value',
      accessor: (row) => (
        <div>
          <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{row.source}</span>
          <div style={{ fontWeight: 700, color: '#059669', marginTop: 4 }}>
            ₹{Number(row.estimatedValue || 0).toLocaleString('en-IN')}
          </div>
        </div>
      )
    },
    {
      header: 'Stage & Priority',
      accessor: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
          <span className="badge-inquiry-status badge-status-qualified">{row.status}</span>
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
            title="View Details & Follow-ups"
            onClick={() => navigate(`/leads/${row._id || row.id}`)}
            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
          >
            <Eye size={14} color="#3b82f6" />
          </button>

          <button
            className="action-btn"
            title="Edit Lead"
            onClick={() => handleOpenEditModal(row)}
            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
          >
            <Edit2 size={14} color="#64748b" />
          </button>

          {!row.convertedToCustomer ? (
            <button
              className="btn-convert-lead"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
              title="Convert to Customer"
              onClick={() => handleConvertToCustomer(row._id || row.id)}
            >
              <UserCheck size={13} /> Convert Customer
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>✓ Customer</span>
          )}

          <button
            className="action-btn"
            title="Delete Lead"
            onClick={() => handleDeleteLead(row._id || row.id)}
            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fff5f5', cursor: 'pointer' }}
          >
            <Trash2 size={14} color="#ef4444" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="leads-container erp-page">
      {/* Header */}
      <div className="crm-header">
        <div className="crm-title-group">
          <h1><Users size={26} color="#2563eb" /> Lead Management</h1>
          <p className="crm-subtitle">Qualify potential customers, schedule follow-ups, and convert leads into sales opportunities.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px', gap: '2px' }}>
            <button
              style={{
                border: 'none',
                background: viewMode === 'kanban' ? '#ffffff' : 'transparent',
                padding: '0.25rem 0.55rem',
                borderRadius: '5px',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setViewMode('kanban')}
            >
              <Kanban size={13} /> Pipeline
            </button>
            <button
              style={{
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                padding: '0.25rem 0.55rem',
                borderRadius: '5px',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setViewMode('table')}
            >
              <TableIcon size={13} /> List View
            </button>
          </div>

          <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ padding: '0.35rem 0.7rem', fontSize: '0.78125rem' }}>
            <Plus size={14} /> New Lead
          </button>
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="inquiry-stats-grid">
        <div className="inquiry-stat-card">
          <div>
            <div className="stat-info-title">Total Leads</div>
            <div className="stat-info-val">{totalLeadsCount}</div>
          </div>
          <div className="stat-icon-badge stat-icon-blue">
            <Users size={16} />
          </div>
        </div>

        <div className="inquiry-stat-card">
          <div>
            <div className="stat-info-title">New Leads</div>
            <div className="stat-info-val">{newLeadsCount}</div>
          </div>
          <div className="stat-icon-badge stat-icon-amber">
            <Clock size={16} />
          </div>
        </div>

        <div className="inquiry-stat-card">
          <div>
            <div className="stat-info-title">Contacted</div>
            <div className="stat-info-val">{contactedCount}</div>
          </div>
          <div className="stat-icon-badge stat-icon-purple">
            <Phone size={16} />
          </div>
        </div>

        <div className="inquiry-stat-card">
          <div>
            <div className="stat-info-title">Qualified</div>
            <div className="stat-info-val">{qualifiedCount}</div>
          </div>
          <div className="stat-icon-badge stat-icon-emerald">
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="inquiry-stat-card">
          <div>
            <div className="stat-info-title">Won</div>
            <div className="stat-info-val">{wonCount}</div>
          </div>
          <div className="stat-icon-badge stat-icon-blue">
            <Award size={16} />
          </div>
        </div>

        <div className="inquiry-stat-card">
          <div>
            <div className="stat-info-title">Pipeline Value</div>
            <div className="stat-info-val" style={{ color: '#059669' }}>
              ₹{(totalPipelineVal / 100000).toFixed(1)}L
            </div>
          </div>
          <div className="stat-icon-badge stat-icon-emerald">
            <IndianRupee size={16} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-filter-group" style={{ flex: 1 }}>
          <div className="search-bar" style={{ width: '100%' }}>
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by Lead ID, company, contact person or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Stages</option>
            {LEAD_STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="All">All Sources</option>
            {LEAD_SOURCES.map(src => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Mobile Stage Switcher Pills */}
      {viewMode === 'kanban' && (
        <div className="mobile-stage-tabs-container">
          <button
            type="button"
            className={`mobile-stage-pill ${activeMobileStage === 'All' ? 'active' : ''}`}
            onClick={() => setActiveMobileStage('All')}
          >
            <span>All Stages</span>
            <span className="mobile-stage-count">{filteredLeads.length}</span>
          </button>
          {PIPELINE_STAGES.map(stage => {
            const count = filteredLeads.filter(l => l.status === stage).length;
            return (
              <button
                key={stage}
                type="button"
                className={`mobile-stage-pill ${activeMobileStage === stage ? 'active' : ''}`}
                onClick={() => setActiveMobileStage(stage)}
              >
                <span>{stage}</span>
                <span className="mobile-stage-count">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main View: Kanban Pipeline or Data Table */}
      {viewMode === 'kanban' ? (
        <div className="pipeline-board">
          {(activeMobileStage === 'All' ? PIPELINE_STAGES : PIPELINE_STAGES.filter(s => s === activeMobileStage)).map(stage => {
            const stageLeads = filteredLeads.filter(l => l.status === stage);
            const stageTotalVal = stageLeads.reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0);

            return (
              <div key={stage} className="pipeline-column">
                <div className="pipeline-column-header">
                  <span>{stage}</span>
                  <span className="pipeline-count-badge">{stageLeads.length}</span>
                </div>
                <div style={{ padding: '0.45rem 0.75rem', background: '#ffffff', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>
                  ₹{(stageTotalVal / 100000).toFixed(1)} Lakh
                </div>

                <div className="pipeline-column-body">
                  {stageLeads.length === 0 ? (
                    <div style={{ textTransform: 'uppercase', textAlign: 'center', color: '#cbd5e1', fontSize: '0.75rem', padding: '2rem 0', fontWeight: 700 }}>
                      No Leads in {stage}
                    </div>
                  ) : (
                    stageLeads.map(lead => (
                      <div
                        key={lead._id || lead.id}
                        className="lead-kanban-card"
                        onClick={() => navigate(`/leads/${lead._id || lead.id}`)}
                      >
                        <div className="lead-card-header">
                          <span className="lead-id-tag">{lead.leadId}</span>
                          {getPriorityBadge(lead.priority)}
                        </div>

                        <div className="lead-title">{lead.leadName}</div>
                        <div className="lead-contact-sub">
                          <Building size={12} /> {lead.contactPerson || lead.companyName}
                        </div>

                        <div style={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 600, marginBottom: '0.5rem' }}>
                          📦 {lead.productInterest}
                        </div>

                        <div className="lead-value-badge">
                          ₹{Number(lead.estimatedValue || 0).toLocaleString('en-IN')}
                        </div>

                        <div className="lead-meta-footer">
                          <span>Source: {lead.source}</span>
                          <span>Assigned: {lead.assignedTo || 'Sales'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredLeads}
          loading={loading}
          emptyMessage="No leads found matching criteria."
        />
      )}

      {/* Modal: Create/Edit Lead */}
      {isModalOpen && (
        <Modal
          title={isEditing ? `Edit Lead ${formData.leadId}` : "Create New Lead"}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleFormSubmit}>
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Lead ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.leadId}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link Existing Customer Account (Optional)</label>
                <select
                  className="form-control"
                  style={{ borderColor: '#3b82f6' }}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const cust = customers.find(c => (c.id || c._id) === cid);
                    if (cust) {
                      setFormData({
                        ...formData,
                        customerId: cust.id || cust._id,
                        leadName: cust.companyName || cust.name,
                        companyName: cust.companyName || cust.name,
                        contactPerson: cust.contactPerson || cust.name,
                        phone: cust.phone || formData.phone,
                        email: cust.email || formData.email
                      });
                    }
                  }}
                >
                  <option value="">-- Create New Lead (Or Select Customer) --</option>
                  {customers.map(c => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.name || c.companyName} ({c.phone || c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Lead / Company Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rahul Furniture"
                  value={formData.leadName}
                  onChange={(e) => setFormData({ ...formData, leadName: e.target.value, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rahul Patel"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
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
                <label className="form-label">Lead Source</label>
                <select
                  className="form-control"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  {LEAD_SOURCES.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Real Stock Product Interest *</label>
                <select
                  className="form-control"
                  style={{ fontWeight: '600' }}
                  value={formData.productId || ''}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const prod = products.find(p => (p.id || p._id || p.sku) === pid);
                    if (prod) {
                      const uPrice = Number(prod.unitPrice || prod.price || 0);
                      setFormData({
                        ...formData,
                        productId: prod.id || prod._id,
                        productInterest: prod.productName || prod.name,
                        category: prod.category || formData.category,
                        estimatedValue: uPrice > 0 ? uPrice : formData.estimatedValue
                      });
                    } else {
                      setFormData({ ...formData, productId: pid });
                    }
                  }}
                >
                  <option value="">-- Select Product Stock Item --</option>
                  {products.map(p => {
                    const sVal = p.stockQuantity ?? p.stock ?? p.quantity ?? 0;
                    const pVal = Number(p.unitPrice || p.price || 0);
                    return (
                      <option key={p.id || p._id || p.sku} value={p.id || p._id}>
                        {p.productName || p.name} — ₹{pVal.toLocaleString()} (Stock: {sVal})
                      </option>
                    );
                  })}
                </select>

                <input
                  type="text"
                  className="form-control"
                  style={{ marginTop: '6px', fontSize: '0.85rem' }}
                  placeholder="Custom Product Specs / Interest Name"
                  value={formData.productInterest}
                  onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Furniture, Plywood"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Value (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 85000"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                />
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
                <label className="form-label">Lead Status Stage</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {LEAD_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
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
                <label className="form-label">Expected Closing Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.expectedClosingDate || ''}
                  onChange={(e) => setFormData({ ...formData, expectedClosingDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Notes & Customization Details</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="e.g. Interested in custom design, fabric choices..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isEditing ? "Update Lead" : "Save Lead"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Leads;
