// src/pages/Menu.jsx
// Public customer-facing menu page.
// Features: category filter tabs, search, grouped product cards.

import { useEffect, useState, useMemo } from 'react';
import { getProducts, getCategories } from '../services/productService';
import ProductCard from '../components/ProductCard';

export default function Menu() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat]   = useState('all');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // ── Fetch data ──────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);

      if (prodRes.error || catRes.error) {
        setError('Nuk mund të ngarkojmë menu-në. Ju lutemi provoni përsëri.');
      } else {
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  // ── Filtered products ───────────────────────────────────────
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCat === 'all' || p.category_id === activeCat;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          (p.description || '').toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCat, search]);

  // ── Group by category ───────────────────────────────────────
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((p) => {
      const catName = p.categories?.name || 'Të tjera';
      if (!map[catName]) map[catName] = [];
      map[catName].push(p);
    });
    return map;
  }, [filtered]);

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--milk)' }}>

      {/* Hero */}
      <header className="menu-hero">
        <div className="container">
          <p className="tagline">Që nga 2024 · Kafe Specialiteti</p>
          <h1>Moon Café</h1>
          <p className="mt-2" style={{ color: 'rgba(245,237,224,0.65)', fontSize: '1rem', position: 'relative' }}>
            Kafe dhe pije të përgatitura me dashuri
          </p>
        </div>
      </header>

      <main className="container py-4">

        {/* ── Controls ─── */}
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 mb-2">

          {/* Search */}
          <div className="search-wrap flex-grow-1 w-100">
            <i className="bi bi-search" />
            <input
              type="search"
              className="form-control"
              placeholder="Kërko në menu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Result count */}
          {search && (
            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {filtered.length} rezultat{filtered.length !== 1 ? 'e' : ''}
            </span>
          )}
        </div>

        {/* Category tabs */}
        {!loading && !error && (
          <div className="cat-tabs">
            <button
              className={`cat-tab ${activeCat === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCat('all')}
            >
              Të gjitha
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`cat-tab ${activeCat === c.id ? 'active' : ''}`}
                onClick={() => setActiveCat(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Loading ─── */}
        {loading && (
          <div className="loading-coffee">
            <div className="spinner-border" role="status" />
            <span>Po përgatitet menu-ja…</span>
          </div>
        )}

        {/* ── Error ─── */}
        {error && !loading && (
          <div className="alert mt-4" style={{ background: 'var(--cream)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--danger)' }}>
            <i className="bi bi-exclamation-circle me-2" />
            {error}
          </div>
        )}

        {/* ── Empty ─── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <i className="bi bi-search" />
            <p>Nuk u gjet asnjë artikull. Provoni një kërkim tjetër ose kategori tjetër.</p>
          </div>
        )}

        {/* ── Grouped sections ─── */}
        {!loading && !error && Object.entries(grouped).map(([catName, items]) => (
          <section key={catName} className="mb-5">
            <h2 className="section-heading">{catName}</h2>
            <div className="row g-4">
              {items.map((product, i) => (
                <div
                  key={product.id}
                  className="col-12 col-sm-6 col-lg-4 col-xl-3"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        ))}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '32px 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        letterSpacing: '0.06em',
      }}>
        <i className="bi bi-cup-hot me-2" style={{ color: 'var(--caramel)' }} />
        Moon Café · Menu Dixhitale
      </footer>
    </div>
  );
}