import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../Components/StatusBadge';
import Modal from '../../Components/Modal';
import { api } from '../../services/api';
import {
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  LayoutDashboard,
  Users,
  AlertTriangle,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import CustomerDashboard from './CustomerDashboard';
import '../../styles/customers.css';

const Customers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'dashboard'
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Delete modal state
  const [deleteModalCustomer, setDeleteModalCustomer] = useState(null);

  const fetchCustomers = async () => {
    const data = await api.getCustomers();
    setCustomers(data || []);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const updated = await api.toggleCustomerStatus(id, newStatus);
    setCustomers(updated || []);
  };

  const confirmDelete = async () => {
    if (deleteModalCustomer) {
      const updated = await api.deleteCustomer(deleteModalCustomer.id || deleteModalCustomer._id);
      setCustomers(updated || []);
      setDeleteModalCustomer(null);
    }
  };

  const filteredCustomers = customers.filter((cust) => {
    const q = searchTerm.toLowerCase();
    const idStr = String(cust.id || cust.customerId || '').toLowerCase();
    const nameStr = String(cust.companyName || cust.name || '').toLowerCase();
    const contactStr = String(cust.customerName || cust.contactPerson || '').toLowerCase();
    const cityStr = String(cust.city || cust.billingAddress?.city || '').toLowerCase();
    const gstStr = String(cust.gstNumber || cust.gstin || '').toLowerCase();
    return idStr.includes(q) || nameStr.includes(q) || contactStr.includes(q) || cityStr.includes(q) || gstStr.includes(q);
  });

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* View Switch Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Customer Directory & Schema</h1>
          <p className="page-subtitle">Manage Customer ID, Company Name, Contact Name, GST Number, Location & Status</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ background: '#f1f5f9', padding: '2px', borderRadius: '6px', display: 'flex', gap: '2px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('directory')}
              style={{ border: 'none', padding: '0.25rem 0.55rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              <Users size={13} /> Directory View
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('dashboard')}
              style={{ border: 'none', padding: '0.25rem 0.55rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              <LayoutDashboard size={13} /> Dashboard View
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/customers/add')} style={{ padding: '0.35rem 0.7rem', fontSize: '0.78125rem' }}>
            <UserPlus size={14} /> Add Customer
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <CustomerDashboard />
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          
          {/* Top Search & Filter Bar */}
          <div
            style={{
              padding: '1.15rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Registered Customers ({filteredCustomers.length})
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, justifyContent: 'flex-end', minWidth: '240px' }}>
              <div className="search-bar" style={{ minWidth: '220px', maxWidth: '380px', width: '100%', flex: '1 1 auto' }}>
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Search by ID, name, company, city, GST..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Customer Table Wrapper */}
          <div className="customer-table-wrapper">
            <table className="customer-table">
              <colgroup>
                <col className="col-id" />
                <col className="col-company" />
                <col className="col-contact" />
                <col className="col-location" />
                <col className="col-date" />
                <col className="col-credit" />
                <col className="col-status" />
                <col className="col-action" />
              </colgroup>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>COMPANY / BUSINESS</th>
                  <th>CUSTOMER CONTACT</th>
                  <th>LOCATION</th>
                  <th>CREATED DATE</th>
                  <th>CREDIT / DUE (₹)</th>
                  <th>STATUS</th>
                  <th className="th-action">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((cust) => (
                    <tr key={cust.id || cust._id}>
                      <td>
                        <span className="customer-id">{cust.id || cust.customerId}</span>
                        {(cust.gstNumber || cust.gstin) && (
                          <div className="customer-gst">GST: {cust.gstNumber || cust.gstin}</div>
                        )}
                      </td>
                      <td>
                        <div className="company-name" onClick={() => navigate(`/customers/${cust.id}`)}>
                          {cust.companyName || cust.name}
                        </div>
                        <span className="customer-type">
                          {cust.customerType || cust.category || 'Retailer'}
                        </span>
                      </td>
                      <td>
                        <div className="contact-name">{cust.customerName || cust.contactPerson}</div>
                        {cust.email && (
                          <div className="contact-line" title={cust.email}>
                            <Mail size={14} /> {cust.email}
                          </div>
                        )}
                        {cust.phone && (
                          <div className="contact-line">
                            <Phone size={14} /> {cust.phone}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="location-main">
                          <MapPin size={14} /> {cust.city || cust.billingAddress?.city || 'vadodara'}
                        </div>
                        <div className="location-state">
                          {cust.state || cust.billingAddress?.state || 'Gujarat'}
                        </div>
                      </td>
                      <td>
                        <span className="created-date">{cust.createdDate || cust.joinedDate || '2026-10-01'}</span>
                      </td>
                      <td>
                        <div className={`credit-value ${cust.outstandingBalance > 0 ? 'due' : ''}`}>
                          ₹{Number(cust.outstandingBalance || 0).toLocaleString('en-IN')}
                        </div>
                        <span className="credit-limit">
                          Limit: ₹{Number(cust.creditLimit || 250000).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <StatusBadge status={cust.status || 'Active'} />
                          <select
                            className="status-select"
                            value={cust.status || 'Active'}
                            onChange={(e) => handleStatusChange(cust.id, e.target.value)}
                            title="Change Customer Status"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Prospect">Prospect</option>
                          </select>
                        </div>
                      </td>
                      <td className="td-action">
                        <div style={{ display: 'inline-flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button className="action-btn" onClick={() => navigate(`/customers/${cust.id}`)} title="View Profile">
                            <Eye size={13} /> View
                          </button>
                          <button className="action-btn" onClick={() => navigate(`/customers/edit/${cust.id}`)} title="Edit Customer">
                            <Edit size={13} /> Edit
                          </button>
                          <button className="action-btn danger" onClick={() => setDeleteModalCustomer(cust)} title="Delete Customer">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No matching registered customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Showing {filteredCustomers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length} entries
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button className="btn btn-secondary btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.85rem', padding: '0 0.5rem', fontWeight: '600', color: '#334155' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button className="btn btn-secondary btn-sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {deleteModalCustomer && (
            <Modal
              isOpen={!!deleteModalCustomer}
              onClose={() => setDeleteModalCustomer(null)}
              title="Confirm Customer Deletion"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ color: '#991b1b', margin: 0, fontSize: '0.95rem' }}>Are you sure you want to delete this customer record?</h4>
                    <p style={{ color: '#7f1d1d', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                      Customer ID: <strong>{deleteModalCustomer.id}</strong> • Company: <strong>{deleteModalCustomer.companyName || deleteModalCustomer.name}</strong>
                    </p>
                    {deleteModalCustomer.outstandingBalance > 0 && (
                      <p style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: '700', marginTop: '6px' }}>
                        Warning: This customer has an outstanding balance of ₹{deleteModalCustomer.outstandingBalance.toLocaleString('en-IN')}. Deactivating the account is recommended instead of permanent deletion.
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-secondary" onClick={() => setDeleteModalCustomer(null)}>
                    Cancel
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      handleStatusChange(deleteModalCustomer.id, 'Inactive');
                      setDeleteModalCustomer(null);
                    }}
                  >
                    Deactivate Account Instead
                  </button>
                  <button className="btn btn-danger" onClick={confirmDelete}>
                    Permanent Delete
                  </button>
                </div>
              </div>
            </Modal>
          )}

        </div>
      )}
    </div>
  );
};

export default Customers;
