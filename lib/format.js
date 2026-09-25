const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const WEEKDAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Every date in this app is handled as a UTC "wall clock" value on purpose:
// slots are built with Date.UTC(...) in lib/schedule.js and read back with
// the UTC getters below, so the displayed time is the same no matter which
// timezone the Vercel function or the visitor's browser happens to be in.
export function formatDate(dateLike) {
  const d = new Date(dateLike);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatTime(dateLike) {
  const d = new Date(dateLike);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatDayLabel(dateLike) {
  const d = new Date(dateLike);
  return `${WEEKDAYS_SHORT[d.getUTCDay()]} ${formatDate(d)}`;
}

export function weekdayName(dateLike) {
  return WEEKDAYS[new Date(dateLike).getUTCDay()];
}

const ACCENTS = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n", ü: "u" };

export function slugify(name) {
  return name
    .toLowerCase()
    .split("")
    .map((c) => ACCENTS[c] || c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
