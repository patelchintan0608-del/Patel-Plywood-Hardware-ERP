import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (statusStr) => {
    if (!statusStr) return 'bg-gray-100 text-gray-700';
    const s = statusStr.toLowerCase();
    
    if (s.includes('active') || s.includes('delivered') || s.includes('qc pass') || s.includes('accepted') || s.includes('in stock') || s.includes('fully paid')) {
      return { bg: '#ecfdf5', color: '#10b981', border: '#a7f3d0' };
    }
    if (s.includes('pending') || s.includes('processing') || s.includes('in production') || s.includes('dispatched') || s.includes('sent') || s.includes('partial')) {
      return { bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
    }
    if (s.includes('low') || s.includes('urgent') || s.includes('draft')) {
      return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
    }
    if (s.includes('inactive') || s.includes('cancelled') || s.includes('out') || s.includes('overdue')) {
      return { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' };
    }
    
    return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  };

  const style = getBadgeClass(status);

  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        padding: '1px 6px',
        borderRadius: '10px',
        fontSize: '0.7rem',
        fontWeight: '700',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: style.color
        }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
