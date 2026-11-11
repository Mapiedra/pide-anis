"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { clearAdmin, setAdmin } from "@/lib/session";

const h = (s: string) => createHash("sha256").update(s).digest();

export async function adminLogin(_: string | undefined, form: FormData) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return "Falta ADMIN_PASSWORD en las variables de entorno.";
  const given = String(form.get("password") ?? "");
  if (!timingSafeEqual(h(given), h(expected))) return "Contraseña incorrecta.";
  await setAdmin();
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdmin();
  redirect("/admin");
}
