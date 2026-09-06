"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import "./prescription.css";

export default function PrescriptionPage() {
  const { user, loading } = useAuth();
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("note", note);

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }
      setSuccess(data.message);
      setNote("");
      setFile(null);
      event.target.reset();
    } catch (submitError) {
      setError(submitError.message || "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="status-message">Loading...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="section">
        <div className="container">
          <p className="status-message error">Please log in to upload a prescription.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <form className="form-card" onSubmit={handleSubmit}>
          <h1>Upload a prescription</h1>
          <p className="muted">Accepted files: JPG, PNG, WEBP, or PDF. Maximum size 8 MB.</p>
          {error && <p className="status-message error">{error}</p>}
          {success && <p className="status-message success">{success}</p>}
          <div className="field">
            <label htmlFor="file">Prescription image/PDF</label>
            <input
              id="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="note">Optional note</label>
            <textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Uploading..." : "Submit"}
          </button>
        </form>
      </div>
    </section>
  );
}
