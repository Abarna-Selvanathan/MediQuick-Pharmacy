"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ToastProvider";
import "./cart.css";

function formatPrice(value) {
  return "LKR " + new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value));
}

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { addToast } = useToast();

  function remove(productId) {
    removeItem(productId);
    addToast("Product removed from cart.", "success");
  }

  function changeQty(productId, quantity) {
    updateQuantity(productId, quantity);
    addToast("Cart updated.", "success");
  }

  return (
    <section className="section cart-page">
      <div className="container">
        <div className="page-title-row">
          <div>
            <p className="eyebrow">Shopping cart</p>
            <h1>Your cart</h1>
          </div>
          <div className="page-title-actions">
            <button className="btn btn-secondary btn-small back-button" type="button" onClick={() => router.back()}>← Back</button>
            <Link className="btn btn-secondary" href="/medicines">Continue shopping</Link>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <h2>Your cart is empty.</h2>
            <p>Add available medicines or pharmacy products to review your order here.</p>
            <Link className="btn btn-primary" href="/medicines">Browse Medicines</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="panel cart-panel">
              {items.map((item) => (
                <div className="cart-item" key={item.productId}>
                  <img src={item.image || "/images/product-placeholder.svg"} alt={item.name} />
                  <div className="cart-item-copy">
                    <h3>{item.name}</h3>
                    <p className="price">{formatPrice(item.price)}</p>
                    <div className="qty-control" aria-label={"Quantity for " + item.name}>
                      <button type="button" onClick={() => changeQty(item.productId, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => changeQty(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    <p className="muted">Subtotal: {formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <button className="btn btn-danger btn-small" type="button" onClick={() => remove(item.productId)}>Remove</button>
                </div>
              ))}
            </div>
            <aside className="summary-card sticky-summary">
              <h2>Order summary</h2>
              <div className="summary-line"><span>Items</span><strong>{items.length}</strong></div>
              <div className="summary-line"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div>
              <Link className="btn btn-primary" href="/checkout">Proceed to Checkout</Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
