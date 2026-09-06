import { getCurrentUserFromRequest, jsonResponse } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const sessionUser = await getCurrentUserFromRequest();
    if (!sessionUser) {
      return jsonResponse({ user: null });
    }

    await dbConnect();
    const user = await User.findById(sessionUser.id).select("name email role phone address");
    if (!user) {
      return jsonResponse({ user: null });
    }

    return jsonResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch {
    return jsonResponse({ user: null });
  }
}
