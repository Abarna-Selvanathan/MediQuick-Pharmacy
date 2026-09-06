import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "mediquick_token";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET. Add it to .env.local.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}

export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUserFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name
    };
  } catch {
    return null;
  }
}

export function jsonResponse(body, status = 200) {
  return Response.json(body, { status });
}

export async function requireUser() {
  const user = await getCurrentUserFromRequest();
  if (!user) {
    return { user: null, error: jsonResponse({ message: "Please log in to continue." }, 401) };
  }
  return { user, error: null };
}

export async function requireAdmin() {
  const { user, error } = await requireUser();
  if (error) {
    return { user: null, error };
  }
  if (user.role !== "admin") {
    return {
      user: null,
      error: jsonResponse({ message: "You do not have permission to perform this action." }, 403)
    };
  }
  return { user, error: null };
}
