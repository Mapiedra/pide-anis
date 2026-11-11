import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";

export type Product = {
  id: string;
  name: string;
  subtitle: string | null;
  price: number;
  image: string | null;
  description: string | null;
  theme: string;
  sort: number;
};

export type OrderItem = { product_id: string; qty: number };

export type Order = {
  id: string;
  name: string;
  email: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

export type OrderInput = {
  name: string;
  email: string;
  comment: string;
  items: OrderItem[];
};

// Mismo catálogo que supabase/schema.sql; solo se usa en local sin Supabase
const DEFAULT_PRODUCTS: Product[] = [
  { id: "anis-seco", name: "Anís Extra Seco", subtitle: "Bidestilado · 55º · 1 L", price: 15, image: "/img/anis-seco.jpg", theme: "azul", sort: 1,
    description: "El anís más recio de la casa. Destilado dos veces con materias primas escogidas por el maestro destilador: seco, limpio y con mucho cuerpo. Para quien lo toma solo, con un poco de agua fresca o como «palomita»." },
  { id: "anis-dulce", name: "Anís Dulce", subtitle: "Altamirano · 35º · 0,70 L", price: 10, image: "/img/anis-dulce.jpg", theme: "azul", sort: 2,
    description: "El anís que ha distinguido a Altamirano desde sus inicios. Pronto se ganó fama de «digestivo» y es el preferido en Rute y su comarca. Suave y redondo: perfecto en la sobremesa y para acompañar los dulces de Navidad." },
  { id: "crema-anisete", name: "Crema de Anisete", subtitle: "Altamirano · 25º · 0,70 L", price: 10, image: "/img/crema-anisete.jpg", theme: "azul", sort: 3,
    description: "Crema de anís de baja graduación, sedosa y de sabor intenso que dura en el paladar. Se disfruta sola, bien fría o con hielo. Una opción suave para quien encuentra el anís demasiado fuerte." },
  { id: "rosoli", name: "Rosoli de la Abuela", subtitle: "Licor de café · 16º · 0,70 L", price: 10, image: "/img/rosoli.jpg", theme: "marron", sort: 4,
    description: "Licor tradicional de Rute hecho con receta de la abuela: los mejores cafés y canela macerados que dejan aromas y un sabor muy especiales. Se toma solo, con hielo o en combinados." },
  { id: "ruteviejo", name: "Ruteviejo", subtitle: "Crema de licor · 0,70 L", price: 10, image: "/img/ruteviejo.jpg", theme: "caramelo", sort: 5,
    description: "Crema de licor de whisky, en la línea de un Baileys: suave, cremosa y pensada para alargar la sobremesa. Mejor bien fría o con hielo, y también va de lujo con el café o sobre un helado." },
];

interface Store {
  listProducts(): Promise<Product[]>;
  getOrder(email: string): Promise<Order | null>;
  saveOrder(input: OrderInput): Promise<void>;
  deleteOrder(email: string): Promise<void>;
  listOrders(): Promise<Order[]>;
}

/* ---------- Supabase (producción) ---------- */

function supabaseStore(db: SupabaseClient): Store {
  const orderSelect = "id, name, email, comment, created_at, updated_at, items:order_items(product_id, qty)";
  return {
    async listProducts() {
      const { data, error } = await db
        .from("products")
        .select("id, name, subtitle, price, image, description, theme, sort")
        .eq("active", true)
        .order("sort");
      if (error) throw error;
      return (data ?? []).map((p) => ({ ...p, price: Number(p.price) }));
    },
    async getOrder(email) {
      const { data, error } = await db.from("orders").select(orderSelect).eq("email", email).maybeSingle();
      if (error) throw error;
      return (data as Order | null) ?? null;
    },
    async saveOrder(input) {
      const { error } = await db.rpc("save_order", {
        p_name: input.name,
        p_email: input.email,
        p_comment: input.comment,
        p_items: input.items,
      });
      if (error) throw error;
    },
    async deleteOrder(email) {
      const { error } = await db.from("orders").delete().eq("email", email);
      if (error) throw error;
    },
    async listOrders() {
      const { data, error } = await db.from("orders").select(orderSelect).order("created_at");
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  };
}

/* ---------- Fichero JSON (solo desarrollo local) ---------- */

type LocalDb = { products: Product[]; orders: Order[] };
const DB_FILE = path.join(process.cwd(), ".data", "db.json");

async function readLocal(): Promise<LocalDb> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8"));
  } catch {
    return { products: DEFAULT_PRODUCTS, orders: [] };
  }
}

async function writeLocal(db: LocalDb) {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

const localStore: Store = {
  async listProducts() {
    // El catálogo local siempre sale del código, para ver los cambios al momento
    return DEFAULT_PRODUCTS;
  },
  async getOrder(email) {
    return (await readLocal()).orders.find((o) => o.email === email) ?? null;
  },
  async saveOrder(input) {
    const db = await readLocal();
    const now = new Date().toISOString();
    const items = input.items.filter((i) => i.qty > 0);
    const existing = db.orders.find((o) => o.email === input.email);
    if (existing) {
      Object.assign(existing, { name: input.name, comment: input.comment || null, items, updated_at: now });
    } else {
      db.orders.push({
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        comment: input.comment || null,
        created_at: now,
        updated_at: now,
        items,
      });
    }
    await writeLocal(db);
  },
  async deleteOrder(email) {
    const db = await readLocal();
    db.orders = db.orders.filter((o) => o.email !== email);
    await writeLocal(db);
  },
  async listOrders() {
    return (await readLocal()).orders;
  },
};

/* ---------- Selección ---------- */

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  if (process.env.VERCEL) {
    throw new Error("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en las variables de entorno de Vercel");
  }
  console.warn("[pideanis] Sin variables de Supabase: usando .data/db.json (solo local)");
}

export const store: Store =
  url && key ? supabaseStore(createClient(url, key, { auth: { persistSession: false } })) : localStore;
