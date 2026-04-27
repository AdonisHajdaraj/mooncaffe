// src/components/ProductCard.jsx
// Customer-facing product card with image, name, description, price.

export default function ProductCard({ product }) {
  const { name, description, price, image_url, categories } = product;

  return (
    <div className="card h-100 animate-in">
      {/* ── Image ─────────────────────────── */}
      <div className="product-img-wrap">
        {image_url ? (
          <img src={image_url} alt={name} loading="lazy" />
        ) : (
          <div className="product-img-placeholder">
            <i className="bi bi-cup-hot" />
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────── */}
      <div className="card-body d-flex flex-column p-3">
        {/* Category badge */}
        {categories?.name && (
          <span className="category-badge mb-2">{categories.name}</span>
        )}

        {/* Name */}
        <h5 className="font-display fw-semibold mb-1" style={{ fontSize: '1.05rem', color: 'var(--espresso)' }}>
          {name}
        </h5>

        {/* Description */}
        {description && (
          <p className="text-muted mb-0 mt-1 flex-grow-1" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
            {description}
          </p>
        )}

        {/* Price */}
        <div className="mt-3 d-flex align-items-center justify-content-between">
          <span className="price-tag">${Number(price).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
