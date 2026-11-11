"use client";

import { useActionState } from "react";
import { adminLogin } from "./actions";

export default function AdminLogin() {
  const [error, action, pending] = useActionState(adminLogin, undefined);
  return (
    <section className="card narrow">
      <h2>Panel del organizador</h2>
      <form action={action} className="form">
        <label>
          Contraseña
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && <p className="msg error">{error}</p>}
        <button className="btn" disabled={pending}>Entrar</button>
      </form>
    </section>
  );
}
