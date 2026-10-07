import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '4rem auto',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪵</div>
          <h2 style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: 700, marginBottom: '0.5rem' }}>
            WoodCraft ERP View Recovered
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            An unexpected render issue occurred while displaying this section.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            style={{
              padding: '0.6rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Reload ERP Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
