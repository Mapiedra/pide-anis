import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { store } from "@/lib/store";
import { CLOSE_AT, CLOSE_LABEL, isClosed } from "@/lib/config";
import { logout } from "../actions";
import OrderForm from "./OrderForm";
import Countdown from "../Countdown";

export const dynamic = "force-dynamic";

export default async function PedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ anulado?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/");

  const [products, order, sp] = await Promise.all([
    store.listProducts(),
    store.getOrder(user.email),
    searchParams,
  ]);
  const closed = isClosed();
  const initial = Object.fromEntries((order?.items ?? []).map((i) => [i.product_id, i.qty]));

  return (
    <>
      <section className="userbar">
        <div>
          Hola, <strong>{user.name}</strong> <small>({user.email})</small>
        </div>
        <form action={logout}>
          <button className="link-btn">No soy yo / salir</button>
        </form>
      </section>

      <div className={closed ? "deadline closed" : "deadline"}>
        {closed ? (
          <>Los pedidos se cerraron el {CLOSE_LABEL} h. Esto es lo que pediste:</>
        ) : (
          <>
            Puedes cambiar tu pedido hasta el <strong>{CLOSE_LABEL} h</strong>
            <Countdown closeAt={CLOSE_AT.toISOString()} />
          </>
        )}
      </div>

      {sp.anulado && !order && <p className="msg ok">Tu pedido se ha anulado.</p>}
      {!order && !closed && !sp.anulado && (
        <p className="msg info">Aún no tienes pedido. Elige las botellas y pulsa «Guardar pedido».</p>
      )}
      {!order && closed && <p className="msg info">No hiciste ningún pedido.</p>}
      {order && (
        <p className="msg info">
          Último cambio:{" "}
          {new Intl.DateTimeFormat("es-ES", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Europe/Madrid",
          }).format(new Date(order.updated_at))}
        </p>
      )}

      <OrderForm
        products={products}
        initial={initial}
        comment={order?.comment ?? ""}
        hasOrder={!!order}
        closed={closed}
      />
    </>
  );
}
