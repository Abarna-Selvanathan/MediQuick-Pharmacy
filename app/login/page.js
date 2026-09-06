"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }
      const currentUser = await refreshUser();
      router.replace(currentUser?.role === "admin" ? "/admin" : "/");
    } catch (submitError) {
      setError(submitError.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="form-card">
          <h1>Login</h1>
          {error && <p className="status-message error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={updateField} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={updateField} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Login"}
            </button>
          </form>
          <p>
            New to MediQuick? <Link href="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
