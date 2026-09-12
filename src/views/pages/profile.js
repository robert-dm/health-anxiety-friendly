import { statusPill } from "../components/cards.js";
import { escapeHtml, formatRating, locationLabel } from "../html.js";

function reviewsList(reviews) {
  if (!reviews.length) {
    return `<div class="card"><p>Todavia no hay experiencias publicadas.</p></div>`;
  }

  return `<div class="reviews">
    ${reviews
      .map((review) => {
        const author = review.anonymous ? review.anonymous_name : review.display_name || "Usuario";
        return `<article class="review">
          <div class="meta">
            <span class="score">${formatRating(review.overall_rating)} / 5</span>
            <span>${escapeHtml(review.visit_type || "Tipo de consulta no informado")}</span>
            <span>${escapeHtml(review.approx_visit_month || "Fecha aproximada no informada")}</span>
          </div>
          <p>${escapeHtml(review.comment || "Sin comentario libre.")}</p>
          <p class="muted">${escapeHtml(author)} · ${review.helpful_count || 0} personas la marcaron util</p>
        </article>`;
      })
      .join("")}
  </div>`;
}

export function professionalPage({ professional }) {
  return `<section class="section profile-grid">
    <article>
      <div class="meta">${statusPill(professional.verification_status)}</div>
      <h1>${escapeHtml(professional.display_name)}</h1>
      <p>${escapeHtml(professional.specialty_name || "Especialidad no informada")} · ${escapeHtml(locationLabel(professional))}</p>
      <p>${escapeHtml(professional.bio || "")}</p>
      <div class="disclaimer">Estas puntuaciones representan experiencias de usuarios y no constituyen una evaluacion de la calidad medica del profesional.</div>
    </article>
    <aside class="card">
      <h2>Compatibilidad</h2>
      <p><span class="score">${formatRating(professional.anxiety_compatibility_average)} / 5</span></p>
      <p>${professional.published_review_count || 0} experiencias publicadas</p>
      ${(professional.published_review_count || 0) < 6 ? `<p class="muted">Muestra pequena: interpretar con cautela.</p>` : ""}
      <a class="button" href="/review/profesional/${professional.id}">Compartir experiencia</a>
    </aside>
  </section>

  <section class="section profile-grid">
    <article class="card">
      <h2>Informacion profesional</h2>
      <p><strong>Institucion:</strong> ${escapeHtml(professional.institution || "No informada")}</p>
      <p><strong>Ubicacion:</strong> ${escapeHtml(professional.address_public || locationLabel(professional))}</p>
      <p><strong>Fuente:</strong> ${escapeHtml(professional.source_notes || "No informada")}</p>
    </article>
    <aside class="card">
      <h2>Valoraciones especificas</h2>
      <p>Escucha, comunicacion clara, evita alarmismo, respeta limites y manejo de incertidumbre.</p>
    </aside>
  </section>

  <section class="section">
    <div class="section-header">
      <h2>Experiencias</h2>
      <a href="/review/profesional/${professional.id}">Escribir experiencia</a>
    </div>
    ${reviewsList(professional.reviews)}
  </section>`;
}

export function facilityPage({ facility }) {
  const studyTypes = facility.studyTypes.map((item) => item.name).join(" · ");

  return `<section class="section profile-grid">
    <article>
      <div class="meta">${statusPill(facility.verification_status)}</div>
      <h1>${escapeHtml(facility.name)}</h1>
      <p>${escapeHtml(studyTypes || "Tipos de estudio no informados")} · ${escapeHtml(locationLabel(facility))}</p>
      <p>${escapeHtml(facility.description || "")}</p>
      <div class="disclaimer">Las experiencias describen comunicacion, trato y preferencias durante estudios. No reemplazan informacion medica ni administrativa actualizada.</div>
    </article>
    <aside class="card">
      <h2>Compatibilidad</h2>
      <p><span class="score">${formatRating(facility.anxiety_compatibility_average)} / 5</span></p>
      <p>${facility.published_review_count || 0} experiencias publicadas</p>
      ${(facility.published_review_count || 0) < 6 ? `<p class="muted">Muestra pequena: interpretar con cautela.</p>` : ""}
      <a class="button" href="/review/centro/${facility.id}">Compartir experiencia</a>
    </aside>
  </section>

  <section class="section profile-grid">
    <article class="card">
      <h2>Informacion del centro</h2>
      <p><strong>Tipo:</strong> ${escapeHtml(facility.facility_type)}</p>
      <p><strong>Ubicacion:</strong> ${escapeHtml(facility.address_public || locationLabel(facility))}</p>
      <p><strong>Fuente:</strong> ${escapeHtml(facility.source_notes || "No informada")}</p>
    </article>
    <aside class="card">
      <h2>Aspectos evaluados</h2>
      <p>Trato, preferencias de comunicacion, comentarios durante el estudio, organizacion y claridad administrativa.</p>
    </aside>
  </section>

  <section class="section">
    <div class="section-header">
      <h2>Experiencias</h2>
      <a href="/review/centro/${facility.id}">Escribir experiencia</a>
    </div>
    ${reviewsList(facility.reviews)}
  </section>`;
}
