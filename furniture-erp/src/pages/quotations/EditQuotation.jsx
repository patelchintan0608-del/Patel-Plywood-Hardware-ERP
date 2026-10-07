import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Plus, Trash2, Save, FileCheck, Package } from 'lucide-react';
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

const EditQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [status, setStatus] = useState('Sent');
  const [validUntil, setValidUntil] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);

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

        const q = await api.getQuotationById(id);
        if (q) {
          setSelectedCustomerId(q.customerId || (custs[0] ? custs[0].id : ''));
          setStatus(q.status || 'Sent');
          setValidUntil(q.validUntil || '');
          setDiscount(q.discount || 0);
          setNotes(q.notes || '');
          
          const enrichedItems = (q.items || []).map(item => {
            const matchedProd = activeProds.find(p => (p.id || p._id || p.sku) === item.productId || (p.productName || p.name) === item.name);
            const stockQty = matchedProd ? Number(matchedProd.stockQuantity ?? matchedProd.stock ?? matchedProd.quantity ?? 0) : (item.stockQuantity ?? 25);
            return {
              ...item,
              productId: item.productId || (matchedProd ? (matchedProd.id || matchedProd._id) : ''),
              stockQuantity: stockQty
            };
          });
          setItems(enrichedItems);
        } else {
          navigate('/quotations');
        }
      } catch (err) {
        console.error("Failed to load quotation for edit:", err);
      }
    };
    fetchData();
  }, [id, navigate]);

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

  const [stockError, setStockError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cust = customers.find(c => c.id === selectedCustomerId || c._id === selectedCustomerId);

    const updatedQuotation = {
      id,
      _id: id.length === 24 ? id : undefined,
      customerId: selectedCustomerId,
      customerName: cust ? (cust.companyName || cust.name || cust.customerName) : 'Client',
      date: new Date().toISOString().split('T')[0],
      validUntil,
      status,
      items,
      subtotal,
      tax: parseFloat(tax.toFixed(2)),
      discount: numDiscount,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      notes
    };

    await api.saveQuotation(updatedQuotation);
    alert(`Quotation ${id} updated successfully!`);
    navigate(`/quotations/${id}`);
  };

  if (items.length === 0 && !selectedCustomerId) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/quotations')} style={{ marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Quotations
          </button>
          <h1 className="page-title">Edit Quotation: {id}</h1>
          <p className="page-subtitle">Update furniture specs, real MongoDB stock inventory, discounts and commercial terms</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--slate-900)' }}>Header & Client Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Client / Customer Account *</label>
              <select
                className="form-control"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
              >
                {customers.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name} ({c.contactPerson || c.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quotation Status</label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
                <option value="Sent">Sent</option>
                <option value="Draft">Draft</option>
                <option value="Expired">Expired</option>
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
                    <tr key={item.id || idx}>
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
                          value={item.woodType || 'American Black Walnut'}
                          onChange={(e) => handleItemChange(idx, 'woodType', e.target.value)}
                        >
                          {WOOD_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={item.finish || 'Satin Polyurethane'}
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
                        ₹{(item.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <button
                          type="button"
                          style={{ background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer', padding: '4px' }}
                          onClick={() => removeItem(idx)}
                          title="Delete Line Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation & Terms */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--slate-900)' }}>Terms & Special Notes</h3>
            <textarea
              className="form-control"
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="quote-summary-card">
            <div className="summary-row">
              <span>Subtotal:</span>
              <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
            </div>
            <div className="summary-row">
              <span>Commercial Discount (₹):</span>
              <input
                type="number"
                style={{ width: '100px', padding: '4px 6px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--slate-300)' }}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div className="summary-row">
              <span>GST Tax (18%):</span>
              <strong>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="summary-row total">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}>
              <Save size={18} /> Update Quotation
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditQuotation;

