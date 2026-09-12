import { getDb } from "../db/connection.js";

function likeTerm(value) {
  return `%${String(value || "").trim()}%`;
}

export function getFeatured() {
  const db = getDb();
  const professionals = db
    .prepare(
      `
      select
        'professional' as type,
        p.id,
        p.slug,
        p.display_name as name,
        s.name as category,
        l.city,
        l.neighborhood,
        p.verification_status,
        prs.published_review_count,
        prs.overall_average,
        prs.anxiety_compatibility_average,
        prs.confidence_score
      from professionals p
      left join specialties s on s.id = p.primary_specialty_id
      left join locations l on l.id = p.location_id
      left join profile_rating_summaries prs on prs.professional_id = p.id
      where p.verification_status != 'suspended'
      order by prs.confidence_score desc, prs.published_review_count desc
      limit 3
    `,
    )
    .all();

  const facilities = db
    .prepare(
      `
      select
        'facility' as type,
        f.id,
        f.slug,
        f.name,
        f.facility_type as category,
        l.city,
        l.neighborhood,
        f.verification_status,
        prs.published_review_count,
        prs.overall_average,
        prs.anxiety_compatibility_average,
        prs.confidence_score
      from facilities f
      left join locations l on l.id = f.location_id
      left join profile_rating_summaries prs on prs.facility_id = f.id
      where f.verification_status != 'suspended'
      order by prs.confidence_score desc, prs.published_review_count desc
      limit 3
    `,
    )
    .all();

  return [...professionals, ...facilities].sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0)).slice(0, 4);
}

export function searchTargets({ q = "", where = "" }) {
  const db = getDb();
  const params = {
    query: likeTerm(q),
    location: likeTerm(where),
    hasQuery: q.trim() ? 1 : 0,
    hasLocation: where.trim() ? 1 : 0,
  };

  const professionals = db
    .prepare(
      `
      select
        'professional' as type,
        p.id,
        p.slug,
        p.display_name as name,
        s.name as category,
        l.city,
        l.zone,
        l.neighborhood,
        p.verification_status,
        prs.published_review_count,
        prs.overall_average,
        prs.anxiety_compatibility_average,
        prs.confidence_score
      from professionals p
      left join specialties s on s.id = p.primary_specialty_id
      left join locations l on l.id = p.location_id
      left join profile_rating_summaries prs on prs.professional_id = p.id
      where p.verification_status != 'suspended'
        and (:hasQuery = 0 or p.display_name like :query or s.name like :query or p.institution like :query)
        and (:hasLocation = 0 or l.city like :location or l.zone like :location or l.neighborhood like :location)
    `,
    )
    .all(params);

  const facilities = db
    .prepare(
      `
      select distinct
        'facility' as type,
        f.id,
        f.slug,
        f.name,
        f.facility_type as category,
        l.city,
        l.zone,
        l.neighborhood,
        f.verification_status,
        prs.published_review_count,
        prs.overall_average,
        prs.anxiety_compatibility_average,
        prs.confidence_score
      from facilities f
      left join locations l on l.id = f.location_id
      left join facility_study_types fst on fst.facility_id = f.id
      left join study_types st on st.id = fst.study_type_id
      left join profile_rating_summaries prs on prs.facility_id = f.id
      where f.verification_status != 'suspended'
        and (:hasQuery = 0 or f.name like :query or f.description like :query or st.name like :query)
        and (:hasLocation = 0 or l.city like :location or l.zone like :location or l.neighborhood like :location)
    `,
    )
    .all(params);

  return [...professionals, ...facilities].sort((a, b) => {
    const confidence = (b.confidence_score || 0) - (a.confidence_score || 0);
    if (confidence !== 0) return confidence;
    return (b.published_review_count || 0) - (a.published_review_count || 0);
  });
}
