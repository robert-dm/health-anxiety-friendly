import { escapeHtml } from "../html.js";

const statusLabels = {
  pending: "En revision",
  published: "Publicado",
  verified: "Verificado",
  rejected: "Rechazado",
};

export function accountPage({ user, suggestions, reviews }) {
  return `<section class="section">
    <div class="section-header">
      <div>
        <h1>Mi actividad</h1>
        <p>${escapeHtml(user.display_name || user.anonymous_name)} · ${escapeHtml(user.email)}</p>
      </div>
      <form method="post" action="/salir"><button class="button secondary" type="submit">Salir</button></form>
    </div>
  </section>

  <section class="section profile-grid">
    <article class="card">
      <h2>Mis propuestas</h2>
      ${
        suggestions.length
          ? `<div class="list">${suggestions
              .map(
                (suggestion) => `<div class="list-row">
                  <strong>${escapeHtml(suggestion.payload.name)}</strong>
                  <span>${escapeHtml(suggestion.target_type === "professional" ? "Profesional" : "Centro")} · ${escapeHtml(statusLabels[suggestion.status] || suggestion.status)}</span>
                </div>`,
              )
              .join("")}</div>`
          : `<p class="muted">Todavia no enviaste propuestas.</p>`
      }
    </article>
    <aside class="card">
      <h2>Mis experiencias</h2>
      ${
        reviews.length
          ? `<div class="list">${reviews
              .map(
                (review) => `<div class="list-row">
                  <strong>${escapeHtml(review.target_name)}</strong>
                  <span>${escapeHtml(review.target_type === "professional" ? "Profesional" : "Centro")} · ${escapeHtml(statusLabels[review.status] || review.status)} · ${review.overall_rating} / 5</span>
                </div>`,
              )
              .join("")}</div>`
          : `<p class="muted">Todavia no compartiste experiencias.</p>`
      }
    </aside>
  </section>

  <section class="section">
    <div class="disclaimer">Cuando publiques una experiencia podras mostrarla como ${escapeHtml(user.anonymous_name)}. Las experiencias nuevas quedan en revision antes de publicarse.</div>
  </section>`;
}
