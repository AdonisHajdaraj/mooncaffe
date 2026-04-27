// src/components/Toast.jsx
// Lightweight toast notification for admin feedback.

import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const config = {
    success: { bg: '#3a7c52', icon: 'bi-check-circle-fill' },
    error:   { bg: '#b84040', icon: 'bi-exclamation-circle-fill' },
    info:    { bg: 'var(--caramel)', icon: 'bi-info-circle-fill' },
  }[type] || { bg: 'var(--caramel)', icon: 'bi-info-circle-fill' };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 9999,
        background: config.bg,
        color: '#fff',
        padding: '14px 20px',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        maxWidth: 360,
        animation: 'fadeInUp 0.3s ease',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        fontSize: '0.9rem',
      }}
    >
      <i className={`bi ${config.icon}`} style={{ fontSize: '1.1rem' }} />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: '#fff', padding: 0, cursor: 'pointer', opacity: 0.7 }}
      >
        <i className="bi bi-x-lg" />
      </button>
    </div>
  );
}
