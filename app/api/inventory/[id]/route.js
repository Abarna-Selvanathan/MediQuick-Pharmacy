import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { jsonResponse, requireAdmin } from "@/lib/auth";
import { toNumber } from "@/lib/validators";
import Product from "@/models/Product";

export async function PUT(request, { params }) {
  const { error } = await requireAdmin();
  if (error) {
    return error;
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid product ID." }, 400);
    }

    const body = await request.json();
    const stock = toNumber(body.stock);

    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      return jsonResponse({ message: "Stock must be a whole number of zero or more." }, 400);
    }

    await dbConnect();
    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      return jsonResponse({ message: "Product not found." }, 404);
    }

    return jsonResponse({ message: "Inventory updated.", product });
  } catch {
    return jsonResponse({ message: "Unable to update inventory." }, 500);
  }
}
