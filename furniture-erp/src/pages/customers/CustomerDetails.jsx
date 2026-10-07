import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LogisticsTimelineStepper from '../../components/LogisticsTimelineStepper';
import { 
  ArrowLeft, Edit, Mail, Phone, MapPin, DollarSign, Calendar, FileText, 
  ShoppingBag, Plus, Clock, UserCheck, Shield, CheckCircle2, MessageSquare, PlusCircle, Building, Hash 
} from 'lucide-react';
import '../../styles/customers.css';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [customerQuotations, setCustomerQuotations] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('schema'); // 'schema' | 'quotations' | 'orders' | 'history'

  // Activity note modal
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    type: 'note',
    description: ''
  });

  const loadCustomerData = async () => {
    try {
      const cust = await api.getCustomerById(id);
      if (cust) {
        setCustomer(cust);
        const [quotes, ords] = await Promise.all([
          api.getQuotations(),
          api.getOrders()
        ]);
        setCustomerQuotations((quotes || []).filter(q => q.customerId === cust.id || q.customerId === cust._id || String(q.customerId) === String(cust.id)));
        setCustomerOrders((ords || []).filter(o => o.customerId === cust.id || o.customerId === cust._id || String(o.customerId) === String(cust.id)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    const updated = await api.toggleCustomerStatus(customer.id || customer._id, newStatus);
    const updatedCust = (updated || []).find(c => c.id === customer.id || c._id === customer._id);
    if (updatedCust) setCustomer(updatedCust);
    else loadCustomerData();
  };

  const handleAddActivitySubmit = async (e) => {
    e.preventDefault();
    if (!newActivity.title.trim()) return;

    await api.addCustomerActivity(customer.id || customer._id, {
      title: newActivity.title,
      type: newActivity.type,
      description: newActivity.description
    });

    setIsActivityModalOpen(false);
    setNewActivity({ title: '', type: 'note', description: '' });
    await loadCustomerData();
  };

  if (!customer) return null;

  const creditLimit = customer.creditLimit || 0;
  const balance = customer.outstandingBalance || 0;
  const availableCredit = Math.max(0, creditLimit - balance);
  const creditUtilization = creditLimit > 0 ? Math.min(100, Math.round((balance / creditLimit) * 100)) : 0;

  const companyName = customer.companyName || customer.name;
  const customerName = customer.customerName || customer.contactPerson || 'N/A';
  const email = customer.email || 'N/A';
  const phone = customer.phone || 'N/A';
  const address = customer.address || customer.billingAddress?.street || 'N/A';
  const city = customer.city || customer.billingAddress?.city || 'N/A';
  const state = customer.state || customer.billingAddress?.state || 'N/A';
  const gstNumber = customer.gstNumber || customer.gstin || 'N/A';
  const customerType = customer.customerType || customer.category || 'N/A';
  const createdDate = customer.createdDate || customer.joinedDate || 'N/A';

  return (
    <div>
      {/* Header & Navigation */}
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')} style={{ marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Directory
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{companyName}</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', background: 'var(--slate-100)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
              {customer.id || customer.customerId}
            </span>
          </div>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/quotations/create?customerId=${customer.id}`)}>
            <Plus size={16} /> Create Quotation
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/customers/edit/${customer.id}`)}>
            <Edit size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Top Banner Card */}
      <div className="customer-detail-header">
        <div className="customer-avatar-large">
          {companyName.charAt(0)}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-900)' }}>{companyName}</h2>
            <StatusBadge status={customer.status} />

            {/* Quick Status Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--slate-500)', marginLeft: 'auto' }}>
              <span>Status:</span>
              <select
                value={customer.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--slate-300)',
                  background: 'white',
                  fontWeight: '600',
                  fontSize: '0.8rem'
                }}
              >
                <option value="Active">Active</option>
                <option value="Prospect">Prospect</option>
                <option value="On Hold">On Hold</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            {customerType} • Created: {createdDate}
            {gstNumber !== 'N/A' && (
              <span style={{ marginLeft: '1rem', color: 'var(--primary-700)', fontWeight: '600' }}>
                GSTIN: {gstNumber}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Card 1: Credit & Receivables */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--slate-400)' }}>Financial Overview</span>
            <span className="badge" style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.7rem', fontWeight: '700' }}>{customer.paymentTerms || 'Net 30'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Credit Limit</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--slate-800)' }}>
                ₹{creditLimit.toLocaleString('en-IN')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Outstanding Due</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: balance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                ₹{balance.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Credit limit progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '4px' }}>
              <span>Available: ₹{availableCredit.toLocaleString('en-IN')}</span>
              <span>{creditUtilization}% Used</span>
            </div>
            <div style={{ height: '6px', background: 'var(--slate-100)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${creditUtilization}%`, background: creditUtilization > 80 ? '#ef4444' : 'var(--primary-600)', borderRadius: '3px' }} />
            </div>
          </div>
        </div>

        {/* Card 2: Primary Customer Contact */}
        <div className="card">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--slate-400)', marginBottom: '0.75rem' }}>
            Customer Name (Contact Person)
          </div>
          <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--slate-900)' }}>
            {customerName}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.875rem' }}>
            Primary Representative
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-700)' }}>
              <Mail size={14} color="var(--primary-600)" />
              <a href={`mailto:${email}`} style={{ color: 'var(--primary-700)', textDecoration: 'none' }}>{email}</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-700)' }}>
              <Phone size={14} color="var(--primary-600)" />
              <a href={`tel:${phone}`} style={{ color: 'var(--slate-700)', textDecoration: 'none' }}>{phone}</a>
            </div>
          </div>
        </div>

        {/* Card 3: Location Details */}
        <div className="card">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--slate-400)', marginBottom: '0.75rem' }}>
            Location & GST Details
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
            <MapPin size={18} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)', lineHeight: '1.4' }}>
              <div>{address}</div>
              <div style={{ fontWeight: '600', color: 'var(--slate-900)' }}>{city}, {state}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.5rem', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
            <strong>GST Number:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary-700)' }}>{gstNumber}</span>
          </div>
        </div>

      </div>

      {/* Main Tabbed Details Section */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        
        {/* Tab Headers */}
        <div style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', display: 'flex', gap: '1rem', padding: '0 1.5rem' }}>
          <button
            onClick={() => setActiveTab('schema')}
            style={{
              padding: '1rem 0.5rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'schema' ? '3px solid var(--primary-600)' : '3px solid transparent',
              fontWeight: activeTab === 'schema' ? '700' : '600',
              color: activeTab === 'schema' ? 'var(--primary-700)' : 'var(--slate-600)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem'
            }}
          >
            <UserCheck size={16} /> Complete Customer Schema
          </button>

          <button
            onClick={() => setActiveTab('quotations')}
            style={{
              padding: '1rem 0.5rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'quotations' ? '3px solid var(--primary-600)' : '3px solid transparent',
              fontWeight: activeTab === 'quotations' ? '700' : '600',
              color: activeTab === 'quotations' ? 'var(--primary-700)' : 'var(--slate-600)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem'
            }}
          >
            <FileText size={16} /> Customer Quotations ({customerQuotations.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '1rem 0.5rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'orders' ? '3px solid var(--primary-600)' : '3px solid transparent',
              fontWeight: activeTab === 'orders' ? '700' : '600',
              color: activeTab === 'orders' ? 'var(--primary-700)' : 'var(--slate-600)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem'
            }}
          >
            <ShoppingBag size={16} /> Sales Orders ({customerOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '1rem 0.5rem',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'history' ? '3px solid var(--primary-600)' : '3px solid transparent',
              fontWeight: activeTab === 'history' ? '700' : '600',
              color: activeTab === 'history' ? 'var(--primary-700)' : 'var(--slate-600)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem'
            }}
          >
            <Clock size={16} /> Customer History ({(customer.history || []).length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div style={{ padding: '1.5rem' }}>
          
          {/* 1. SCHEMA PROPERTIES TAB */}
          {activeTab === 'schema' && (
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '1.25rem' }}>Customer Record Properties</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', background: 'var(--slate-50)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>Customer ID</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-700)' }}>{customer.id || customer.customerId}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>Customer Name</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--slate-900)' }}>{customerName}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>Company Name</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-900)' }}>{companyName}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>Email</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--primary-700)' }}>{email}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>Phone</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--slate-800)' }}>{phone}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>Address</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--slate-800)' }}>{address}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>City</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--slate-900)' }}>{city}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>State</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--slate-900)' }}>{state}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>GST Number</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', fontFamily: 'monospace', color: 'var(--primary-700)' }}>{gstNumber}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>Customer Type</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--slate-900)' }}>{customerType}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>Created Date</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--slate-800)' }}>{createdDate}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>Status</span>
                  <div><StatusBadge status={customer.status} /></div>
                </div>
              </div>
            </div>
          )}

          {/* 2. QUOTATIONS TAB */}
          {activeTab === 'quotations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>Issued Quotations for {companyName}</h4>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/quotations/create?customerId=${customer.id}`)}
                >
                  <Plus size={14} /> Create Quotation for Client
                </button>
              </div>

              {customerQuotations.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Quotation Ref</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Quote Date</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Valid Until</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Subtotal</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Grand Total</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerQuotations.map((q) => (
                        <tr key={q.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                          <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: 'var(--primary-700)' }}>{q.id}</td>
                          <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-600)' }}>{q.date}</td>
                          <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-500)' }}>{q.validUntil}</td>
                          <td style={{ padding: '0.875rem 1rem' }}>₹{q.subtotal?.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: 'var(--slate-900)' }}>
                            ₹{q.grandTotal?.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={q.status} /></td>
                          <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => navigate(`/quotations/${q.id}`)}
                            >
                              View Quote
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--slate-50)', borderRadius: '8px' }}>
                  <FileText size={32} color="var(--slate-400)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ color: 'var(--slate-600)', margin: 0 }}>No quotations have been generated for this client yet.</p>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => navigate(`/quotations/create?customerId=${customer.id}`)}
                    style={{ marginTop: '0.875rem' }}
                  >
                    Generate First Quotation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. SALES ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>Sales Orders History</h4>
              </div>

              {customerOrders.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Order Ref</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Quotation Ref</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Order Date</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Fulfillment Timeline</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Due Date</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Order Status</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerOrders.map((o) => (
                        <tr key={o.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                          <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: 'var(--primary-700)' }}>{o.id}</td>
                          <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-500)' }}>{o.quotationId}</td>
                          <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-600)' }}>{o.orderDate}</td>
                          <td style={{ padding: '0.5rem 1rem', minWidth: '340px' }}>
                            <LogisticsTimelineStepper status={o.status} variant="mini" showBadge={false} />
                          </td>
                          <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-600)' }}>{o.deliveryDueDate}</td>
                          <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: 'var(--slate-900)' }}>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={o.status} /></td>
                          <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={o.paymentStatus} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--slate-50)', borderRadius: '8px' }}>
                  <ShoppingBag size={32} color="var(--slate-400)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ color: 'var(--slate-600)', margin: 0 }}>No active or past sales orders recorded for this client.</p>
                </div>
              )}
            </div>
          )}

          {/* 4. CUSTOMER HISTORY & TIMELINE TAB */}
          {activeTab === 'history' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>Interaction Log & Activity Timeline</h4>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsActivityModalOpen(true)}
                >
                  <PlusCircle size={14} /> Add Interaction / Note
                </button>
              </div>

              {customer.history && customer.history.length > 0 ? (
                <div className="customer-timeline">
                  {customer.history.map((act, idx) => (
                    <div key={act.id || idx} className="timeline-item">
                      <div className="timeline-marker" />
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--slate-900)' }}>{act.title}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{act.date}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', margin: '4px 0 0 0' }}>{act.description}</p>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginTop: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                          Logged by: {act.author || 'System'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>
                  No history logs recorded yet.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Add Activity / Call Note Modal */}
      {isActivityModalOpen && (
        <Modal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          title={`Log Interaction for ${companyName}`}
        >
          <form onSubmit={handleAddActivitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Interaction Type</label>
              <select
                className="form-control"
                value={newActivity.type}
                onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
              >
                <option value="note">Internal Note</option>
                <option value="call">Phone Call Summary</option>
                <option value="meeting">Client Meeting</option>
                <option value="email">Email Communication</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Title / Heading *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Phone call regarding project delivery timelines"
                value={newActivity.title}
                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Notes / Summary</label>
              <textarea
                rows={3}
                className="form-control"
                placeholder="Details of conversation or action items..."
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsActivityModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Interaction Log
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CustomerDetails;
