import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { jsonResponse, requireAdmin, requireUser } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";

const STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

export async function GET(_request, { params }) {
  const { user, error } = await requireUser();
  if (error) {
    return error;
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid order ID." }, 400);
    }

    await dbConnect();
    const order = await Order.findById(id).populate("user", "name email");
    if (!order) {
      return jsonResponse({ message: "Order not found." }, 404);
    }

    if (user.role !== "admin" && String(order.user._id) !== user.id) {
      return jsonResponse({ message: "You do not have permission to view this order." }, 403);
    }

    return jsonResponse({ order });
  } catch {
    return jsonResponse({ message: "Unable to load this order." }, 500);
  }
}

export async function PUT(request, { params }) {
  const { error } = await requireAdmin();
  if (error) {
    return error;
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid order ID." }, 400);
    }

    const body = await request.json();
    const orderStatus = String(body.orderStatus || "");
    if (!STATUSES.includes(orderStatus)) {
      return jsonResponse({ message: "Invalid order status." }, 400);
    }

    await dbConnect();
    const order = await Order.findById(id);
    if (!order) {
      return jsonResponse({ message: "Order not found." }, 404);
    }

    if (order.orderStatus !== "Cancelled" && orderStatus === "Cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    order.orderStatus = orderStatus;
    await order.save();
    const populated = await order.populate("user", "name email");
    return jsonResponse({ message: "Order status updated.", order: populated });
  } catch {
    return jsonResponse({ message: "Unable to update order status." }, 500);
  }
}
