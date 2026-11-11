import { isAdmin } from "@/lib/session";
import { store } from "@/lib/store";
import { summarize } from "@/lib/summary";

export const dynamic = "force-dynamic";

const cell = (v: string | number) => {
  const s = typeof v === "number" ? v.toFixed(2).replace(".", ",") : v;
  // Evita inyección de fórmulas al abrir en Excel
  const safe = /^[=+\-@]/.test(s) && typeof v === "string" ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await isAdmin())) return new Response("No autorizado", { status: 401 });

  const [products, orders] = await Promise.all([store.listProducts(), store.listOrders()]);
  const s = summarize(products, orders);

  const header = ["Nombre", "Email", ...products.map((p) => p.name), "Botellas", "Total (€)", "Comentario", "Actualizado"];
  const rows = s.people.map((p) => {
    const q = new Map(p.items.map((i) => [i.product_id, i.qty]));
    return [
      cell(p.name),
      cell(p.email),
      ...products.map((pr) => String(q.get(pr.id) ?? 0)),
      String(p.bottles),
      cell(p.total),
      cell(p.comment ?? ""),
      cell(new Date(p.updated_at).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })),
    ];
  });
  const totals = [cell("TOTAL"), cell(""), ...s.lines.map((l) => String(l.units)), String(s.bottles), cell(s.total), "", ""];

  const csv = "﻿" + [header.map(cell), ...rows, totals].map((r) => r.join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pedidos-licores.csv"',
      "Cache-Control": "no-store",
    },
  });
}
