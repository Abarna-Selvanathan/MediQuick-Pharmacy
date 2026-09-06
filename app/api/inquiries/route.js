import dbConnect from "@/lib/db";
import { jsonResponse, requireAdmin } from "@/lib/auth";
import { isValidEmail } from "@/lib/validators";
import Inquiry from "@/models/Inquiry";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) {
    return error;
  }

  try {
    await dbConnect();
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return jsonResponse({ inquiries });
  } catch {
    return jsonResponse({ message: "Unable to load inquiries." }, 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return jsonResponse({ message: "Name, email, and message are required." }, 400);
    }

    if (!isValidEmail(email)) {
      return jsonResponse({ message: "Please enter a valid email address." }, 400);
    }

    await dbConnect();
    const inquiry = await Inquiry.create({ name, email, message, status: "New" });
    return jsonResponse({ message: "Inquiry sent.", inquiry }, 201);
  } catch (error) {
    const message =
      error.message?.includes("MONGODB_URI")
        ? "The database is not configured yet."
        : "Unable to send this inquiry.";
    return jsonResponse({ message }, 500);
  }
}
