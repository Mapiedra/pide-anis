// Fecha de cierre: jueves 3 de diciembre de 2026 a las 15:00 (hora de Madrid)
export const CLOSE_AT = new Date(process.env.CLOSE_AT || "2026-12-03T15:00:00+01:00");

export function isClosed(now = new Date()) {
  return now.getTime() >= CLOSE_AT.getTime();
}

export const CLOSE_LABEL = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
}).format(CLOSE_AT);

export const MAX_QTY = 48;

export function euros(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

export function normalizeName(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
