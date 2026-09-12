const escapeMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => escapeMap[character]);
}

export function formatRating(value) {
  if (value === null || value === undefined) return "Sin datos";
  return Number(value).toFixed(1).replace(".", ",");
}

export function locationLabel(item) {
  return [item.neighborhood, item.city].filter(Boolean).join(", ") || item.city || "Ubicacion no informada";
}
