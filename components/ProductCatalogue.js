"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ToastProvider";

export default function ProductCatalogue({ title, intro, includePrescriptionFilter = false }) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [prescription, setPrescription] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load products.");
        }
        setProducts(data.products || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = Array.from(new Set(products.map((item) => item.category))).filter(Boolean);

  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    const matchesAvailability =
      availability === "all" ||
      (availability === "in-stock" && product.stock > 0) ||
      (availability === "out-of-stock" && product.stock <= 0);
    const matchesPrescription =
      prescription === "all" ||
      (prescription === "required" && product.prescriptionRequired) ||
      (prescription === "not-required" && !product.prescriptionRequired);

    return matchesSearch && matchesCategory && matchesAvailability && matchesPrescription;
  });

  function handleAdd(product) {
    const result = addItem(product, 1);
    setMessage(result.message);
    if (result.ok) {
      addToast("Product added to cart.", "success");
    } else {
      addToast(result.message || "Unable to add product to cart.", "error");
    }
  }

  return (
    <div className="catalogue-page">
      <section className="page-header compact-header">
        <div className="container page-header-grid">
          <div>
            <p className="eyebrow">MediQuick catalogue</p>
            <h1>{title}</h1>
            <p className="section-intro">{intro}</p>
          </div>
        </div>
      </section>
      <section className="section catalogue-section">
        <div className="container">
          {message && <p className="status-message success">{message}</p>}
          <div className="filters">
            <div>
              <label htmlFor="search">Search</label>
              <input
                id="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by medicine name"
              />
            </div>
            <div>
              <label htmlFor="category">Category</label>
              <select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="availability">Availability</label>
              <select id="availability" value={availability} onChange={(event) => setAvailability(event.target.value)}>
                <option value="all">All stock</option>
                <option value="in-stock">In stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </div>
            {includePrescriptionFilter && (
              <div>
                <label htmlFor="prescription">Prescription</label>
                <select id="prescription" value={prescription} onChange={(event) => setPrescription(event.target.value)}>
                  <option value="all">All</option>
                  <option value="required">Required</option>
                  <option value="not-required">Not required</option>
                </select>
              </div>
            )}
          </div>

          {loading && <p className="status-message">Loading products...</p>}
          {error && <p className="status-message error">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="status-message">No products match the current search or filters.</p>
          )}

          <div className="product-grid">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} showAddToCart onAddToCart={handleAdd} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
