"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import "./cart.css";

function formatPrice(value) {
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value))}`;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <section className="section">
      <div className="container">
        <h1>Your cart</h1>
        {items.length === 0 ? (
          <p className="status-message">Your cart is empty.</p>
        ) : (
          <div className="cart-layout">
            <div className="panel">
              {items.map((item) => (
                <div className="cart-item" key={item.productId}>
                  <img src={item.image || "/images/product-placeholder.svg"} alt={item.name} />
                  <div>
                    <h3>{item.name}</h3>
                    <p className="price">{formatPrice(item.price)}</p>
                    <div className="qty-control">
                      <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                    <p>Subtotal: {formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <button className="btn btn-danger btn-small" type="button" onClick={() => removeItem(item.productId)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <aside className="summary-card">
              <h2>Summary</h2>
              <p>Total: {formatPrice(subtotal)}</p>
              <Link className="btn btn-primary" href="/checkout">
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
