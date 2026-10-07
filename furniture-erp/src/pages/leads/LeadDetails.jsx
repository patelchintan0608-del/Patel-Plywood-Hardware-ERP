import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Phone,
  Mail,
  Building,
  UserCheck,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  CheckCircle,
  Plus,
  Send,
  Sparkles,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import '../../styles/leads.css';
import '../../styles/inquiries.css';

const FOLLOW_UP_TYPES = [
  "Phone Call",
  "WhatsApp",
  "Email",
  "Meeting",
  "Site Visit",
  "Product Demo"
];

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('followups'); // 'followups', 'timeline', 'quotations'

  // Log Follow-up Modal
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpData, setFollowUpData] = useState({
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '11:30 AM',
    followUpType: 'Phone Call',
    assignedEmployee: 'Amit',
    remarks: 'Discuss sofa customization',
    status: 'Pending'
  });

  const loadLeadDetails = async () => {
    setLoading(true);
    try {
      const [leadData, prodsData, custsData, quotesData] = await Promise.all([
        api.getLeadById(id),
        api.getProducts(),
        api.getCustomers(),
        api.getQuotations()
      ]);
      setLead(leadData);
      setProducts(prodsData || []);
      setCustomers(custsData || []);
      setQuotations(quotesData || []);
    } catch (err) {
      console.error("Error loading lead details & ERP data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeadDetails();
  }, [id]);

  // Find matched product from MongoDB catalog
  const matchedProduct = lead ? products.find(p => (p.id || p._id || p.sku) === lead.productId || (p.productName || p.name) === lead.productInterest) : null;
  const realStockQty = matchedProduct ? Number(matchedProduct.stockQuantity ?? matchedProduct.stock ?? matchedProduct.quantity ?? 0) : 25;

  // Find linked customer quotations
  const leadQuotations = quotations.filter(q => 
    (lead && lead.convertedCustomerId && (q.customerId === lead.convertedCustomerId || q.customerName === lead.companyName)) ||
    (lead && (q.customerName === lead.leadName || q.customerName === lead.companyName))
  );

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    try {
      await api.addLeadFollowUp(id, followUpData);
      setIsFollowUpModalOpen(false);
      loadLeadDetails();
    } catch (err) {
      alert("Failed to schedule follow-up.");
    }
  };

  const handleToggleFollowUpStatus = async (followupId, currentStatus) => {
    const nextStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    try {
      await api.updateFollowUpStatus(id, followupId, { status: nextStatus });
      loadLeadDetails();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleConvertToCustomer = async () => {
    if (window.confirm(`Convert Lead ${lead.leadId} (${lead.leadName}) into an active Customer record?`)) {
      try {
        const res = await api.convertLeadToCustomer(lead._id || lead.id);
        alert(`Successfully created Customer ${res.data?.customerId || ''}! You can now generate a quotation.`);
        loadLeadDetails();

        if (window.confirm("Would you like to create a Quotation for this Customer now?")) {
          const prodId = matchedProduct ? (matchedProduct.id || matchedProduct._id) : (lead.productId || '');
          navigate(`/quotations/create?customerId=${res.data?.customerId || ''}&customerName=${encodeURIComponent(lead.companyName || lead.leadName)}&productId=${prodId}`);
        }
      } catch (err) {
        alert("Failed to convert lead to customer.");
      }
    }
  };

  if (loading) {
    return <div className="erp-page" style={{ padding: '2rem', textAlign: 'center' }}>Loading Lead Details...</div>;
  }

  if (!lead) {
    return (
      <div className="erp-page" style={{ padding: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/leads')}>
          <ArrowLeft size={16} /> Back to Leads
        </button>
        <h2 style={{ marginTop: '1rem' }}>Lead Not Found</h2>
      </div>
    );
  }

  return (
    <div className="lead-details-container erp-page">
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/leads')}>
          <ArrowLeft size={16} /> Back to Leads
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!lead.convertedToCustomer ? (
            <button className="btn-convert-customer" onClick={handleConvertToCustomer}>
              <UserCheck size={18} /> Convert to Customer
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ background: '#ecfdf5', color: '#059669', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem' }}>
                ✓ Converted Customer ({lead.convertedCustomerId || 'CUS-00001'})
              </span>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const prodId = matchedProduct ? (matchedProduct.id || matchedProduct._id) : (lead.productId || '');
                  navigate(`/quotations/create?customerId=${lead.convertedCustomerId || 'CUS-00001'}&customerName=${encodeURIComponent(lead.companyName || lead.leadName)}&productId=${prodId}`);
                }}
              >
                <FileText size={16} /> Create Quotation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Lead Banner */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8125rem' }}>
                {lead.leadId}
              </span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {lead.leadName}
              </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
              Company: <strong>{lead.companyName}</strong> | Contact: <strong>{lead.contactPerson}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge-inquiry-status badge-status-qualified" style={{ fontSize: '0.875rem', padding: '0.4rem 0.85rem' }}>
              {lead.status}
            </span>
            <span className={`priority-tag priority-${(lead.priority || 'medium').toLowerCase()}`} style={{ fontSize: '0.875rem', padding: '0.4rem 0.75rem' }}>
              {lead.priority} Priority
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Info Cards vs Timeline/Followups */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem' }}>
        
        {/* Left Column: Specs, Real Stock & Contact Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Contact Information */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              Contact Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={16} color="#64748b" />
                <span><strong>Name:</strong> {lead.contactPerson}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="#64748b" />
                <span><strong>Phone:</strong> {lead.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="#64748b" />
                <span><strong>Email:</strong> {lead.email || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} color="#64748b" />
                <span><strong>Company:</strong> {lead.companyName}</span>
              </div>
            </div>
          </div>

          {/* Real Stock & Product Interest Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              📦 Product Interest & Live Stock
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div><strong>Product:</strong> {lead.productInterest}</div>
              <div><strong>Category:</strong> {lead.category}</div>
              {matchedProduct ? (
                <div>
                  <strong>Catalog Price:</strong>{' '}
                  <span style={{ fontWeight: 700, color: '#059669' }}>
                    ₹{Number(matchedProduct.unitPrice || matchedProduct.price || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ) : null}

              {/* Stock availability indicator */}
              <div style={{ marginTop: '0.25rem', padding: '0.6rem 0.75rem', background: realStockQty > 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', border: `1px solid ${realStockQty > 0 ? '#bbf7d0' : '#fecaca'}` }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: realStockQty > 0 ? '#15803d' : '#dc2626' }}>
                  {realStockQty > 0 ? `✓ In Stock (${realStockQty} available)` : '⚠️ Out of Stock (Pre-order required)'}
                </div>
              </div>
            </div>
          </div>

          {/* Lead Information */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              Lead Financials
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div><strong>Lead Source:</strong> {lead.source}</div>
              <div>
                <strong>Estimated Value:</strong>{' '}
                <span style={{ color: '#059669', fontWeight: 700, fontSize: '1rem' }}>
                  ₹{Number(lead.estimatedValue || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div><strong>Assigned To:</strong> {lead.assignedTo || 'Sales Executive'}</div>
              <div><strong>Expected Closing:</strong> {lead.expectedClosingDate || '15 Oct 2026'}</div>
              {lead.notes && (
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', marginTop: '0.5rem', fontSize: '0.8125rem', color: '#334155' }}>
                  <strong>Notes:</strong> {lead.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tabs (Follow-up Management, Quotations & Timeline) */}
        <div>
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            
            {/* Tabs Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  style={{
                    border: 'none',
                    background: 'none',
                    paddingBottom: '0.5rem',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: activeTab === 'followups' ? '#2563eb' : '#64748b',
                    borderBottom: activeTab === 'followups' ? '2px solid #2563eb' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveTab('followups')}
                >
                  📅 Follow-ups ({lead.followUps ? lead.followUps.length : 0})
                </button>

                <button
                  style={{
                    border: 'none',
                    background: 'none',
                    paddingBottom: '0.5rem',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: activeTab === 'quotations' ? '#2563eb' : '#64748b',
                    borderBottom: activeTab === 'quotations' ? '2px solid #2563eb' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveTab('quotations')}
                >
                  📄 Quotations ({leadQuotations.length})
                </button>

                <button
                  style={{
                    border: 'none',
                    background: 'none',
                    paddingBottom: '0.5rem',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: activeTab === 'timeline' ? '#2563eb' : '#64748b',
                    borderBottom: activeTab === 'timeline' ? '2px solid #2563eb' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveTab('timeline')}
                >
                  🕒 Activity Timeline ({lead.activityTimeline ? lead.activityTimeline.length : 0})
                </button>
              </div>

              {activeTab === 'followups' && (
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}
                  onClick={() => setIsFollowUpModalOpen(true)}
                >
                  <Plus size={14} /> Schedule Follow-up
                </button>
              )}

              {activeTab === 'quotations' && (
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}
                  onClick={() => {
                    const prodId = matchedProduct ? (matchedProduct.id || matchedProduct._id) : (lead.productId || '');
                    const custId = lead.convertedCustomerId || '';
                    navigate(`/quotations/create?customerId=${custId}&customerName=${encodeURIComponent(lead.companyName || lead.leadName)}&productId=${prodId}`);
                  }}
                >
                  <Plus size={14} /> New Quotation
                </button>
              )}
            </div>

            {/* TAB 1: Follow-up Management */}
            {activeTab === 'followups' && (
              <div>
                {(!lead.followUps || lead.followUps.length === 0) ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                    <Calendar size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600 }}>No follow-ups logged yet.</p>
                    <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setIsFollowUpModalOpen(true)}>
                      Schedule First Follow-up
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {lead.followUps.map((f, idx) => (
                      <div
                        key={f.id || idx}
                        style={{
                          background: f.status === 'Completed' ? '#f8fafc' : '#ffffff',
                          border: `1px solid ${f.status === 'Completed' ? '#e2e8f0' : '#cbd5e1'}`,
                          borderRadius: '10px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                              {f.followUpType}
                            </span>
                            <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              Assigned: {f.assignedEmployee || 'Sales'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.35rem' }}>
                            📅 <strong>Date:</strong> {f.followUpDate} | ⏰ <strong>Time:</strong> {f.followUpTime}
                          </div>

                          {f.remarks && (
                            <div style={{ fontSize: '0.8125rem', color: '#334155', background: '#f1f5f9', padding: '0.4rem 0.75rem', borderRadius: '6px' }}>
                              <strong>Remark:</strong> {f.remarks}
                            </div>
                          )}
                        </div>

                        <div>
                          <button
                            onClick={() => handleToggleFollowUpStatus(f._id || f.id, f.status)}
                            style={{
                              border: 'none',
                              padding: '0.4rem 0.85rem',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              background: f.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                              color: f.status === 'Completed' ? '#15803d' : '#b45309'
                            }}
                          >
                            {f.status === 'Completed' ? '✓ Completed' : '⏳ Mark Done'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Quotations */}
            {activeTab === 'quotations' && (
              <div>
                {leadQuotations.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                    <FileText size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600 }}>No quotations generated for this lead yet.</p>
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: '0.5rem' }}
                      onClick={() => {
                        const prodId = matchedProduct ? (matchedProduct.id || matchedProduct._id) : (lead.productId || '');
                        const custId = lead.convertedCustomerId || '';
                        navigate(`/quotations/create?customerId=${custId}&customerName=${encodeURIComponent(lead.companyName || lead.leadName)}&productId=${prodId}`);
                      }}
                    >
                      Create First Quotation
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {leadQuotations.map(q => (
                      <div
                        key={q.id || q._id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.9375rem' }}>{q.id}</div>
                          <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                            Valid Until: {q.validUntil || 'N/A'} | Items: {(q.items || []).length}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                            ₹{Number(q.grandTotal || 0).toLocaleString('en-IN')}
                          </div>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ marginTop: '4px' }}
                            onClick={() => navigate(`/quotations/${q.id || q._id}`)}
                          >
                            View Quote
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Activity Timeline */}
            {activeTab === 'timeline' && (
              <div className="activity-timeline-container">
                {(!lead.activityTimeline || lead.activityTimeline.length === 0) ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No activity records found.
                  </div>
                ) : (
                  lead.activityTimeline.map((act, idx) => (
                    <div key={act.id || idx} className="timeline-item">
                      <div className="timeline-card">
                        <div className="timeline-header">
                          <span>{act.title}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{act.date}</span>
                        </div>
                        <div className="timeline-desc">{act.description}</div>
                        <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginTop: 4 }}>
                          By: {act.author || 'System'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Schedule Follow-up */}
      {isFollowUpModalOpen && (
        <Modal
          title={`Schedule Follow-up for ${lead.leadName}`}
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
        >
          <form onSubmit={handleAddFollowUp}>
            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Follow-up Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={followUpData.followUpDate}
                  onChange={(e) => setFollowUpData({ ...followUpData, followUpDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Time *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 11:30 AM"
                  value={followUpData.followUpTime}
                  onChange={(e) => setFollowUpData({ ...followUpData, followUpTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Type</label>
                <select
                  className="form-control"
                  value={followUpData.followUpType}
                  onChange={(e) => setFollowUpData({ ...followUpData, followUpType: e.target.value })}
                >
                  {FOLLOW_UP_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Employee</label>
                <input
                  type="text"
                  className="form-control"
                  value={followUpData.assignedEmployee}
                  onChange={(e) => setFollowUpData({ ...followUpData, assignedEmployee: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Remarks / Action Notes</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="e.g. Discuss sofa customization, fabric swatches & delivery timeline..."
                value={followUpData.remarks}
                onChange={(e) => setFollowUpData({ ...followUpData, remarks: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsFollowUpModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Follow-up
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LeadDetails;
