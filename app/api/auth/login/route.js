import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { createSessionToken, jsonResponse, setAuthCookie } from "@/lib/auth";
import { isValidEmail } from "@/lib/validators";
import User from "@/models/User";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "";
    const isConfiguredAdminLogin =
      Boolean(adminEmail && adminPassword) &&
      email === adminEmail &&
      password === adminPassword;

    if (!email || !password) {
      return jsonResponse({ message: "Email and password are required." }, 400);
    }

    if (!isValidEmail(email)) {
      return jsonResponse({ message: "Please enter a valid email address." }, 400);
    }

    await dbConnect();
    let user = await User.findOne({ email });
    if (!user) {
      if (isConfiguredAdminLogin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        user = await User.create({
          name: "MediQuick Admin",
          email: adminEmail,
          password: hashedPassword,
          phone: "00000000000",
          address: "Pharmacy Office",
          role: "admin"
        });
      } else {
        return jsonResponse({ message: "Invalid email or password." }, 401);
      }
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches && !isConfiguredAdminLogin) {
      return jsonResponse({ message: "Invalid email or password." }, 401);
    }

    if (isConfiguredAdminLogin && (user.role !== "admin" || !matches)) {
      user.role = "admin";
      if (!matches) {
        user.password = await bcrypt.hash(adminPassword, 10);
      }
      await user.save();
    }

    const token = await createSessionToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name
    });
    await setAuthCookie(token);

    return jsonResponse({
      message: "Login successful.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return jsonResponse({ message: "Unable to log in at the moment." }, 500);
  }
}
