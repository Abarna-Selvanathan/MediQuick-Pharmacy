"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ToastProvider";

function formatPrice(value) {
  return "LKR " + new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value));
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch("/api/products/" + params.id);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Product not found.");
        setProduct(data.product);
      } catch (loadError) {
        setError(loadError.message || "Unable to load this product.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) loadProduct();
  }, [params.id]);

  function handleAdd() {
    const result = addItem(product, quantity);
    setMessage(result.message);
    if (result.ok) {
      addToast("Product added to cart.", "success");
    } else {
      addToast(result.message || "Unable to add product to cart.", "error");
    }
  }

  if (loading) return <section className="section"><div className="container"><p className="status-message">Loading product details...</p></div></section>;

  if (error || !product) {
    return <section className="section"><div className="container"><p className="status-message error">{error || "Product not found."}</p></div></section>;
  }

  const available = product.stock > 0;

  return (
    <section className="section product-detail-page">
      <div className="container details-layout">
        <div className="details-media panel">
          <button className="btn btn-secondary btn-small back-button" type="button" onClick={() => router.back()}>← Back</button>
          <img className="details-image" src={product.image || "/images/product-placeholder.svg"} alt={product.name} />
        </div>
        <div className="details-copy panel">
          <p className="product-category">{product.category}</p>
          <h1>{product.name}</h1>
          <div className="details-price-row">
            <p className="price">{formatPrice(product.price)}</p>
            <span className={available ? "stock-pill stock-in" : "stock-pill stock-out"}>{available ? "In stock (" + product.stock + ")" : "Out of stock"}</span>
          </div>
          {product.prescriptionRequired && <span className="prescription-badge">Prescription Required</span>}
          <p>{product.description}</p>
          <div className="detail-list">
            {product.dosage && <p><strong>Dosage information:</strong> {product.dosage}</p>}
            {product.safetyInformation && <p><strong>Safety information:</strong> {product.safetyInformation}</p>}
            <p><strong>Prescription required:</strong> {product.prescriptionRequired ? "Yes" : "No"}</p>
          </div>
          <p className="notice">Follow professional medical advice and the instructions supplied with the product. MediQuick Pharmacy does not replace a consultation with a qualified healthcare professional.</p>
          {message && <p className="status-message success">{message}</p>}
          <div className="field quantity-field">
            <label htmlFor="quantity">Quantity</label>
            <input id="quantity" type="number" min="1" max={Math.max(product.stock, 1)} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
          </div>
          {product.prescriptionRequired ? (
            <a className="btn btn-primary" href="/prescription">Upload Prescription</a>
          ) : (
            <button className="btn btn-primary" type="button" disabled={!available} onClick={handleAdd}>Add to Cart</button>
          )}
        </div>
      </div>
    </section>
  );
}
