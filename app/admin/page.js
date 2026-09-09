"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";
import "./admin.css";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const [productsRes, ordersRes, prescriptionsRes, inquiriesRes] = await Promise.all([
          fetch("/api/products"), fetch("/api/orders"), fetch("/api/prescriptions"), fetch("/api/inquiries")
        ]);
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();
        const prescriptionsData = await prescriptionsRes.json();
        const inquiriesData = await inquiriesRes.json();
        if (!productsRes.ok || !ordersRes.ok || !prescriptionsRes.ok || !inquiriesRes.ok) throw new Error("Unable to load dashboard data.");
        const products = productsData.products || [];
        const orders = ordersData.orders || [];
        const prescriptions = prescriptionsData.prescriptions || [];
        const inquiries = inquiriesData.inquiries || [];
        setStats({ totalProducts: products.length, lowStock: products.filter((item) => item.stock > 0 && item.stock <= 10).length, pendingOrders: orders.filter((item) => item.orderStatus === "Pending").length, pendingPrescriptions: prescriptions.filter((item) => item.status === "Pending").length, newInquiries: inquiries.filter((item) => item.status === "New").length });
      } catch (loadError) {
        setError(loadError.message || "Unable to load dashboard data.");
      }
    }
    loadStats();
  }, []);

  return (
    <AdminGuard>
      <section className="section admin-section">
        <div className="container">
          <div className="admin-header"><div><p className="eyebrow">Admin area</p><h1>Admin Dashboard</h1></div><p>Monitor products, stock, orders, prescriptions, and customer inquiries.</p></div>
          <AdminNav current="/admin" />
          {error && <p className="status-message error">{error}</p>}
          {!stats && !error && <p className="status-message">Loading dashboard...</p>}
          {stats && <div className="admin-grid">
            <article className="admin-card"><span>Total Products</span><p>{stats.totalProducts}</p></article>
            <article className="admin-card"><span>Low Stock</span><p>{stats.lowStock}</p></article>
            <article className="admin-card"><span>Pending Orders</span><p>{stats.pendingOrders}</p></article>
            <article className="admin-card"><span>Pending Prescriptions</span><p>{stats.pendingPrescriptions}</p></article>
            <article className="admin-card"><span>New Inquiries</span><p>{stats.newInquiries}</p></article>
          </div>}
        </div>
      </section>
    </AdminGuard>
  );
}
