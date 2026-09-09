import Link from "next/link";

function formatPrice(value) {
  return "LKR " + new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value));
}

export default function ProductCard({ product, showAddToCart = false, onAddToCart }) {
  const available = product.stock > 0;

  return (
    <article className="product-card">
      <Link className="product-image-link" href={"/products/" + product._id} aria-label={"View " + product.name}>
        <img
          className="product-image"
          src={product.image || "/images/product-placeholder.svg"}
          alt={product.name}
        />
      </Link>
      <div className="product-body">
        <div className="product-meta-row">
          <p className="product-category">{product.category}</p>
          <span className={available ? "stock-pill stock-in" : "stock-pill stock-out"}>
            {available ? "In stock (" + product.stock + ")" : "Out of stock"}
          </span>
        </div>
        <h3>{product.name}</h3>
        <p className="muted product-description">{product.description}</p>
        <div className="product-footer-row">
          <p className="price">{formatPrice(product.price)}</p>
          {product.prescriptionRequired && (
            <span className="prescription-badge">Prescription Required</span>
          )}
        </div>
        <div className="card-actions">
          <Link className="btn btn-secondary btn-small" href={"/products/" + product._id}>
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
