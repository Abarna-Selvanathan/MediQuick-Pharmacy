"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

function formatPrice(value) {
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value))}`;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Product not found.");
        }
        setProduct(data.product);
      } catch (loadError) {
        setError(loadError.message || "Unable to load this product.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  function handleAdd() {
    const result = addItem(product, quantity);
    setMessage(result.message);
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="status-message">Loading product details...</p>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="section">
        <div className="container">
          <p className="status-message error">{error || "Product not found."}</p>
        </div>
      </section>
    );
  }

  const available = product.stock > 0;

  return (
    <section className="section">
      <div className="container details-layout">
        <img
          className="details-image"
          src={product.image || "/images/product-placeholder.svg"}
          alt={product.name}
        />
        <div className="details-copy">
          <h1>{product.name}</h1>
          <p className="price">{formatPrice(product.price)}</p>
          {product.prescriptionRequired && (
            <span className="prescription-badge">Prescription Required</span>
          )}
          <p>{product.description}</p>
          <p><strong>Category:</strong> {product.category}</p>
          {product.dosage && <p><strong>Dosage information:</strong> {product.dosage}</p>}
          {product.safetyInformation && (
            <p><strong>Safety information:</strong> {product.safetyInformation}</p>
          )}
          <p>
            <strong>Availability:</strong>{" "}
            {available ? `In stock (${product.stock})` : "Out of stock"}
          </p>
          <p>
            <strong>Prescription required:</strong>{" "}
            {product.prescriptionRequired ? "Yes" : "No"}
          </p>
          <p className="notice">
            Follow professional medical advice and the instructions supplied with
            the product. MediQuick Pharmacy does not replace a consultation with a
            qualified healthcare professional.
          </p>
          {message && <p className="status-message">{message}</p>}
          <div className="field">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={Math.max(product.stock, 1)}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>
          {product.prescriptionRequired ? (
            <a className="btn btn-primary" href="/prescription">
              Upload Prescription
            </a>
          ) : (
            <button className="btn btn-primary" type="button" disabled={!available} onClick={handleAdd}>
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
