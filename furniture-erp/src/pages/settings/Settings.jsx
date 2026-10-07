import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Building,
  DollarSign,
  Sliders,
  ShieldCheck,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  CreditCard,
  Lock,
  Clock,
  Bell,
  Package
} from 'lucide-react';
import '../../styles/settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [settings, setSettings] = useState({
    companyName: 'Patel Plywood & Hardware ERP',
    gstin: '24AAACP7740P1Z8',
    taxRate: 18,
    currency: 'INR (₹)',
    companyAddress: '150 Industrial Timber Way, GIDC, Surat, Gujarat 395007',
    email: 'info@patelplywood.com',
    phone: '+91 98765 43210',
    website: 'www.patelplywood.com',
    bankName: 'HDFC Bank Ltd',
    accountNo: '50200089012345',
    ifscCode: 'HDFC0000124',
    paymentTerms: 'Net 30 Days',
    autoReserveStock: true,
    enableQuotationApproval: true,
    autoDispatchNotification: true,
    require2FA: false,
    sessionTimeoutMinutes: 60
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await api.getSettings();
        if (s) setSettings(prev => ({ ...prev, ...s }));
      } catch (err) {
        console.error("Failed to fetch ERP settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.saveSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save ERP settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      {/* Header Title */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">ERP System Settings</h1>
          <p className="page-subtitle">Configure company information, quotation defaults, workflow automation, and security policies</p>
        </div>
      </div>

      {/* Success Notification Toast */}
      {savedSuccess && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: '#ecfdf5',
          color: '#047857',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          border: '1px solid #a7f3d0',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)'
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>ERP System Settings updated and saved successfully!</span>
        </div>
      )}

      {/* Two Column Settings Grid */}
      <div className="settings-grid">
        
        {/* Left Tab Navigation Sidebar */}
        <div className="settings-tabs-card">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab('company')}
          >
            <Building size={18} className="tab-icon" />
            <span>Company Profile</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
            onClick={() => setActiveTab('financial')}
          >
            <DollarSign size={18} className="tab-icon" />
            <span>Commercial & Tax</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'automation' ? 'active' : ''}`}
            onClick={() => setActiveTab('automation')}
          >
            <Sliders size={18} className="tab-icon" />
            <span>Workflow & Rules</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <ShieldCheck size={18} className="tab-icon" />
            <span>Security & Access</span>
          </button>
        </div>

        {/* Right Tab Content Card */}
        <div className="settings-main-card">
          <form onSubmit={handleSubmit}>

            {/* TAB 1: COMPANY PROFILE */}
            {activeTab === 'company' && (
              <div>
                <h3 className="settings-section-title">
                  <Building size={20} color="var(--primary-600)" /> Company Profile & Showroom Branding
                </h3>
                <p className="settings-section-sub">Legal identity, corporate contact, GST registration, and plant address printed on tax invoices & quotations</p>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label">
                      <Building size={14} color="var(--slate-500)" /> Company Legal / Brand Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      className="settings-input"
                      value={settings.companyName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Patel Plywood & Hardware ERP"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">
                      <FileText size={14} color="var(--slate-500)" /> GSTIN / Tax Registration No.
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      className="settings-input"
                      value={settings.gstin}
                      onChange={handleChange}
                      placeholder="e.g. 24AAACP7740P1Z8"
                    />
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label">
                      <Mail size={14} color="var(--slate-500)" /> Corporate Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="settings-input"
                      value={settings.email}
                      onChange={handleChange}
                      required
                      placeholder="info@patelplywood.com"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">
                      <Phone size={14} color="var(--slate-500)" /> Contact Phone Number *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      className="settings-input"
                      value={settings.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">
                    <Globe size={14} color="var(--slate-500)" /> Corporate Website URL
                  </label>
                  <input
                    type="text"
                    name="website"
                    className="settings-input"
                    value={settings.website}
                    onChange={handleChange}
                    placeholder="www.patelplywood.com"
                  />
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">
                    <MapPin size={14} color="var(--slate-500)" /> Physical Plant & Showroom Address
                  </label>
                  <textarea
                    name="companyAddress"
                    rows={3}
                    className="settings-input"
                    value={settings.companyAddress}
                    onChange={handleChange}
                    placeholder="Enter full street, city, state and pincode..."
                  />
                </div>
              </div>
            )}

            {/* TAB 2: COMMERCIAL & FINANCIAL */}
            {activeTab === 'financial' && (
              <div>
                <h3 className="settings-section-title">
                  <DollarSign size={20} color="var(--primary-600)" /> Commercial & Financial Defaults
                </h3>
                <p className="settings-section-sub">Configure default GST rates, billing currency, credit terms, and official bank details for payments</p>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label">
                      <DollarSign size={14} color="var(--slate-500)" /> Default Tax Rate (GST %)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="taxRate"
                      className="settings-input"
                      value={settings.taxRate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">
                      <Globe size={14} color="var(--slate-500)" /> System Currency
                    </label>
                    <select name="currency" className="settings-input" value={settings.currency} onChange={handleChange}>
                      <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                      <option value="USD ($)">USD ($) - US Dollar</option>
                      <option value="EUR (€)">EUR (€) - Euro</option>
                      <option value="GBP (£)">GBP (£) - British Pound</option>
                    </select>
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label">
                      <CreditCard size={14} color="var(--slate-500)" /> Preferred Bank Name
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      className="settings-input"
                      value={settings.bankName}
                      onChange={handleChange}
                      placeholder="e.g. HDFC Bank Ltd"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">
                      <CreditCard size={14} color="var(--slate-500)" /> Bank Account Number
                    </label>
                    <input
                      type="text"
                      name="accountNo"
                      className="settings-input"
                      value={settings.accountNo}
                      onChange={handleChange}
                      placeholder="e.g. 50200089012345"
                    />
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label">
                      <CreditCard size={14} color="var(--slate-500)" /> IFSC Code / SWIFT Code
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      className="settings-input"
                      value={settings.ifscCode}
                      onChange={handleChange}
                      placeholder="e.g. HDFC0000124"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">
                      <Clock size={14} color="var(--slate-500)" /> Default Payment Terms
                    </label>
                    <select name="paymentTerms" className="settings-input" value={settings.paymentTerms} onChange={handleChange}>
                      <option value="Immediate Pay">Immediate Payment on Order</option>
                      <option value="Net 15 Days">Net 15 Days Credit</option>
                      <option value="Net 30 Days">Net 30 Days Credit</option>
                      <option value="50% Advance">50% Advance / 50% on Delivery</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WORKFLOW & RULES */}
            {activeTab === 'automation' && (
              <div>
                <h3 className="settings-section-title">
                  <Sliders size={20} color="var(--primary-600)" /> Automation & Inventory Rules
                </h3>
                <p className="settings-section-sub">Configure automatic stock reservations, approval flows, and customer dispatch alerts</p>

                <div className="settings-toggle-card">
                  <div>
                    <div className="settings-toggle-title">Auto-Reserve Inventory on Order Approval</div>
                    <div className="settings-toggle-desc">Automatically lock factory stock when a Sales Order moves to Approved stage</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="autoReserveStock"
                      checked={settings.autoReserveStock}
                      onChange={handleChange}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-card">
                  <div>
                    <div className="settings-toggle-title">Require Manager Approval for Large Quotations</div>
                    <div className="settings-toggle-desc">Mandate admin sign-off for quotations exceeding ₹2,50,000 value</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="enableQuotationApproval"
                      checked={settings.enableQuotationApproval}
                      onChange={handleChange}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="settings-toggle-card">
                  <div>
                    <div className="settings-toggle-title">Automated Dispatch & Driver Notifications</div>
                    <div className="settings-toggle-desc">Send automated dispatch SMS/Email alerts to client upon vehicle departure</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="autoDispatchNotification"
                      checked={settings.autoDispatchNotification}
                      onChange={handleChange}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY & ACCESS */}
            {activeTab === 'security' && (
              <div>
                <h3 className="settings-section-title">
                  <ShieldCheck size={20} color="var(--primary-600)" /> Security & Access Control
                </h3>
                <p className="settings-section-sub">Manage administrator multi-factor authentication, session timeouts, and audit logging</p>

                <div className="settings-toggle-card">
                  <div>
                    <div className="settings-toggle-title">Enforce Two-Factor Authentication (2FA)</div>
                    <div className="settings-toggle-desc">Require OTP verification on login for all Admin and Manager accounts</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="require2FA"
                      checked={settings.require2FA}
                      onChange={handleChange}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="settings-form-group" style={{ marginTop: '1.25rem' }}>
                  <label className="settings-label">
                    <Clock size={14} color="var(--slate-500)" /> Inactive User Session Timeout (Minutes)
                  </label>
                  <select
                    name="sessionTimeoutMinutes"
                    className="settings-input"
                    value={settings.sessionTimeoutMinutes}
                    onChange={handleChange}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes (1 Hour)</option>
                    <option value={120}>120 Minutes (2 Hours)</option>
                    <option value={480}>480 Minutes (8 Hours)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Save Action Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-200)' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem', gap: '8px' }}
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
