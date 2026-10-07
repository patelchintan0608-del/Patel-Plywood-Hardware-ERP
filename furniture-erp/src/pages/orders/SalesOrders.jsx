import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import StatCard from '../../components/StatCard';
import LogisticsTimelineStepper from '../../components/LogisticsTimelineStepper';
import { api } from '../../services/api';
import { ShoppingBag, PlusCircle, Trash2, Truck, MapPin, ExternalLink, Calendar, CheckCircle2, CreditCard } from 'lucide-react';
import '../../styles/orders.css';

const SalesOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isPaymentsTab = searchParams.get('tab') === 'payments';
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Active Dispatch Schedule Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState(null);
  const [dispatchFormData, setDispatchFormData] = useState({
    destination: '',
    estimatedArrival: '',
    status: 'Dispatched',
    driver: 'Logistics Driver (+91 98765 01920)',
    vehicleNo: 'GA-01-TRK-7740'
  });

  // Form State for New Order Modal
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    deliveryDueDate: '',
    status: 'Processing',
    paymentStatus: 'Pending'
  });

  const loadData = async () => {
    try {
      const [orderData, customerData, productData, deliveryData] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
        api.getProducts(),
        api.getDeliveries()
      ]);
      setOrders(orderData || []);
      setCustomers(customerData || []);
      setProducts(productData || []);
      setDeliveries(deliveryData || []);
    } catch (err) {
      console.error("Failed to load orders data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDispatchModalForOrder = async (order, existingDelivery = null) => {
    setSelectedOrderForDispatch(order);
    let targetDel = existingDelivery;

    if (!targetDel) {
      targetDel = deliveries.find(d =>
        String(d.orderId) === String(order.id) ||
        String(d.orderId) === String(order._id) ||
        String(d.orderNumber) === String(order.id) ||
        String(d.orderNumber) === String(order.orderNumber)
      );
    }

    if (!targetDel) {
      try {
        targetDel = await api.createDeliveryFromOrder(order._id || order.id, {
          destination: 'Client Site Address, Main St',
          estimatedArrival: order.deliveryDueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Dispatched'
        });
        if (targetDel) {
          setDeliveries(prev => [targetDel, ...prev]);
        }
      } catch (e) {
        console.error("Auto dispatch creation error:", e);
      }
    }

    if (targetDel) {
      setSelectedDispatch(targetDel);
      setDispatchFormData({
        destination: targetDel.destination || 'Client Site Address, Main St',
        estimatedArrival: targetDel.estimatedArrival || order.deliveryDueDate || '',
        status: targetDel.status || 'Dispatched',
        driver: targetDel.driver || 'Logistics Driver (+91 98765 01920)',
        vehicleNo: targetDel.vehicleNo || 'GA-01-TRK-7740'
      });
    } else {
      setSelectedDispatch({
        deliveryNumber: '00001',
        customerName: order.customerName,
        orderNumber: order.id || order.orderNumber,
        destination: 'Client Site Address, Main St',
        estimatedArrival: order.deliveryDueDate || '',
        status: 'Dispatched',
        driver: 'Logistics Driver (+91 98765 01920)',
        vehicleNo: 'GA-01-TRK-7740'
      });
      setDispatchFormData({
        destination: 'Client Site Address, Main St',
        estimatedArrival: order.deliveryDueDate || '',
        status: 'Dispatched',
        driver: 'Logistics Driver (+91 98765 01920)',
        vehicleNo: 'GA-01-TRK-7740'
      });
    }

    setIsDispatchModalOpen(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const updatedOrders = orders.map(o => {
      if (o.id === orderId || o._id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    setOrders(updatedOrders);
    const orderToSave = updatedOrders.find(o => o.id === orderId || o._id === orderId);
    if (orderToSave) {
      await api.saveOrder(orderToSave);

      // Automatically showcase Active Dispatch Schedule when status is changed to "Ready for Delivery" or "Ready for Dispatch"
      if (newStatus === 'Ready for Delivery' || newStatus === 'Ready for Dispatch') {
        await openDispatchModalForOrder(orderToSave);
      }
    }
  };

  const handleSaveDispatchSchedule = async (e) => {
    e.preventDefault();
    if (!selectedDispatch) return;
    try {
      const updatedDelivery = {
        ...selectedDispatch,
        destination: dispatchFormData.destination,
        estimatedArrival: dispatchFormData.estimatedArrival,
        status: dispatchFormData.status,
        driver: dispatchFormData.driver,
        vehicleNo: dispatchFormData.vehicleNo
      };
      const saved = await api.saveDelivery(updatedDelivery);
      setDeliveries(prev => prev.map(d => (d.id === saved.id || d._id === saved._id ? saved : d)));
      setSelectedDispatch(saved);
      alert('Active Dispatch Schedule saved successfully!');
      setIsDispatchModalOpen(false);
    } catch (err) {
      console.error("Failed to update dispatch schedule:", err);
      alert('Failed to update dispatch schedule');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this sales order?")) {
      try {
        await api.deleteOrder(orderId);
        setOrders(prev => prev.filter(o => o.id !== orderId && o._id !== orderId));
      } catch (err) {
        console.error("Failed to delete order:", err);
      }
    }
  };

  const handleProductSelect = (productId) => {
    const selected = products.find(p => p._id === productId || p.id === productId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        productId: selected._id || selected.id,
        productName: selected.name || selected.productName,
        unitPrice: selected.price || selected.unitPrice || 0
      }));
    }
  };

  const handleCustomerSelect = (customerId) => {
    const selected = customers.find(c => c._id === customerId || c.id === customerId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        customerId: selected._id || selected.id,
        customerName: selected.customerName || selected.companyName || ''
      }));
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const qty = Number(formData.quantity) || 1;
      const price = Number(formData.unitPrice) || 0;
      const itemTotal = qty * price;

      const itemObj = {
        productName: formData.productName || 'Custom Furniture Item',
        quantity: qty,
        unitPrice: price,
        total: itemTotal
      };
      if (formData.productId) {
        itemObj.productId = formData.productId;
      }

      const payload = {
        customerId: formData.customerId,
        customerName: formData.customerName || 'Walk-in Customer',
        items: [itemObj],
        totalAmount: itemTotal,
        deliveryDueDate: formData.deliveryDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: formData.status,
        paymentStatus: formData.paymentStatus
      };

      const newOrder = await api.saveOrder(payload);
      setOrders(prev => [newOrder, ...prev]);
      setIsModalOpen(false);
      setFormData({
        customerId: '',
        customerName: '',
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        deliveryDueDate: '',
        status: 'Processing',
        paymentStatus: 'Pending'
      });
      alert('Sales Order created successfully!');

      // If created with status "Ready for Delivery", show Active Dispatch Schedule modal
      if (payload.status === 'Ready for Delivery') {
        openDispatchModalForOrder(newOrder);
      }
    } catch (err) {
      console.error('Failed to create order:', err);
      alert(err.response?.data?.message || 'Failed to create Sales Order');
    }
  };

  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const processingCount = orders.filter(o => o.status === 'Processing' || o.status === 'In Production' || o.status === 'Pending').length;
  const readyCount = orders.filter(o => o.status === 'Ready for Delivery' || o.status === 'Ready for Dispatch').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  const columns = [
    {
      header: 'Order Ref',
      accessor: 'id',
      minWidth: '85px',
      render: (row) => <span style={{ fontWeight: '700', fontFamily: 'monospace', color: 'var(--primary-700)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{row.id}</span>
    },
    {
      header: 'Quotation Ref',
      accessor: 'quotationId',
      minWidth: '95px',
      render: (row) => <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{row.quotationId || 'Direct Order'}</span>
    },
    {
      header: 'Client Company',
      accessor: 'customerName',
      minWidth: '120px',
      render: (row) => <span style={{ fontWeight: '700', color: 'var(--slate-900)', fontSize: '0.8125rem' }}>{row.customerName}</span>
    },
    {
      header: 'Order Date',
      accessor: 'orderDate',
      minWidth: '85px',
      render: (row) => <span style={{ fontSize: '0.78rem', color: '#334155', whiteSpace: 'nowrap' }}>{row.orderDate}</span>
    },
    {
      header: 'Delivery Target',
      accessor: 'deliveryDueDate',
      minWidth: '90px',
      render: (row) => <span style={{ color: 'var(--slate-600)', fontWeight: '600', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{row.deliveryDueDate || '—'}</span>
    },
    {
      header: 'Stock Allocation',
      accessor: 'items',
      minWidth: '165px',
      render: (row) => (
        <div style={{ fontSize: '0.75rem' }}>
          {(row.items || []).map((i, idx) => {
            const req = i.orderedQty || i.quantity || 1;
            const resv = i.reservedQty ?? (row.status === 'Ready for Delivery' || row.status === 'Delivered' ? req : req);
            const pend = i.pendingQty ?? 0;
            return (
              <div key={idx} style={{ marginBottom: '2px', lineHeight: 1.2 }}>
                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.78rem' }}>{i.productName}</div>
                <div style={{ display: 'flex', gap: '6px', fontSize: '0.7rem', marginTop: '1px' }}>
                  <span style={{ color: '#475569' }}>Ord: <strong>{req}</strong></span>
                  <span style={{ color: '#16a34a', fontWeight: '700' }}>Resv: <strong>{resv}</strong></span>
                  {pend > 0 ? (
                    <span style={{ color: '#dc2626', background: '#fef2f2', padding: '0px 4px', borderRadius: '4px', border: '1px solid #fca5a5', fontWeight: '800' }}>
                      Shortage: {pend}
                    </span>
                  ) : (
                    <span style={{ color: '#059669', fontWeight: '600' }}>✓ Reserved</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )
    },
    {
      header: 'Order Value',
      accessor: 'totalAmount',
      minWidth: '95px',
      render: (row) => <span style={{ fontWeight: '800', color: 'var(--slate-900)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>₹{row.totalAmount?.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Payment Status',
      accessor: 'paymentStatus',
      minWidth: '95px',
      render: (row) => <StatusBadge status={row.paymentStatus} />
    },
    {
      header: 'Order Stage',
      accessor: 'status',
      minWidth: '115px',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div>
      {/* Header Section */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title">{isPaymentsTab ? 'Payments & Invoices' : 'Sales Orders'}</h1>
          <p className="page-subtitle">
            {isPaymentsTab
              ? 'Track customer invoice payment receipts, pending balances, collection status, and billing ledger'
              : 'Track confirmed customer orders through processing, reservation, shortage procurement & dispatch'
            }
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '0.35rem 0.7rem', fontSize: '0.78125rem' }}>
            <PlusCircle size={14} /> Create Sales Order
          </button>
        </div>
      </div>

      {/* Orders KPI Stats Banner */}
      <div className="stats-grid">
        <StatCard
          title="Total Active Sales"
          value={`₹${totalSales.toLocaleString('en-IN')}`}
          icon={<CreditCard size={16} />}
          iconBg="#eff6ff"
          iconColor="#2563eb"
          change="All Active Orders"
          positive={true}
        />
        <StatCard
          title="Order Processing"
          value={`${processingCount} Orders`}
          icon={<ShoppingBag size={16} />}
          iconBg="#eff6ff"
          iconColor="#3b82f6"
          change="In Production / Prep"
          positive={true}
        />
        <StatCard
          title="Ready for Dispatch"
          value={`${readyCount} Orders`}
          icon={<Truck size={16} />}
          iconBg="#fffbeb"
          iconColor="#d97706"
          change="Ready for Delivery"
          positive={true}
        />
        <StatCard
          title="Delivered & Fulfilled"
          value={`${deliveredCount} Orders`}
          icon={<CheckCircle2 size={16} />}
          iconBg="#ecfdf5"
          iconColor="#10b981"
          change="Successfully Completed"
          positive={true}
        />
      </div>

      <DataTable
        title="Sales Orders Management"
        columns={columns}
        data={orders}
        searchPlaceholder="Search order ID, client..."
        pageSize={4}
        actions={(row) => {
          const isReady = row.status === 'Ready for Delivery' || row.status === 'Ready for Dispatch' || row.status === 'Delivered';
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' }}>
              <select
                className="form-control"
                style={{ padding: '2px 4px', fontSize: '0.72rem', width: 'auto', minWidth: '105px', borderRadius: '4px' }}
                value={row.status === 'In Production' ? 'Processing' : row.status}
                onChange={(e) => handleUpdateStatus(row.id || row._id, e.target.value)}
              >
                <option value="Processing">Processing</option>
                <option value="Partially Available">Partially Available</option>
                <option value="Ready for Delivery">Ready for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {isReady && (
                <button
                  className="btn btn-sm btn-primary"
                  style={{ padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                  title="View Active Dispatch Schedule"
                  onClick={() => openDispatchModalForOrder(row)}
                >
                  <Truck size={12} /> Dispatch
                </button>
              )}

              <button
                className="btn btn-sm btn-outline-danger"
                style={{ padding: '2px 5px', color: 'var(--danger)', border: '1px solid var(--danger-light)' }}
                title="Delete Order"
                onClick={() => handleDeleteOrder(row.id || row._id)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        }}
      />

      {/* Showcase Active Dispatch Schedule Modal */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Active Dispatch Schedule"
        maxWidth="650px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Top Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: 'white',
            padding: '1.25rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Truck color="#38bdf8" size={20} />
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc' }}>
                  Dispatch Schedule #{selectedDispatch?.deliveryNumber || selectedDispatch?.id || '00001'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                Linked Sales Order: <strong style={{ color: '#cbd5e1' }}>{selectedOrderForDispatch?.id || selectedDispatch?.orderId || '00001'}</strong> ({selectedOrderForDispatch?.customerName || selectedDispatch?.customerName})
              </p>
            </div>
            <div>
              <StatusBadge status={dispatchFormData.status} />
            </div>
          </div>

          {/* End-to-End Fulfillment Timeline Stepper */}
          <LogisticsTimelineStepper
            status={dispatchFormData.status}
            title="End-to-End Logistics Fulfillment Timeline"
            subtitle="Live status progress tracker for this dispatch schedule"
            showBadge={true}
            style={{ marginBottom: '0.25rem' }}
          />

          <form onSubmit={handleSaveDispatchSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>Destination Site Address</label>
              <input
                type="text"
                className="form-control"
                required
                value={dispatchFormData.destination}
                onChange={(e) => setDispatchFormData(prev => ({ ...prev, destination: e.target.value }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600' }}>Assigned Driver & Contact</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={dispatchFormData.driver}
                  onChange={(e) => setDispatchFormData(prev => ({ ...prev, driver: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600' }}>Vehicle Registration No.</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={dispatchFormData.vehicleNo}
                  onChange={(e) => setDispatchFormData(prev => ({ ...prev, vehicleNo: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600' }}>Est. Arrival Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dispatchFormData.estimatedArrival}
                  onChange={(e) => setDispatchFormData(prev => ({ ...prev, estimatedArrival: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600' }}>Dispatch Status</label>
                <select
                  className="form-control"
                  value={dispatchFormData.status}
                  onChange={(e) => setDispatchFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Dispatched">Dispatched</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            {/* Quick Summary Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: '#64748b' }}>Order Item:</span>{' '}
                <strong>{selectedOrderForDispatch?.items?.[0]?.productName || 'Custom Furniture Order'}</strong>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  setIsDispatchModalOpen(false);
                  navigate('/deliveries');
                }}
              >
                Full Dispatch Logistics <ExternalLink size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsDispatchModalOpen(false)}>
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Confirm Schedule
              </button>
            </div>

          </form>

        </div>
      </Modal>

      {/* Create Sales Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Sales Order"
        maxWidth="650px"
      >
        <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="form-group">
            <label className="form-label">Client / Customer *</label>
            <select
              className="form-control"
              required
              value={formData.customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.customerName || c.companyName} ({c.email || c.phone || 'Client'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Item / Product Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Executive Desk"
                required
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              />
              {products.length > 0 && (
                <select
                  style={{ marginTop: '4px', fontSize: '0.8rem' }}
                  className="form-control"
                  onChange={(e) => handleProductSelect(e.target.value)}
                >
                  <option value="">-- Or pick from existing product --</option>
                  {products.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name || p.productName} (₹{p.price || p.unitPrice})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Delivery Target Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.deliveryDueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryDueDate: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Order Stage</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="Processing">Processing</option>
                <option value="Ready for Delivery">Ready for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="form-control"
                value={formData.paymentStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
              >
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div style={{ background: 'var(--slate-50)', padding: '0.75rem 1rem', borderRadius: '6px', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
            <span>Estimated Total Order Amount:</span>
            <span style={{ color: 'var(--primary-700)', fontSize: '1.1rem' }}>
              ₹{(Number(formData.quantity || 0) * Number(formData.unitPrice || 0)).toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesOrders;
