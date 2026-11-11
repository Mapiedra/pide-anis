import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { CLOSE_AT, CLOSE_LABEL, isClosed } from "@/lib/config";
import { store } from "@/lib/store";
import IdentifyForm from "./IdentifyForm";
import Countdown from "./Countdown";
import ProductCard from "./ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (await getUser()) redirect("/pedido");
  const products = await store.listProducts();
  const closed = isClosed();

  return (
    <>
      <section className="hero">
        <h1>Encargo de licores</h1>
        <p>
          Apúntate con tu nombre y tu email, elige cuántas botellas quieres y listo. Con el mismo
          nombre y email puedes volver a entrar para cambiar tu pedido.
        </p>
        <div className={closed ? "deadline closed" : "deadline"}>
          {closed ? (
            <>Pedidos cerrados desde el {CLOSE_LABEL} h.</>
          ) : (
            <>
              Cierre: <strong>{CLOSE_LABEL} h</strong>
              <Countdown closeAt={CLOSE_AT.toISOString()} />
            </>
          )}
        </div>
      </section>

      <section className="card">
        <h2>{closed ? "Consultar mi pedido" : "Entra para hacer o cambiar tu pedido"}</h2>
        <IdentifyForm closed={closed} />
      </section>

      <section>
        <h2 className="section-title">Lo que se puede pedir</h2>
        <div className="pgrid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
