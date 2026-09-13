import { runBatch } from "../db/batch.js";
import crypto from "node:crypto";
import { getDb } from "../db/connection.js";

const adminRoles = new Set(["admin", "moderator"]);
const reviewStatuses = new Set(["pending", "published", "hidden", "removed"]);
const reportStatuses = new Set(["open", "reviewing", "resolved", "dismissed"]);
const suggestionStatuses = new Set(["pending", "published", "verified", "rejected"]);

export function canUseAdmin(user) {
  return Boolean(user && adminRoles.has(user.role));
}

export async function getAdminDashboard() {
  const db = getDb();
  return {
    stats: {
      pendingReviews: (await db.prepare("select count(*) as count from reviews where status = 'pending'").get()).count,
      openReports: (await db.prepare("select count(*) as count from reports where status in ('open', 'reviewing')").get()).count,
      pendingSuggestions: (await db.prepare("select count(*) as count from profile_suggestions where status = 'pending'").get()).count,
      publishedReviews: (await db.prepare("select count(*) as count from reviews where status = 'published'").get()).count,
    },
    reviews: (await db
      .prepare(
        `
        select
          r.id,
          r.overall_rating,
          r.visit_type,
          r.approx_visit_month,
          r.comment,
          r.anonymous,
          r.status,
          r.created_at,
          u.email as author_email,
          u.display_name as author_name,
          coalesce(p.display_name, f.name) as target_name,
          case when r.professional_id is not null then 'professional' else 'facility' end as target_type
        from reviews r
        join users u on u.id = r.author_id
        left join professionals p on p.id = r.professional_id
        left join facilities f on f.id = r.facility_id
        where r.status in ('pending', 'hidden')
        order by r.created_at asc
        limit 30
      `,
      )
      .all()),
    suggestions: (await db
      .prepare(
        `
        select ps.id, ps.target_type, ps.payload_json, ps.status, ps.created_at, u.email as submitter_email
        from profile_suggestions ps
        join users u on u.id = ps.submitted_by
        where ps.status = 'pending'
        order by ps.created_at asc
        limit 30
      `,
      )
      .all())
      .map((row) => ({ ...row, payload: JSON.parse(row.payload_json) })),
    reports: (await db
      .prepare(
        `
        select
          rp.id,
          rp.reason,
          rp.details,
          rp.status,
          rp.created_at,
          u.email as reporter_email,
          coalesce(p.display_name, f.name, 'Review') as target_name,
          case
            when rp.review_id is not null then 'review'
            when rp.professional_id is not null then 'professional'
            else 'facility'
          end as target_type
        from reports rp
        join users u on u.id = rp.reporter_id
        left join reviews r on r.id = rp.review_id
        left join professionals p on p.id = coalesce(r.professional_id, rp.professional_id)
        left join facilities f on f.id = coalesce(r.facility_id, rp.facility_id)
        where rp.status in ('open', 'reviewing')
        order by rp.created_at asc
        limit 30
      `,
      )
      .all()),
  };
}

export async function updateReviewStatus({ reviewId, status, moderatorId }) {
  if (!reviewStatuses.has(status)) return { ok: false, errors: ["Estado de review invalido."] };

  const result = (await getDb()
    .prepare("update reviews set status = ?, moderation_note = null, updated_at = ? where id = ?")
    .run(status, new Date().toISOString(), reviewId));

  if (!result.changes) return { ok: false, errors: ["No encontramos esa review."] };
  return { ok: true, moderatorId };
}

export async function updateSuggestionStatus({ suggestionId, status, moderatorId }) {
  if (!suggestionStatuses.has(status)) return { ok:false, errors:["Estado de propuesta inválido."] };
  const db = getDb();
  const proposal = (await db.prepare("select * from profile_suggestions where id = ?").get(suggestionId));
  if (!proposal) return { ok:false, errors:["No encontramos esa propuesta."] };
  // Verification requires a separate evidence review; publishing never certifies a profile.
  if (status === 'verified') return { ok:false, errors:["La verificación requiere comprobar y registrar fuentes. Publicá primero el perfil como comunitario."] };
  if (proposal.status !== 'pending') return { ok:false, errors:["Esta propuesta ya fue revisada."] };
  const payload = JSON.parse(proposal.payload_json);
  const now = new Date().toISOString();
  const statements = [];
  let professionalId = null, facilityId = null;
  const gate = "exists (select 1 from profile_suggestions where id = ? and status = 'pending')";
  if (status === 'published') {
    if (!['professional','facility'].includes(proposal.target_type)) return {ok:false,errors:['Tipo de propuesta inválido.']};
    const locationId = crypto.randomUUID(), id = crypto.randomUUID();
    const slug = payload.name.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + id;
    statements.push({sql:`insert into locations (id,country_code,city,neighborhood) select ?,'AR',?,? where ${gate}`,params:[locationId,payload.city || 'No informada',payload.neighborhood || null,suggestionId]});
    if (proposal.target_type === 'professional') {
      professionalId = id;
      const specialtyName = payload.specialty || 'Especialidad pendiente';
      const specialtyId = crypto.randomUUID();
      const normalizedSpecialty = specialtyName.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
      const category = /psicolog|psiquiatr/.test(normalizedSpecialty) ? 'mental_health' : /cardiolog|clinica|dermatolog|gastroenterolog|neurolog|endocrinolog|otorrinolaringolog|oftalmolog|pediatr|traumatolog|ginecolog|urolog/.test(normalizedSpecialty) ? 'medical' : 'other';
      statements.push({sql:`insert into specialties (id,name,slug,category) select ?,?,?,? where ${gate} and not exists (select 1 from specialties where lower(name)=lower(?))`,params:[specialtyId,specialtyName,'especialidad-'+specialtyId,category,suggestionId,specialtyName]});
      statements.push({sql:`insert into professionals (id,slug,display_name,primary_specialty_id,institution,location_id,address_public,website_url,public_phone,verification_status,source_notes,created_by,created_at,updated_at) select ?,?,?,(select id from specialties where lower(name)=lower(?) limit 1),?,?,?,?,?,'community',?,?,?,? where ${gate}`,params:[id,slug,payload.name,specialtyName,payload.institution || null,locationId,payload.address_public || null,payload.website_url || null,payload.public_phone || null,'Propuesta de la comunidad. Datos básicos pendientes de verificación.',proposal.submitted_by,now,now,suggestionId]});
    } else {
      facilityId = id;
      statements.push({sql:`insert into facilities (id,slug,name,facility_type,location_id,address_public,website_url,public_phone,verification_status,source_notes,created_by,created_at,updated_at) select ?,?,?,'other',?,?,?,?,'community',?,?,?,? where ${gate}`,params:[id,slug,payload.name,locationId,payload.address_public || null,payload.website_url || null,payload.public_phone || null,'Propuesta de la comunidad. Datos básicos pendientes de verificación.',proposal.submitted_by,now,now,suggestionId]});
      if (payload.specialty) {
        const studyId = crypto.randomUUID();
        statements.push({sql:`insert into study_types (id,name,slug) select ?,?,? where ${gate} and not exists (select 1 from study_types where lower(name)=lower(?))`,params:[studyId,payload.specialty,'estudio-'+studyId,suggestionId,payload.specialty]});
        statements.push({sql:`insert into facility_study_types (facility_id,study_type_id) select ?, (select id from study_types where lower(name)=lower(?) limit 1) where ${gate}`,params:[id,payload.specialty,suggestionId]});
      }
    }
  }
  statements.push({sql:"update profile_suggestions set status=?,professional_id=?,facility_id=?,reviewed_by=?,reviewed_at=? where id=? and status='pending'",params:[status,professionalId,facilityId,moderatorId,now,suggestionId]});
  const results = await runBatch(db,statements);
  const last = results.at(-1);
  if (!(last.changes ?? last.meta?.changes)) return {ok:false,errors:['Esta propuesta ya fue revisada.']};
  return {ok:true};
}

export async function updateReportStatus({ reportId, status, moderatorId }) {
  if (!reportStatuses.has(status)) return { ok: false, errors: ["Estado de reporte invalido."] };

  const handled = status === "resolved" || status === "dismissed";
  const result = (await getDb()
    .prepare("update reports set status = ?, handled_by = ?, handled_at = ? where id = ?")
    .run(status, handled ? moderatorId : null, handled ? new Date().toISOString() : null, reportId));

  if (!result.changes) return { ok: false, errors: ["No encontramos ese reporte."] };
  return { ok: true };
}
