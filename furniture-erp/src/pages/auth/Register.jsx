import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { register } from '../../services/authService';
import '../../styles/adminLogin.css';

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await register(name.trim(), email.trim(), password, role);
      if (res.success) {
        setSuccessMessage('Registration successful! Redirecting to Admin Dashboard...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-container">
        
        {/* Left Hero Section */}
        <div className="admin-brand-hero">
          <div className="brand-bg-glow" />
          <div className="brand-bg-glow-bottom" />

          <div className="brand-hero-header">
            <img
              src="/Furniture Erp Log.jpg"
              alt="Patel Plywood & Hardware"
              className="brand-logo-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="brand-logo-title">
              <span>PATEL PLYWOOD</span>
              <span className="brand-logo-subtitle">HARDWARE ERP</span>
            </div>
          </div>

          <div className="brand-hero-content">
            <div className="hero-tagline-badge">
              <Sparkles size={14} />
              <span>ALWAYS SOMETHING DIFFERENT.</span>
            </div>

            <h1 className="hero-main-title">
              Join the <span>Admin Portal</span>
            </h1>

            <p className="hero-description">
              Create an administrative user account to access inventory stock management, customer CRM, quotations, and live sales monitoring.
            </p>

            <div className="hero-feature-list">
              <div className="hero-feature-item">
                <div className="feature-check-icon"><CheckCircle2 size={14} /></div>
                <span>Role-Based Access Control (Admin / Super Admin)</span>
              </div>
              <div className="hero-feature-item">
                <div className="feature-check-icon"><CheckCircle2 size={14} /></div>
                <span>Bcrypt Password Encryption & JWT Security</span>
              </div>
            </div>
          </div>

          <div className="brand-hero-footer">
            <span>© 2026 PATEL PLYWOOD & HARDWARE. All rights reserved.</span>
            <span>Enterprise Edition</span>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="admin-login-form-section">
          <div className="login-card">
            
            <div className="card-header">
              <div className="card-logo-wrapper">
                <img
                  src="/Furniture Erp Log.jpg"
                  alt="Patel Plywood & Hardware ERP Logo"
                  className="card-brand-logo"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="portal-badge">
                <ShieldCheck size={14} />
                <span>Account Registration</span>
              </div>
              <h2 className="card-title">Create Admin Account</h2>
              <p className="card-subtitle">Fill in your details to register a new account</p>
            </div>

            {errorMessage && (
              <div className="login-alert login-alert-danger">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="login-alert login-alert-success">
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-container">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Chintan Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-container">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@patelplywood.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-container">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="manager">Operations Manager</option>
                </select>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>REGISTER ACCOUNT</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Already have an account?{' '}
              <Link to="/login" className="forgot-password-link" style={{ fontWeight: 700 }}>
                Sign In Here
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
