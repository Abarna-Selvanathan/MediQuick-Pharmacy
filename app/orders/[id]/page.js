"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import "./../orders.css";

function formatPrice(value) {
  return "LKR " + new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value || 0));
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`/api/orders/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load this order.");
        }

        setOrder(data.order);
      } catch (loadError) {
        setError(loadError.message || "Unable to load this order.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  if (loading) {
    return <section className="section"><div className="container"><p className="status-message">Loading order...</p></div></section>;
  }

  if (error || !order) {
    return <section className="section"><div className="container"><div className="empty-state"><h2>Order not available</h2><p>{error || "Unable to find this order."}</p><Link className="btn btn-primary" href="/orders">Back to My Orders</Link></div></div></section>;
  }

  const deliveryFee = Number(order.deliveryFee || 0);
  const subtotal = order.items?.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0) || 0;
  const itemCount = order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  return (
    <section className="section orders-page">
      <div className="container">
        <div className="page-title-row">
          <div>
            <p className="eyebrow">Order details</p>
            <h1>Order #{order._id}</h1>
          </div>
          <div className="page-title-actions">
            <button className="btn btn-secondary btn-small back-button" type="button" onClick={() => router.back()}>← Back</button>
          </div>
        </div>

        <div className="order-detail-grid">
          <article className="panel order-detail-card">
            <div className="order-card-head">
              <div>
                <span className="order-label">Order ID</span>
                <span className="order-id">{order._id}</span>
              </div>
              <span className={`order-status status-${String(order.orderStatus || "Pending").toLowerCase()}`}>{order.orderStatus}</span>
            </div>

            <div className="order-card-meta detail-meta">
              <span><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</span>
              <span><strong>Status:</strong> {order.orderStatus}</span>
              <span><strong>Total:</strong> {formatPrice(order.totalAmount)}</span>
            </div>

            <div className="order-detail-block">
              <h2>Items</h2>
              <div className="order-items">
                {order.items?.map((item) => (
                  <div className="order-item-row" key={item.product || item.name}>
                    <div className="order-product-image">
                      <img src="/images/product-placeholder.svg" alt={item.name} />
                    </div>
                    <div className="order-product-copy">
                      <div className="order-product-title">
                        <strong>{item.name}</strong>
                      </div>
                      <div className="order-product-meta">
                        <span>Qty: {item.quantity}</span>
                        <span>Unit price: {formatPrice(item.price)}</span>
                        <span>Subtotal: {formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-detail-block">
              <h2>Order Summary</h2>
              <div className="order-summary">
                <div className="summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
                <div className="summary-line"><span>Delivery fee</span><strong>{formatPrice(deliveryFee)}</strong></div>
                <div className="summary-line"><span>Total</span><strong>{formatPrice(order.totalAmount)}</strong></div>
                <div className="summary-line"><span>Items</span><strong>{itemCount}</strong></div>
              </div>
            </div>

            <div className="order-detail-block">
              <h2>Delivery information</h2>
              <div className="delivery-details">
                <p><strong>Name:</strong> {order.deliveryDetails?.fullName}</p>
                <p><strong>Phone:</strong> {order.deliveryDetails?.phone}</p>
                <p><strong>Address:</strong> {order.deliveryDetails?.address}</p>
                <p><strong>City:</strong> {order.deliveryDetails?.city}</p>
                <p><strong>Postal code:</strong> {order.deliveryDetails?.postalCode}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
