import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Printer, Download, CheckCircle } from 'lucide-react';
import '../../styles/quotations.css';

const QuotationPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const q = await api.getQuotationById(id);
      const s = await api.getSettings();
      if (q) setQuotation(q);
      if (s) setSettings(s);
    };
    fetchData();
  }, [id]);

  if (!quotation || !settings) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Non-printable Action Bar */}
      <div className="page-header no-print">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/quotations/${id}`)} style={{ marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Quotation Details
          </button>
          <h1 className="page-title">Printable Quotation Document: {quotation.id}</h1>
          <p className="page-subtitle">Official commercial proposal ready for printing or saving as PDF</p>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate(`/quotations/edit/${quotation.id}`)}>
            Edit Details
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Paper Document Container */}
      <div className="quotation-preview-container">
        
        {/* Header Branding */}
        <div className="quote-paper-header">
          <div className="company-branding">
            <h2 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '4px' }}>{settings.companyName || 'WoodCraft Artisan ERP'}</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0' }}>{settings.companyAddress || '150 Industrial Woodcraft Way, Phase 2, GIDC, Gujarat'}</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0' }}>
              Email: {settings.email || 'info@woodcraft-erp.com'} | Phone: {settings.phone || '+91 79 5555 WOOD'}
            </p>
            {settings.companyAddress && (
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace', marginTop: '4px' }}>
                GSTIN: 24AAAAA0000A1Z5
              </p>
            )}
          </div>

          <div className="quote-badge-title" style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '1.8rem', letterSpacing: '0.05em', color: '#1e293b', margin: 0 }}>COMMERCIAL QUOTATION</h1>
            <p style={{ fontWeight: '700', color: '#b87333', fontSize: '1.1rem', margin: '4px 0' }}>Ref: {quotation.id}</p>
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: '2px 0' }}>Date Issued: <strong>{quotation.date}</strong></p>
            <p style={{ fontSize: '0.85rem', color: '#d97706', margin: '2px 0' }}>Valid Until: <strong>{quotation.validUntil}</strong></p>
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: '2px 0' }}>Status: <strong>{quotation.status}</strong></p>
          </div>
        </div>

        {/* Prepared For & Supplier Details */}
        <div className="quote-addresses" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '2rem 0', padding: '1rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h4 style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>CLIENT / PREPARED FOR:</h4>
            <p style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0f172a', margin: '0 0 4px 0' }}>{quotation.customerName}</p>
            <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>Client Ref ID: {quotation.customerId || 'N/A'}</p>
            <p style={{ color: '#475569', fontSize: '0.875rem', margin: '2px 0 0 0' }}>Attn: Commercial Procurement Dept</p>
          </div>
          <div>
            <h4 style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>SUPPLIER & SHOWROOM:</h4>
            <p style={{ fontWeight: '600', fontSize: '0.95rem', color: '#0f172a', margin: '0 0 4px 0' }}>Patel Plywood & Hardware Head Office</p>
            <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>GIDC Industrial Estate, Gujarat</p>
            <p style={{ color: '#475569', fontSize: '0.875rem', margin: '2px 0 0 0' }}>GSTIN: 24AAAAA0000A1Z5</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="preview-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px', width: '5%' }}>#</th>
              <th style={{ padding: '8px 10px' }}>Item Description & Specifications</th>
              <th style={{ padding: '8px 10px' }}>Wood Species</th>
              <th style={{ padding: '8px 10px' }}>Finish</th>
              <th style={{ padding: '8px 10px', width: '8%', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rate (₹)</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items?.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px', color: '#64748b' }}>{idx + 1}</td>
                <td style={{ padding: '10px', fontWeight: '600', color: '#0f172a' }}>{item.name}</td>
                <td style={{ padding: '10px', color: '#475569' }}>{item.woodType || 'Standard Hardwood'}</td>
                <td style={{ padding: '10px', color: '#475569' }}>{item.finish || 'Natural Finish'}</td>
                <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600' }}>{item.qty}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                  ₹{item.total?.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals & Terms */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '2.5rem' }}>
          <div style={{ maxWidth: '50%' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#475569', marginBottom: '6px', fontWeight: '700' }}>
              Payment & Commercial Terms:
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
              {quotation.notes || '50% deposit required upon order confirmation. 5-Year Structural Warranty on all hardwood furniture items. Lead time: 3-4 weeks.'}
            </p>
          </div>

          <div style={{ width: '300px', borderTop: '2px solid #cbd5e1', paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#475569' }}>
              <span>Subtotal:</span>
              <strong>₹{quotation.subtotal?.toLocaleString('en-IN')}</strong>
            </div>
            {quotation.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#dc2626' }}>
                <span>Discount:</span>
                <span>-₹{quotation.discount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#475569' }}>
              <span>GST Tax (18%):</span>
              <span>₹{quotation.tax?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #b87333', fontSize: '1.25rem', fontWeight: '800', color: '#7e431f', marginTop: '4px' }}>
              <span>Grand Total:</span>
              <span>₹{quotation.grandTotal?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Signature Authorization Block */}
        <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', paddingTop: '2rem', borderTop: '1px dashed #cbd5e1' }}>
          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ borderBottom: '1px solid #94a3b8', height: '40px', marginBottom: '8px' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Authorized Signatory</span>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>WoodCraft Sales Manager</div>
          </div>
          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ borderBottom: '1px solid #94a3b8', height: '40px', marginBottom: '8px' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Client Acceptance & Stamp</span>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Date: __________________</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuotationPreview;
