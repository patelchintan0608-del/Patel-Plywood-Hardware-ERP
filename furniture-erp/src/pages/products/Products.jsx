import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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

const defaultFurnitureProducts = [
  { id: 'SUN-001', sku: 'SUN-001', name: 'Glossy Sunmica 1.0mm', category: 'Sunmica', unitPrice: 1250, unit: 'Sheet (8x4 ft)', quantity: 82, reserved: 10, finish: 'Glossy Royal Teak', status: 'In Stock', description: 'High-gloss laminated decorative sheet for luxury furniture.' },
  { id: 'SUN-002', sku: 'SUN-002', name: 'Matte Finish Sunmica 1.0mm', category: 'Sunmica', unitPrice: 1350, unit: 'Sheet (8x4 ft)', quantity: 45, reserved: 5, finish: 'Matte Walnut', status: 'In Stock', description: 'Anti-fingerprint matte laminate sheet.' },
  { id: 'SUN-003', sku: 'SUN-003', name: 'Textured Sunmica 1.2mm', category: 'Sunmica', unitPrice: 1550, unit: 'Sheet (8x4 ft)', quantity: 8, reserved: 4, finish: 'Textured Natural Oak', status: 'Low Stock', description: 'Deep textured wood-grain laminate.' },
  { id: 'PLY-001', sku: 'PLY-001', name: 'Plywood 18mm Marine BWP', category: 'Plywood', unitPrice: 2850, unit: 'Sheet (8x4 ft)', quantity: 32, reserved: 8, thickness: '18mm', status: 'In Stock', description: '100% Boiling Waterproof Gurjan Plywood.' },
  { id: 'MDF-001', sku: 'MDF-001', name: 'MDF Board High Density 12mm', category: 'MDF', unitPrice: 1450, unit: 'Sheet (8x4 ft)', quantity: 0, reserved: 0, thickness: '12mm', status: 'Out of Stock', description: 'Smooth exterior grade medium density fiberboard.' },
  { id: 'HDW-001', sku: 'HDW-001', name: 'Soft-Close Cabinet Hinges (SS 304)', category: 'Hardware', unitPrice: 480, unit: 'Pair', quantity: 145, reserved: 20, finish: 'Stainless Steel', status: 'In Stock', description: 'Hydraulic 3D soft-closing cabinet hinges.' }
];

const Products = () => {
  const { categorySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [stockInQty, setStockInQty] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Sunmica',
    unitPrice: '',
    unit: 'Sheet (8x4 ft)',
    sku: '',
    quantity: 50,
    reserved: 0,
    description: '',
    thickness: '',
    finish: '',
    status: 'In Stock'
  });

  const categories = [
    { key: 'All', label: 'All Categories', icon: Package },
    { key: 'Sunmica', slug: 'sunmica', label: 'Sunmica', icon: Layers },
    { key: 'Plywood', slug: 'plywood', label: 'Plywood', icon: Layers },
    { key: 'MDF', slug: 'mdf', label: 'MDF Board', icon: DoorClosed },
    { key: 'Hardware', slug: 'hardware', label: 'Hardware', icon: Armchair },
  ];

  const searchParams = new URLSearchParams(location.search);
  const activeTabParam = searchParams.get('tab');
  const isPurchaseTab = activeTabParam === 'purchase';

  useEffect(() => {
    if (categorySlug) {
      const slugLower = categorySlug.toLowerCase();
      const matched = categories.find(c => c.slug === slugLower || c.key.toLowerCase().startsWith(slugLower));
      if (matched) {
        setSelectedCategory(matched.key);
      }
    } else {
      const catParam = searchParams.get('category');
      if (catParam) {
        setSelectedCategory(catParam);
      } else {
        setSelectedCategory('All');
      }
    }

    if (isPurchaseTab) {
      setSelectedStockStatus('Low Stock');
    }
  }, [categorySlug, location.search, isPurchaseTab]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(defaultFurnitureProducts);
      }
    } catch (e) {
      console.error("Products load error:", e);
      setProducts(defaultFurnitureProducts);
    }
  };

  const handleCategorySelect = (catKey) => {
    setSelectedCategory(catKey);
    const cat = categories.find(c => c.key === catKey);
    if (cat && cat.slug) {
      navigate(`/products/${cat.slug}`);
    } else {
      navigate('/products');
    }
  };

  // KPI Computations
  const totalProductsCount = products.length;
  const totalStockQuantity = products.reduce((sum, p) => sum + Number(p.quantity || p.stock || 0), 0);
  const totalReservedQuantity = products.reduce((sum, p) => sum + Number(p.reserved || p.reservedQuantity || 0), 0);
  const totalAvailableForOrder = Math.max(0, totalStockQuantity - totalReservedQuantity);

  const inStockCount = products.filter(p => (p.quantity || p.stock || 0) >= 15).length;
  const lowStockCount = products.filter(p => (p.quantity || p.stock || 0) > 0 && (p.quantity || p.stock || 0) < 15).length;
  const outOfStockCount = products.filter(p => (p.quantity || p.stock || 0) === 0).length;

  // Filtered dataset
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All'
      || p.category?.toLowerCase() === selectedCategory.toLowerCase()
      || (selectedCategory === 'Plywood' && p.category?.toLowerCase().includes('plywood'))
      || (selectedCategory === 'MDF' && (p.category?.toLowerCase().includes('mdf') || p.category?.toLowerCase().includes('door')));
    
    const qty = Number(p.quantity || p.stock || 0);
    let matchesStatus = true;
    if (selectedStockStatus === 'In Stock') matchesStatus = qty >= 15;
    else if (selectedStockStatus === 'Low Stock') matchesStatus = qty > 0 && qty < 15;
    else if (selectedStockStatus === 'Out of Stock') matchesStatus = qty === 0;

    return matchesCategory && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: selectedCategory !== 'All' ? selectedCategory : 'Sunmica',
      unitPrice: '',
      unit: 'Sheet (8x4 ft)',
      sku: `SUN-${Math.floor(100 + Math.random() * 900)}`,
      quantity: 50,
      reserved: 0,
      description: '',
      thickness: '',
      finish: '',
      status: 'In Stock'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'Sunmica',
      unitPrice: product.unitPrice || '',
      unit: product.unit || 'Piece',
      sku: product.sku || '',
      quantity: product.quantity ?? product.stock ?? 0,
      reserved: product.reserved ?? product.reservedQuantity ?? 0,
      description: product.description || '',
      thickness: product.thickness || '',
      finish: product.finish || '',
      status: product.status || 'In Stock'
    });
    setIsModalOpen(true);
  };

  const handleOpenStockInModal = (product) => {
    setSelectedStockProduct(product);
    setStockInQty(20);
    setIsStockInModalOpen(true);
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
      await api.saveProduct(updated);
      await loadProducts();
    } catch (err) {
      console.error("Failed to update stock:", err);
    }

    setIsStockInModalOpen(false);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await api.deleteProduct(id);
        await loadProducts();
      } catch (e) {
        console.error("Delete failed:", e);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(formData.quantity || 0);
    let status = 'In Stock';
    if (qty === 0) status = 'Out of Stock';
    else if (qty < 15) status = 'Low Stock';

    const productToSave = {
      ...formData,
      productName: formData.name,
      name: formData.name,
      id: editingProduct ? editingProduct.id : undefined,
      _id: editingProduct ? editingProduct._id : undefined,
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
      await api.saveProduct(productToSave);
      await loadProducts();
    } catch (err) {
      console.error("Save product error:", err);
    }

    setIsModalOpen(false);
  };

  // Inventory Table Columns
  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      minWidth: '180px',
      render: (row) => (
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.85rem' }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
            {row.finish || row.thickness ? `${row.finish || ''} ${row.thickness ? `• ${row.thickness}` : ''}` : row.description}
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      minWidth: '100px',
      render: (row) => (
        <span className="badge" style={{ background: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: '0.78rem', padding: '2px 8px', whiteSpace: 'nowrap' }}>
          {row.category}
        </span>
      )
    },
    {
      header: 'SKU',
      accessor: 'sku',
      minWidth: '110px',
      render: (row) => <span style={{ fontWeight: 700, color: 'var(--primary-700)', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{row.sku || row.id}</span>
    },
    {
      header: 'Available',
      accessor: 'quantity',
      minWidth: '110px',
      render: (row) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: (row.quantity || row.stock || 0) === 0 ? 'var(--danger)' : 'var(--slate-900)' }}>
            {row.quantity ?? row.stock ?? 0}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginLeft: '4px' }}>{row.unit || 'pcs'}</span>
        </div>
      )
    },
    {
      header: 'Reserved',
      accessor: 'reserved',
      minWidth: '95px',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#d97706', background: '#fef3c7', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '12px', fontSize: '0.78rem', whiteSpace: 'nowrap', display: 'inline-block' }}>
          {row.reserved ?? row.reservedQuantity ?? 0} pcs
        </span>
      )
    },
    {
      header: 'Available for New Orders',
      accessor: 'availableForOrder',
      minWidth: '155px',
      render: (row) => {
        const avail = Number(row.quantity ?? row.stock ?? 0);
        const res = Number(row.reserved ?? row.reservedQuantity ?? 0);
        const net = Math.max(0, avail - res);
        return (
          <span style={{ fontWeight: 800, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'inline-block' }}>
            {net} {row.unit || 'pcs'}
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      minWidth: '110px',
      render: (row) => <StatusBadge status={row.status || ((row.quantity || row.stock || 0) === 0 ? 'Out of Stock' : (row.quantity || row.stock || 0) < 15 ? 'Low Stock' : 'In Stock')} />
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {isPurchaseTab ? 'Purchase & Procurement' : 'Products & Materials Catalog'}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.9rem', marginTop: '2px' }}>
            {isPurchaseTab
              ? 'Manage raw material purchase requisitions, low-stock reorder triggers, and vendor inventory restocks'
              : 'Patel Plywood & Hardware materials inventory valuation, stock-in replenishment, and order allocation flow'
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="btn-group" style={{ display: 'flex', background: 'var(--slate-100)', padding: '3px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
            <button 
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : ''}`}
              style={{ background: viewMode === 'table' ? undefined : 'transparent', color: viewMode === 'table' ? undefined : 'var(--slate-600)', border: 'none' }}
              onClick={() => setViewMode('table')}
            >
              <List size={16} /> Table View
            </button>
            <button 
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : ''}`}
              style={{ background: viewMode === 'grid' ? undefined : 'transparent', color: viewMode === 'grid' ? undefined : 'var(--slate-600)', border: 'none' }}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} /> Stock Cards
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} /> + Add Stock
          </button>
        </div>
      </div>

      {/* Recommended Section 1: Stock Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.65rem' }}>
        
        <StatCard
          title="Total Items"
          value={totalProductsCount.toString()}
          icon={<Boxes size={16} />}
          change={`${totalStockQuantity} total pcs in stock`}
          positive={true}
        />

        <StatCard
          title="In Stock"
          value={`${inStockCount} items`}
          icon={<Package size={16} />}
          change={`${totalStockQuantity} available units`}
          positive={true}
        />

        <StatCard
          title="Low Stock"
          value={lowStockCount.toString()}
          icon={<AlertTriangle size={16} />}
          change="Stock < 15 pcs"
          positive={false}
        />

        <StatCard
          title="Out Stock"
          value={outOfStockCount.toString()}
          icon={<AlertTriangle size={16} />}
          change="Stock depleted (0)"
          positive={false}
        />

        <StatCard
          title="Available for New Orders"
          value={`${totalAvailableForOrder} pcs`}
          icon={<ShoppingCart size={16} />}
          change={`Net after ${totalReservedQuantity} reserved`}
          positive={true}
        />

      </div>


      {/* Filter Controls Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategorySelect(cat.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: isActive ? '2px solid var(--primary-600)' : '1px solid var(--slate-200)',
                  background: isActive ? 'var(--primary-50)' : 'white',
                  color: isActive ? 'var(--primary-800)' : 'var(--slate-700)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer'
                }}
              >
                <Icon size={16} style={{ color: isActive ? 'var(--primary-600)' : 'var(--slate-500)' }} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stock Status Dropdown Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--slate-600)' }}>Stock Status:</label>
          <select
            className="form-control"
            style={{ width: '160px', fontSize: '0.825rem', padding: '6px 10px' }}
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">🟢 In Stock (&ge;15)</option>
            <option value="Low Stock">🟡 Low Stock (&lt;15)</option>
            <option value="Out of Stock">🔴 Out of Stock (0)</option>
          </select>
        </div>

      </div>

      {/* Main Content View */}
      {viewMode === 'table' ? (
        <DataTable
          title={`${selectedCategory} Stocks Overview`}
          columns={columns}
          data={filteredProducts}
          searchPlaceholder="Search product name, SKU, finish..."
          actions={(row) => (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                className="btn btn-sm btn-outline-primary"
                style={{ padding: '4px 8px', fontSize: '0.775rem' }}
                onClick={() => handleOpenStockInModal(row)}
                title="Top-up Available Stock"
              >
                <PlusCircle size={14} /> + Stock In
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(row)} title="Edit Specs">
                <Edit size={14} />
              </button>
              <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteProduct(row.id || row._id)} title="Delete Product">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filteredProducts.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              No products match category "{selectedCategory}" and status "{selectedStockStatus}".
            </div>
          ) : (
            filteredProducts.map((product) => {
              const avail = Number(product.quantity ?? product.stock ?? 0);
              const res = Number(product.reserved ?? product.reservedQuantity ?? 0);
              const net = Math.max(0, avail - res);

              return (
                <div 
                  key={product.id || product._id}
                  className="card"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    border: '1px solid var(--slate-200)',
                    borderRadius: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        padding: '3px 8px',
                        background: 'var(--primary-100)',
                        color: 'var(--primary-800)',
                        borderRadius: '6px'
                      }}>
                        {product.category}
                      </span>
                      <StatusBadge status={product.status || 'In Stock'} />
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
                      {product.name}
                    </h3>

                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontFamily: 'monospace', fontWeight: 700, marginBottom: '0.75rem' }}>
                      SKU: {product.sku || product.id}
                    </div>

                    {/* Stock Math Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: 'var(--slate-50)', padding: '0.65rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.675rem', color: 'var(--slate-500)' }}>Available</span>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--slate-900)' }}>{avail} {product.unit || 'pcs'}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.675rem', color: 'var(--slate-500)' }}>Reserved</span>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#d97706' }}>{res} pcs</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.675rem', color: 'var(--slate-500)' }}>Net New Orders</span>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#2563eb' }}>{net} pcs</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--slate-100)' }}>
                    <div>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        ₹{product.unitPrice?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => handleOpenStockInModal(product)}>
                        + Stock In
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(product)}>
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal 1: Add / Edit Product */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product & Initial Stock'}
        maxWidth="650px"
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Glossy Sunmica 1.0mm White Teak"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-control"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="Sunmica">Sunmica</option>
              <option value="Plywood">Plywood</option>
              <option value="MDF">MDF Board</option>
              <option value="Hardware">Hardware</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">SKU / Code *</label>
            <input
              type="text"
              className="form-control"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. SUN-001"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Available Stock Quantity *</label>
            <input
              type="number"
              className="form-control"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="e.g. 82"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reserved Quantity (Allocated)</label>
            <input
              type="number"
              className="form-control"
              value={formData.reserved}
              onChange={(e) => setFormData({ ...formData, reserved: e.target.value })}
              placeholder="e.g. 10"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit Price (₹) *</label>
            <input
              type="number"
              className="form-control"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              placeholder="e.g. 1250"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit of Measure</label>
            <input
              type="text"
              className="form-control"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g. Sheet (8x4 ft)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Finish / Pattern</label>
            <input
              type="text"
              className="form-control"
              value={formData.finish}
              onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
              placeholder="e.g. Glossy Teak / Matte Walnut"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Thickness / Spec</label>
            <input
              type="text"
              className="form-control"
              value={formData.thickness}
              onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
              placeholder="e.g. 18mm or 1.0mm"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Product Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="WoodCraft timber specs, core materials, grain options..."
            />
          </div>

          <div className="form-group full-width" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Stock In Replenishment */}
      <Modal
        isOpen={isStockInModalOpen}
        onClose={() => setIsStockInModalOpen(false)}
        title={`Stock In: ${selectedStockProduct?.name || ''}`}
        maxWidth="500px"
      >
        <form onSubmit={handleStockInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid var(--slate-200)' }}>
            <div><strong>SKU:</strong> {selectedStockProduct?.sku || selectedStockProduct?.id}</div>
            <div><strong>Current Available Stock:</strong> {selectedStockProduct?.quantity ?? selectedStockProduct?.stock ?? 0} {selectedStockProduct?.unit || 'pcs'}</div>
            <div><strong>Currently Reserved:</strong> {selectedStockProduct?.reserved ?? 0} pcs</div>
            <div style={{ color: '#2563eb', fontWeight: 700, marginTop: '4px' }}>
              Current Available for New Orders: {Math.max(0, (selectedStockProduct?.quantity ?? selectedStockProduct?.stock ?? 0) - (selectedStockProduct?.reserved ?? 0))} pcs
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Quantity Received (Purchase / Stock In) *</label>
            <input
              type="number"
              className="form-control"
              min="1"
              value={stockInQty}
              onChange={(e) => setStockInQty(e.target.value)}
              required
            />
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 600 }}>
            New Stock Total will be: <strong>{Number(selectedStockProduct?.quantity || selectedStockProduct?.stock || 0) + Number(stockInQty || 0)} {selectedStockProduct?.unit || 'pcs'}</strong>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsStockInModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} /> Confirm Stock In
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Products;
