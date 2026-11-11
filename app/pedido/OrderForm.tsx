"use client";

import { useActionState, useState } from "react";
import { cancelOrder, saveOrder } from "../actions";
import type { Product } from "@/lib/store";
import ProductCard from "../ProductCard";

const MAX = 48;
const fmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export default function OrderForm({
  products,
  initial,
  comment,
  hasOrder,
  closed,
}: {
  products: Product[];
  initial: Record<string, number>;
  comment: string;
  hasOrder: boolean;
  closed: boolean;
}) {
  const [qty, setQty] = useState<Record<string, number>>(initial);
  const [note, setNote] = useState(comment);
  const [state, action, pending] = useActionState(saveOrder, undefined);

  const set = (id: string, n: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(MAX, Number.isFinite(n) ? Math.floor(n) : 0)) }));

  const bottles = products.reduce((s, p) => s + (qty[p.id] ?? 0), 0);
  const total = products.reduce((s, p) => s + (qty[p.id] ?? 0) * p.price, 0);

  return (
    <>
      <form action={action} className="order">
        <div className="pgrid">
          {products.map((p) => {
            const n = qty[p.id] ?? 0;
            return (
              <ProductCard key={p.id} product={p} active={n > 0}>
                <div className="stepper">
                  <button type="button" aria-label={`Quitar ${p.name}`} disabled={closed || n === 0} onClick={() => set(p.id, n - 1)}>
                    −
                  </button>
                  <input
                    name={`qty_${p.id}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={MAX}
                    value={n}
                    readOnly={closed}
                    onChange={(e) => set(p.id, Number(e.target.value))}
                    aria-label={`Cantidad de ${p.name}`}
                  />
                  <button type="button" aria-label={`Añadir ${p.name}`} disabled={closed || n >= MAX} onClick={() => set(p.id, n + 1)}>
                    +
                  </button>
                </div>
                <span className="subtotal">{n > 0 ? `= ${fmt.format(n * p.price)}` : ""}</span>
              </ProductCard>
            );
          })}
        </div>

        <label className="comment">
          <span className="comment-title">¿Quieres algo más del catálogo?</span>
          <span className="comment-help">
            Si te interesa otro producto del{" "}
            <a href="/catalogo.pdf" target="_blank" rel="noopener">catálogo</a> (otro anís, pacharán, licor de
            hierbas, otro formato…), escríbelo aquí. Consulto el precio y te lo confirmo antes de hacer el pedido.
            También puedes dejar cualquier otro comentario.
          </span>
          <textarea
            name="comment"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            readOnly={closed}
            placeholder="Ej.: 1 Pacharán de 1 L y 2 Licor de Hierbas de 0,70 L"
          />
        </label>

        <div className="summary">
          <div>
            <span>
              {bottles} {bottles === 1 ? "botella" : "botellas"}
              {note.trim() ? " + catálogo (precio a confirmar)" : ""}
            </span>
            <strong>{fmt.format(total)}</strong>
          </div>
          {!closed && (
            <button className="btn" disabled={pending || (bottles === 0 && !note.trim())}>
              {pending ? "Guardando…" : hasOrder ? "Guardar cambios" : "Guardar pedido"}
            </button>
          )}
        </div>
        {state?.error && <p className="msg error">{state.error}</p>}
        {state?.ok && <p className="msg ok">{state.ok}</p>}
      </form>

      {hasOrder && !closed && (
        <form
          action={cancelOrder}
          onSubmit={(e) => {
            if (!confirm("¿Seguro que quieres anular todo tu pedido?")) e.preventDefault();
          }}
          className="cancel"
        >
          <button className="link-btn danger">Anular mi pedido</button>
        </form>
      )}
    </>
  );
}
