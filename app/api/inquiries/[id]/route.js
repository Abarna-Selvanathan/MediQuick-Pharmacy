import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { jsonResponse, requireAdmin } from "@/lib/auth";
import Inquiry from "@/models/Inquiry";

const STATUSES = ["New", "In Progress", "Resolved"];

export async function PUT(request, { params }) {
  const { error } = await requireAdmin();
  if (error) {
    return error;
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid inquiry ID." }, 400);
    }

    const body = await request.json();
    const status = String(body.status || "");
    if (!STATUSES.includes(status)) {
      return jsonResponse({ message: "Invalid inquiry status." }, 400);
    }

    await dbConnect();
    const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!inquiry) {
      return jsonResponse({ message: "Inquiry not found." }, 404);
    }

    return jsonResponse({ message: "Inquiry status updated.", inquiry });
  } catch {
    return jsonResponse({ message: "Unable to update inquiry status." }, 500);
  }
}
