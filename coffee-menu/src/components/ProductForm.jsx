// src/components/ProductForm.jsx
// Forma modale për shtimin dhe ndryshimin e produkteve.
// Mbështet ngarkimin e fotove nëpërmjet Supabase Storage.

import { useState, useEffect } from 'react';
import { uploadProductImage } from '../services/productService';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category_id: '',
};

export default function ProductForm({ product, categories, onSave, onClose, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Plotëso formularin kur po ndryshojmë një produkt ekzistues
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        image_url: product.image_url || '',
        category_id: product.category_id || '',
      });
      setPreview(product.image_url || '');
    } else {
      setForm(EMPTY_FORM);
      setPreview('');
    }
    setImageFile(null);
    setUploadError('');
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validimi i tipit të fotos
    if (!file.type.startsWith('image/')) {
      setUploadError('Ju lutemi zgjidhni një foto (JPEG, PNG, etj.)');
      return;
    }
    
    // Validimi i madhësisë (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Foto shumë e madhe. Maksimumi 5MB.');
      return;
    }
    
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setUploadError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    let finalImageUrl = form.image_url;

    // Vetëm nëse ka foto, provo ngarkimin
    if (imageFile) {
      setUploading(true);
      const { url, error } = await uploadProductImage(imageFile);
      setUploading(false);
      
      if (error) {
        console.error('Gabim gjatë ngarkimit:', error);
        // Nëse ngarkimi dështon, përdor URL-në manuale nëse ekziston
        if (form.image_url) {
          finalImageUrl = form.image_url;
          setUploadError('⚠️ Ngarkimi i fotos dështoi, por u përdor URL-ja manuale.');
        } else {
          setUploadError('❌ Ngarkimi i fotos dështoi. Ju lutemi vendosni një URL manuale ose provoni përsëri.');
          return;
        }
      } else if (url) {
        finalImageUrl = url;
        console.log('✅ Foto u ngarkua me sukses:', url);
      }
    }

    // Ruaj produktin
    onSave({
      ...form,
      price: parseFloat(form.price),
      image_url: finalImageUrl || null,
    });
  };

  const isSubmitting = loading || uploading;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">

          {/* ── Header ─────────────────────────── */}
          <div className="modal-header">
            <h5 className="modal-title">
              {product ? '✏️ Ndrysho Produktin' : '➕ Shto Produkt të Ri'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting} />
          </div>

          {/* ── Body ───────────────────────────── */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              
              {/* Mesazhi i gabimit */}
              {uploadError && (
                <div className="alert alert-warning alert-dismissible fade show mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {uploadError}
                  <button type="button" className="btn-close" onClick={() => setUploadError('')}></button>
                </div>
              )}

              <div className="row g-3">

                {/* Emri */}
                <div className="col-12">
                  <label className="form-label">Emri i Produktit *</label>
                  <input
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="p.sh. Oat Milk Latte"
                    required
                  />
                </div>

                {/* Përshkrimi */}
                <div className="col-12">
                  <label className="form-label">Përshkrimi</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Një përshkrim i shkurtër dhe tërheqës…"
                  />
                </div>

                {/* Çmimi + Kategoria */}
                <div className="col-sm-6">
                  <label className="form-label">Çmimi *</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ background: '#f8f9fa' }}>$</span>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Kategoria *</label>
                  <select
                    className="form-select"
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Zgjidhni kategorinë…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* URL e fotos - Futje manuale */}
                <div className="col-12">
                  <label className="form-label">🖼️ URL e Fotografisë (opsionale)</label>
                  <input
                    className="form-control"
                    name="image_url"
                    value={form.image_url}
                    onChange={(e) => {
                      handleChange(e);
                      setPreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80"
                  />
                  <small className="text-muted">
                    💡 Këshillë: Vendosni një URL direkt nga Unsplash, Imgur, ose ndonjë shërbim tjetër
                  </small>
                </div>

                {/* Ngarkimi i fotos nga kompjuteri */}
                <div className="col-12">
                  <label className="form-label">📁 Ose ngarkoni nga kompjuteri</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleImageChange}
                  />
                  <small className="text-muted">
                    Maksimumi 5MB. Mbështet JPG, PNG, WebP
                  </small>
                </div>

                {/* Pamja paraprake e fotos */}
                {preview && (
                  <div className="col-12">
                    <label className="form-label">🖼️ Pamja Paraprake</label>
                    <div className="border rounded p-2" style={{ background: '#f8f9fa', textAlign: 'center' }}>
                      <img
                        src={preview}
                        alt="Pamja paraprake"
                        style={{ 
                          maxHeight: 150, 
                          maxWidth: '100%', 
                          borderRadius: 8, 
                          objectFit: 'contain' 
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          setUploadError('⚠️ URL-ja e fotografisë është e pavlefshme ose nuk mund të ngarkohet');
                        }}
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ── Footer ─────────────────────────── */}
            <div className="modal-footer gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={isSubmitting}>
                Anulo
              </button>
              <button type="submit" className="btn btn-dark px-4" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {uploading ? 'Po ngarkon foton...' : 'Po ruhet...'}
                  </>
                ) : (
                  product ? '💾 Ruaj Ndryshimet' : '✨ Shto Produktin'
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}