// src/components/Sidebar.jsx
// Sidebar i administratorit me navigim dhe dalje.

import { supabase } from '../services/supabaseClient';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
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
      {/* Shtresa e errët për celular */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="brand">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-cup-hot-fill" style={{ color: 'var(--caramel)', fontSize: '1.4rem' }} />
            <div>
              <h5>Moon Café</h5>
              <small>Paneli Admin</small>
            </div>
          </div>
        </div>

        {/* Navigimi */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div key={item.id} className="nav-item">
              <a
                href="#"
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab(item.id); onClose(); }}
              >
                <i className={`bi ${item.icon}`} />
                {item.label}
              </a>
            </div>
          ))}

          <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '16px 4px' }} />

          {/* Lidhja për të parë menu-në */}
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

        {/* Fundi i sidebar-it */}
        <div className="sidebar-footer">
          <button
            className="btn w-100 text-start"
            onClick={handleLogout}
            style={{ color: 'rgba(245,237,224,0.6)', padding: '10px 16px', borderRadius: 8 }}
          >
            <i className="bi bi-box-arrow-right me-2" />
            Dil
          </button>
        </div>
      </aside>
    </>
  );
}