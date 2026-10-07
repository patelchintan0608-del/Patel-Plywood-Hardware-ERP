import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  PackageCheck,
  Clock,
  CheckCircle2,
  MapPin,
  Search,
  PhoneCall,
  UserCheck,
  AlertTriangle,
  FileCheck,
  Navigation,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import LogisticsTimelineStepper from '../../components/LogisticsTimelineStepper';
import '../../styles/dashboard.css';
import '../../styles/employee-dashboard.css';

const DeliveryDashboard = () => {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([
    {
      id: 'DEL-8901',
      orderId: 'SO-2026-104',
      customerName: 'Om Construction & Developers',
      address: 'Plot 45, VIP Road, Vesu, Surat',
      driverName: 'Rakesh Verma',
      vehicleNo: 'GJ-05-BX-4920',
      phone: '+91 98251 11223',
      itemsCount: '45 Sheets (18mm Century Ply)',
      status: 'Out for Delivery',
      dispatchTime: '09:45 AM',
      estDelivery: '12:30 PM'
    },
    {
      id: 'DEL-8902',
      orderId: 'SO-2026-108',
      customerName: 'Arch. Sneha Kapoor',
      address: '7th Floor, Shivalik Highstreet, Piplod',
      driverName: 'Suresh Parmar',
      vehicleNo: 'GJ-05-YY-9081',
      phone: '+91 98980 67890',
      itemsCount: '12 Sets Hafele Tandem Boxes',
      status: 'In Transit',
      dispatchTime: '10:30 AM',
      estDelivery: '02:00 PM'
    },
    {
      id: 'DEL-8903',
      orderId: 'SO-2026-098',
      customerName: 'Shreeji Interior Studio',
      address: '12, Ring Road Plywood Hub, Surat',
      driverName: 'Vikram Driver',
      vehicleNo: 'GJ-05-AA-1200',
      phone: '+91 97129 00998',
      itemsCount: '100 Sheets Greenlam Laminates',
      status: 'Delivered',
      dispatchTime: '08:15 AM',
      estDelivery: '10:00 AM'
    }
  ]);

  const [selectedDelivery, setSelectedDelivery] = useState(deliveries[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleUpdateStatus = (delId, newStatus) => {
    setDeliveries(prev => prev.map(d => d.id === delId ? { ...d, status: newStatus } : d));
    showToast(`Delivery status for ${delId} updated to "${newStatus}"!`);
  };

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch =
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.driverName && d.driverName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inTransitCount = deliveries.filter(d => d.status === 'In Transit' || d.status === 'Out for Delivery').length;
  const deliveredCount = deliveries.filter(d => d.status === 'Delivered').length;

  return (
    <div className="emp-dashboard-container">
      
      {/* Dynamic Toast Alert */}
      {toastMsg && (
        <div style={{
          background: '#dcfce7',
          color: '#15803d',
          border: '1px solid #86efac',
          padding: '8px 14px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '0.8rem',
          marginBottom: '1rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="emp-header-banner" style={{ background: 'linear-gradient(135deg, #065f46 0%, #022c22 100%)', padding: '1rem 1.25rem' }}>
        <div className="emp-header-left" style={{ gap: '12px' }}>
          <div className="emp-avatar-wrapper">
            <div className="emp-card-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              <Truck size={24} />
            </div>
          </div>
          <div>
            <h1 className="emp-greeting-title" style={{ fontSize: '1.25rem', marginBottom: '2px' }}>
              Logistics & Delivery Dashboard 🚚
            </h1>
            <p className="emp-greeting-sub" style={{ fontSize: '0.78rem' }}>
              Track vehicle dispatches, assign truck drivers, monitor live routes & record proof of delivery.
            </p>
          </div>
        </div>

        <div className="emp-header-actions">
          <button
            onClick={() => navigate('/deliveries')}
            className="btn-punch-in"
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <Navigation size={15} />
            <span>Manage All Deliveries</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="emp-grid-3col">
        <div className="emp-card" style={{ padding: '0.75rem 1rem' }}>
          <div className="emp-card-header" style={{ marginBottom: '0.35rem' }}>
            <span className="emp-card-title" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
              <span className="emp-card-icon" style={{ background: '#e0f2fe', color: '#0284c7', width: '24px', height: '24px', borderRadius: '6px' }}>
                <Truck size={14} />
              </span>
              Active Dispatches
            </span>
            <span className="att-tag ontime" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>In Transit</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7', marginTop: '0.1rem', lineHeight: '1.2' }}>
            {inTransitCount} Deliveries Active
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
            Trucks currently en-route in Surat region
          </span>
        </div>

        <div className="emp-card" style={{ padding: '0.75rem 1rem' }}>
          <div className="emp-card-header" style={{ marginBottom: '0.35rem' }}>
            <span className="emp-card-title" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
              <span className="emp-card-icon" style={{ background: '#dcfce7', color: '#15803d', width: '24px', height: '24px', borderRadius: '6px' }}>
                <PackageCheck size={14} />
              </span>
              Delivered Today
            </span>
            <span className="att-tag present" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>Completed</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d', marginTop: '0.1rem', lineHeight: '1.2' }}>
            {deliveredCount} Delivered
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
            Verified with signed challan proof
          </span>
        </div>

        <div className="emp-card" style={{ padding: '0.75rem 1rem' }}>
          <div className="emp-card-header" style={{ marginBottom: '0.35rem' }}>
            <span className="emp-card-title" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
              <span className="emp-card-icon" style={{ background: '#fef3c7', color: '#d97706', width: '24px', height: '24px', borderRadius: '6px' }}>
                <Clock size={14} />
              </span>
              Fleet Availability
            </span>
            <span className="att-tag late" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>Ready</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d97706', marginTop: '0.1rem', lineHeight: '1.2' }}>
            4 Vehicles Standby
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
            Warehouse 1 & Warehouse 2 Loading Bays
          </span>
        </div>
      </div>

      {/* Main Delivery Tracking Workspace Table */}
      <div className="emp-card" style={{ overflow: 'hidden' }}>
        <div className="emp-card-header" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 className="emp-card-title" style={{ fontSize: '0.92rem', fontWeight: 700 }}>
            <span className="emp-card-icon" style={{ background: '#ecfdf5', color: '#10b981', width: '28px', height: '28px' }}>
              <Navigation size={16} />
            </span>
            Live Dispatch & Delivery Tracking
          </h3>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="emp-search-container" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px' }}>
              <Search size={14} style={{ color: '#64748b', marginRight: '6px' }} />
              <input
                type="text"
                placeholder="Search delivery ID, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.78rem', width: '180px' }}
              />
            </div>

            <select
              className="emp-input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', padding: '4px 10px', fontSize: '0.78rem', borderRadius: '8px' }}
            >
              <option value="All">All Status</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table className="emp-table" style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap', width: '90px' }}>DELIVERY ID</th>
                <th style={{ whiteSpace: 'nowrap', width: '95px' }}>ORDER ID</th>
                <th style={{ minWidth: '170px' }}>CUSTOMER & DESTINATION</th>
                <th style={{ minWidth: '280px', textAlign: 'center' }}>FULFILLMENT TIMELINE</th>
                <th style={{ minWidth: '150px' }}>DRIVER & VEHICLE</th>
                <th style={{ minWidth: '130px' }}>GOODS ITEM DETAILS</th>
                <th style={{ width: '110px', textAlign: 'center' }}>STATUS</th>
                <th style={{ width: '130px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map(d => (
                <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDelivery(d)}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="emp-id-pill" style={{ background: '#ecfdf5', color: '#047857', border: 'none', padding: '2px 6px', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', whiteSpace: 'nowrap', display: 'inline-block' }}>
                      {d.id}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#0f172a', whiteSpace: 'nowrap', display: 'inline-block' }}>
                      {d.orderId}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }}>
                      {d.customerName}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }}>
                      <MapPin size={11} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.address}</span>
                    </div>
                  </td>
                  <td style={{ padding: '4px 6px' }}>
                    <div style={{ minWidth: '270px' }}>
                      <LogisticsTimelineStepper status={d.status} variant="mini" showBadge={false} />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {d.driverName}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      (Vehicle: {d.vehicleNo || 'GJ-05-BX-4920'})
                    </div>
                    <a href={`tel:${d.phone}`} style={{ fontSize: '0.7rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginTop: '1px', whiteSpace: 'nowrap' }}>
                      {d.phone}
                    </a>
                  </td>
                  <td style={{ fontSize: '0.72rem', color: '#334155' }}>
                    <span style={{ display: 'inline-block', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.itemsCount}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <span className={`att-tag ${d.status === 'Delivered' ? 'present' : d.status === 'Out for Delivery' ? 'ontime' : 'late'}`} style={{ fontSize: '0.68rem', padding: '2px 6px', display: 'inline-block', whiteSpace: 'nowrap' }}>
                      ● {d.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', alignItems: 'center' }}>
                      {d.status !== 'Delivered' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(d.id, 'Delivered'); }}
                          className="btn-action-sm"
                          style={{ background: '#dcfce7', borderColor: '#86efac', color: '#15803d', padding: '3px 6px', fontSize: '0.68rem', gap: '3px', whiteSpace: 'nowrap' }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Delivered</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/deliveries'); }}
                        className="btn-action-sm"
                        style={{ padding: '3px 6px', fontSize: '0.68rem', gap: '3px', whiteSpace: 'nowrap' }}
                      >
                        <Navigation size={12} />
                        <span>Track</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DeliveryDashboard;
