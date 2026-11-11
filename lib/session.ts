import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET || "dev-secret-solo-para-local";
const USER_COOKIE = "pa_user";
const ADMIN_COOKIE = "pa_admin";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 días

function sign(value: string) {
  const mac = createHmac("sha256", SECRET).update(value).digest("base64url");
  return `${Buffer.from(value).toString("base64url")}.${mac}`;
}

function verify(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const value = Buffer.from(payload, "base64url").toString();
  const expected = createHmac("sha256", SECRET).update(value).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return value;
}

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

export type User = { name: string; email: string };

export async function getUser(): Promise<User | null> {
  const raw = verify((await cookies()).get(USER_COOKIE)?.value);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function setUser(user: User) {
  (await cookies()).set(USER_COOKIE, sign(JSON.stringify(user)), cookieOpts);
}

export async function clearUser() {
  (await cookies()).delete(USER_COOKIE);
}

export async function isAdmin() {
  return verify((await cookies()).get(ADMIN_COOKIE)?.value) === "admin";
}

export async function setAdmin() {
  (await cookies()).set(ADMIN_COOKIE, sign("admin"), { ...cookieOpts, maxAge: 60 * 60 * 12 });
}

export async function clearAdmin() {
  (await cookies()).delete(ADMIN_COOKIE);
}
