"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import "./register.css";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed.");
      await refreshUser();
      addToast("Account created successfully.", "success");
      router.push("/");
    } catch (submitError) {
      const msg = submitError.message || "Registration failed.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section auth-page register-page">
      <div className="container auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Create account</p>
          <h1>Join MediQuick Pharmacy</h1>
          <p>Create an account to checkout faster, upload prescriptions, and manage your pharmacy orders.</p>
        </div>
        <div className="form-card auth-card">
          <h2>Register</h2>
          {error && <p className="status-message error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" value={form.name} onChange={updateField} required /></div>
            <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" value={form.email} onChange={updateField} required /></div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="password-wrap">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={updateField} required />
                  <button className="password-eye" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? "🙈" : "👁"}</button>
                </div>
              </div>
              <div className="field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <div className="password-wrap">
                  <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={updateField} required />
                  <button className="password-eye" type="button" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} onClick={() => setShowConfirmPassword((value) => !value)}>{showConfirmPassword ? "🙈" : "👁"}</button>
                </div>
              </div>
            </div>
            <div className="field"><label htmlFor="phone">Phone number</label><input id="phone" name="phone" placeholder="+94 XX XXX XXXX" value={form.phone} onChange={updateField} required /></div>
            <div className="field"><label htmlFor="address">Address</label><input id="address" name="address" value={form.address} onChange={updateField} /></div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Creating account..." : "Register"}</button>
          </form>
          <div className="auth-link-row">
            <p className="form-footnote">Already have an account? <Link className="form-link" href="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </section>
  );
}
