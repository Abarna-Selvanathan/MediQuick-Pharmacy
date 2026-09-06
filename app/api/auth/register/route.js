import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { createSessionToken, jsonResponse, setAuthCookie } from "@/lib/auth";
import { isValidEmail, validatePassword } from "@/lib/validators";
import User from "@/models/User";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();

    if (!name || !email || !password || !confirmPassword || !phone) {
      return jsonResponse({ message: "Please complete all required fields." }, 400);
    }

    if (!isValidEmail(email)) {
      return jsonResponse({ message: "Please enter a valid email address." }, 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return jsonResponse({ message: passwordError }, 400);
    }

    if (password !== confirmPassword) {
      return jsonResponse({ message: "Passwords do not match." }, 400);
    }

    await dbConnect();

    const existing = await User.findOne({ email });
    if (existing) {
      return jsonResponse({ message: "An account with this email already exists." }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: "customer"
    });

    const token = await createSessionToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name
    });
    await setAuthCookie(token);

    return jsonResponse({
      message: "Registration successful.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }, 201);
  } catch (error) {
    return jsonResponse({ message: "Unable to register at the moment." }, 500);
  }
}
