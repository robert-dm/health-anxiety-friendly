import { getDb } from "../db/connection.js";

const adminRoles = new Set(["admin", "moderator"]);
const reviewStatuses = new Set(["pending", "published", "hidden", "removed"]);
const reportStatuses = new Set(["open", "reviewing", "resolved", "dismissed"]);
const suggestionStatuses = new Set(["pending", "published", "verified", "rejected"]);

export function canUseAdmin(user) {
  return Boolean(user && adminRoles.has(user.role));
}

export function getAdminDashboard() {
  const db = getDb();
  return {
    stats: {
      pendingReviews: db.prepare("select count(*) as count from reviews where status = 'pending'").get().count,
      openReports: db.prepare("select count(*) as count from reports where status in ('open', 'reviewing')").get().count,
      pendingSuggestions: db.prepare("select count(*) as count from profile_suggestions where status = 'pending'").get().count,
      publishedReviews: db.prepare("select count(*) as count from reviews where status = 'published'").get().count,
    },
    reviews: db
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
      .all(),
    suggestions: db
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
      .all()
      .map((row) => ({ ...row, payload: JSON.parse(row.payload_json) })),
    reports: db
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
      .all(),
  };
}

export function updateReviewStatus({ reviewId, status, moderatorId }) {
  if (!reviewStatuses.has(status)) return { ok: false, errors: ["Estado de review invalido."] };

  const result = getDb()
    .prepare("update reviews set status = ?, moderation_note = null, updated_at = ? where id = ?")
    .run(status, new Date().toISOString(), reviewId);

  if (!result.changes) return { ok: false, errors: ["No encontramos esa review."] };
  return { ok: true, moderatorId };
}

export function updateSuggestionStatus({ suggestionId, status, moderatorId }) {
  if (!suggestionStatuses.has(status)) return { ok: false, errors: ["Estado de propuesta invalido."] };

  const result = getDb()
    .prepare("update profile_suggestions set status = ?, reviewed_by = ?, reviewed_at = ? where id = ?")
    .run(status, moderatorId, new Date().toISOString(), suggestionId);

  if (!result.changes) return { ok: false, errors: ["No encontramos esa propuesta."] };
  return { ok: true };
}

export function updateReportStatus({ reportId, status, moderatorId }) {
  if (!reportStatuses.has(status)) return { ok: false, errors: ["Estado de reporte invalido."] };

  const handled = status === "resolved" || status === "dismissed";
  const result = getDb()
    .prepare("update reports set status = ?, handled_by = ?, handled_at = ? where id = ?")
    .run(status, handled ? moderatorId : null, handled ? new Date().toISOString() : null, reportId);

  if (!result.changes) return { ok: false, errors: ["No encontramos ese reporte."] };
  return { ok: true };
}
