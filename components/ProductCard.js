import Link from "next/link";

function formatPrice(value) {
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value))}`;
}

export default function ProductCard({ product, showAddToCart = false, onAddToCart }) {
  const available = product.stock > 0;

  return (
    <article className="product-card">
      <img
        className="product-image"
        src={product.image || "/images/product-placeholder.svg"}
        alt={product.name}
      />
      <div className="product-body">
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="muted">{product.description}</p>
        <p className="price">{formatPrice(product.price)}</p>
        {product.prescriptionRequired && (
          <span className="prescription-badge">Prescription Required</span>
        )}
        {showAddToCart && (
          <p className="muted">
            {available ? `In stock (${product.stock})` : "Out of stock"}
          </p>
        )}
        <div className="card-actions">
          <Link className="btn btn-secondary btn-small" href={`/products/${product._id}`}>
            View Details
          </Link>
          {showAddToCart && (
            product.prescriptionRequired ? (
              <Link className="btn btn-primary btn-small" href="/prescription">
                Upload Prescription
              </Link>
            ) : (
              <button
                className="btn btn-primary btn-small"
                type="button"
                disabled={!available}
                onClick={() => onAddToCart?.(product)}
              >
                Add to Cart
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
}
