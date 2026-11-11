-- Pide Anís · esquema de Supabase
-- Pégalo entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez.

create extension if not exists pgcrypto;

-- Productos (precios editables desde Table Editor)
create table if not exists public.products (
  id        text primary key,
  name      text not null,
  subtitle  text,
  price     numeric(6,2) not null check (price >= 0),
  image     text,
  description text,
  theme     text not null default 'azul',  -- color de la cinta: azul, marron, caramelo
  sort      int not null default 0,
  active    boolean not null default true
);

-- Por si la tabla ya existía de una versión anterior
alter table public.products add column if not exists description text;
alter table public.products add column if not exists theme text not null default 'azul';

-- Un pedido por persona (email único)
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) between 2 and 80),
  email       text not null unique check (email = lower(email) and email like '%@%'),
  comment     text check (length(comment) <= 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.order_items (
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  text not null references public.products(id),
  qty         int  not null check (qty between 1 and 48),
  primary key (order_id, product_id)
);

-- Seguridad: RLS activado y SIN políticas → nadie puede leer ni escribir con la
-- clave pública (anon). La web accede solo desde el servidor con la service_role.
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Guardar pedido en una sola transacción (crea o actualiza y sustituye las líneas)
create or replace function public.save_order(
  p_name text, p_email text, p_comment text, p_items jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into orders (name, email, comment)
  values (trim(p_name), lower(trim(p_email)), nullif(trim(p_comment), ''))
  on conflict (email) do update
    set name = excluded.name,
        comment = excluded.comment,
        updated_at = now()
  returning id into v_id;

  delete from order_items where order_id = v_id;

  insert into order_items (order_id, product_id, qty)
  select v_id, (i->>'product_id')::text, (i->>'qty')::int
  from jsonb_array_elements(p_items) as i
  where (i->>'qty')::int > 0;

  return v_id;
end;
$$;

revoke all on function public.save_order(text, text, text, jsonb) from public, anon, authenticated;

-- Catálogo (precios redondeados a partir de anisaltamirano.com, noviembre de 2026).
-- Ojo: volver a ejecutar este bloque sobrescribe los cambios hechos a mano en estos productos.
insert into public.products (id, name, subtitle, price, image, description, theme, sort) values
  ('anis-seco', 'Anís Extra Seco', 'Bidestilado · 55º · 1 L', 15.00, '/img/anis-seco.jpg',
   'El anís más recio de la casa. Destilado dos veces con materias primas escogidas por el maestro destilador: seco, limpio y con mucho cuerpo. Para quien lo toma solo, con un poco de agua fresca o como «palomita».',
   'azul', 1),
  ('anis-dulce', 'Anís Dulce', 'Altamirano · 35º · 0,70 L', 10.00, '/img/anis-dulce.jpg',
   'El anís que ha distinguido a Altamirano desde sus inicios. Pronto se ganó fama de «digestivo» y es el preferido en Rute y su comarca. Suave y redondo: perfecto en la sobremesa y para acompañar los dulces de Navidad.',
   'azul', 2),
  ('crema-anisete', 'Crema de Anisete', 'Altamirano · 25º · 0,70 L', 10.00, '/img/crema-anisete.jpg',
   'Crema de anís de baja graduación, sedosa y de sabor intenso que dura en el paladar. Se disfruta sola, bien fría o con hielo. Una opción suave para quien encuentra el anís demasiado fuerte.',
   'azul', 3),
  ('rosoli', 'Rosoli de la Abuela', 'Licor de café · 16º · 0,70 L', 10.00, '/img/rosoli.jpg',
   'Licor tradicional de Rute hecho con receta de la abuela: los mejores cafés y canela macerados que dejan aromas y un sabor muy especiales. Se toma solo, con hielo o en combinados.',
   'marron', 4),
  ('ruteviejo', 'Ruteviejo', 'Crema de licor · 0,70 L', 10.00, '/img/ruteviejo.jpg',
   'Crema de licor de whisky, en la línea de un Baileys: suave, cremosa y pensada para alargar la sobremesa. Mejor bien fría o con hielo, y también va de lujo con el café o sobre un helado.',
   'caramelo', 5)
on conflict (id) do update set
  name = excluded.name, subtitle = excluded.subtitle, price = excluded.price, image = excluded.image,
  description = excluded.description, theme = excluded.theme, sort = excluded.sort;
