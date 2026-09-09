"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";
import { useToast } from "@/components/ToastProvider";
import "./prescriptions.css";

export default function AdminPrescriptionsPage() {
  const { addToast } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  async function loadPrescriptions() {
    const response = await fetch("/api/prescriptions");
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Unable to load prescriptions.");
      return;
    }
    setPrescriptions(data.prescriptions || []);
  }

  useEffect(() => {
    loadPrescriptions();
  }, []);

  async function updateStatus(id, status) {
    setUpdatingId(id);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/prescriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) {
        const msg = data.message || "Unable to update prescription.";
        addToast(msg, "error");
        throw new Error(msg);
      }
      setMessage(data.message);
      addToast(data.message || `Prescription marked ${status}.`, "success");
      await loadPrescriptions();
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <AdminGuard>
      <section className="section admin-section">
        <div className="container">
          <div className="admin-header"><div><p className="eyebrow">Clinical review</p><h1>Prescriptions</h1></div><p>Review uploaded prescription files and record their current status.</p></div>
          <AdminNav current="/admin/prescriptions" />
          {message && <p className="status-message success">{message}</p>}
          {error && <p className="status-message error">{error}</p>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Customer</th>
                  <th>Upload date</th>
                  <th>Status</th>
                  <th>File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((item) => (
                  <tr key={item._id}>
                    <td>{item._id}</td>
                    <td>{item.user?.name || "Customer"}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>{item.status}</td>
                    <td>
                      <a href={item.fileUrl} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          className="btn btn-primary btn-small"
                          type="button"
                          disabled={updatingId === item._id}
                          onClick={() => updateStatus(item._id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          type="button"
                          disabled={updatingId === item._id}
                          onClick={() => updateStatus(item._id, "Rejected")}
                        >
                          Reject
                        </button>
                      </div>
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
