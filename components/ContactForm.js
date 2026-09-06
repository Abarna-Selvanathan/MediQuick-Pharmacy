"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", text: "" });
    setSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send inquiry.");
      }

      setForm({ name: "", email: "", message: "" });
      setStatus({
        type: "success",
        text: "Your inquiry has been sent. The pharmacy team will review it."
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || "Unable to send inquiry."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      {status.text && (
        <p className={`status-message ${status.type}`}>{status.text}</p>
      )}
      <div className="field">
        <label htmlFor="contact-name">Name</label>
        <input
          id="contact-name"
          name="name"
          value={form.name}
          onChange={updateField}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          value={form.message}
          onChange={updateField}
          required
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
