import { getDb } from "../db/connection.js";
export const minimumReviews = 6;
export async function getRatingSummary({ professionalId = null, facilityId = null }) {
  const db = getDb();
  const params = { professionalId, facilityId };
  const filter = `r.status = 'published' and (($professionalId is not null and r.professional_id = $professionalId) or ($facilityId is not null and r.facility_id = $facilityId))`;
  const general = (await db.prepare(`select count(*) as published_review_count, avg(r.overall_rating) as overall_average from reviews r where ${filter}`).get(params));
  const scores = (await db.prepare(`select rs.score_key, avg(rs.score_value) as average from review_scores rs join reviews r on r.id = rs.review_id where ${filter} group by rs.score_key`).all(params));
  const compatibility = scores.length ? scores.reduce((sum, item) => sum + item.average, 0) / scores.length : null;
  return { ...general, anxiety_compatibility_average: compatibility, score_breakdown_json: JSON.stringify(Object.fromEntries(scores.map(item => [item.score_key, item.average]))), confidence_score: general.published_review_count / (general.published_review_count + minimumReviews) };
}
