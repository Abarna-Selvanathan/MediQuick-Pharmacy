"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import "./prescription.css";

export default function PrescriptionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { addToast } = useToast();
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
      if (file) formData.append("file", file);
      formData.append("note", note);

      const response = await fetch("/api/prescriptions", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed.");
      setSuccess(data.message);
      addToast("Prescription uploaded successfully.", "success");
      setNote("");
      setFile(null);
      event.target.reset();
    } catch (submitError) {
      const msg = submitError.message || "Upload failed.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <section className="section"><div className="container"><p className="status-message">Loading...</p></div></section>;

  if (!user) {
    return <section className="section"><div className="container"><div className="empty-state"><h2>Please log in to upload a prescription.</h2><p>Prescription uploads are connected to your MediQuick account.</p><a className="btn btn-primary" href="/login">Login</a></div></div></section>;
  }

  return (
    <section className="section prescription-page">
      <div className="container prescription-layout">
        <div className="prescription-copy">
          <button className="btn btn-secondary btn-small back-button" type="button" onClick={() => router.back()}>← Back</button>
          <p className="eyebrow">Prescription upload</p>
          <h1>Submit your prescription for review.</h1>
          <p>Upload a clear image or PDF for medicines marked as Prescription Required. The existing pharmacy workflow will save and route it to the admin dashboard.</p>
          <div className="notice"><strong>Accepted files:</strong> JPG, PNG, WEBP, or PDF. Maximum size 8 MB.</div>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Upload file</h2>
          {error && <p className="status-message error">{error}</p>}
          {success && <p className="status-message success">{success}</p>}
          <div className="field"><label htmlFor="file">Prescription image/PDF</label><input id="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} required />{file && <p className="muted selected-file">Selected: {file.name}</p>}</div>
          <div className="field"><label htmlFor="note">Optional note</label><textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add medicine names or pharmacist notes" /></div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Uploading..." : "Submit Prescription"}</button>
        </form>
      </div>
    </section>
  );
}
