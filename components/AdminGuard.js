"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <p className="status-message">Checking admin access...</p>;
  }

  if (!user || user.role !== "admin") {
    return <p className="status-message error">You do not have permission to view this page.</p>;
  }

  return children;
}
