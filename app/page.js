"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ContactForm from "@/components/ContactForm";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products?limit=8");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load medicines.");
        }

        setProducts((data.products || []).slice(0, 8));
      } catch (loadError) {
        setError(loadError.message || "Unable to load medicines.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Trusted online pharmacy</p>
          <h1>MediQuick Pharmacy</h1>
          <p className="hero-text">
            Convenient online access to medicines and pharmacy products, with
            careful product information, prescription support, and a clear
            checkout process.
          </p>
          <a className="btn btn-primary" href="/medicines">
            Shop Medicines
          </a>
        </div>
      </section>

      <section id="about" className="section">
        <div className="container">
          <h2>About MediQuick Pharmacy</h2>
          <p className="section-intro">
            MediQuick Pharmacy helps customers browse medicines and pharmacy
            products, view important product details, upload prescriptions where
            needed, and place orders for delivery. Our aim is to make pharmacy
            shopping clearer, safer, and easier to manage from home.
          </p>
        </div>
      </section>

      <section id="medicines" className="section section-alt">
        <div className="container">
          <h2>Medicines</h2>
          <p className="section-intro">
            A selection of medicines and pharmacy products available through
            MediQuick Pharmacy.
          </p>

          {loading && <p className="status-message">Loading medicines...</p>}
          {error && <p className="status-message error">{error}</p>}
          {!loading && !error && products.length === 0 && (
            <p className="status-message">
              No medicines are available yet. Please check back after the
              catalogue has been set up.
            </p>
          )}

          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="section-actions">
            <a className="btn btn-secondary" href="/medicines">
              View More Medicines
            </a>
          </div>
        </div>
      </section>

      <section id="contact" className="section">
        <div className="container">
          <h2>Contact</h2>
          <p className="section-intro">
            Send a message to the pharmacy team. Your inquiry will be saved and
            reviewed by staff.
          </p>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
