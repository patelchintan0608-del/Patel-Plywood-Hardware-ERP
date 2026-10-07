import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { ArrowLeft, Edit, Printer, ShoppingBag, Calendar, CheckCircle, Trash2, AlertTriangle, FileText, User, MessageCircle } from 'lucide-react';
import '../../styles/quotations.css';

const QuotationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      const q = await api.getQuotationById(id);
      if (q) {
        setQuotation(q);
      } else {
        navigate('/quotations');
      }
    };
    fetchQuote();
  }, [id, navigate]);

  if (!quotation) return null;

  const acceptQuotation = async (quotationId) => {
    try {
      await api.acceptQuotation(quotationId);
      setQuotation(prev => ({ ...prev, status: 'Accepted' }));
      alert('Quotation accepted and Sales Order created!');
      navigate('/orders');
    } catch (err) {
      console.error('Failed to accept quotation & create order:', err);
      alert(err.response?.data?.message || 'Failed to create Sales Order');
    }
  };

  const handleStatusChange = async (newStatus) => {
    const updatedQuotes = await api.updateQuotationStatus(quotation.id || quotation._id, newStatus);
    const updatedQuote = (updatedQuotes || []).find(q => q.id === quotation.id || q._id === quotation._id);
    if (updatedQuote) setQuotation(updatedQuote);

    if (newStatus === 'Accepted' && quotation.status !== 'Accepted') {
      await acceptQuotation(quotation._id || quotation.id);
    }
  };

  const confirmDelete = async () => {
    await api.deleteQuotation(quotation.id || quotation._id);
    navigate('/quotations');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/quotations')} style={{ marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Quotations
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="page-title">Quotation {quotation.id}</h1>
            <StatusBadge status={quotation.status} />

            {/* Status Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--slate-500)' }}>Status:</span>
              <select
                value={quotation.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--slate-300)',
                  background: 'white',
                  fontWeight: '600'
                }}
              >
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/quotations/edit/${quotation.id}`)}>
            <Edit size={16} /> Edit Quote
          </button>
          <button 
            className="btn" 
            onClick={() => {
              const phone = quotation.phone || quotation.customerPhone || '9876543210';
              const cleanPhone = String(phone).replace(/\D/g, '');
              const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
              const itemsSummary = (quotation.items || [])
                .map((item, idx) => `${idx + 1}. *${item.productName || item.name}* (Qty: ${item.quantity || item.qty}) - ₹${(item.total || 0).toLocaleString('en-IN')}`)
                .join('\n');
              const message = `*WOODCRAFT FURNITURE ERP - COMMERCIAL QUOTATION* 📄\n\n` +
                `Hello *${quotation.customerName}*,\n\n` +
                `Here is the quotation summary:\n` +
                `🔹 *Ref*: ${quotation.id}\n` +
                `📅 *Date*: ${quotation.date}\n` +
                `💰 *Total*: ₹${quotation.grandTotal?.toLocaleString('en-IN')}\n\n` +
                `*ITEMS*:\n${itemsSummary}\n\n` +
                `Regards,\n*WoodCraft Team*`;
              window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
            }}
            style={{ backgroundColor: '#25D366', color: 'white', border: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button className="btn btn-outline" onClick={() => navigate(`/quotations/preview/${quotation.id}`)}>
            <Printer size={16} /> PDF Preview / Print
          </button>
          {quotation.status === 'Accepted' && (
            <button className="btn btn-primary" onClick={() => acceptQuotation(quotation._id || quotation.id)}>
              <ShoppingBag size={16} /> Convert to Sales Order
            </button>
          )}
          <button className="btn btn-danger" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Client & Date Info Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>CLIENT COMPANY</span>
            <h3 
              style={{ fontSize: '1.15rem', color: 'var(--primary-700)', cursor: 'pointer', marginTop: '2px' }}
              onClick={() => quotation.customerId && navigate(`/customers/${quotation.customerId}`)}
            >
              {quotation.customerName}
            </h3>
            {quotation.customerId && (
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>ID: {quotation.customerId}</div>
            )}
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>ISSUE DATE</span>
            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Calendar size={15} color="var(--primary-600)" /> {quotation.date}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700' }}>VALID UNTIL</span>
            <div style={{ fontWeight: '600', color: 'var(--warning)', marginTop: '4px' }}>{quotation.validUntil}</div>
          </div>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--slate-900)' }}>Itemized Furniture Costing</h3>
        
        <table className="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item Description</th>
              <th>Timber / Wood Species</th>
              <th>Stain & Finish</th>
              <th>Qty</th>
              <th>Unit Price (₹)</th>
              <th style={{ textAlign: 'right' }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items?.map((item, idx) => (
              <tr key={idx}>
                <td style={{ color: 'var(--slate-400)' }}>{idx + 1}</td>
                <td style={{ fontWeight: '600', color: 'var(--slate-900)' }}>{item.name}</td>
                <td>{item.woodType || 'Standard Hardwood'}</td>
                <td>{item.finish || 'Natural Finish'}</td>
                <td style={{ fontWeight: '600' }}>{item.qty}</td>
                <td>₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--primary-700)' }}>
                  ₹{item.total?.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Totals Card */}
        <div className="quote-summary-card">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{quotation.subtotal?.toLocaleString('en-IN')}</span>
          </div>
          {quotation.discount > 0 && (
            <div className="summary-row">
              <span>Discount:</span>
              <span style={{ color: 'var(--danger)' }}>-₹{quotation.discount?.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="summary-row">
            <span>GST Tax (18%):</span>
            <span>₹{quotation.tax?.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row total">
            <span>Grand Total:</span>
            <span>₹{quotation.grandTotal?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {quotation.notes && (
        <div className="card">
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--slate-700)' }}>Notes & Commercial Agreement Terms</h4>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: '1.5' }}>{quotation.notes}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Quotation Deletion"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ color: '#991b1b', margin: 0, fontSize: '0.95rem' }}>Are you sure you want to delete quotation {quotation.id}?</h4>
                <p style={{ color: '#7f1d1d', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Client: {quotation.customerName} • Grand Total: ₹{quotation.grandTotal?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete Quotation Permanently
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default QuotationDetails;
