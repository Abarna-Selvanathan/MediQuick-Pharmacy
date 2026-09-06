"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import "./checkout.css";

const DELIVERY_FEE = 3.5;

function formatPrice(value) {
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value))}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          deliveryDetails: form
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to place this order.");
      }
      clearCart();
      setSuccess(data.message);
      setTimeout(() => router.push("/"), 1800);
    } catch (submitError) {
      setError(submitError.message || "Unable to place this order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="status-message">Loading checkout...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="section">
        <div className="container">
          <p className="status-message error">Please log in before checking out.</p>
        </div>
      </section>
    );
  }

  if (items.length === 0 && !success) {
    return (
      <section className="section">
        <div className="container">
          <p className="status-message">Your cart is empty.</p>
        </div>
      </section>
    );
  }

  const total = subtotal + DELIVERY_FEE;

  return (
    <section className="section">
      <div className="container checkout-grid">
        <form className="form-card" onSubmit={handleSubmit}>
          <h1>Checkout</h1>
          {error && <p className="status-message error">{error}</p>}
          {success && <p className="status-message success">{success}</p>}
          <h2>Delivery information</h2>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" value={form.fullName} onChange={updateField} required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" name="phone" value={form.phone} onChange={updateField} required />
          </div>
          <div className="field">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" value={form.address} onChange={updateField} required />
          </div>
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" name="city" value={form.city} onChange={updateField} required />
          </div>
          <div className="field">
            <label htmlFor="postalCode">Postal code</label>
            <input id="postalCode" name="postalCode" value={form.postalCode} onChange={updateField} required />
          </div>
          <div className="notice">
            <h3>Demo payment</h3>
            <p>
              This is a test checkout. No card details are collected and no real
              payment is processed.
            </p>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting || Boolean(success)}>
            {submitting ? "Placing order..." : "Place Order"}
          </button>
        </form>
        <aside className="summary-card">
          <h2>Order summary</h2>
          {items.map((item) => (
            <p key={item.productId}>
              {item.name} x {item.quantity} - {formatPrice(item.price * item.quantity)}
            </p>
          ))}
          <p>Subtotal: {formatPrice(subtotal)}</p>
          <p>Delivery fee: {formatPrice(DELIVERY_FEE)}</p>
          <p className="price">Final total: {formatPrice(total)}</p>
        </aside>
      </div>
    </section>
  );
}
