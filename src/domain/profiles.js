import { getDb } from "../db/connection.js";

export function getProfessionalBySlug(slug) {
  const db = getDb();
  const professional = db
    .prepare(
      `
      select
        p.*,
        s.name as specialty_name,
        l.city,
        l.zone,
        l.neighborhood,
        prs.published_review_count,
        prs.overall_average,
        prs.anxiety_compatibility_average,
        prs.confidence_score,
        prs.score_breakdown_json
      from professionals p
      left join specialties s on s.id = p.primary_specialty_id
      left join locations l on l.id = p.location_id
      left join profile_rating_summaries prs on prs.professional_id = p.id
      where p.slug = ? and p.verification_status != 'suspended'
    `,
    )
    .get(slug);

  if (!professional) return null;
  professional.reviews = getReviews({ professionalId: professional.id });
  return professional;
}

export function getFacilityBySlug(slug) {
  const db = getDb();
  const facility = db
    .prepare(
      `
      select
        f.*,
        l.city,
        l.zone,
        l.neighborhood,
        prs.published_review_count,
        prs.overall_average,
        prs.anxiety_compatibility_average,
        prs.confidence_score,
        prs.score_breakdown_json
      from facilities f
      left join locations l on l.id = f.location_id
      left join profile_rating_summaries prs on prs.facility_id = f.id
      where f.slug = ? and f.verification_status != 'suspended'
    `,
    )
    .get(slug);

  if (!facility) return null;
  facility.studyTypes = db
    .prepare(
      `
      select st.name
      from facility_study_types fst
      join study_types st on st.id = fst.study_type_id
      where fst.facility_id = ?
      order by st.name
    `,
    )
    .all(facility.id);
  facility.reviews = getReviews({ facilityId: facility.id });
  return facility;
}

function getReviews({ professionalId = null, facilityId = null }) {
  const db = getDb();
  return db
    .prepare(
      `
      select
        r.id,
        r.overall_rating,
        r.visit_type,
        r.approx_visit_month,
        r.comment,
        r.anonymous,
        r.helpful_count,
        u.display_name,
        u.anonymous_name
      from reviews r
      join users u on u.id = r.author_id
      where r.status = 'published'
        and (($professionalId is not null and r.professional_id = $professionalId)
          or ($facilityId is not null and r.facility_id = $facilityId))
      order by r.created_at desc
      limit 10
    `,
    )
    .all({ professionalId, facilityId });
}
