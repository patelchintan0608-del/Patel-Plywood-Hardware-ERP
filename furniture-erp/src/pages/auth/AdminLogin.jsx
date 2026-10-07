import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Layers,
  LayoutGrid,
  Sparkles,
  Droplets,
  KeyRound,
  X
} from 'lucide-react';
import { login, forgotPassword, isLoggedIn, getCurrentUser, getDashboardRouteForUser } from '../../services/authService';
import '../../styles/adminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [email, setEmail] = useState('patelchintan0608@gmail.com');
  const [password, setPassword] = useState('Admin@12345');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '', token: '' });

  useEffect(() => {
    if (isLoggedIn()) {
      const user = getCurrentUser();
      const targetRoute = getDashboardRouteForUser(user);
      navigate(targetRoute, { replace: true });
    }

    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('session') === 'expired') {
      setErrorMessage('Your session has expired. Please log in again.');
    }
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your username or email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim(), password, rememberMe);
      if (res.success) {
        const user = res.user || getCurrentUser();
        const roleStr = (user?.role || '').toLowerCase();
        const emailStr = (user?.email || email.trim() || '').toLowerCase();
        const isAdminAccount = roleStr.includes('admin') || roleStr.includes('administrator') || emailStr === 'patelchintan0608@gmail.com' || emailStr === 'admin@patelplywood.com';

        const targetRoute = isAdminAccount ? '/' : (location.state?.from?.pathname || getDashboardRouteForUser(user));
        
        setSuccessMessage(`Login successful! Directing to ${isAdminAccount ? 'Admin' : user?.role === 'quotation_employee' ? 'Quotation' : 'Delivery'} Dashboard...`);
        
        setTimeout(() => {
          navigate(targetRoute, { replace: true });
        }, 300);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg({ type: '', text: '', token: '' });

    if (!forgotEmail.trim()) {
      setForgotMsg({ type: 'error', text: 'Please enter your registered email.' });
      return;
    }

    setForgotLoading(true);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      setForgotMsg({
        type: 'success',
        text: res.message || 'Password reset link generated.',
        token: res.resetToken || ''
      });
    } catch (err) {
      setForgotMsg({
        type: 'error',
        text: err.message || 'Failed to request password reset.'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-cinema-bg">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="login-bg-video"
      >
        <source src="/furniture_erp_login_bg.mp4" type="video/mp4" />
        <source src="/liquid_pouring_background.mp4" type="video/mp4" />
        <source src="/plywood_erp_background_compatible.mp4" type="video/mp4" />
      </video>
      <div className="login-dark-overlay" />

      {/* ================= 1. TOP BAR HEADER ================= */}
      <header className="login-top-bar">
        {/* Top-Left Brand Logo */}
        <div className="brand-logo-container">
          <div className="brand-logo-stack-icon">
            <span className="stack-layer layer-1" />
            <span className="stack-layer layer-2" />
            <span className="stack-layer layer-3" />
          </div>
          <div className="brand-logo-text-group">
            <h1 className="brand-name-main">PATEL</h1>
            <span className="brand-name-sub">PLYWOOD & HARDWARE</span>
            <div className="brand-name-erp-line">
              <span className="line" />
              <span className="erp-tag">E R P</span>
              <span className="line" />
            </div>
          </div>
        </div>

        {/* Top-Right Quality Motto */}
        <div className="top-motto-container">
          <div className="motto-line">QUALITY WOOD</div>
          <div className="motto-line bold">STRONGER SPACES</div>
          <div className="motto-line">BETTER TOMORROW</div>
        </div>
      </header>

      {/* ================= 2. MAIN CONTAINER (LEFT CHIPS & RIGHT LOGIN CARD) ================= */}
      <main className="login-main-stage">
        
        {/* Left Column: Product Features Stack */}
        <div className="left-features-column">
          
          <div className="feature-chip-item">
            <div className="chip-icon-box">
              <Layers size={20} />
            </div>
            <div className="chip-text-box">
              <h3 className="chip-title">PLYWOOD</h3>
              <p className="chip-sub">Strong Foundations for Better Tomorrow</p>
            </div>
          </div>

          <div className="feature-chip-item">
            <div className="chip-icon-box">
              <LayoutGrid size={20} />
            </div>
            <div className="chip-text-box">
              <h3 className="chip-title">SUNMICA SHEETS</h3>
              <p className="chip-sub">Stylish Finishes for Modern Spaces</p>
            </div>
          </div>

          <div className="feature-chip-item">
            <div className="chip-icon-box">
              <Sparkles size={20} />
            </div>
            <div className="chip-text-box">
              <h3 className="chip-title">WOODEN SHEETS</h3>
              <p className="chip-sub">Natural Beauty Endless Possibilities</p>
            </div>
          </div>

          <div className="feature-chip-item">
            <div className="chip-icon-box">
              <Droplets size={20} />
            </div>
            <div className="chip-text-box">
              <h3 className="chip-title">WOOD OIL</h3>
              <p className="chip-sub">Protection that Lasts</p>
            </div>
          </div>

          {/* Calligraphic Tagline at Bottom Left */}
          <div className="calligraphy-tagline">
            Built with Nature's Finest
          </div>
        </div>

        {/* Right Column: Floating Dark Glassmorphic Login Card */}
        <div className="right-glass-login-card">
          
          <div className="card-header-group">
            <h2 className="login-portal-title">
              Admin <span className="gold-portal-text">Portal</span>
            </h2>
            <p className="login-portal-sub">
              Manage Your Business. Build a Stronger Future.
            </p>
          </div>

          {/* Alert Banners */}
          {errorMessage && (
            <div className="login-alert-box alert-danger">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="login-alert-box alert-success">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="dark-login-form">
            
            {/* Username Field */}
            <div className="dark-field-group">
              <div className="dark-input-wrapper">
                <User className="dark-input-icon" size={18} />
                <input
                  type="text"
                  className="dark-input-element"
                  placeholder="Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="dark-field-group">
              <div className="dark-input-wrapper">
                <Lock className="dark-input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="dark-input-element"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="dark-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="dark-options-row">
              <label className="dark-checkbox-label">
                <input
                  type="checkbox"
                  className="dark-checkbox-element"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="gold-forgot-link"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotMsg({ type: '', text: '', token: '' });
                  setShowForgotModal(true);
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Golden Login Button */}
            <button
              type="submit"
              className="gold-login-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={18} className="btn-arrow-icon" />
                </>
              )}
            </button>
          </form>

          {/* Subtext Footer inside Card */}
          <div className="card-footer-branding">
            <p className="footer-company">Patel Plywood & Hardware ERP</p>
            <p className="footer-access">Admin Access Only</p>
          </div>

        </div>

      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="auth-modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="auth-modal-card-dark" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowForgotModal(false)}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div className="forgot-key-icon-box">
                <KeyRound size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Reset Admin Password</h3>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Enter your account username/email to receive a password reset link.
              </p>
            </div>

            {forgotMsg.text && (
              <div className={`login-alert-box ${forgotMsg.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                {forgotMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                <div>
                  <div>{forgotMsg.text}</div>
                  {forgotMsg.token && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}>
                      <a
                        href={`/reset-password?token=${forgotMsg.token}`}
                        style={{ color: '#f59e0b', textDecoration: 'underline' }}
                        onClick={() => setShowForgotModal(false)}
                      >
                        Click here to set new password
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="dark-field-group">
                <div className="dark-input-wrapper">
                  <User className="dark-input-icon" size={18} />
                  <input
                    type="email"
                    className="dark-input-element"
                    placeholder="Admin Email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="gold-login-btn"
                disabled={forgotLoading}
                style={{ marginTop: '0.25rem' }}
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLogin;