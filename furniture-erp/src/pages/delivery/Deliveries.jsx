import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LogisticsTimelineStepper from '../../components/LogisticsTimelineStepper';
import { api } from '../../services/api';
import { MapPin, PlusCircle, Trash2 } from 'lucide-react';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    destination: '',
    estimatedArrival: '',
    status: 'Dispatched',
    driver: 'Logistics Driver (+91 98765 01920)',
    vehicleNo: 'GA-01-TRK-7740'
  });

  const fetchDeliveries = async () => {
    try {
      const [delData, ordData] = await Promise.all([
        api.getDeliveries(),
        api.getOrders()
      ]);
      setDeliveries(delData || []);
      setOrders(ordData || []);
      if (delData && delData.length > 0) {
        setSelectedDelivery(delData[0]);
      }
    } catch (err) {
      console.error("Failed to fetch deliveries data:", err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (deliveryId, newStatus) => {
    const updated = deliveries.map(d => {
      if (d.id === deliveryId || d._id === deliveryId) {
        return { ...d, status: newStatus };
      }
      return d;
    });
    setDeliveries(updated);
    if (selectedDelivery && (selectedDelivery.id === deliveryId || selectedDelivery._id === deliveryId)) {
      setSelectedDelivery({ ...selectedDelivery, status: newStatus });
    }
    const target = updated.find(d => d.id === deliveryId || d._id === deliveryId);
    if (target) {
      await api.saveDelivery(target);
    }
  };

  const handleDeleteDelivery = async (deliveryId) => {
    if (window.confirm("Are you sure you want to delete this delivery schedule?")) {
      try {
        const updated = await api.deleteDelivery(deliveryId);
        setDeliveries(updated || []);
      } catch (err) {
        console.error("Failed to delete delivery:", err);
      }
    }
  };

  const handleOrderSelect = (orderId) => {
    const selected = orders.find(o => o._id === orderId || o.id === orderId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        orderId: selected._id || selected.id,
        customerName: selected.customerName || '',
        destination: 'Client Site Address, Main St',
        estimatedArrival: selected.deliveryDueDate || ''
      }));
    }
  };

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    try {
      if (formData.orderId) {
        const newDel = await api.createDeliveryFromOrder(formData.orderId, formData);
        setDeliveries(prev => [newDel, ...prev]);
        setSelectedDelivery(newDel);
      } else {
        const newDel = await api.saveDelivery(formData);
        setDeliveries(prev => [newDel, ...prev]);
        setSelectedDelivery(newDel);
      }
      setIsModalOpen(false);
      setFormData({
        orderId: '',
        customerName: '',
        destination: '',
        estimatedArrival: '',
        status: 'Dispatched',
        driver: 'Logistics Driver (+91 98765 01920)',
        vehicleNo: 'GA-01-TRK-7740'
      });
      alert('Dispatch & Delivery schedule created successfully!');
    } catch (err) {
      console.error("Failed to create delivery:", err);
      alert(err.response?.data?.message || 'Failed to create delivery schedule');
    }
  };

  const columns = [
    {
      header: 'Delivery ID',
      accessor: 'id',
      render: (row) => (
        <button
          onClick={() => setSelectedDelivery(row)}
          style={{ background: '#ecfdf5', color: '#047857', border: 'none', padding: '2px 6px', fontWeight: '700', fontSize: '0.72rem', fontFamily: 'monospace', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-block' }}
          title="Click to select & view live tracking timeline"
        >
          {row.id}
        </button>
      )
    },
    {
      header: 'Sales Order Ref',
      accessor: 'orderId',
      render: (row) => <span style={{ fontWeight: '700', fontSize: '0.75rem', whiteSpace: 'nowrap', display: 'inline-block' }}>{row.orderId}</span>
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => (
        <span style={{ fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap', display: 'inline-block' }}>
          {row.customerName}
        </span>
      )
    },
    {
      header: 'Fulfillment Timeline',
      accessor: 'timeline',
      render: (row) => (
        <div style={{ minWidth: '270px', padding: '2px 0' }}>
          <LogisticsTimelineStepper status={row.status} variant="mini" showBadge={false} />
        </div>
      )
    },
    {
      header: 'Destination Address',
      accessor: 'destination',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'var(--slate-700)', whiteSpace: 'nowrap' }}>
          <MapPin size={12} color="var(--primary-600)" style={{ flexShrink: 0 }} />
          <span>{row.destination}</span>
        </div>
      )
    },
    {
      header: 'Driver & Vehicle',
      accessor: 'driver',
      render: (row) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <div style={{ fontWeight: '700', fontSize: '0.75rem' }}>{row.driver}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>Vehicle: {row.vehicleNo}</div>
        </div>
      )
    },
    {
      header: 'Est. Arrival',
      accessor: 'estimatedArrival',
      render: (row) => <span style={{ color: 'var(--slate-600)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{row.estimatedArrival}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.25rem' }}>Dispatch & Logistics Management</h1>
          <p className="page-subtitle" style={{ fontSize: '0.78rem' }}>Track outbound white-glove furniture delivery, fleet assignments, and client arrivals</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
            <PlusCircle size={14} /> Create Dispatch Schedule
          </button>
        </div>
      </div>

      <DataTable
        title="Active Dispatch Schedule"
        columns={columns}
        data={deliveries}
        searchPlaceholder="Search delivery ID, customer, address..."
        actions={(row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              className="form-control"
              style={{ padding: '3px 6px', fontSize: '0.72rem', borderRadius: '6px' }}
              value={row.status}
              onChange={(e) => handleUpdateStatus(row.id || row._id, e.target.value)}
            >
              <option value="Dispatched">Dispatched</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              className="btn btn-sm btn-outline-danger"
              style={{ padding: '3px 6px', color: 'var(--danger)', border: '1px solid var(--danger-light)', borderRadius: '6px' }}
              title="Delete Delivery Schedule"
              onClick={() => handleDeleteDelivery(row.id || row._id)}
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      />

      {/* Create Dispatch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Dispatch Schedule"
        maxWidth="600px"
      >
        <form onSubmit={handleCreateDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Sales Order Reference *</label>
            <select
              className="form-control"
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              value={formData.orderId}
              onChange={(e) => handleOrderSelect(e.target.value)}
            >
              <option value="">-- Direct Dispatch / Pick Sales Order --</option>
              {orders.map(o => (
                <option key={o._id || o.id} value={o._id || o.id}>
                  {o.orderNumber || o.id} - {o.customerName} (₹{o.totalAmount?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Customer Name *</label>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              required
              placeholder="Client / Company Name"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Destination Address *</label>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              required
              placeholder="Site / Delivery Location Address"
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Driver & Contact Phone</label>
              <input
                type="text"
                className="form-control"
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                value={formData.driver}
                onChange={(e) => setFormData(prev => ({ ...prev, driver: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Vehicle Number</label>
              <input
                type="text"
                className="form-control"
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                value={formData.vehicleNo}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleNo: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Estimated Arrival Date</label>
              <input
                type="date"
                className="form-control"
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                value={formData.estimatedArrival}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedArrival: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Dispatch Status</label>
              <select
                className="form-control"
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="Dispatched">Dispatched</option>
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              Create Dispatch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Deliveries;
