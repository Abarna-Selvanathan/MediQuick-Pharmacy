"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";
import { useToast } from "@/components/ToastProvider";
import "./inventory.css";

function formatPrice(value) {
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value))}`;
}

function stockLabel(stock) {
  if (stock <= 0) return { text: "Out of stock", className: "badge badge-out" };
  if (stock <= 10) return { text: "Low stock", className: "badge badge-low" };
  return { text: "In stock", className: "badge badge-in" };
}

export default function AdminInventoryPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  async function loadProducts() {
    const response = await fetch("/api/products");
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Unable to load inventory.");
      return;
    }
    setProducts(data.products || []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function updateStock(product) {
    setSavingId(product._id);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/inventory/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: Number(product.stock) })
      });
      const data = await response.json();
      if (!response.ok) {
        const msg = data.message || "Unable to update stock.";
        addToast(msg, "error");
        throw new Error(msg);
      }
      setMessage(data.message);
      addToast(data.message || "Stock updated.", "success");
      await loadProducts();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSavingId("");
    }
  }

  return (
    <AdminGuard>
      <section className="section admin-section">
        <div className="container">
          <div className="admin-header"><div><p className="eyebrow">Stock control</p><h1>Inventory</h1></div><p>Keep product quantities and availability status current.</p></div>
          <AdminNav current="/admin/inventory" />
          {message && <p className="status-message success">{message}</p>}
          {error && <p className="status-message error">{error}</p>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product name</th>
                  <th>Category</th>
                  <th>Current stock</th>
                  <th>Stock status</th>
                  <th>Price</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const status = stockLabel(product.stock);
                  return (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={product.stock}
                          onChange={(event) =>
                            setProducts((current) =>
                              current.map((item) =>
                                item._id === product._id
                                  ? { ...item, stock: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </td>
                      <td>
                        <span className={status.className}>{status.text}</span>
                      </td>
                      <td>{formatPrice(product.price)}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-small"
                          type="button"
                          disabled={savingId === product._id}
                          onClick={() => updateStock(product)}
                        >
                          {savingId === product._id ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminGuard>
  );
}
