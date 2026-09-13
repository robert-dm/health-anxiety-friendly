import { runBatch } from "../db/batch.js";
import crypto from "node:crypto";
import { getDb } from "../db/connection.js";

const professionalScores = [
  "listening",
  "respect",
  "clear_communication",
  "non_alarmist",
  "avoids_reassurance_seeking",
  "respects_limits",
  "rational_tests",
  "uncertainty_support",
  "understands_health_anxiety",
];

const facilityScores = [
  "staff_respect",
  "communication_preferences",
  "no_unrequested_findings",
  "avoids_speculation",
  "low_anxiety_procedure",
  "organization",
  "overall_experience",
];

const findingFrequencies = new Set(["never", "almost_never", "sometimes", "frequently", "always", ""]);

function scoreValue(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 5 ? number : null;
}

function clean(value, max = 1200) {
  return String(value || "").trim().slice(0, max);
}

export async function getReviewTarget(type, id) {
  const db = getDb();
  if (type === "professional") {
    const target = (await db
      .prepare(
        `
        select p.id, p.display_name as name, s.name as subtitle
        from professionals p
        left join specialties s on s.id = p.primary_specialty_id
        where p.id = ? and p.verification_status != 'suspended' and p.is_demo = 0
      `,
      )
      .get(id));
    return target ? { ...target, type } : null;
  }

  if (type === "facility") {
    const target = (await db
      .prepare("select id, name, facility_type as subtitle from facilities where id = ? and verification_status != 'suspended' and is_demo = 0")
      .get(id));
    return target ? { ...target, type } : null;
  }

  return null;
}

export async function createReview({ userId, targetType, targetId, form }) {
  const target = await getReviewTarget(targetType, targetId);
  const scoreKeys = targetType === "professional" ? professionalScores : facilityScores;
  const errors = [];

  if (!target) errors.push("No encontramos el perfil para esta experiencia.");

  const overallRating = scoreValue(form.overall_rating);
  if (!overallRating) errors.push("Indica una experiencia general entre 1 y 5.");

  const scores = scoreKeys.map((key) => [key, scoreValue(form[key])]);
  if (scores.some(([, value]) => !value)) errors.push("Completa todas las valoraciones especificas.");

  const comment = String(form.comment || "").trim();
  if (comment.length > 1600) errors.push("El comentario es demasiado largo.");

  const visitType = clean(form.visit_type, 120);
  const approxVisitMonth = clean(form.approx_visit_month, 20);
  if (approxVisitMonth && (!/^\d{4}-(0[1-9]|1[0-2])$/.test(approxVisitMonth) || approxVisitMonth > new Date().toISOString().slice(0, 7))) errors.push("Indicá un mes válido que no sea futuro.");
  const anonymous = form.anonymous === "yes" ? 1 : 0;
  const findingFrequency = clean(form.commented_findings_frequency, 40);

  if (targetType === "facility" && !findingFrequencies.has(findingFrequency)) {
    errors.push("La respuesta sobre comentarios durante el estudio no es valida.");
  }

  if (errors.length) return { ok: false, errors };

  const db = getDb();
  const now = new Date().toISOString();
  const reviewId = crypto.randomUUID();

  const statements = [{
    sql: "insert into reviews (id,author_id,professional_id,facility_id,overall_rating,visit_type,approx_visit_month,comment,anonymous,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,'pending',?,?)",
    params: [reviewId,userId,targetType === 'professional' ? targetId : null,targetType === 'facility' ? targetId : null,overallRating,visitType || null,approxVisitMonth || null,comment || null,anonymous,now,now]
  }];
  for (const [key,value] of scores) statements.push({sql:"insert into review_scores (id,review_id,score_key,score_value) values (?,?,?,?)",params:[crypto.randomUUID(),reviewId,key,value]});
  if (targetType === 'facility') statements.push({sql:"insert into facility_review_answers (review_id,commented_findings_frequency,preference_requested,preference_respected) values (?,?,?,?)",params:[reviewId,findingFrequency || null,form.preference_requested === 'yes' ? 1 : form.preference_requested === 'no' ? 0 : null,form.preference_respected === 'yes' ? 1 : form.preference_respected === 'no' ? 0 : null]});
  await runBatch(db,statements);
  return {ok:true,reviewId};
}

export async function getUserReviews(userId) {
  return (await getDb()
    .prepare(
      `
      select
        r.id,
        r.overall_rating,
        r.status,
        r.created_at,
        coalesce(p.display_name, f.name) as target_name,
        case when r.professional_id is not null then 'professional' else 'facility' end as target_type
      from reviews r
      left join professionals p on p.id = r.professional_id
      left join facilities f on f.id = r.facility_id
      where r.author_id = ?
      order by r.created_at desc
      limit 20
    `,
    )
    .all(userId));
}
