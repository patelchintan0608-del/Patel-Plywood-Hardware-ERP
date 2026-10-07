import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { 
  Users, UserCheck, UserX, DollarSign, TrendingUp, UserPlus, 
  AlertCircle, Building2, Calendar, FileText, ArrowRight, 
  ShieldAlert, ShieldCheck, Sparkles, Filter, PieChart, Phone, Mail, Award
} from 'lucide-react';
import '../../styles/customers.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activityFilter, setActivityFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custs, quotes, ords] = await Promise.all([
          api.getCustomers(),
          api.getQuotations(),
          api.getOrders()
        ]);
        setCustomers(custs || []);
        setQuotations(quotes || []);
        setOrders(ords || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Dashboard KPI Calculations
  const totalCustomers = customers.length;
  const activeCount = customers.filter(c => c.status === 'Active').length;
  const inactiveCount = customers.filter(c => c.status === 'Inactive').length;
  const onHoldCount = customers.filter(c => c.status === 'On Hold').length;
  const prospectCount = customers.filter(c => c.status === 'Prospect').length;

  const totalReceivables = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
  const totalCreditLimit = customers.reduce((sum, c) => sum + (c.creditLimit || 0), 0);
  const creditUtilization = totalCreditLimit > 0 ? ((totalReceivables / totalCreditLimit) * 100).toFixed(1) : 0;

  // Category Breakdown with totals and limits
  const categories = [
    { name: 'Commercial Retailer', icon: <Building2 size={16} />, color: 'var(--primary-600)' },
    { name: 'Hotel Chain', icon: <Sparkles size={16} />, color: '#8b5cf6' },
    { name: 'Interior Designer', icon: <TrendingUp size={16} />, color: '#10b981' },
    { name: 'Residential Direct', icon: <Users size={16} />, color: '#f59e0b' }
  ];

  const categoryStats = categories.map(cat => {
    const list = customers.filter(c => (c.customerType || c.category) === cat.name);
    const count = list.length;
    const receivables = list.reduce((s, c) => s + (c.outstandingBalance || 0), 0);
    const limit = list.reduce((s, c) => s + (c.creditLimit || 0), 0);
    return { ...cat, count, receivables, limit };
  });

  // Top High Value Clients
  const topClients = [...customers].sort((a, b) => (b.creditLimit || 0) - (a.creditLimit || 0)).slice(0, 5);

  // Collect recent activities across customers
  const recentActivities = customers
    .flatMap(c => (c.history || []).map(h => ({ ...h, customerName: c.companyName || c.name, customerId: c.id })))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredActivities = recentActivities.filter(a => {
    if (activityFilter === 'ALL') return true;
    if (activityFilter === 'QUOTATION' && a.type === 'quotation') return true;
    if (activityFilter === 'ORDER' && a.type === 'order') return true;
    return true;
  }).slice(0, 6);

  const getInitials = (name) => {
    if (!name) return 'CU';
    const words = name.trim().split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Hero Header Banner */}
      <div className="customer-hero-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.775rem', fontWeight: '700', color: 'var(--primary-200)', marginBottom: '0.5rem' }}>
              <Award size={14} color="#f59e0b" /> Executive Client Analytics
            </div>
            <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
              Customer Relationship & Financial Health
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
              Monitor credit limit utilization, outstanding receivables, account lifecycle & touchpoints
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/customers')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
              View Directory
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/customers/add')} style={{ padding: '0.65rem 1.4rem' }}>
              <UserPlus size={16} /> Register New Customer
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Client Directory"
          value={totalCustomers.toString()}
          icon={<Users size={22} />}
          change={`${activeCount} Active Accounts`}
          positive={true}
        />
        <StatCard
          title="Active Client Ratio"
          value={`${((activeCount / (totalCustomers || 1)) * 100).toFixed(0)}%`}
          icon={<UserCheck size={22} />}
          change={`${prospectCount} Lead Prospects`}
          positive={true}
        />
        <StatCard
          title="Account Risk / On Hold"
          value={(onHoldCount + inactiveCount).toString()}
          icon={<AlertCircle size={22} />}
          change={`${onHoldCount} On Hold, ${inactiveCount} Inactive`}
          positive={false}
        />
        <StatCard
          title="Total Receivables Outstanding"
          value={`₹${totalReceivables.toLocaleString('en-IN')}`}
          icon={<DollarSign size={22} />}
          change={`Credit Utilized: ${creditUtilization}%`}
          positive={totalReceivables === 0}
        />
      </div>

      {/* Main Grid: Left Column (Top Clients & Categories) + Right Column (Credit Widget & Activity Stream) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top High-Value Enterprise Clients */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', margin: 0, fontWeight: '800' }}>
                  Top Enterprise Clients
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', margin: '2px 0 0 0' }}>
                  Ranked by approved credit line & active outstanding receivables
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')}>
                All Directory <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Client & Contact</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Credit Limit</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Outstanding</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map(client => {
                    const clientLimit = client.creditLimit || 0;
                    const clientBal = client.outstandingBalance || 0;
                    const util = clientLimit > 0 ? Math.min(100, Math.round((clientBal / clientLimit) * 100)) : 0;
                    return (
                      <tr 
                        key={client.id} 
                        style={{ borderBottom: '1px solid var(--slate-100)', transition: 'var(--transition)' }}
                        className="hover-row"
                      >
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                              width: '38px', 
                              height: '38px', 
                              borderRadius: '10px', 
                              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))', 
                              color: 'white', 
                              fontWeight: '800',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {getInitials(client.companyName || client.name)}
                            </div>
                            <div>
                              <div 
                                style={{ fontWeight: '700', color: 'var(--slate-900)', cursor: 'pointer' }}
                                onClick={() => navigate(`/customers/${client.id}`)}
                              >
                                {client.companyName || client.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                {client.id} • {client.customerName || client.contactPerson}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ fontSize: '0.775rem', fontWeight: '600', color: 'var(--slate-700)', background: 'var(--slate-100)', padding: '3px 8px', borderRadius: '4px' }}>
                            {client.customerType || client.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={client.status} /></td>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '700' }}>₹{clientLimit.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ fontWeight: '800', color: clientBal > 0 ? 'var(--danger)' : 'var(--success)' }}>
                            ₹{clientBal.toLocaleString('en-IN')}
                          </div>
                          <div style={{ height: '4px', background: 'var(--slate-100)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${util}%`, background: util > 75 ? '#ef4444' : '#10b981' }} />
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => navigate(`/customers/${client.id}`)}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          >
                            Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Breakdown & Lifecycle Visual Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Category Breakdown */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                <Building2 size={18} color="var(--primary-600)" /> Category Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categoryStats.map(cat => {
                  const pct = totalCustomers > 0 ? Math.round((cat.count / totalCustomers) * 100) : 0;
                  return (
                    <div key={cat.name} style={{ background: 'var(--slate-50)', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid var(--slate-100)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: '700', color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {cat.icon} {cat.name}
                        </span>
                        <span style={{ fontWeight: '800', color: 'var(--slate-900)' }}>{cat.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '7px', width: '100%', background: 'var(--slate-200)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            width: `${pct}%`, 
                            background: cat.color,
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }} 
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--slate-500)', marginTop: '6px' }}>
                        <span>Limit: ₹{cat.limit.toLocaleString('en-IN')}</span>
                        <span style={{ color: cat.receivables > 0 ? 'var(--danger)' : 'var(--slate-600)', fontWeight: '600' }}>Due: ₹{cat.receivables.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lifecycle Status Breakdown */}
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', color: 'var(--slate-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                <TrendingUp size={18} color="var(--primary-600)" /> Client Lifecycle Status
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div style={{ padding: '1.1rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Accounts</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#065f46', marginTop: '0.25rem' }}>{activeCount}</div>
                  <div style={{ fontSize: '0.725rem', color: '#047857', marginTop: '4px' }}>Ready for orders</div>
                </div>

                <div style={{ padding: '1.1rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lead Prospects</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e40af', marginTop: '0.25rem' }}>{prospectCount}</div>
                  <div style={{ fontSize: '0.725rem', color: '#1d4ed8', marginTop: '4px' }}>Quotes in progress</div>
                </div>

                <div style={{ padding: '1.1rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credit On Hold</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#92400e', marginTop: '0.25rem' }}>{onHoldCount}</div>
                  <div style={{ fontSize: '0.725rem', color: '#b45309', marginTop: '4px' }}>Pending approval</div>
                </div>

                <div style={{ padding: '1.1rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inactive</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#991b1b', marginTop: '0.25rem' }}>{inactiveCount}</div>
                  <div style={{ fontSize: '0.725rem', color: '#b91c1c', marginTop: '4px' }}>Dormant profiles</div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Financial Exposure Gauge & Activity Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Receivables & Financial Exposure Gauge Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'white', margin: 0, fontWeight: '800' }}>
                Credit Exposure Gauge
              </h3>
              <ShieldCheck size={20} color="#10b981" />
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginBottom: '1.25rem' }}>
              Combined credit portfolio risk exposure across all registered client accounts.
            </p>
            
            <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Total Portfolio Approved Credit</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'white', marginTop: '2px' }}>₹{totalCreditLimit.toLocaleString('en-IN')}</div>
            </div>

            <div style={{ marginBottom: '1.25rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: '0.725rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Total Outstanding Due</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f87171', marginTop: '2px' }}>₹{totalReceivables.toLocaleString('en-IN')}</div>
            </div>

            {/* Exposure progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--slate-300)', marginBottom: '0.35rem' }}>
                <span>Exposure Ratio</span>
                <span style={{ fontWeight: '800', color: Number(creditUtilization) > 50 ? '#f87171' : '#34d399' }}>{creditUtilization}% Utilized</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${creditUtilization}%`, background: Number(creditUtilization) > 50 ? '#ef4444' : '#10b981', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>

          {/* Activity Stream */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                <Calendar size={18} color="var(--primary-600)" /> Touchpoint Activity
              </h3>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem' }}>
              <button 
                className={`btn btn-sm ${activityFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ fontSize: '0.725rem', padding: '2px 8px' }}
                onClick={() => setActivityFilter('ALL')}
              >
                All
              </button>
              <button 
                className={`btn btn-sm ${activityFilter === 'QUOTATION' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ fontSize: '0.725rem', padding: '2px 8px' }}
                onClick={() => setActivityFilter('QUOTATION')}
              >
                Quotations
              </button>
              <button 
                className={`btn btn-sm ${activityFilter === 'ORDER' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ fontSize: '0.725rem', padding: '2px 8px' }}
                onClick={() => setActivityFilter('ORDER')}
              >
                Orders
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {filteredActivities.map((act, i) => (
                <div key={act.id || i} style={{ display: 'flex', gap: '0.75rem', borderBottom: i < filteredActivities.length - 1 ? '1px solid var(--slate-100)' : 'none', paddingBottom: '0.75rem' }}>
                  <div style={{ 
                    width: '34px', 
                    height: '34px', 
                    borderRadius: '10px', 
                    background: act.type === 'quotation' ? '#eff6ff' : act.type === 'order' ? '#ecfdf5' : '#fffbeb',
                    color: act.type === 'quotation' ? '#2563eb' : act.type === 'order' ? '#10b981' : '#d97706',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FileText size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span 
                        style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary-700)', cursor: 'pointer' }}
                        onClick={() => navigate(`/customers/${act.customerId}`)}
                      >
                        {act.customerName}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>{act.date}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--slate-800)', marginTop: '2px' }}>{act.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>{act.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;
