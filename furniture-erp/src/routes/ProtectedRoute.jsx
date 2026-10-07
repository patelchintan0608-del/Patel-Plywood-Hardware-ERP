import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isLoggedIn } from '../services/authService';

const ProtectedRoute = ({ allowedRoles = [], requiredPermission }) => {
  const location = useLocation();
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#eaeff4',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        color: '#1e293b'
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>PATEL PLYWOOD ERP</div>
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Verifying security session...</div>
      </div>
    );
  }

  const authenticated = !!user || isLoggedIn();

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleCheck = allowedRoles.length === 0 || (user && allowedRoles.includes(user.role));
  const permCheck = !requiredPermission || hasPermission(requiredPermission);

  if (!roleCheck || !permCheck) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>🔒</div>
        <h2 style={{ color: '#ef4444', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>403 - Access Denied</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '420px', margin: '0 0 1.5rem 0' }}>
          Your user account does not have permission to access this ERP module ({requiredPermission || allowedRoles.join(', ')}).
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '10px 20px',
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
          <a
            href="/"
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
