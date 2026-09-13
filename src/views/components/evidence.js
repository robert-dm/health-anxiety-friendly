import { escapeHtml } from '../html.js';
import { evidenceLabels } from '../../domain/evidence.js';
export function evidencePills(item) {
  if (item.is_demo) return '';
  const kinds = [...new Set((item.evidence || []).map(row=>row.kind))];
  return `<div class="evidence-labels">${kinds.length ? kinds.map(kind=>`<span class="pill evidence-pill">${escapeHtml(evidenceLabels[kind] || 'Evidencia por revisar')}</span>`).join('') : '<span class="pill">Experiencia específica pendiente de revisión</span>'}</div>`;
}
export function evidenceDetails(item) {
  if (item.is_demo) return '';
  return `<section class="section card"><p class="eyebrow">EVIDENCIA PÚBLICA</p><h2>Qué sabemos sobre esta atención</h2>${evidencePills(item)}${(item.evidence || []).map(row=>{
    let url; try { const parsed = new URL(row.source_url); if (['http:','https:'].includes(parsed.protocol)) url=parsed.href; } catch {}
    return `<article class="evidence-detail"><h3>${escapeHtml(row.scope)}</h3><p>${escapeHtml(row.summary)}</p><p class="small">${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.source_title)} ↗</a>` : escapeHtml(row.source_title)} · Consultado: ${escapeHtml(row.reviewed_at)}</p></article>`;
  }).join('') || '<p>Todavía no revisamos evidencia específica de experiencia en TOC o adaptaciones para la ansiedad. El perfil conserva sus fuentes originales para consulta.</p>'}<p class="small muted">Estas etiquetas describen lo publicado por sus fuentes. No certifican el trato, la calidad médica ni una experiencia sin ansiedad. Las opiniones de pacientes aparecen por separado.</p></section>`;
}
