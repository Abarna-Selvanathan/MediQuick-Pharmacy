"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";
import { useToast } from "@/components/ToastProvider";
import "./products.css";

function formatPrice(value) {
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(Number(value))}`;
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  dosage: "",
  safetyInformation: "",
  stock: "",
  prescriptionRequired: false,
  image: null
};

export default function AdminProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadProducts() {
    const response = await fetch("/api/products");
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Unable to load products.");
      return;
    }
    setProducts(data.products || []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateField(event) {
    const { name, value, type, checked, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : files ? files[0] : value
    }));
  }

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      dosage: product.dosage || "",
      safetyInformation: product.safetyInformation || "",
      stock: product.stock,
      prescriptionRequired: product.prescriptionRequired,
      image: null
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "image") {
        if (value) payload.append("image", value);
        return;
      }
      payload.append(key, String(value));
    });

    try {
      const response = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PUT" : "POST",
        body: payload
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save product.");
      }
      setMessage(data.message);
      addToast(data.message || "Product saved successfully.", "success");
      setForm(emptyForm);
      setEditingId("");
      await loadProducts();
    } catch (submitError) {
      const msg = submitError.message || "Unable to save product.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteProduct(id) {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      const msg = data.message || "Unable to delete product.";
      setError(msg);
      addToast(msg, "error");
      return;
    }
    setMessage(data.message);
    addToast(data.message || "Product deleted successfully.", "success");
    await loadProducts();
  }

  return (
    <AdminGuard>
      <section className="section admin-section">
        <div className="container">
          <div className="admin-header"><div><p className="eyebrow">Catalogue management</p><h1>Products</h1></div><p>Add, edit, and remove products while keeping pricing and prescription settings accurate.</p></div>
          <AdminNav current="/admin/products" />
          {message && <p className="status-message success">{message}</p>}
          {error && <p className="status-message error">{error}</p>}
          <form className="form-card" onSubmit={handleSubmit}>
            <h2>{editingId ? "Edit product" : "Add product"}</h2>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={updateField} required />
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={form.description} onChange={updateField} required />
            </div>
            <div className="field">
              <label htmlFor="price">Price</label>
              <input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateField} required />
            </div>
            <div className="field">
              <label htmlFor="category">Category</label>
              <input id="category" name="category" value={form.category} onChange={updateField} required />
            </div>
            <div className="field">
              <label htmlFor="dosage">Dosage information</label>
              <input id="dosage" name="dosage" value={form.dosage} onChange={updateField} />
            </div>
            <div className="field">
              <label htmlFor="safetyInformation">Safety information</label>
              <textarea id="safetyInformation" name="safetyInformation" value={form.safetyInformation} onChange={updateField} />
            </div>
            <div className="field">
              <label htmlFor="stock">Stock quantity</label>
              <input id="stock" name="stock" type="number" min="0" step="1" value={form.stock} onChange={updateField} required />
            </div>
            <div className="field">
              <label htmlFor="image">Product image</label>
              <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={updateField} />
            </div>
            <div className="field checkbox-row">
              <label className="checkbox-inline" htmlFor="prescriptionRequired">
                <input
                  id="prescriptionRequired"
                  name="prescriptionRequired"
                  type="checkbox"
                  checked={form.prescriptionRequired}
                  onChange={updateField}
                />
                <span>Prescription required</span>
              </label>
              <small className="checkbox-help">Customers must provide a prescription before purchasing this medicine.</small>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update product" : "Add product"}
            </button>
          </form>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <div className="inline-actions">
                        <button className="btn btn-secondary btn-small" type="button" onClick={() => startEdit(product)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-small" type="button" onClick={() => deleteProduct(product._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminGuard>
  );
}
