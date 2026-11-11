"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { store, type OrderItem } from "@/lib/store";
import { clearUser, getUser, setUser } from "@/lib/session";
import { isClosed, isValidEmail, MAX_QTY, normalizeName } from "@/lib/config";

export type FormState = { error?: string; ok?: string } | undefined;
export type IdentifyState = { error: string; name: string; email: string } | undefined;

export async function identify(_: IdentifyState, form: FormData): Promise<IdentifyState> {
  const name = String(form.get("name") ?? "").replace(/\s+/g, " ").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const fail = (error: string) => ({ error, name, email });

  if (name.length < 2) return fail("Escribe tu nombre y apellido.");
  if (name.length > 80) return fail("El nombre es demasiado largo.");
  if (!isValidEmail(email)) return fail("Ese email no parece válido.");

  const existing = await store.getOrder(email);
  if (existing && normalizeName(existing.name) !== normalizeName(name)) {
    return fail(
      "Ya hay un pedido con este email a otro nombre. Escribe el nombre igual que la primera vez."
    );
  }
  if (!existing && isClosed()) {
    return fail("El plazo de pedidos ya ha terminado.");
  }

  await setUser({ name: existing?.name ?? name, email });
  redirect("/pedido");
}

export async function saveOrder(_: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) redirect("/");
  if (isClosed()) return { error: "El plazo de pedidos ya ha terminado. No se pueden hacer cambios." };

  const products = await store.listProducts();
  const items: OrderItem[] = [];
  for (const p of products) {
    const qty = Math.floor(Number(form.get(`qty_${p.id}`) ?? 0));
    if (!Number.isFinite(qty) || qty < 0 || qty > MAX_QTY) {
      return { error: `Cantidad no válida para ${p.name} (máximo ${MAX_QTY}).` };
    }
    if (qty > 0) items.push({ product_id: p.id, qty });
  }
  const comment = String(form.get("comment") ?? "").trim().slice(0, 500);
  // Se puede pedir solo algo del catálogo (en el comentario), sin botellas de la lista
  if (items.length === 0 && !comment) {
    return {
      error: "Añade al menos una botella o escribe en el comentario qué quieres del catálogo. Si no quieres nada, usa «Anular mi pedido».",
    };
  }
  await store.saveOrder({ name: user.name, email: user.email, comment, items });
  revalidatePath("/pedido");
  return { ok: "¡Pedido guardado! Puedes volver a cambiarlo hasta el cierre." };
}

export async function cancelOrder() {
  const user = await getUser();
  if (!user) redirect("/");
  if (!isClosed()) {
    await store.deleteOrder(user.email);
  }
  revalidatePath("/pedido");
  redirect("/pedido?anulado=1");
}

export async function logout() {
  await clearUser();
  redirect("/");
}
