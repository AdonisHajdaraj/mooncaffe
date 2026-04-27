// src/pages/Admin.jsx
// Paneli i administratorit - menaxho produktet dhe kategoritë.

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  getProducts, getCategories,
  addProduct, updateProduct, deleteProduct,
  addCategory, deleteCategory,
} from '../services/productService';
import Sidebar from '../components/Sidebar';
import ProductForm from '../components/ProductForm';
import Toast from '../components/Toast';

export default function Admin() {
  // ── State ────────────────────────────────────────────────
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [activeTab, setActiveTab]     = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal
  const [showForm, setShowForm]       = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Kërkim / filtër
  const [search, setSearch]           = useState('');

  // Njoftimet
  const [toast, setToast]             = useState(null);

  // Forma për kategori të re
  const [newCatName, setNewCatName]   = useState('');
  const [catLoading, setCatLoading]   = useState(false);

  // Informacioni i administratorit
  const [user, setUser]               = useState(null);

  // ── Ngarko të dhënat ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
    if (!prodRes.error) setProducts(prodRes.data || []);
    if (!catRes.error)  setCategories(catRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
  }, [loadData]);

  // ── Ndihmës për njoftimet ─────────────────────────────────────────
  const notify = (message, type = 'success') => setToast({ message, type });

  // ── CRUD për Produktet ─────────────────────────────────────────
  const handleSaveProduct = async (formData) => {
    setSaving(true);
    let res;
    if (editProduct) {
      res = await updateProduct(editProduct.id, formData);
    } else {
      res = await addProduct(formData);
    }
    setSaving(false);

    if (res.error) {
      notify('Gabim: ' + res.error.message, 'error');
    } else {
      notify(editProduct ? 'Produkti u përditësua!' : 'Produkti u shtua!');
      setShowForm(false);
      setEditProduct(null);
      loadData();
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Fshini "${product.name}"? Ky veprim nuk mund të zhbëhet.`)) return;
    const { error } = await deleteProduct(product.id);
    if (error) {
      notify('Fshirja dështoi: ' + error.message, 'error');
    } else {
      notify('Produkti u fshi.');
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  // ── CRUD për Kategoritë ────────────────────────────────────────
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatLoading(true);
    const { error } = await addCategory(newCatName.trim());
    setCatLoading(false);
    if (error) {
      notify('Gabim: ' + error.message, 'error');
    } else {
      notify('Kategoria u shtua!');
      setNewCatName('');
      loadData();
    }
  };

  // Funksioni për të fshirë një kategori
  const handleDeleteCategory = async (category) => {
    // Kontrollo nëse ka produkte në këtë kategori
    const productsInCategory = products.filter((p) => p.category_id === category.id);
    
    if (productsInCategory.length > 0) {
      notify(`Kategoria "${category.name}" ka ${productsInCategory.length} produkt(e). Fshini fillimisht produktet ose zhvendosini në një kategori tjetër.`, 'error');
      return;
    }
    
    if (!window.confirm(`Fshini kategorinë "${category.name}"? Ky veprim nuk mund të zhbëhet.`)) return;
    
    const { error } = await deleteCategory(category.id);
    if (error) {
      notify('Fshirja dështoi: ' + error.message, 'error');
    } else {
      notify('Kategoria u fshi!');
      loadData();
    }
  };

  // ── Produktet e filtruara ─────────────────────────────────────
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Statistikat ─────────────────────────────────────────
  const totalValue = products.reduce((sum, p) => sum + Number(p.price), 0);

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex' }}>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Përmbajtja kryesore */}
      <div className="admin-main flex-grow-1">

        {/* Shiriti i sipërm */}
        <div className="admin-topbar">
          <div className="d-flex align-items-center gap-3">
            {/* Hamburger për celular */}
            <button
              className="btn d-md-none"
              onClick={() => setSidebarOpen(true)}
              style={{ color: 'var(--espresso)', padding: '4px 8px' }}
            >
              <i className="bi bi-list fs-5" />
            </button>
            <div>
              <h6 className="mb-0 fw-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--espresso)' }}>
                {activeTab === 'products' ? 'Produktet' : 'Kategoritë'}
              </h6>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {user?.email}
              </small>
            </div>
          </div>

          {/* Butoni për shtimin e produktit */}
          {activeTab === 'products' && (
            <button className="btn btn-caramel btn-sm px-3" onClick={openAdd}>
              <i className="bi bi-plus-lg me-1" /> Shto Produkt
            </button>
          )}
        </div>

        {/* Përmbajtja */}
        <div className="admin-content">

          {/* ── TABI I PRODUKTEVE ── */}
          {activeTab === 'products' && (
            <>
              {/* Rreshti i statistikave */}
              <div className="row g-3 mb-4">
                {[
                  { label: 'Totali i Produkteve', value: products.length, icon: 'bi-grid', bg: 'var(--cream)' },
                  { label: 'Kategoritë',     value: categories.length, icon: 'bi-tags', bg: '#e8f4ed' },
                  { label: 'Çmimi Mesatar',      value: products.length ? `$${(totalValue / products.length).toFixed(2)}` : '—', icon: 'bi-cash', bg: '#fdf0e0' },
                ].map((s) => (
                  <div key={s.label} className="col-12 col-sm-4">
                    <div className="stat-card" style={{ background: s.bg }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
                      <div className="stat-num mt-1">{s.value}</div>
                      <i className={`bi ${s.icon} stat-icon`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Shiriti i veglave */}
              <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
                <div className="search-wrap flex-grow-1">
                  <i className="bi bi-search" />
                  <input
                    className="form-control"
                    placeholder="Kërko produkte…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="btn btn-caramel px-4" onClick={openAdd}>
                  <i className="bi bi-plus-lg me-1" /> Shto Produkt
                </button>
              </div>

              {/* Tabela */}
              {loading ? (
                <div className="loading-coffee">
                  <div className="spinner-border" />
                  <span>Po ngarkohet…</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-cup-hot" />
                  <p>{search ? 'Nuk ka produkte që përputhen me kërkimin tuaj.' : 'Nuk ka produkte ende. Shtoni të parin!'}</p>
                  {!search && (
                    <button className="btn btn-caramel mt-2" onClick={openAdd}>Shto Produkt</button>
                  )}
                </div>
              ) : (
                <div className="admin-table">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Emri</th>
                        <th>Kategoria</th>
                        <th>Çmimi</th>
                        <th>Përshkrimi</th>
                        <th style={{ width: 100 }}>Veprimet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id}>
                          <td>
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="thumb" />
                            ) : (
                              <div className="thumb-placeholder">
                                <i className="bi bi-cup-hot" />
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="fw-semibold" style={{ color: 'var(--espresso)' }}>{p.name}</span>
                          </td>
                          <td>
                            <span className="category-badge">{p.categories?.name || '—'}</span>
                          </td>
                          <td>
                            <span className="fw-semibold" style={{ color: 'var(--caramel)' }}>
                              ${Number(p.price).toFixed(2)}
                            </span>
                          </td>
                          <td style={{ maxWidth: 200 }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {p.description || '—'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm"
                                title="Ndrysho"
                                onClick={() => handleEdit(p)}
                                style={{ background: 'var(--cream)', border: '1px solid var(--border-color)', color: 'var(--medium-roast)', borderRadius: 8 }}
                              >
                                <i className="bi bi-pencil" />
                              </button>
                              <button
                                className="btn btn-sm"
                                title="Fshij"
                                onClick={() => handleDelete(p)}
                                style={{ background: '#fef0f0', border: '1px solid #fcd0d0', color: 'var(--danger)', borderRadius: 8 }}
                              >
                                <i className="bi bi-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── TABI I KATEGORIVE ── */}
          {activeTab === 'categories' && (
            <>
              <h2 className="section-heading">Kategoritë</h2>

              {/* Shto kategori */}
              <div className="card mb-4" style={{ maxWidth: 480 }}>
                <div className="card-body p-4">
                  <h6 className="fw-semibold mb-3" style={{ color: 'var(--espresso)' }}>Shto Kategori të Re</h6>
                  <form onSubmit={handleAddCategory} className="d-flex gap-2">
                    <input
                      className="form-control"
                      placeholder="p.sh. Kafe"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-caramel px-3" disabled={catLoading}>
                      {catLoading ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-plus-lg" />}
                    </button>
                  </form>
                </div>
              </div>

              {/* Lista e kategorive */}
              {loading ? (
                <div className="loading-coffee">
                  <div className="spinner-border" />
                </div>
              ) : categories.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-tags" />
                  <p>Nuk ka kategori ende. Shtoni një më lart.</p>
                </div>
              ) : (
                <div className="row g-3">
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category_id === cat.id).length;
                    return (
                      <div key={cat.id} className="col-12 col-sm-6 col-md-4">
                        <div className="card p-3 d-flex flex-row align-items-center gap-3">
                          <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: 'var(--cream)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--caramel)', fontSize: '1.2rem',
                            border: '2px solid var(--border-color)',
                          }}>
                            <i className="bi bi-tag" />
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-semibold" style={{ color: 'var(--espresso)' }}>{cat.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {count} produkt{count !== 1 ? 'e' : ''}
                            </div>
                          </div>
                          {/* Butoni për fshirjen e kategorisë */}
                          <button
                            className="btn btn-sm"
                            title="Fshij Kategorinë"
                            onClick={() => handleDeleteCategory(cat)}
                            style={{ 
                              background: '#fef0f0', 
                              border: '1px solid #fcd0d0', 
                              color: 'var(--danger)', 
                              borderRadius: 8,
                              width: 32,
                              height: 32
                            }}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Modal për formën e produktit */}
      {showForm && (
        <ProductForm
          product={editProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          loading={saving}
        />
      )}

      {/* Njoftimet */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}