"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";
import { useToast } from "@/components/ToastProvider";
import "./inquiries.css";

const STATUSES = ["New", "In Progress", "Resolved"];

export default function AdminInquiriesPage() {
  const { addToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadInquiries() {
    const response = await fetch("/api/inquiries");
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Unable to load inquiries.");
      return;
    }
    setInquiries(data.inquiries || []);
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  async function updateStatus(id, status) {
    const response = await fetch(`/api/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = data.message || "Unable to update inquiry.";
      setError(msg);
      addToast(msg, "error");
      return;
    }
    setMessage(data.message);
    addToast(data.message || "Inquiry status updated.", "success");
    await loadInquiries();
  }

  return (
    <AdminGuard>
      <section className="section admin-section">
        <div className="container">
          <div className="admin-header"><div><p className="eyebrow">Customer support</p><h1>Inquiries</h1></div><p>Review and update customer questions from the pharmacy contact form.</p></div>
          <AdminNav current="/admin/inquiries" />
          {message && <p className="status-message success">{message}</p>}
          {error && <p className="status-message error">{error}</p>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td><div className="message-scroll"><span>{item.message}</span></div></td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={item.status}
                        onChange={(event) => updateStatus(item._id, event.target.value)}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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
