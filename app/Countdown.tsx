"use client";

import { useEffect, useState } from "react";

function left(ms: number) {
  if (ms <= 0) return "cerrado";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (d > 0) return `quedan ${d} d ${h} h`;
  if (h > 0) return `quedan ${h} h ${m} min`;
  return `quedan ${m} min`;
}

export default function Countdown({ closeAt }: { closeAt: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const t = new Date(closeAt).getTime();
    const tick = () => setText(left(t - Date.now()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [closeAt]);
  return text ? <span className="countdown">{text}</span> : null;
}
