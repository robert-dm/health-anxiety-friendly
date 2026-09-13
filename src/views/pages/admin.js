import { escapeHtml, formatRating } from "../html.js";

function emptyState(label) {
  return `<div class="card"><p class="muted">${escapeHtml(label)}</p></div>`;
}

function actionForm(action, id, options) {
  return `<form class="admin-actions" method="post" action="${action}">
    <input type="hidden" name="id" value="${escapeHtml(id)}">
    ${options.map(([status, label]) => `<button class="button secondary compact" type="submit" name="status" value="${status}">${label}</button>`).join("")}
  </form>`;
}

function reviewCard(review) {
  return `<article class="card admin-item">
    <div>
      <div class="meta">
        <span class="pill">${review.target_type === "professional" ? "Profesional" : "Centro"}</span>
        <span class="pill">${escapeHtml(review.status)}</span>
      </div>
      <h3>${escapeHtml(review.target_name || "Perfil no encontrado")}</h3>
      <p><strong>${formatRating(review.overall_rating)} / 5</strong> · ${escapeHtml(review.visit_type || "Tipo no informado")} · ${escapeHtml(review.approx_visit_month || "Fecha no informada")}</p>
      <p>${escapeHtml(review.comment || "Sin comentario libre.")}</p>
      <p class="muted">${escapeHtml(review.author_name || review.author_email)} · ${review.anonymous ? "publica como anonimo" : "publica con nombre visible"}</p>
    </div>
    ${actionForm("/admin/reviews/status", review.id, [
      ["published", "Publicar"],
      ["hidden", "Ocultar"],
      ["removed", "Remover"],
    ])}
  </article>`;
}

function suggestionCard(suggestion) {
  const payload = suggestion.payload;
  return `<article class="card admin-item">
    <div>
      <div class="meta">
        <span class="pill">${suggestion.target_type === "professional" ? "Profesional" : "Centro"}</span>
        <span class="pill">${escapeHtml(suggestion.status)}</span>
      </div>
      <h3>${escapeHtml(payload.name)}</h3>
      <p>${escapeHtml(payload.specialty || "Especialidad/tipo no informado")} · ${escapeHtml(payload.city || "Ciudad no informada")} ${payload.neighborhood ? `· ${escapeHtml(payload.neighborhood)}` : ""}</p>
      <p>${escapeHtml(payload.reason || "Sin motivo informado.")}</p>
      <p class="muted">${escapeHtml(suggestion.submitter_email)}</p>
    </div>
    ${actionForm("/admin/suggestions/status", suggestion.id, [
      ["published", "Publicar perfil comunitario"],
      ["rejected", "Rechazar"],
    ])}
  </article>`;
}

function reportCard(report) {
  return `<article class="card admin-item">
    <div>
      <div class="meta">
        <span class="pill">${escapeHtml(report.target_type)}</span>
        <span class="pill">${escapeHtml(report.status)}</span>
      </div>
      <h3>${escapeHtml(report.target_name || "Contenido reportado")}</h3>
      <p><strong>${escapeHtml(report.reason)}</strong></p>
      <p>${escapeHtml(report.details || "Sin detalle adicional.")}</p>
      <p class="muted">${escapeHtml(report.reporter_email)}</p>
    </div>
    ${actionForm("/admin/reports/status", report.id, [
      ["reviewing", "Revisando"],
      ["resolved", "Resolver"],
      ["dismissed", "Descartar"],
    ])}
  </article>`;
}

export function adminPage({ dashboard, errors = [] }) {
  return `<section class="section">
    <h1>Administracion</h1>
    ${errors.length ? `<div class="notice error">${errors.map((error) => `<p>${escapeHtml(error)}</p>`).join("")}</div>` : ""}
    <div class="result-grid">
      <article class="card"><h3>Reviews pendientes</h3><p class="score">${dashboard.stats.pendingReviews}</p></article>
      <article class="card"><h3>Reportes abiertos</h3><p class="score">${dashboard.stats.openReports}</p></article>
      <article class="card"><h3>Propuestas pendientes</h3><p class="score">${dashboard.stats.pendingSuggestions}</p></article>
      <article class="card"><h3>Reviews publicadas</h3><p class="score">${dashboard.stats.publishedReviews}</p></article>
    </div>
  </section>

  <section class="section">
    <div class="section-header"><h2>Experiencias para moderar</h2></div>
    <div class="admin-list">${dashboard.reviews.length ? dashboard.reviews.map(reviewCard).join("") : emptyState("No hay experiencias pendientes.")}</div>
  </section>

  <section class="section">
    <div class="section-header"><h2>Propuestas de perfiles</h2></div>
    <div class="admin-list">${dashboard.suggestions.length ? dashboard.suggestions.map(suggestionCard).join("") : emptyState("No hay propuestas pendientes.")}</div>
  </section>

  <section class="section">
    <div class="section-header"><h2>Reportes abiertos</h2></div>
    <div class="admin-list">${dashboard.reports.length ? dashboard.reports.map(reportCard).join("") : emptyState("No hay reportes abiertos.")}</div>
  </section>`;
}
