"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      if (!response.ok) throw new Error(data.message || "Login failed.");
      const currentUser = await refreshUser();
      addToast("Login successful.", "success");
      router.replace(currentUser?.role === "admin" ? "/admin" : "/");
    } catch (submitError) {
      const msg = submitError.message || "Login failed.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section auth-page login-page">
      <div className="container auth-layout">
        <div className="auth-copy">
          <button className="btn btn-secondary btn-small back-button" type="button" onClick={() => router.back()}>← Back</button>
          <p className="eyebrow">Account access</p>
          <h1>Login to MediQuick</h1>
          <p>Access your cart, checkout, prescription uploads, and account-specific pharmacy services.</p>
        </div>
        <div className="form-card auth-card">
          <h2>Login</h2>
          {error && <p className="status-message error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" value={form.email} onChange={updateField} required /></div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-wrap">
                <input id="password" name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={updateField} required />
                <button className="password-eye" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>
                  <svg className="password-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    {showPassword ? (
                      <path fill="currentColor" d="M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    ) : (
                      <path fill="currentColor" d="M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Login"}</button>
          </form>
          <div className="auth-link-row">
            <p className="form-footnote">New to MediQuick? <Link className="form-link" href="/register">Create an account</Link></p>
          </div>
        </div>
      </div>
    </section>
  );
}
