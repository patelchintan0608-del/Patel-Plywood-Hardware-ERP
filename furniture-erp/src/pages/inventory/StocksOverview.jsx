import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import { api } from '../../services/api';
import {
  Package,
  Plus,
  Search,
  Grid,
  List,
  Edit,
  Trash2,
  Tag,
  Layers,
  Armchair,
  DoorClosed,
  ShieldCheck,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Info,
  ShoppingCart
} from 'lucide-react';

const StocksOverview = () => {
  const navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All');
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [stockInQty, setStockInQty] = useState(20);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Sunmica',
    unitPrice: '',
    unit: 'Sheet (8x4 ft)',
    sku: '',
    quantity: 50,
    reserved: 0,
    warehouseLocation: 'Warehouse A - Bay 01',
    description: '',
    status: 'In Stock'
  });

  const categories = [
    { key: 'All', label: 'All Categories', icon: Package },
    { key: 'Sunmica', label: 'Sunmica', icon: Layers },
    { key: 'Plywood', label: 'Plywood', icon: Layers },
    { key: 'MDF', label: 'MDF Board', icon: DoorClosed },
    { key: 'Hardware', label: 'Hardware', icon: Armchair },
  ];

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const data = await api.getStocks();
      setStocks(data || []);
    } catch (e) {
      console.error("Stocks load error:", e);
    }
  };

  // KPI Computations
  const totalItemsCount = stocks.length;
  const totalStockQuantity = stocks.reduce((sum, s) => sum + Number(s.quantity || s.stock || 0), 0);
  const totalReservedQuantity = stocks.reduce((sum, s) => sum + Number(s.reserved || s.reservedQuantity || 0), 0);
  const totalAvailableForOrder = Math.max(0, totalStockQuantity - totalReservedQuantity);

  const inStockCount = stocks.filter(s => (s.quantity || s.stock || 0) >= 15).length;
  const lowStockCount = stocks.filter(s => (s.quantity || s.stock || 0) > 0 && (s.quantity || s.stock || 0) < 15).length;
  const outOfStockCount = stocks.filter(s => (s.quantity || s.stock || 0) === 0).length;

  // Filtered dataset
  const filteredStocks = stocks.filter(s => {
    const matchesCategory = selectedCategory === 'All'
      || s.category?.toLowerCase() === selectedCategory.toLowerCase()
      || (selectedCategory === 'Plywood' && s.category?.toLowerCase().includes('plywood'))
      || (selectedCategory === 'MDF' && (s.category?.toLowerCase().includes('mdf') || s.category?.toLowerCase().includes('door')));

    const qty = Number(s.quantity || s.stock || 0);
    let matchesStatus = true;
    if (selectedStockStatus === 'In Stock') matchesStatus = qty >= 15;
    else if (selectedStockStatus === 'Low Stock') matchesStatus = qty > 0 && qty < 15;
    else if (selectedStockStatus === 'Out of Stock') matchesStatus = qty === 0;

    return matchesCategory && matchesStatus;
  });

  const handleOpenStockInModal = (stockItem) => {
    setSelectedStockProduct(stockItem);
    setStockInQty(20);
    setIsStockInModalOpen(true);
  };

  const handleOpenEditModal = (stockItem) => {
    setSelectedStockProduct(stockItem);
    setFormData({
      name: stockItem.name || stockItem.productName || '',
      category: stockItem.category || 'Sunmica',
      unitPrice: stockItem.unitPrice || stockItem.price || '',
      unit: stockItem.unit || 'Piece',
      sku: stockItem.sku || '',
      quantity: stockItem.quantity ?? stockItem.stock ?? 0,
      reserved: stockItem.reserved ?? stockItem.reservedQuantity ?? 0,
      warehouseLocation: stockItem.warehouseLocation || 'Warehouse A - Bay 01',
      description: stockItem.description || '',
      status: stockItem.status || 'In Stock'
    });
    setIsEditModalOpen(true);
  };

  const handleStockInSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStockProduct) return;

    const currentQty = Number(selectedStockProduct.quantity || selectedStockProduct.stock || 0);
    const newQty = currentQty + Number(stockInQty);

    let newStatus = 'In Stock';
    if (newQty === 0) newStatus = 'Out of Stock';
    else if (newQty < 15) newStatus = 'Low Stock';

    const updated = {
      ...selectedStockProduct,
      quantity: newQty,
      stockQuantity: newQty,
      stock: newQty,
      status: newStatus
    };

    try {
      await api.saveStock(updated);
      await loadStocks();
    } catch (err) {
      console.error("Failed to update stock:", err);
    }

    setIsStockInModalOpen(false);
  };

  const handleDeleteStock = async (id) => {
    if (window.confirm('Are you sure you want to delete this stock entry?')) {
      try {
        await api.deleteStock(id);
        await loadStocks();
      } catch (e) {
        console.error("Delete failed:", e);
      }
    }
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    const qty = Number(formData.quantity || 0);
    let status = 'In Stock';
    if (qty === 0) status = 'Out of Stock';
    else if (qty < 15) status = 'Low Stock';

    const stockToSave = {
      ...formData,
      productName: formData.name,
      name: formData.name,
      id: selectedStockProduct ? selectedStockProduct.id : undefined,
      _id: selectedStockProduct ? selectedStockProduct._id : undefined,
      unitPrice: Number(formData.unitPrice || 0),
      price: Number(formData.unitPrice || 0),
      quantity: qty,
      stockQuantity: qty,
      stock: qty,
      reserved: Number(formData.reserved || 0),
      reservedQuantity: Number(formData.reserved || 0),
      status
    };

    try {
      await api.saveStock(stockToSave);
      await loadStocks();
    } catch (err) {
      console.error("Save stock error:", err);
    }

    setIsEditModalOpen(false);
  };

  const columns = [
    {
      header: 'SKU Code',
      accessor: 'sku',
      minWidth: '70px',
      render: (row) => <span style={{ fontWeight: '700', fontFamily: 'monospace', color: 'var(--primary-700)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{row.sku || row.id}</span>
    },
    {
      header: 'Stock Item & Specs',
      accessor: 'name',
      minWidth: '130px',
      render: (row) => (
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontWeight: '700', color: 'var(--slate-900)', fontSize: '0.75rem' }}>{row.name || row.productName}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)', marginTop: '1px' }}>
            Location: {row.warehouseLocation || 'Main Warehouse'}
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      minWidth: '70px',
      render: (row) => (
        <span className="badge badge-secondary" style={{ background: '#f1f5f9', color: '#334155', fontWeight: '600', fontSize: '0.7rem', padding: '1px 6px', whiteSpace: 'nowrap' }}>
          {row.category}
        </span>
      )
    },
    {
      header: 'Physical Stock',
      accessor: 'quantity',
      minWidth: '75px',
      render: (row) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: '800', fontSize: '0.78rem', color: '#0f172a' }}>
            {row.quantity || row.stock || 0}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '500', marginLeft: '3px' }}>{row.unit}</span>
        </div>
      )
    },
    {
      header: 'Reserved',
      accessor: 'reserved',
      minWidth: '60px',
      render: (row) => (
        <span style={{ color: '#d97706', fontWeight: '700', background: '#fef3c7', border: '1px solid #fde68a', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', whiteSpace: 'nowrap', display: 'inline-block' }}>
          {row.reserved || row.reservedQuantity || 0}
        </span>
      )
    },
    {
      header: 'Available for Order',
      accessor: 'availableQuantity',
      minWidth: '95px',
      render: (row) => {
        const avail = Math.max(0, (row.quantity || row.stock || 0) - (row.reserved || row.reservedQuantity || 0));
        return (
          <span style={{ fontWeight: '800', color: avail > 0 ? '#10b981' : '#ef4444', background: avail > 0 ? '#ecfdf5' : '#fef2f2', border: `1px solid ${avail > 0 ? '#a7f3d0' : '#fecaca'}`, padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', whiteSpace: 'nowrap', display: 'inline-block' }}>
            {avail} {row.unit}
          </span>
        );
      }
    },
    {
      header: 'Unit Rate (₹)',
      accessor: 'unitPrice',
      minWidth: '65px',
      render: (row) => (
        <span style={{ fontWeight: '700', color: 'var(--slate-900)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          ₹{(row.unitPrice || row.price || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Stock Status',
      accessor: 'status',
      minWidth: '75px',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Stocks Overview</h1>
          <p className="page-subtitle">Real-time inventory stock levels, physical vs reserved quantities & warehouse tracking</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => {
            setSelectedStockProduct(null);
            setFormData({
              name: '', category: 'Sunmica', unitPrice: '', unit: 'Sheet (8x4 ft)',
              sku: `STK-${Math.floor(100 + Math.random() * 900)}`, quantity: 50, reserved: 0,
              warehouseLocation: 'Warehouse A - Bay 01', description: '', status: 'In Stock'
            });
            setIsEditModalOpen(true);
          }}>
            <PlusCircle size={16} /> + Add Stock Item
          </button>
        </div>
      </div>

      {/* Real-time Allocation Pipeline Flow Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '1.25rem 1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#94a3b8' }}>
            <Boxes size={18} color="#10b981" /> STOCK RESERVATION & ALLOCATION PIPELINE
          </div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 10px', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.3)', fontWeight: '700' }}>
            Connected Database Sync
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', textAlign: 'center', fontSize: '0.8rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.6rem', borderRadius: '10px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>1. PROCUREMENT</div>
            <div style={{ fontWeight: '700', color: '#f8fafc', marginTop: '2px' }}>Purchase In</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.6rem', borderRadius: '10px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>2. PHYSICAL STOCK</div>
            <div style={{ fontWeight: '800', color: '#34d399', marginTop: '2px' }}>{totalStockQuantity} Units</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.6rem', borderRadius: '10px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>3. SALES RESERVED</div>
            <div style={{ fontWeight: '800', color: '#fbbf24', marginTop: '2px' }}>{totalReservedQuantity} Units</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.6rem', borderRadius: '10px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>4. AVAILABLE FOR ORDER</div>
            <div style={{ fontWeight: '800', color: '#60a5fa', marginTop: '2px' }}>{totalAvailableForOrder} Units</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.6rem', borderRadius: '10px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>5. DISPATCH</div>
            <div style={{ fontWeight: '700', color: '#c084fc', marginTop: '2px' }}>Customer Delivery</div>
          </div>
        </div>
      </div>

      {/* Top Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
        <StatCard
          title="Total Products"
          value={totalItemsCount.toString()}
          icon={<Boxes size={16} />}
          change={`${totalStockQuantity.toLocaleString()} Physical Units`}
          positive={true}
        />
        <StatCard
          title="In Stock"
          value={inStockCount.toString()}
          icon={<CheckCircle2 size={16} />}
          change="Available > 10 units"
          positive={true}
        />
        <StatCard
          title="Low Stock"
          value={lowStockCount.toString()}
          icon={<AlertTriangle size={16} />}
          change="Needs replenishment"
          positive={false}
        />
        <StatCard
          title="Out of Stock"
          value={outOfStockCount.toString()}
          icon={<Info size={16} />}
          change="0 physical balance"
          positive={false}
        />
        <StatCard
          title="Reserved Stock"
          value={totalReservedQuantity.toLocaleString()}
          icon={<Package size={16} />}
          change="Sales order allocation"
          positive={false}
        />
        <StatCard
          title="Available Stock"
          value={totalAvailableForOrder.toLocaleString()}
          icon={<ShoppingCart size={16} />}
          change="Physical - Reserved"
          positive={true}
        />
      </div>

      {/* Category Tabs & Status Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.key}
                  className={`btn btn-sm ${selectedCategory === cat.key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem' }}
                >
                  <IconComp size={15} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.825rem' }}>
            <span style={{ color: 'var(--slate-600)', fontWeight: '600' }}>Stock Filter:</span>
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${selectedStockStatus === st ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                onClick={() => setSelectedStockStatus(st)}
              >
                {st}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Stocks Data Table */}
      <DataTable
        title={`Stock Inventory Records (${filteredStocks.length})`}
        columns={columns}
        data={filteredStocks}
        searchPlaceholder="Search stock name, SKU, warehouse location..."
        actions={(row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenStockInModal(row)}
              title="Add Received Stock"
              style={{ padding: '2px 6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <PlusCircle size={12} /> + Stock In
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleOpenEditModal(row)}
              title="Edit Stock Item"
              style={{ padding: '2px 6px', fontSize: '0.7rem' }}
            >
              <Edit size={12} /> Edit
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDeleteStock(row.id || row._id)}
              title="Delete Stock Entry"
              style={{ padding: '2px 6px', color: 'var(--danger)', border: '1px solid var(--danger-light)' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      />

      {/* Stock In (+ Stock) Modal */}
      {isStockInModalOpen && selectedStockProduct && (
        <Modal
          isOpen={isStockInModalOpen}
          onClose={() => setIsStockInModalOpen(false)}
          title={`+ Stock In: ${selectedStockProduct.name || selectedStockProduct.productName}`}
        >
          <form onSubmit={handleStockInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
              <div>SKU: <strong>{selectedStockProduct.sku}</strong></div>
              <div>Current Physical Stock: <strong>{selectedStockProduct.quantity || selectedStockProduct.stock || 0} {selectedStockProduct.unit}</strong></div>
              <div>Reserved for Orders: <strong>{selectedStockProduct.reserved || 0} {selectedStockProduct.unit}</strong></div>
            </div>

            <div className="form-group">
              <label className="form-label">Received Stock Quantity (+)</label>
              <input
                type="number"
                className="form-control"
                value={stockInQty}
                onChange={(e) => setStockInQty(e.target.value)}
                min="1"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsStockInModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm + Stock In
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add / Edit Stock Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={selectedStockProduct ? "Edit Stock Entry" : "+ Add New Stock Entry"}
        >
          <form onSubmit={handleSaveStock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Stock Item Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Sunmica">Sunmica</option>
                  <option value="Plywood">Plywood</option>
                  <option value="MDF">MDF Board</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Chairs">Chairs</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">SKU Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Physical Stock</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reserved Qty</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.reserved}
                  onChange={(e) => setFormData({ ...formData, reserved: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit Price (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Warehouse Location</label>
              <input
                type="text"
                className="form-control"
                value={formData.warehouseLocation}
                onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Stock Record
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default StocksOverview;
