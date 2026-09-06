import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { jsonResponse, requireAdmin } from "@/lib/auth";
import Prescription from "@/models/Prescription";

const STATUSES = ["Pending", "Approved", "Rejected"];

export async function PUT(request, { params }) {
  const { error } = await requireAdmin();
  if (error) {
    return error;
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid prescription ID." }, 400);
    }

    const body = await request.json();
    const status = String(body.status || "");
    if (!STATUSES.includes(status)) {
      return jsonResponse({ message: "Invalid prescription status." }, 400);
    }

    await dbConnect();
    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!prescription) {
      return jsonResponse({ message: "Prescription not found." }, 404);
    }

    return jsonResponse({ message: `Prescription ${status.toLowerCase()}.`, prescription });
  } catch {
    return jsonResponse({ message: "Unable to update prescription status." }, 500);
  }
}
