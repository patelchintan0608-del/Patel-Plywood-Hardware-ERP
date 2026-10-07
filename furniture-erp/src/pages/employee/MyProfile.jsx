import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Briefcase,
  MapPin,
  ShieldCheck,
  Award,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Camera,
  X
} from 'lucide-react';
import '../../styles/employee-dashboard.css';

const MyProfile = () => {
  const [profile, setProfile] = useState({
    employeeId: 'PPH-EMP-1042',
    name: 'Chintan Patel',
    department: 'Sales & Hardware Operations',
    designation: 'Senior Sales Executive & Material Specialist',
    email: 'chintan.patel@patelplywood.com',
    phone: '+91 98765 43210',
    emergencyContact: '+91 98123 45678 (Spouse - Anjali Patel)',
    joiningDate: '15 March 2022',
    tenure: '4 Years, 6 Months',
    reportingManager: 'Ramesh Patel (General Manager)',
    workLocation: 'Main Showroom & Warehouse 1, Ring Road, Surat',
    address: '45, Shivalik Avenue, Near SVNIT Circle, Surat, Gujarat - 395007',
    shiftTiming: '09:00 AM - 06:30 PM (Regular Shift)',
    employmentType: 'Full-Time Permanent',
    bankAccount: 'HDFC Bank - AC ending ****4892 (Verified)',
    panCard: 'ABCDE1234F (Verified)',
    aadhaarCard: 'XXXX-XXXX-9842 (Verified)',
    profilePhoto: '/Chintan06image.jpeg'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsEditModalOpen(false);
    setSaveSuccessMsg('Profile contact details updated successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  return (
    <div className="emp-dashboard-container">
      {/* Toast alert */}
      {saveSuccessMsg && (
        <div style={{
          background: '#dcfce7',
          color: '#15803d',
          border: '1px solid #86efac',
          padding: '12px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Profile Cover Card Header */}
      <div className="profile-cover-card">
        <div style={{ position: 'relative' }}>
          <img
            src={profile.profilePhoto}
            alt={profile.name}
            className="profile-avatar-large"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'; }}
          />
          <button
            onClick={() => setIsEditModalOpen(true)}
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              background: '#2563eb',
              color: '#ffffff',
              border: '2px solid #ffffff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Edit Photo or Info"
          >
            <Camera size={15} />
          </button>
        </div>

        <div className="profile-info-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="profile-name">{profile.name}</h1>
            <span style={{
              background: '#22c55e',
              color: '#ffffff',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              ACTIVE EMPLOYEE
            </span>
          </div>

          <p className="profile-designation">{profile.designation}</p>

          <div className="profile-badges-row">
            <span className="profile-tag">
              <Building size={13} style={{ display: 'inline', marginRight: '4px' }} />
              {profile.department}
            </span>
            <span className="profile-tag">
              ID: {profile.employeeId}
            </span>
            <span className="profile-tag">
              <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Joined: {profile.joiningDate}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          style={{
            marginLeft: 'auto',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Edit3 size={16} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Details Sections Grid */}
      <div className="profile-details-grid">
        
        {/* 1. Employment Details */}
        <div className="emp-card">
          <div className="emp-card-header">
            <h3 className="emp-card-title">
              <span className="emp-card-icon">
                <Briefcase size={18} />
              </span>
              Employment & Designation
            </h3>
            <span className="emp-id-pill" style={{ background: '#f1f5f9', color: '#475569', border: 'none' }}>
              Official Info
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="profile-detail-row">
              <span className="detail-label">
                <User size={15} /> Employee ID
              </span>
              <span className="detail-value" style={{ fontFamily: 'monospace', color: '#2563eb' }}>
                {profile.employeeId}
              </span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">
                <Building size={15} /> Department
              </span>
              <span className="detail-value">{profile.department}</span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">
                <Briefcase size={15} /> Designation
              </span>
              <span className="detail-value">{profile.designation}</span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">
                <User size={15} /> Reporting Manager
              </span>
              <span className="detail-value">{profile.reportingManager}</span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">
                <Calendar size={15} /> Joining Date
              </span>
              <span className="detail-value">{profile.joiningDate} ({profile.tenure})</span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">
                <Clock size={15} /> Shift Timings
              </span>
              <span className="detail-value">{profile.shiftTiming}</span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">
                <Award size={15} /> Employment Status
              </span>
              <span className="detail-value" style={{ color: '#16a34a' }}>{profile.employmentType}</span>
            </div>
          </div>
        </div>

        {/* 2. Contact & Location Information */}
        <div className="emp-card">
          <div className="emp-card-header">
            <h3 className="emp-card-title">
              <span className="emp-card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <Phone size={18} />
              </span>
              Contact Information
            </h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
            >
              Update Details
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="profile-detail-row">
              <span className="detail-label">
                <Mail size={15} /> Official Email
              </span>
              <span className="detail-value" style={{ color: '#2563eb' }}>{profile.email}</span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">
                <Phone size={15} /> Primary Mobile
              </span>
              <span className="detail-value">{profile.phone}</span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">
                <AlertCircle size={15} style={{ color: '#ef4444' }} /> Emergency Contact
              </span>
              <span className="detail-value" style={{ color: '#b91c1c' }}>{profile.emergencyContact}</span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">
                <MapPin size={15} /> Work Location
              </span>
              <span className="detail-value">{profile.workLocation}</span>
            </div>

            <div className="profile-detail-row" style={{ flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
              <span className="detail-label">
                <MapPin size={15} /> Residential Address
              </span>
              <span className="detail-value" style={{ textAlign: 'left', fontWeight: 500, color: '#334155' }}>
                {profile.address}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Payroll & Identity Verification */}
        <div className="emp-card" style={{ gridColumn: 'span 2' }}>
          <div className="emp-card-header">
            <h3 className="emp-card-title">
              <span className="emp-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <ShieldCheck size={18} />
              </span>
              Payroll & Identity Verification
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={15} /> All Documents Verified
            </span>
          </div>

          <div className="emp-grid-3col">
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>BANK ACCOUNT DETALS</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                {profile.bankAccount}
              </div>
              <span className="att-tag present" style={{ marginTop: '8px', fontSize: '0.7rem' }}>
                Salary Account Active
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>PAN CARD NUMBER</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '4px', fontFamily: 'monospace' }}>
                {profile.panCard}
              </div>
              <span className="att-tag present" style={{ marginTop: '8px', fontSize: '0.7rem' }}>
                Government Verified
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>AADHAAR NUMBER</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '4px', fontFamily: 'monospace' }}>
                {profile.aadhaarCard}
              </div>
              <span className="att-tag present" style={{ marginTop: '8px', fontSize: '0.7rem' }}>
                E-KYC Verified
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="emp-modal-overlay">
          <div className="emp-modal-card">
            <div className="emp-modal-header">
              <h3 className="emp-modal-title">Edit Profile Information</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="emp-input-field"
                  value={editForm.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="emp-input-field"
                  value={editForm.email}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Primary Phone Number
                </label>
                <input
                  type="text"
                  className="emp-input-field"
                  value={editForm.phone}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Emergency Contact Details
                </label>
                <input
                  type="text"
                  className="emp-input-field"
                  value={editForm.emergencyContact}
                  onChange={(e) => handleEditChange('emergencyContact', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Residential Address
                </label>
                <textarea
                  className="emp-input-field"
                  rows="3"
                  value={editForm.address}
                  onChange={(e) => handleEditChange('address', e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyProfile;
