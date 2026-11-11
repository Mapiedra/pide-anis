import type { Product } from "@/lib/store";

const fmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

/** Ficha de producto con el estilo del catálogo: cinta colgante, foto y ola de puntos. */
export default function ProductCard({
  product: p,
  active = false,
  children,
}: {
  product: Product;
  active?: boolean;
  children?: React.ReactNode;
}) {
  const gid = `rib-${p.id}`;
  // Una palabra por línea: si alguna es larga, la letra se reduce para que quepa en la cinta
  const longest = Math.max(...p.name.split(/\s+/).map((w) => w.length));
  const fontSize = longest >= 9 ? "1.7rem" : longest >= 8 ? "1.9rem" : undefined;
  return (
    <article className={active ? "pcard on" : "pcard"} data-theme={p.theme || "azul"}>
      <div className="pcard-top">
        <div className="ribbon" aria-hidden="true">
          <svg viewBox="0 0 116 200" width="116" height="200">
            <defs>
              <radialGradient id={gid} cx="50%" cy="45%" r="70%">
                <stop offset="0" stopColor="var(--glow)" />
                <stop offset="1" stopColor="var(--c)" />
              </radialGradient>
            </defs>
            <path d="M0 0H116V200L58 180L0 200Z" fill={`url(#${gid})`} />
            <path d="M8 0V187L58 169L108 187V0" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="1.6" strokeDasharray="6 5" />
          </svg>
          <span style={fontSize ? { fontSize } : undefined}>{p.name}</span>
        </div>
        {p.image && <img className="bottle" src={p.image} alt={p.name} loading="lazy" />}
      </div>
      <div className="pcard-body">
        <h3 className="sr-only">{p.name}</h3>
        {p.subtitle && <p className="pcard-sub">{p.subtitle}</p>}
        {p.description && <p className="pcard-desc">{p.description}</p>}
        <div className="pcard-foot">
          <span className="pcard-price">{fmt.format(p.price)}</span>
          {children}
        </div>
      </div>
    </article>
  );
}
