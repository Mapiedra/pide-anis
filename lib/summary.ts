import type { Order, Product } from "./store";

export function summarize(products: Product[], orders: Order[]) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const units = new Map<string, number>();
  const people = orders.map((o) => {
    let total = 0;
    let bottles = 0;
    for (const i of o.items) {
      units.set(i.product_id, (units.get(i.product_id) ?? 0) + i.qty);
      total += i.qty * (byId.get(i.product_id)?.price ?? 0);
      bottles += i.qty;
    }
    return { ...o, total, bottles };
  });
  const lines = products.map((p) => {
    const u = units.get(p.id) ?? 0;
    return { ...p, units: u, amount: u * p.price };
  });
  return {
    people,
    lines,
    bottles: lines.reduce((s, l) => s + l.units, 0),
    total: lines.reduce((s, l) => s + l.amount, 0),
  };
}
