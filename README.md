# Pide Anís · encargo de licores

Web sencilla para que los compañeros encarguen licores Altamirano (0,70 L, salvo el Anís Extra Seco, que va en 1 L).
La estética imita el catálogo de la casa (cintas colgantes, letra rotulada, fondo de acuarela) y las fotos de las botellas salen del propio catálogo.

- Cada persona entra con **nombre + email** y elige cuántas botellas quiere.
- Con el mismo nombre y email puede **volver a entrar y cambiar** o anular su pedido.
- Los pedidos se **cierran solos el jueves 3 de diciembre de 2026 a las 15:00** (hora de Madrid).
  Pasada esa hora, cada persona puede ver su pedido pero no cambiarlo.
- Hay un comentario para pedir **otros productos del catálogo**; el precio se consulta y se confirma aparte.
- En **`/admin`** (con contraseña) ves el total por producto, el pedido de cada persona, los comentarios y puedes descargar un CSV.

Stack: Next.js 15 en Vercel + Postgres de Supabase.

---

## 1. Supabase (5 min)

1. Entra en <https://supabase.com> → **New project** (región *West EU*, por ejemplo). Apunta la contraseña de la base de datos aunque no la vas a necesitar aquí.
2. Ve a **SQL Editor → New query**, pega todo el contenido de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.
   Crea las tablas, la función `save_order` y los 5 productos con sus precios.
3. Ve a **Project Settings → API** y copia:
   - **Project URL** → será `SUPABASE_URL`
   - **service_role** (secret) → será `SUPABASE_SERVICE_ROLE_KEY`

> Las tablas tienen RLS activado y sin políticas: la clave pública no puede leer nada.
> Solo el servidor de Vercel, con la `service_role`, accede a los datos. **No pongas nunca esa clave en el navegador ni la compartas.**

### Cambiar precios o productos

En Supabase → **Table Editor → products** puedes editar `price`, `name`, `subtitle`, `description`, `theme` (color de la cinta: `azul`, `marron` o `caramelo`) o poner `active = false`
para ocultar un producto. Los cambios se ven al momento, sin volver a desplegar.

## 2. Vercel (5 min)

**Opción A · con GitHub (recomendado)**

1. Sube esta carpeta a un repositorio nuevo de GitHub (privado).
2. En <https://vercel.com/new> importa el repositorio. Vercel detecta Next.js solo.
3. Antes de desplegar, en **Environment Variables** añade:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | la Project URL de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | la clave `service_role` |
| `ADMIN_PASSWORD` | la contraseña que quieras para `/admin` |
| `SESSION_SECRET` | una cadena larga aleatoria (p. ej. de `openssl rand -hex 32` o un generador de contraseñas) |
| `CLOSE_AT` | `2026-12-03T15:00:00+01:00` (opcional, es el valor por defecto) |
| `SITE_URL` | opcional: solo si usas un dominio propio, p. ej. `https://anis.midominio.es` (para la imagen al compartir el enlace) |

4. **Deploy**. Comparte la URL `https://<tu-proyecto>.vercel.app` con los compañeros.

**Opción B · sin GitHub, desde la terminal**

```bash
npx vercel
```

Después añade las variables en Vercel → Project → Settings → Environment Variables y despliega a producción:

```bash
npx vercel --prod
```

### Ampliar o adelantar el cierre

Cambia `CLOSE_AT` en Vercel (Settings → Environment Variables) y vuelve a desplegar (Deployments → ⋯ → Redeploy).

## Desarrollo local

```bash
npm install
npm run dev
```

Sin variables de Supabase, la web guarda los pedidos en `.data/db.json` para poder probarla en local.
Crea `.env.local` con `ADMIN_PASSWORD` y `SESSION_SECRET` (ver `.env.example`).

## Precios (redondeados a partir de anisaltamirano.com, noviembre de 2026)

| Producto | Precio | Precio en la web |
|---|---|---|
| Anís Extra Seco Bidestilado 55º · 1 L | 15 € | 15,06 € |
| Anís Dulce 0,70 L | 10 € | 9,08 € |
| Crema de Anisete | 10 € | 9,68 € (la web la lista en 1 L) |
| Rosoli de la Abuela (licor de café) 0,70 L | 10 € | 9,68 € |
| Ruteviejo crema de licor 0,70 L | 10 € | 9,68 € |

## Otros productos del catálogo

En el pedido hay un campo de comentario para que cada persona pida algo del catálogo que no esté en la lista
(otro anís, pacharán, licor de hierbas, otro formato…). No suma al total: en `/admin` aparece un bloque
«Comentarios y encargos del catálogo» para que consultes el precio y se lo confirmes.
