import dbConnect from "@/lib/db";
import { jsonResponse, requireAdmin, requireUser } from "@/lib/auth";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";

const DELIVERY_FEE = 3.5;

export async function GET() {
  const { user, error } = await requireUser();
  if (error) {
    return error;
  }

  try {
    await dbConnect();
    const filter = user.role === "admin" ? {} : { user: user.id };
    const orders = await Order.find(filter).populate("user", "name email").sort({ createdAt: -1 });
    return jsonResponse({ orders });
  } catch {
    return jsonResponse({ message: "Unable to load orders." }, 500);
  }
}

export async function POST(request) {
  const { user, error } = await requireUser();
  if (error) {
    return error;
  }

  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const deliveryDetails = body.deliveryDetails || {};
    const fullName = String(deliveryDetails.fullName || "").trim();
    const phone = String(deliveryDetails.phone || "").trim();
    const address = String(deliveryDetails.address || "").trim();
    const city = String(deliveryDetails.city || "").trim();
    const postalCode = String(deliveryDetails.postalCode || "").trim();

    if (!items.length) {
      return jsonResponse({ message: "Your cart is empty." }, 400);
    }

    if (!fullName || !phone || !address || !city || !postalCode) {
      return jsonResponse({ message: "Please complete all delivery details." }, 400);
    }

    await dbConnect();
    await User.findById(user.id);

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!item.productId || !Number.isInteger(quantity) || quantity < 1) {
        return jsonResponse({ message: "One or more cart items are invalid." }, 400);
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return jsonResponse({ message: "A product in your cart is no longer available." }, 400);
      }

      if (product.prescriptionRequired) {
        return jsonResponse({
          message: `${product.name} requires an approved prescription and cannot be ordered here.`
        }, 400);
      }

      if (product.stock < quantity) {
        return jsonResponse({
          message: `${product.name} does not have enough stock for this order.`
        }, 400);
      }

      const updated = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!updated) {
        return jsonResponse({
          message: `${product.name} went out of stock before the order could be completed.`
        }, 409);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity
      });
      subtotal += product.price * quantity;
    }

    const totalAmount = Number((subtotal + DELIVERY_FEE).toFixed(2));

    const order = await Order.create({
      user: user.id,
      items: orderItems,
      deliveryDetails: { fullName, phone, address, city, postalCode },
      totalAmount,
      deliveryFee: DELIVERY_FEE,
      paymentStatus: "demo-test",
      orderStatus: "Pending"
    });

    return jsonResponse({
      message: "Order placed using the demo payment flow. No real payment was processed.",
      order
    }, 201);
  } catch {
    return jsonResponse({ message: "Unable to place this order." }, 500);
  }
}
