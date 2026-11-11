import { isAdmin } from "@/lib/session";
import { store } from "@/lib/store";
import { summarize } from "@/lib/summary";
import { CLOSE_LABEL, euros, isClosed } from "@/lib/config";
import AdminLogin from "./AdminLogin";
import { adminLogout } from "./actions";

export const dynamic = "force-dynamic";

const when = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Madrid",
});

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin />;

  const [products, orders] = await Promise.all([store.listProducts(), store.listOrders()]);
  const s = summarize(products, orders);
  const names = new Map(products.map((p) => [p.id, p.name]));

  return (
    <>
      <section className="userbar">
        <div>
          <strong>Panel del organizador</strong> ·{" "}
          {isClosed() ? `cerrado desde el ${CLOSE_LABEL} h` : `abierto hasta el ${CLOSE_LABEL} h`}
        </div>
        <div className="row">
          <a className="btn small" href="/admin/export">Descargar CSV</a>
          <form action={adminLogout}>
            <button className="link-btn">Salir</button>
          </form>
        </div>
      </section>

      <section className="stats">
        <div><span>Personas</span><strong>{orders.length}</strong></div>
        <div><span>Botellas</span><strong>{s.bottles}</strong></div>
        <div><span>Importe total</span><strong>{euros(s.total)}</strong></div>
      </section>

      {orders.some((o) => o.comment) && (
        <section className="card">
          <h2>Comentarios y encargos del catálogo</h2>
          <p className="muted" style={{ marginTop: 0 }}>Revisa si piden algo fuera de la lista para consultar el precio.</p>
          <ul className="notes">
            {orders.filter((o) => o.comment).map((o) => (
              <li key={o.id}>
                <strong>{o.name}</strong> <small>({o.email})</small>
                <div>{o.comment}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2>Total a encargar</h2>
        <table className="table">
          <thead>
            <tr><th>Producto</th><th className="num">Precio</th><th className="num">Uds.</th><th className="num">Importe</th></tr>
          </thead>
          <tbody>
            {s.lines.map((l) => (
              <tr key={l.id}>
                <td>{l.name} <small>{l.subtitle}</small></td>
                <td className="num">{euros(l.price)}</td>
                <td className="num"><strong>{l.units}</strong></td>
                <td className="num">{euros(l.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td>Total</td><td /><td className="num">{s.bottles}</td><td className="num">{euros(s.total)}</td></tr>
          </tfoot>
        </table>
      </section>

      <section className="card">
        <h2>Pedidos por persona</h2>
        {s.people.length === 0 ? (
          <p className="muted">Todavía no hay pedidos.</p>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr><th>Nombre</th><th>Pedido</th><th className="num">Total</th><th>Actualizado</th></tr>
              </thead>
              <tbody>
                {s.people.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <br />
                      <small>{p.email}</small>
                    </td>
                    <td>
                      {p.items.map((i) => `${i.qty} × ${names.get(i.product_id) ?? i.product_id}`).join(", ")}
                      {p.comment && <div className="admin-note">Comentario / catálogo: {p.comment}</div>}
                    </td>
                    <td className="num">{euros(p.total)}</td>
                    <td><small>{when.format(new Date(p.updated_at))}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
