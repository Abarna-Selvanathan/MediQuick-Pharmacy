"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./orders.css";

function formatPrice(value) {
  return "LKR " + new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value || 0));
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/orders");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your orders.");
        }

        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <section className="section orders-page">
      <div className="container">
        <div className="page-title-row">
          <div>
            <p className="eyebrow">Order management</p>
            <h1>My Orders</h1>
          </div>
          <div className="page-title-actions">
            <button className="btn btn-secondary btn-small back-button" type="button" onClick={() => router.back()}>← Back</button>
          </div>
        </div>

        {loading && <div className="status-message">Loading your orders...</div>}
        {error && <div className="status-message error">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-state">
            <h2>No orders yet</h2>
            <p>Your order history will appear here after checkout.</p>
            <Link className="btn btn-primary" href="/medicines">Browse Medicines</Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-grid">
            {orders.map((order) => {
              const itemTotal = Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
              return (
                <article className="order-card" key={order._id}>
                  <div className="order-card-head">
                    <div>
                      <span className="order-label">Order ID</span>
                      <span className="order-id">{order._id}</span>
                    </div>
                    <span className={`order-status status-${String(order.orderStatus || "Pending").toLowerCase()}`}>{order.orderStatus}</span>
                  </div>
                  <div className="order-card-meta">
                    <span><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span><strong>Items:</strong> {itemTotal}</span>
                    <span><strong>Total:</strong> {formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="order-card-actions">
                    <Link className="btn btn-secondary btn-small" href={`/orders/${order._id}`}>View Details</Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
