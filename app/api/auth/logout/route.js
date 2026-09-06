import { clearAuthCookie, jsonResponse } from "@/lib/auth";

export async function POST() {
  await clearAuthCookie();
  return jsonResponse({ message: "Logged out." });
}
