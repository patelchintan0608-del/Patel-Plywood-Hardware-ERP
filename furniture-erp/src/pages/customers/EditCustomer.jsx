import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  ArrowLeft, Save, Plus, Trash2, User, Building, MapPin, DollarSign, 
  FileText, CheckCircle2, ShieldCheck, Briefcase, Hotel, Palette, 
  Home, Building2, Sparkles, Phone, Mail, ArrowRight
} from 'lucide-react';
import '../../styles/customers.css';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchCust = async () => {
      const cust = await api.getCustomerById(id);
      if (cust) {
        setFormData({
          ...cust,
          customerId: cust.id || cust.customerId,
          customerName: cust.customerName || cust.contactPerson || '',
          companyName: cust.companyName || cust.name || '',
          email: cust.email || '',
          phone: cust.phone || '',
          address: cust.address || cust.billingAddress?.street || '',
          city: cust.city || cust.billingAddress?.city || '',
          state: cust.state || cust.billingAddress?.state || '',
          gstNumber: cust.gstNumber || cust.gstin || '',
          customerType: cust.customerType || cust.category || 'Commercial Retailer',
          createdDate: cust.createdDate || cust.joinedDate || new Date().toISOString().split('T')[0],
          status: cust.status || 'Active',
          paymentTerms: cust.paymentTerms || 'Net 30',
          creditLimit: cust.creditLimit || 0,
          outstandingBalance: cust.outstandingBalance || 0,
          notes: cust.notes || '',
          billingAddress: cust.billingAddress || {
            street: cust.address || '',
            city: cust.city || '',
            state: cust.state || '',
            pincode: '',
            country: 'India'
          },
          shippingAddress: cust.shippingAddress || {
            street: cust.address || '',
            city: cust.city || '',
            state: cust.state || '',
            pincode: '',
            country: 'India'
          },
          sameAsBilling: cust.sameAsBilling !== undefined ? cust.sameAsBilling : true,
          contactPersons: cust.contactPersons && cust.contactPersons.length > 0 
            ? cust.contactPersons 
            : [{ id: 1, name: cust.contactPerson || '', designation: 'Primary Contact', email: cust.email || '', phone: cust.phone || '', isPrimary: true }]
        });
      } else {
        navigate('/customers');
      }
    };
    fetchCust();
  }, [id, navigate]);

  if (!formData) return null;

  const calculateProgress = () => {
    let score = 0;
    let total = 6;
    if (formData.companyName) score++;
    if (formData.customerName) score++;
    if (formData.email) score++;
    if (formData.phone) score++;
    if (formData.city || formData.address) score++;
    if (formData.gstNumber) score++;
    return Math.round((score / total) * 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'city' || name === 'state' || name === 'address') {
      const updatedBilling = {
        ...formData.billingAddress,
        street: name === 'address' ? value : formData.billingAddress.street,
        city: name === 'city' ? value : formData.billingAddress.city,
        state: name === 'state' ? value : formData.billingAddress.state
      };
      setFormData({
        ...formData,
        [name]: value,
        billingAddress: updatedBilling,
        shippingAddress: formData.sameAsBilling ? { ...updatedBilling } : formData.shippingAddress
      });
    } else if (name === 'customerName') {
      const updatedContacts = [...formData.contactPersons];
      if (updatedContacts.length > 0) {
        updatedContacts[0] = { ...updatedContacts[0], name: value };
      }
      setFormData({ ...formData, customerName: value, contactPersons: updatedContacts });
    } else if (name === 'email' || name === 'phone') {
      const updatedContacts = [...formData.contactPersons];
      if (updatedContacts.length > 0) {
        updatedContacts[0] = { ...updatedContacts[0], [name]: value };
      }
      setFormData({ ...formData, [name]: value, contactPersons: updatedContacts });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBillingAddressChange = (e) => {
    const { name, value } = e.target;
    const updatedBilling = { ...formData.billingAddress, [name]: value };
    setFormData({
      ...formData,
      billingAddress: updatedBilling,
      address: updatedBilling.street,
      city: updatedBilling.city,
      state: updatedBilling.state,
      shippingAddress: formData.sameAsBilling ? { ...updatedBilling } : formData.shippingAddress
    });
  };

  const handleShippingAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      shippingAddress: { ...formData.shippingAddress, [name]: value }
    });
  };

  const handleSameAsBillingToggle = (e) => {
    const checked = e.target.checked;
    setFormData({
      ...formData,
      sameAsBilling: checked,
      shippingAddress: checked ? { ...formData.billingAddress } : formData.shippingAddress
    });
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...formData.contactPersons];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    
    if (index === 0 || updatedContacts[index].isPrimary) {
      const mainName = field === 'name' ? value : formData.customerName;
      const mainEmail = field === 'email' ? value : formData.email;
      const mainPhone = field === 'phone' ? value : formData.phone;
      setFormData({
        ...formData,
        customerName: mainName,
        email: mainEmail,
        phone: mainPhone,
        contactPersons: updatedContacts
      });
    } else {
      setFormData({ ...formData, contactPersons: updatedContacts });
    }
  };

  const setPrimaryContact = (index) => {
    const updatedContacts = formData.contactPersons.map((contact, i) => ({
      ...contact,
      isPrimary: i === index
    }));
    const primary = updatedContacts[index];
    setFormData({
      ...formData,
      customerName: primary.name,
      email: primary.email,
      phone: primary.phone,
      contactPersons: updatedContacts
    });
  };

  const addContactPerson = () => {
    setFormData({
      ...formData,
      contactPersons: [
        ...formData.contactPersons,
        { id: Date.now(), name: '', designation: '', email: '', phone: '', isPrimary: false }
      ]
    });
  };

  const removeContactPerson = (index) => {
    if (formData.contactPersons.length <= 1) return;
    const updatedContacts = formData.contactPersons.filter((_, i) => i !== index);
    if (!updatedContacts.some(c => c.isPrimary)) {
      updatedContacts[0].isPrimary = true;
    }
    setFormData({ ...formData, contactPersons: updatedContacts });
  };

  const setCategory = (cat) => {
    setFormData(prev => ({ ...prev, customerType: cat }));
  };

  const setCreditPreset = (amount) => {
    setFormData(prev => ({ ...prev, creditLimit: amount }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const finalData = {
      ...formData,
      id: formData.customerId,
      name: formData.companyName || 'Company',
      category: formData.customerType,
      gstin: formData.gstNumber,
      joinedDate: formData.createdDate
    };
    await api.saveCustomer(finalData);
    navigate(`/customers/${formData.id}`);
  };

  const getInitials = (name) => {
    if (!name) return 'CU';
    const words = name.trim().split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const categoryOptions = [
    { type: 'Commercial Retailer', label: 'Commercial Retailer', icon: <Building2 size={20} /> },
    { type: 'Hotel Chain', label: 'Hotel & Hospitality', icon: <Hotel size={20} /> },
    { type: 'Interior Designer', label: 'Interior Designer', icon: <Palette size={20} /> },
    { type: 'Residential Direct', label: 'Residential Direct', icon: <Home size={20} /> },
    { type: 'Corporate Client', label: 'Corporate Office', icon: <Briefcase size={20} /> }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Banner Header */}
      <div className="customer-hero-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')} style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
              <ArrowLeft size={14} /> Back to Directory
            </button>
            <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              Edit Customer Profile: <span style={{ color: '#93c5fd' }}>{formData.id}</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
              Update company identity, contact representatives, site delivery location, and approved credit limit.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/customers')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} style={{ padding: '0.65rem 1.4rem' }}>
              <Save size={16} /> Save Profile Changes
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="register-stepper">
        <div 
          className={`step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
          onClick={() => setCurrentStep(1)}
        >
          <div className="step-number">{currentStep > 1 ? <CheckCircle2 size={16} /> : '1'}</div>
          <div className="step-text">
            <span className="step-title">Business Profile</span>
            <span className="step-desc">ID, Type & Company</span>
          </div>
        </div>

        <div 
          className={`step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
          onClick={() => setCurrentStep(2)}
        >
          <div className="step-number">{currentStep > 2 ? <CheckCircle2 size={16} /> : '2'}</div>
          <div className="step-text">
            <span className="step-title">Contact Persons</span>
            <span className="step-desc">Primary & Representatives</span>
          </div>
        </div>

        <div 
          className={`step-item ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
          onClick={() => setCurrentStep(3)}
        >
          <div className="step-number">{currentStep > 3 ? <CheckCircle2 size={16} /> : '3'}</div>
          <div className="step-text">
            <span className="step-title">Location & Addresses</span>
            <span className="step-desc">Billing & Shipping Sites</span>
          </div>
        </div>

        <div 
          className={`step-item ${currentStep === 4 ? 'active' : ''}`}
          onClick={() => setCurrentStep(4)}
        >
          <div className="step-number">4</div>
          <div className="step-text">
            <span className="step-title">Financial & Credit</span>
            <span className="step-desc">Limit & Terms</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Form (Left) + Live Preview Card (Right Column) */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Step Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STEP 1: Business Profile & Schema */}
          {currentStep === 1 && (
            <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building size={20} color="var(--primary-600)" /> Business Identity & Category
                </h3>
                <span className="badge" style={{ background: 'var(--primary-50)', color: 'var(--primary-800)', border: '1px solid var(--primary-200)', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>
                  Step 1 of 4
                </span>
              </div>

              {/* Category Picker Visual Grid */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: '700' }}>
                  Customer Category / Type *
                </label>
                <div className="category-picker-grid">
                  {categoryOptions.map(cat => (
                    <div
                      key={cat.type}
                      className={`category-card ${formData.customerType === cat.type ? 'selected' : ''}`}
                      onClick={() => setCategory(cat.type)}
                    >
                      <div className="category-icon-wrapper">
                        {cat.icon}
                      </div>
                      <span className="category-title">{cat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                
                <div className="form-group">
                  <label className="form-label">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    name="customerId"
                    disabled
                    className="form-control"
                    style={{ fontWeight: '700', color: 'var(--slate-500)', background: 'var(--slate-100)' }}
                    value={formData.customerId}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company / Business Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    className="form-control"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GSTIN / Tax ID Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="gstNumber"
                      className="form-control"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                    />
                    {formData.gstNumber && formData.gstNumber.length >= 10 && (
                      <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                        <ShieldCheck size={14} /> Valid Format
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Registration Date *</label>
                  <input
                    type="date"
                    name="createdDate"
                    required
                    className="form-control"
                    value={formData.createdDate}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-100)' }}>
                <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(2)}>
                  Continue to Contacts <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Contacts & Representatives */}
          {currentStep === 2 && (
            <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={20} color="var(--primary-600)" /> Contact Persons & Representatives
                  </h3>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addContactPerson}>
                  <Plus size={14} /> Add Contact Person
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formData.contactPersons.map((contact, idx) => (
                  <div 
                    key={contact.id || idx} 
                    style={{ 
                      background: contact.isPrimary ? '#f0fdf4' : 'var(--slate-50)', 
                      padding: '1.25rem', 
                      borderRadius: '12px',
                      border: contact.isPrimary ? '1.5px solid #86efac' : '1px solid var(--slate-200)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--slate-800)' }}>
                          Contact #{idx + 1}
                        </span>
                        {contact.isPrimary ? (
                          <span style={{ background: '#10b981', color: 'white', fontSize: '0.7rem', padding: '3px 10px', borderRadius: '12px', fontWeight: '800' }}>
                            Primary Representative
                          </span>
                        ) : (
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm" 
                            style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                            onClick={() => setPrimaryContact(idx)}
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>

                      {formData.contactPersons.length > 1 && (
                        <button 
                          type="button" 
                          className="btn btn-danger btn-sm"
                          onClick={() => removeContactPerson(idx)}
                          title="Remove Contact"
                          style={{ padding: '0.35rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={contact.name}
                          onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Designation / Role</label>
                        <input
                          type="text"
                          className="form-control"
                          value={contact.designation}
                          onChange={(e) => handleContactChange(idx, 'designation', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input
                          type="email"
                          required
                          className="form-control"
                          value={contact.email}
                          onChange={(e) => handleContactChange(idx, 'email', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={contact.phone}
                          onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-100)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft size={16} /> Back to Profile
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                  Continue to Addresses <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Location & Addresses */}
          {currentStep === 3 && (
            <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={20} color="var(--primary-600)" /> Address & Delivery Sites
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Billing Address */}
                <div style={{ background: 'var(--slate-50)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--slate-200)' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--slate-900)', marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.4rem', fontWeight: '700' }}>
                    Official Billing Address
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div className="form-group">
                      <label className="form-label">Street / Building Address *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={formData.address}
                        onChange={handleChange}
                        name="address"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={formData.city}
                          onChange={handleChange}
                          name="city"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={formData.state}
                          onChange={handleChange}
                          name="state"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div style={{ background: 'var(--slate-50)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--slate-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.4rem' }}>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--slate-900)', margin: 0, fontWeight: '700' }}>
                      Delivery / Warehouse Site
                    </h4>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem', cursor: 'pointer', color: 'var(--primary-700)', fontWeight: '700' }}>
                      <input
                        type="checkbox"
                        checked={formData.sameAsBilling}
                        onChange={handleSameAsBillingToggle}
                      />
                      Same as Billing
                    </label>
                  </div>

                  {!formData.sameAsBilling ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      <div className="form-group">
                        <label className="form-label">Street / Site Address *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={formData.shippingAddress.street}
                          onChange={handleShippingAddressChange}
                          name="street"
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label">City *</label>
                          <input
                            type="text"
                            required
                            className="form-control"
                            value={formData.shippingAddress.city}
                            onChange={handleShippingAddressChange}
                            name="city"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">State *</label>
                          <input
                            type="text"
                            required
                            className="form-control"
                            value={formData.shippingAddress.state}
                            onChange={handleShippingAddressChange}
                            name="state"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '2rem 1.5rem', background: 'white', borderRadius: '8px', color: 'var(--slate-500)', fontSize: '0.85rem', textAlign: 'center', border: '1px dashed var(--slate-300)' }}>
                      <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                      Shipping location matches Billing Address.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-100)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft size={16} /> Back to Contacts
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(4)}>
                  Continue to Financials <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Financial & Credit Terms */}
          {currentStep === 4 && (
            <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <DollarSign size={20} color="var(--primary-600)" /> Financial Terms & Account Status
                </h3>
              </div>

              <div className="form-grid">
                
                <div className="form-group full-width">
                  <label className="form-label" style={{ fontWeight: '700' }}>
                    Approved Credit Limit (₹) *
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      name="creditLimit"
                      className="form-control"
                      style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-700)', maxWidth: '280px' }}
                      value={formData.creditLimit}
                      onChange={handleChange}
                    />
                    <div className="preset-pills-row">
                      {[100000, 250000, 500000, 1000000, 2500000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          className={`preset-pill ${Number(formData.creditLimit) === amt ? 'active' : ''}`}
                          onClick={() => setCreditPreset(amt)}
                        >
                          ₹{(amt / 100000).toFixed(amt >= 1000000 ? 0 : 1)} Lakh{amt > 100000 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Terms</label>
                  <select name="paymentTerms" className="form-control" value={formData.paymentTerms} onChange={handleChange}>
                    <option value="Immediate / Advance">Immediate / Advance</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 45">Net 45 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select name="status" className="form-control" value={formData.status} onChange={handleChange}>
                    <option value="Active">Active Account</option>
                    <option value="Prospect">Prospect / Lead</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Internal Remarks & Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="form-control"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-100)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft size={16} /> Back to Location
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                  <Save size={18} /> Update Customer Profile
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Live Preview Sidebar Column */}
        <div>
          <div className="live-preview-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary-700)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} /> Live Profile Preview
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{calculateProgress()}% Complete</span>
            </div>

            <div style={{ height: '6px', background: 'var(--slate-100)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <div style={{ height: '100%', width: `${calculateProgress()}%`, background: 'var(--primary-600)', transition: 'width 0.3s ease' }} />
            </div>

            <div className="live-preview-header">
              <div className="preview-avatar">
                {getInitials(formData.companyName || formData.customerName)}
              </div>
              <div className="preview-company-name">
                {formData.companyName || 'Company Name'}
              </div>
              <div className="preview-contact-name">
                {formData.customerName ? `Contact: ${formData.customerName}` : 'Primary Contact'}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span className="badge" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', border: '1px solid var(--primary-200)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                  {formData.customerType}
                </span>
              </div>
            </div>

            <div>
              <div className="preview-detail-row">
                <span className="preview-label">Customer ID</span>
                <span className="preview-value" style={{ fontFamily: 'monospace', color: 'var(--primary-700)' }}>{formData.customerId}</span>
              </div>

              <div className="preview-detail-row">
                <span className="preview-label">GSTIN</span>
                <span className="preview-value" style={{ fontFamily: 'monospace' }}>{formData.gstNumber || 'Not Specified'}</span>
              </div>

              <div className="preview-detail-row">
                <span className="preview-label">Phone</span>
                <span className="preview-value">{formData.phone || '—'}</span>
              </div>

              <div className="preview-detail-row">
                <span className="preview-label">Location</span>
                <span className="preview-value">{formData.city ? `${formData.city}, ${formData.state}` : '—'}</span>
              </div>

              <div className="preview-detail-row">
                <span className="preview-label">Approved Credit</span>
                <span className="preview-value" style={{ color: 'var(--success)', fontWeight: '800' }}>₹{Number(formData.creditLimit).toLocaleString('en-IN')}</span>
              </div>

              <div className="preview-detail-row">
                <span className="preview-label">Outstanding Due</span>
                <span className="preview-value" style={{ color: formData.outstandingBalance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: '800' }}>₹{Number(formData.outstandingBalance).toLocaleString('en-IN')}</span>
              </div>

              <div className="preview-detail-row">
                <span className="preview-label">Account Status</span>
                <span className="preview-value">
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    fontSize: '0.7rem', 
                    fontWeight: '700',
                    background: formData.status === 'Active' ? '#ecfdf5' : '#fffbeb',
                    color: formData.status === 'Active' ? '#047857' : '#b45309'
                  }}>
                    {formData.status}
                  </span>
                </span>
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
};

export default EditCustomer;
