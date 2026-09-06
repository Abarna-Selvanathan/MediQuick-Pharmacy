"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";
import "./orders.css";

const STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

function formatPrice(value) {
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value))}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadOrders() {
    const response = await fetch("/api/orders");
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Unable to load orders.");
      return;
    }
    setOrders(data.orders || []);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(id, orderStatus) {
    setError("");
    setMessage("");
    const response = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Unable to update order.");
      return;
    }
    setMessage(data.message);
    setSelected(data.order);
    await loadOrders();
  }

  return (
    <AdminGuard>
      <section className="section">
        <div className="container">
          <h1>Orders</h1>
          <AdminNav current="/admin/orders" />
          {message && <p className="status-message success">{message}</p>}
          {error && <p className="status-message error">{error}</p>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.user?.name || "Customer"}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{formatPrice(order.totalAmount)}</td>
                    <td>
                      <select
                        value={order.orderStatus}
                        onChange={(event) => updateStatus(order._id, event.target.value)}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-small" type="button" onClick={() => setSelected(order)}>
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected && (
            <div className="panel">
              <h2>Order details</h2>
              <p><strong>Order ID:</strong> {selected._id}</p>
              <p><strong>Customer:</strong> {selected.user?.name} ({selected.user?.email})</p>
              <p><strong>Status:</strong> {selected.orderStatus}</p>
              {selected.items?.map((item) => (
                <p key={item.name}>
                  {item.name} x {item.quantity} - {formatPrice(item.price * item.quantity)}
                </p>
              ))}
              <p>
                {selected.deliveryDetails?.fullName}, {selected.deliveryDetails?.address},{" "}
                {selected.deliveryDetails?.city}, {selected.deliveryDetails?.postalCode}
              </p>
            </div>
          )}
        </div>
      </section>
    </AdminGuard>
  );
}
