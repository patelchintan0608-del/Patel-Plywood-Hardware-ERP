import React from 'react';
import { Check, Dot } from 'lucide-react';

export const STEPS = [
  { id: 1, label: 'Quotation Accepted' },
  { id: 2, label: 'Sales Order Created' },
  { id: 3, label: 'Packed & QC' },
  { id: 4, label: 'Dispatched' },
  { id: 5, label: 'Out for Delivery' },
  { id: 6, label: 'Delivered' }
];

export const getFulfillmentStepIndex = (status) => {
  if (!status) return 4;
  const s = status.toString().trim().toLowerCase();

  if (s.includes('quotation') || s.includes('draft') || s.includes('quote')) return 1;
  if (s.includes('sales order') || s.includes('created') || s.includes('pending') || s.includes('approved') || s.includes('processing')) return 2;
  if (s.includes('packed') || s.includes('qc') || s.includes('ready')) return 3;
  if (s.includes('dispatched') || s.includes('transit') || s.includes('shipped')) return 4;
  if (s.includes('out for delivery') || s.includes('on truck') || s.includes('dispatching')) return 5;
  if (s.includes('delivered') || s.includes('completed') || s.includes('received')) return 6;

  return 4;
};

const LogisticsTimelineStepper = ({
  status = 'Dispatched',
  title = 'End-to-End Logistics Fulfillment Timeline',
  subtitle = 'Live progress status for sales orders cleared for factory dispatch',
  variant = 'full', // 'full' | 'card' | 'compact' | 'mini'
  showBadge = true,
  badgeText = 'Automated Tracking',
  className = '',
  style = {}
}) => {
  const currentStep = getFulfillmentStepIndex(status);

  // Compact or Mini mode (for tables or item cards)
  if (variant === 'compact' || variant === 'mini') {
    const isMini = variant === 'mini';
    return (
      <div
        className={`logistics-timeline-compact ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: isMini ? '2px 0' : '8px 0',
          gap: isMini ? '2px' : '4px',
          ...style
        }}
      >
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isPending = step.id > currentStep;
          const isLast = idx === STEPS.length - 1;

          // Line color after this step
          let nextLineColor = '#e2e8f0';
          if (step.id < currentStep) {
            nextLineColor = '#10b981';
          } else if (step.id === currentStep) {
            nextLineColor = '#3b82f6';
          }

          return (
            <React.Fragment key={step.id}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: isMini ? '42px' : '90px',
                  maxWidth: isMini ? '56px' : 'none',
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                {/* Node Circle */}
                <div
                  style={{
                    width: isMini ? '14px' : '26px',
                    height: isMini ? '14px' : '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMini ? '0.5rem' : '0.75rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    ...(isCompleted
                      ? { background: '#10b981', color: '#ffffff' }
                      : isActive
                      ? {
                          background: '#2563eb',
                          color: '#ffffff',
                          boxShadow: '0 0 0 2px #dbeafe',
                          transform: 'scale(1.05)'
                        }
                      : {
                          background: '#ffffff',
                          color: '#94a3b8',
                          border: isMini ? '1.5px solid #cbd5e1' : '2px solid #cbd5e1'
                        })
                  }}
                  title={`${step.label}: ${isCompleted ? 'Completed' : isActive ? 'Active' : 'Pending'}`}
                >
                  {isCompleted ? (
                    '✓'
                  ) : isActive ? (
                    <div style={{ width: isMini ? '4px' : '8px', height: isMini ? '4px' : '8px', borderRadius: '50%', background: '#ffffff' }} />
                  ) : (
                    '○'
                  )}
                </div>

                {/* Step Text Label */}
                <span
                  style={{
                    fontSize: isMini ? '0.54rem' : '0.725rem',
                    lineHeight: isMini ? 1.05 : 1.3,
                    fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                    color: isActive ? '#1d4ed8' : isCompleted ? '#065f46' : '#64748b',
                    marginTop: isMini ? '2px' : '4px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: isMini ? '1.5px' : '2.5px',
                    background: nextLineColor,
                    marginBottom: isMini ? '10px' : '18px',
                    minWidth: isMini ? '5px' : '20px',
                    transition: 'background 0.3s ease'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Full / Card Banner Variant
  return (
    <div
      className={`card logistics-timeline-card ${className}`}
      style={{
        padding: '1.15rem 1.25rem',
        marginBottom: '1.25rem',
        background: '#ffffff',
        border: '1px solid var(--slate-200)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        ...style
      }}
    >
      {/* Header Row */}
      {(title || subtitle) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '0.775rem', color: 'var(--slate-500)', marginTop: '2px', margin: 0 }}>{subtitle}</p>}
          </div>
          {showBadge && (
            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
              {badgeText}
            </span>
          )}
        </div>
      )}

      {/* 6-Step Stepper Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', overflowX: 'auto' }}>
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isPending = step.id > currentStep;
          const isLast = idx === STEPS.length - 1;

          // Connector line after current node
          let nextLineColor = '#cbd5e1';
          if (step.id < currentStep) {
            nextLineColor = '#10b981';
          } else if (step.id === currentStep) {
            nextLineColor = '#3b82f6';
          }

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1, minWidth: '95px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    transition: 'all 0.25s ease',
                    ...(isCompleted
                      ? { background: '#10b981', color: '#ffffff' }
                      : isActive
                      ? {
                          background: '#2563eb',
                          color: '#ffffff',
                          boxShadow: '0 0 0 5px #dbeafe',
                          transform: 'scale(1.05)'
                        }
                      : {
                          background: '#f8fafc',
                          color: '#64748b',
                          border: '2px solid #cbd5e1'
                        })
                  }}
                >
                  {isCompleted ? (
                    '✓'
                  ) : isActive ? (
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffffff' }} />
                  ) : (
                    '○'
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.775rem',
                    fontWeight: isActive ? 700 : isCompleted ? 700 : 600,
                    color: isActive ? '#1d4ed8' : isCompleted ? '#065f46' : '#64748b',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: '3px',
                    background: nextLineColor,
                    margin: '0 6px',
                    marginTop: '-22px',
                    minWidth: '20px',
                    transition: 'background 0.3s ease'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default LogisticsTimelineStepper;
