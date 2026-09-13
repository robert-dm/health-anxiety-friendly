import { evidencePills } from './evidence.js';
import { escapeHtml, formatRating, locationLabel } from "../html.js";
import { minimumReviews } from "../../domain/ratings.js";
export function statusPill(status, isDemo = false) {
  if (isDemo) return `<span class="pill">Perfil de ejemplo</span>`;
  if (status === "verified") return `<span class="pill verified">Datos básicos comprobados</span>`;
  if (status === "claimed") return `<span class="pill">Perfil reclamado</span>`;
  if (status === "community") return `<span class="pill community">Agregado por la comunidad</span>`;
  return `<span class="pill">Datos básicos por completar</span>`;
}
export function categoryLabel(value) { return ({diagnostic_center:'Centro de diagnóstico',clinic:'Clínica',lab:'Laboratorio',hospital:'Hospital',other:'Centro de salud'})[value] || value || 'Especialidad no informada'; }
export function ratingSummary(item) {
  const count = item.published_review_count || 0;
  if (item.is_demo) return `<p class="demo-notice">Perfil ficticio para explorar el sitio. No corresponde a una recomendación real.</p>`;
  if (!count) return `<p class="data-note">Todavía sin experiencias publicadas.</p>`;
  if (count < minimumReviews) return `<p class="data-note">${count} experiencia${count === 1 ? '' : 's'} · Aún no mostramos un promedio: hay pocas valoraciones.</p>`;
  return `<div class="meta"><span class="score">${formatRating(item.overall_average)} / 5 en trato general</span><span>${count} experiencias</span></div><p class="data-note">Comunicación y atención de la ansiedad: ${formatRating(item.anxiety_compatibility_average)}${item.anxiety_compatibility_average == null ? '' : ' / 5'}. Opiniones de pacientes.</p>`;
}
export function targetCard(item) {
  const path = item.type === 'professional' ? `/profesionales/${encodeURIComponent(item.slug)}` : `/centros/${encodeURIComponent(item.slug)}`;
  return `<article class="card result-card"><div><div class="meta"><span class="pill">${item.type === 'professional' ? 'Profesional' : escapeHtml(categoryLabel(item.category))}</span>${statusPill(item.verification_status, item.is_demo)}</div><h3><a href="${path}">${escapeHtml(item.name)}</a></h3><p>${escapeHtml(categoryLabel(item.specialty_names || item.category))} · ${escapeHtml(locationLabel(item))}</p>${evidencePills(item)}${ratingSummary(item)}</div><a class="button secondary" href="${path}" aria-label="Ver perfil de ${escapeHtml(item.name)}">Ver perfil ↗</a></article>`;
}
