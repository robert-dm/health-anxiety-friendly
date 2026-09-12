import { escapeHtml, formatRating, locationLabel } from "../html.js";

export function statusPill(status) {
  if (status === "verified") return `<span class="pill verified">Informacion verificada</span>`;
  if (status === "claimed") return `<span class="pill verified">Perfil reclamado</span>`;
  if (status === "community") return `<span class="pill community">Agregado por la comunidad</span>`;
  return `<span class="pill">Informacion incompleta</span>`;
}

export function targetCard(item) {
  const path = item.type === "professional" ? `/profesionales/${item.slug}` : `/centros/${item.slug}`;
  const type = item.type === "professional" ? "Profesional" : "Centro";
  const count = item.published_review_count || 0;
  const sample = count < 6 ? `<span class="pill">Pocas experiencias</span>` : "";

  return `<article class="card result-card">
    <div>
      <div class="meta">
        <span class="pill">${type}</span>
        ${statusPill(item.verification_status)}
        ${sample}
      </div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.category || "Categoria no informada")} · ${escapeHtml(locationLabel(item))}</p>
      <div class="meta">
        <span class="score">${formatRating(item.overall_average)} / 5</span>
        <span>${formatRating(item.anxiety_compatibility_average)} compatibilidad</span>
        <span>${count} experiencias</span>
      </div>
    </div>
    <a class="button secondary" href="${path}">Ver perfil</a>
  </article>`;
}
