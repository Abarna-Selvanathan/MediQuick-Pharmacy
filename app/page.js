"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="home-page">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Trusted Sri Lankan online pharmacy</p>
            <h1>MediQuick Pharmacy</h1>
            <p className="hero-text">
              Browse medicines, wellness products, and prescription support in a clear online pharmacy experience designed for everyday Sri Lankan care.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-light" href="/medicines">Shop Medicines</Link>
              <Link className="btn btn-ghost" href="/prescription">Upload Prescription</Link>
            </div>
          </div>
          <div className="hero-card" aria-label="MediQuick pharmacy service highlights">
            <span className="hero-card-label">Pharmacy services</span>
            <div className="hero-metric"><strong>8+</strong><span>featured medicines</span></div>
            <div className="hero-metric"><strong>LKR</strong><span>local pricing displayed clearly</span></div>
            <div className="hero-metric"><strong>Rx</strong><span>prescription workflow preserved</span></div>
          </div>
        </div>
      </section>

      <section id="about" className="section">
        <div className="container about-section">
          <div className="about-intro">
            <p className="eyebrow">About MediQuick</p>
            <h2>Pharmacy shopping made calmer, clearer, and easier.</h2>
            <p className="section-intro">
              MediQuick brings product information, prescription support, and checkout into one straightforward pharmacy experience.
            </p>
          </div>
          <div className="about-points">
            <article className="about-point"><strong>Browse with confidence</strong><span>See price, category, stock, dosage, and safety details before ordering.</span></article>
            <article className="about-point"><strong>Prescription-ready</strong><span>Products requiring a prescription stay clearly marked and linked to the existing upload flow.</span></article>
            <article className="about-point"><strong>Simple delivery flow</strong><span>Keep cart items, delivery information, and order totals together in one clear process.</span></article>
          </div>
        </div>
      </section>

      <section id="medicines" className="section section-alt">
        <div className="container">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Featured products</p>
              <h2>Medicines</h2>
              <p className="section-intro">Real products from the current MediQuick catalogue, including price, stock, and prescription status.</p>
            </div>
            <Link className="btn btn-secondary" href="/medicines">View More Medicines</Link>
          </div>

          {loading && <p className="status-message">Loading medicines...</p>}
          {error && <p className="status-message error">{error}</p>}
          {!loading && !error && products.length === 0 && (
            <p className="status-message">No medicines are available yet. Please check back after the catalogue has been set up.</p>
          )}

          <div className="product-grid">
            {products.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="section prescription-strip">
        <div className="container prescription-grid">
          <div>
            <p className="eyebrow">Prescription support</p>
            <h2>Upload prescriptions for restricted medicines.</h2>
            <p>Products that require a prescription remain clearly marked in the catalogue. Use the existing upload workflow so pharmacy staff can review your request.</p>
          </div>
          <Link className="btn btn-primary" href="/prescription">Upload Prescription</Link>
        </div>
      </section>


      <section id="contact" className="section contact-section">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Need pharmacy support?</h2>
            <p className="section-intro">Send a message to the pharmacy team. Your inquiry will be saved and reviewed by staff.</p>
            <div className="contact-list">
              <p><strong>Email:</strong> support@mediquick.pharmacy</p>
              <p><strong>Phone:</strong> +94 11 234 5678</p>
              <p><strong>Location:</strong> Colombo, Sri Lanka</p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
