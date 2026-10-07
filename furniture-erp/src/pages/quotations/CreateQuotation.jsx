import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import { ArrowLeft, Plus, Trash2, Save, FileCheck, Package, AlertTriangle } from 'lucide-react';
import '../../styles/quotations.css';

const WOOD_TYPES = [
  'American Black Walnut',
  'Burmese Teak',
  'White Oak',
  'Hard Maple',
  'Cherry Wood',
  'Rosewood',
  'Sheesham Wood',
  'Engineered MDF'
];

const FINISHES = [
  'Satin Polyurethane',
  'Natural Teak Oil',
  'Espresso Stain',
  'Matte Hardwax Oil',
  'High Gloss Clear Lacquer',
  'Walnut Melamine',
  'Raw Unfinished'
];

const CreateQuotation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCustomerQuery = searchParams.get('customerId');
  const initialProductIdQuery = searchParams.get('productId');

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerQuery || '');
  const [status, setStatus] = useState('Pending');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('Standard 50% deposit required upon order confirmation. 5-Year Structural Warranty on all hardwood items. Lead time: 3-4 weeks.');

  const [items, setItems] = useState([]);

  // Modal & Error State
  const [showInsufficientStockModal, setShowInsufficientStockModal] = useState(false);
  const [insufficientStockDetails, setInsufficientStockDetails] = useState([]);
  const [stockError, setStockError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custs, prods] = await Promise.all([
          api.getCustomers(),
          api.getProducts()
        ]);
        
        setCustomers(custs || []);
        const activeProds = prods || [];
        setProducts(activeProds);

        if (custs && custs.length > 0 && !selectedCustomerId) {
          const matchedCust = initialCustomerQuery ? custs.find(c => c.id === initialCustomerQuery || c._id === initialCustomerQuery || c.customerId === initialCustomerQuery) : null;
          setSelectedCustomerId(matchedCust ? (matchedCust.id || matchedCust._id) : (custs[0].id || custs[0]._id));
        }

        // Initialize with matched product from query param or first real product
        if (activeProds.length > 0) {
          const targetProd = initialProductIdQuery 
            ? (activeProds.find(p => (p.id || p._id || p.sku) === initialProductIdQuery || p.productName === initialProductIdQuery || p.name === initialProductIdQuery) || activeProds[0])
            : activeProds[0];
          const unitP = Number(targetProd.unitPrice || targetProd.price || 0);
          setItems([{
            id: Date.now(),
            productId: targetProd.id || targetProd._id,
            name: targetProd.productName || targetProd.name || '',
            qty: 1,
            unitPrice: unitP,
            stockQuantity: Number(targetProd.stockQuantity ?? targetProd.stock ?? targetProd.quantity ?? 0),
            woodType: 'American Black Walnut',
            finish: 'Satin Polyurethane',
            total: unitP
          }]);
        } else {
          setItems([{
            id: Date.now(),
            productId: '',
            name: 'Plywood 18mm Marine BWP',
            qty: 1,
            unitPrice: 2850,
            stockQuantity: 32,
            woodType: 'American Black Walnut',
            finish: 'Satin Polyurethane',
            total: 2850
          }]);
        }
      } catch (err) {
        console.error("Failed to fetch initial quotation data:", err);
      }
    };
    fetchData();
  }, []);

  const handleProductSelect = (index, productId) => {
    const newItems = [...items];
    const selectedProd = products.find(p => (p.id || p._id || p.sku) === productId);

    if (selectedProd) {
      const uPrice = Number(selectedProd.unitPrice || selectedProd.price || 0);
      const q = Number(newItems[index].qty) || 1;
      const sQty = Number(selectedProd.stockQuantity ?? selectedProd.stock ?? selectedProd.quantity ?? 0);

      newItems[index] = {
        ...newItems[index],
        productId: selectedProd.id || selectedProd._id,
        name: selectedProd.productName || selectedProd.name || '',
        unitPrice: uPrice,
        stockQuantity: sQty,
        total: q * uPrice
      };
    } else {
      newItems[index].productId = productId;
    }

    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'qty' || field === 'unitPrice') {
      const q = parseFloat(newItems[index].qty) || 0;
      const p = parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].total = q * p;
    }

    setItems(newItems);
  };

  const addItem = () => {
    const defaultProd = products.length > 0 ? products[0] : null;
    const uPrice = defaultProd ? Number(defaultProd.unitPrice || defaultProd.price || 0) : 15000;
    const sQty = defaultProd ? Number(defaultProd.stockQuantity ?? defaultProd.stock ?? defaultProd.quantity ?? 0) : 50;

    setItems([
      ...items,
      {
        id: Date.now(),
        productId: defaultProd ? (defaultProd.id || defaultProd._id) : '',
        name: defaultProd ? (defaultProd.productName || defaultProd.name) : 'Custom Wood Specs Item',
        qty: 1,
        unitPrice: uPrice,
        stockQuantity: sQty,
        woodType: 'American Black Walnut',
        finish: 'Satin Polyurethane',
        total: uPrice
      }
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const numDiscount = Number(discount) || 0;
  const taxableAmount = Math.max(0, subtotal - numDiscount);
  const tax = taxableAmount * 0.18; // 18% GST
  const grandTotal = Math.max(0, taxableAmount + tax);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cust = customers.find(c => c.id === selectedCustomerId || c._id === selectedCustomerId);

    let nextNumStr = '0001';
    try {
      const existingQuotes = await api.getQuotations();
      const count = (existingQuotes || []).length;
      nextNumStr = String(count + 1).padStart(4, '0');
    } catch (err) {
      console.error("Failed to count quotations:", err);
    }

    const newQuotation = {
      quotationNumber: `QN-${nextNumStr}`,
      customerId: cust?._id || selectedCustomerId,
      customerName: cust ? (cust.name || cust.companyName || cust.customerName) : 'Unknown Client',
      date: new Date().toISOString().split('T')[0],
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil,
      status,
      items: items.map(item => ({
        ...item,
        productName: item.name || item.productName || 'Furniture Line Item',
        name: item.name || item.productName || 'Furniture Line Item',
        quantity: Number(item.qty || item.quantity || 1),
        qty: Number(item.qty || item.quantity || 1),
        price: Number(item.unitPrice || item.price || 0),
        unitPrice: Number(item.unitPrice || item.price || 0),
        total: Number(item.total || 0)
      })),
      subtotal,
      tax: parseFloat(tax.toFixed(2)),
      discount: numDiscount,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      notes
    };

    try {
      await api.saveQuotation(newQuotation);
      alert(`✓ Quotation ${newQuotation.quotationNumber} generated successfully!`);
      navigate('/quotations');
    } catch (err) {
      console.error("Failed to save quotation:", err);
      const msg = err.response?.data?.message || err.message || "Failed to save quotation.";
      alert(`Quotation generation failed: ${msg}`);
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/quotations')}>
          <ArrowLeft size={16} /> Back to Quotations
        </button>
      </div>

      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">New Commercial Furniture Quotation</h1>
          <p className="page-subtitle">Configure real stock timber specifications, GST tax calculations, and validity terms</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {stockError && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <Package size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 0.35rem 0', color: '#991b1b' }}>
                Quotation Generation Blocked — Insufficient Stock!
              </h4>
              <p style={{ fontSize: '0.85rem', margin: 0, whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                {stockError}
              </p>
            </div>
          </div>
        )}

        {/* Client & Header Details */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--slate-900)' }}>Header & Client Details</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Select Client / Customer *</label>
              <select
                className="form-control"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
              >
                {customers.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name || c.companyName} ({c.contactPerson || c.category || 'Client'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quotation Initial Status</label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Sent">Sent</option>
                <option value="Draft">Draft</option>
                <option value="Declined">Declined</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quotation Validity Until</label>
              <input
                type="date"
                className="form-control"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Real Stock Furniture Line Items */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>Furniture Line Items & Real Stock Specs</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Select real inventory items from MongoDB catalog with live stock tracking</p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
              <Plus size={14} /> Add Furniture Item
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="items-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Real Stock Item / Description</th>
                  <th style={{ width: '18%' }}>Timber Wood Species</th>
                  <th style={{ width: '18%' }}>Stain / Coating Finish</th>
                  <th style={{ width: '10%' }}>Qty</th>
                  <th style={{ width: '12%' }}>Unit Price (₹)</th>
                  <th style={{ width: '10%' }}>Total (₹)</th>
                  <th style={{ width: '2%' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const sQty = item.stockQuantity ?? 0;
                  return (
                    <tr key={item.id}>
                      <td>
                        {/* Real Stock Item Dropdown from MongoDB */}
                        {products.length > 0 ? (
                          <select
                            className="form-control"
                            value={item.productId || ''}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            style={{ fontWeight: '600' }}
                          >
                            <option value="">-- Select Real Product Stock --</option>
                            {products.map(p => {
                              const stockVal = p.stockQuantity ?? p.stock ?? p.quantity ?? 0;
                              const priceVal = Number(p.unitPrice || p.price || 0);
                              return (
                                <option key={p.id || p._id || p.sku} value={p.id || p._id}>
                                  {p.productName || p.name} — ₹{priceVal.toLocaleString()} (Available: {stockVal} {p.unit || 'units'})
                                </option>
                              );
                            })}
                          </select>
                        ) : null}

                        <input
                          type="text"
                          className="form-control"
                          style={{ marginTop: '6px', fontSize: '0.85rem' }}
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          placeholder="Item Description / Wood Spec"
                          required
                        />

                        {/* Live Stock Quantity Indicator Badge */}
                        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                          <Package size={13} color={sQty > 0 ? '#10b981' : '#ef4444'} />
                          <span style={{
                            color: sQty > 15 ? '#10b981' : sQty > 0 ? '#d97706' : '#ef4444',
                            fontWeight: '700'
                          }}>
                            {sQty > 0 ? `In Stock: ${sQty} available` : 'Out of Stock (Pre-order)'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={item.woodType}
                          onChange={(e) => handleItemChange(idx, 'woodType', e.target.value)}
                        >
                          {WOOD_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={item.finish}
                          onChange={(e) => handleItemChange(idx, 'finish', e.target.value)}
                        >
                          {FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="1"
                          className="form-control"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        />
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--slate-900)' }}>
                        ₹{(item.total || 0).toLocaleString()}
                      </td>
                      <td>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation & Terms */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--slate-900)' }}>Terms & Commercial Notes</h3>
            <textarea
              className="form-control"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, delivery schedule, warranty details..."
            />
          </div>

          <div className="card" style={{ background: 'var(--slate-50)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--slate-900)' }}>Quotation Total Breakdown</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                <span>Subtotal Items</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--slate-600)' }}>Special Discount (₹)</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: '110px', textAlign: 'right', padding: '4px 8px' }}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--slate-600)' }}>
                <span>GST Tax (18%)</span>
                <span>₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>

              <div style={{ height: '1px', background: 'var(--slate-200)', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.15rem', color: 'var(--primary-700)' }}>
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '0.75rem' }}
            >
              <FileCheck size={18} /> Generate Official Quotation
            </button>
          </div>
        </div>
      </form>

      {/* ❌ Insufficient Stock Modal Dialog */}
      {showInsufficientStockModal && (
        <Modal
          isOpen={showInsufficientStockModal}
          onClose={() => setShowInsufficientStockModal(false)}
          title="❌ Insufficient Stock"
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {insufficientStockDetails.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '1.15rem'
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#991b1b', marginBottom: '0.65rem' }}>
                  Product: {item.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#7f1d1d', marginBottom: '0.35rem' }}>
                  <span>Requested Quantity:</span>
                  <strong style={{ fontSize: '1rem' }}>{item.requested}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#7f1d1d' }}>
                  <span>Available Stock:</span>
                  <strong style={{ fontSize: '1rem', color: '#dc2626' }}>{item.available}</strong>
                </div>
              </div>
            ))}

            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.35rem 0 0 0', lineHeight: '1.5' }}>
              You cannot generate this quotation because the requested quantity exceeds available stock in inventory.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowInsufficientStockModal(false)}
                style={{ minWidth: '100px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CreateQuotation;
