// src/pages/Login.jsx
// Admin login using Supabase Auth (email + password).

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPw, setShowPw]     = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/admin', { replace: true });
    });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message || 'Invalid credentials. Please try again.');
      setLoading(false);
    } else {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-in">

        {/* Logo */}
        <div className="logo">Moon &amp; Caffe</div>
        <div className="logo-sub">Admin Access</div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 p-3"
            style={{
              background: 'rgba(184,64,64,0.08)',
              border: '1px solid rgba(184,64,64,0.2)',
              borderRadius: 10,
              color: 'var(--danger)',
              fontSize: '0.87rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <i className="bi bi-exclamation-circle" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@brewco.com"
              autoFocus
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="position-relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  padding: 0,
                }}
              >
                <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-caramel w-100 py-2"
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
            ) : (
              <><i className="bi bi-box-arrow-in-right me-2" />Sign In</>
            )}
          </button>
        </form>

        {/* Link to menu */}
        <div className="text-center mt-4">
          <a href="/menu" style={{ color: 'var(--caramel)', fontSize: '0.85rem' }}>
            <i className="bi bi-arrow-left me-1" />Back to menu
          </a>
        </div>

      </div>
    </div>
  );
}
