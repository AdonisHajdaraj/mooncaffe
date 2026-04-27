// src/components/ProtectedRoute.jsx
// Wraps admin routes — redirects to /login if not authenticated.

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Still loading — show a subtle spinner
  if (session === undefined) {
    return (
      <div className="loading-coffee">
        <div className="spinner-border" role="status" />
        <span>Checking access…</span>
      </div>
    );
  }

  // Not logged in → redirect
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
