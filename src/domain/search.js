import { getDb } from "../db/connection.js";
import { getRatingSummary } from "./ratings.js";

export function normalizeSearch(value) {
  return String(value || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}
function terms(value) {
  return normalizeSearch(value).split(/\s+/).filter(Boolean).map(word => ({ psicologo:"psicolog", psicologa:"psicolog", cardiologo:"cardiolog", cardiologa:"cardiolog", psiquiatra:"psiquiatr", medico:"medic" }[word] || word));
}
export async function searchTargets({ q = "", where = "", tipo = "", categoria = "", modalidad = "", verificado = false } = {}) {
  const db = getDb();
  const professionals = tipo === "centros" ? [] : (await db.prepare(`select 'professional' as type, p.id, p.slug, p.display_name as name, s.name as category, s.category as specialty_category, p.bio as description, p.institution, p.care_modes, p.is_demo, p.verification_status, l.city, l.zone, l.neighborhood from professionals p left join specialties s on s.id = p.primary_specialty_id left join locations l on l.id = p.location_id where p.verification_status != 'suspended'`).all());
  const facilities = tipo === "profesionales" || categoria || modalidad ? [] : (await db.prepare(`select 'facility' as type, f.id, f.slug, f.name, f.facility_type as category, f.description, f.is_demo, f.verification_status, l.city, l.zone, l.neighborhood, (select group_concat(st.name, ' ') from facility_study_types fst join study_types st on st.id = fst.study_type_id where fst.facility_id = f.id) as studies from facilities f left join locations l on l.id = f.location_id where f.verification_status != 'suspended'`).all());
  const queryTerms = terms(q), locationTerms = terms(where);
  const matches = [...professionals, ...facilities].filter(item => {
    const content = normalizeSearch([item.name, item.category, item.description, item.institution, item.studies].filter(Boolean).join(' '));
    const location = normalizeSearch([item.city, item.zone, item.neighborhood].filter(Boolean).join(' '));
    return queryTerms.every(term => content.includes(term)) && locationTerms.every(term => location.includes(term)) && (!categoria || item.specialty_category === categoria) && (!modalidad || JSON.parse(item.care_modes || '[]').includes(modalidad)) && (!verificado || (!item.is_demo && item.verification_status === 'verified'));
  });
  return (await Promise.all(matches.map(async item => ({ ...item, ...await getRatingSummary(item.type === 'professional' ? {professionalId:item.id} : {facilityId:item.id}) })))).sort((a,b) => a.is_demo-b.is_demo || b.published_review_count-a.published_review_count || a.name.localeCompare(b.name, 'es'));
}
export async function getFeatured() { return (await searchTargets()).slice(0, 4); }
