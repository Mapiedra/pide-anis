"use client";

import { useActionState } from "react";
import { identify } from "./actions";

export default function IdentifyForm({ closed }: { closed: boolean }) {
  const [state, action, pending] = useActionState(identify, undefined);
  return (
    <form action={action} className="form">
      <label>
        Nombre y apellido
        <input name="name" key={`n-${state?.name}`} defaultValue={state?.name} autoComplete="name" required minLength={2} maxLength={80} placeholder="Ana García" />
      </label>
      <label>
        Email
        <input name="email" key={`e-${state?.email}`} defaultValue={state?.email} type="email" autoComplete="email" required placeholder="ana@empresa.com" />
      </label>
      {state?.error && <p className="msg error">{state.error}</p>}
      <button className="btn" disabled={pending}>
        {pending ? "Entrando…" : closed ? "Ver mi pedido" : "Continuar"}
      </button>
    </form>
  );
}
