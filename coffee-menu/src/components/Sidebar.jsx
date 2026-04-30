// src/components/Sidebar.jsx

import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop / mobile
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { id: 'products', icon: 'bi-grid-3x3-gap', label: 'Produktet' },
    { id: 'categories', icon: 'bi-tags', label: 'Kategoritë' },
  ];

  return (
    <>
      {/* Overlay vetëm për mobile */}
      {!isDesktop && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
        />
      )}

      <aside
        className={`admin-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',          // 🔥 FIX FULL HEIGHT
          width: 280,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',

          // 🔥 DESKTOP vs MOBILE LOGIC
          transform: isDesktop
            ? 'translateX(0)' // gjithmonë i hapur në desktop
            : isOpen
            ? 'translateX(0)'
            : 'translateX(-100%)',

          transition: 'transform 0.3s ease',
        }}
      >
        {/* BRAND */}
        <div className="brand">
          <div className="d-flex align-items-center gap-2">
            <i
              className="bi bi-cup-hot-fill"
              style={{ color: 'var(--caramel)', fontSize: '1.4rem' }}
            />
            <div>
              <h5>Moon Café</h5>
              <small>Paneli Admin</small>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="sidebar-nav" style={{ flex: 1 }}>
          {navItems.map((item) => (
            <div key={item.id} className="nav-item">
              <a
                href="#"
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.id);

                  // mbylle vetëm në mobile
                  if (!isDesktop) onClose();
                }}
              >
                <i className={`bi ${item.icon}`} />
                {item.label}
              </a>
            </div>
          ))}

          <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

          <div className="nav-item">
            <a
              href="/menu"
              target="_blank"
              rel="noreferrer"
              className="nav-link"
            >
              <i className="bi bi-eye" />
              Shiko Menu-në
            </a>
          </div>
        </nav>

        {/* FOOTER */}
        <div
          className="sidebar-footer"
          style={{
            marginTop: 'auto',
          }}
        >
          <button
            onClick={handleLogout}
            className="btn w-100 text-start"
            style={{
              color: 'rgba(245,237,224,0.6)',
              padding: '10px 16px',
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
            }}
          >
            <i className="bi bi-box-arrow-right me-2" />
            Dil
          </button>
        </div>
      </aside>
    </>
  );
}