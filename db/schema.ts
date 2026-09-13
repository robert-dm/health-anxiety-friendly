import { sqliteTable, text, integer, real, primaryKey, uniqueIndex, index, check } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  password_hash: text("password_hash").notNull(),
  display_name: text("display_name"),
  anonymous_name: text("anonymous_name").notNull(),
  role: text("role").notNull().default(sql`'user'`),
  status: text("status").notNull().default(sql`'active'`),
  reputation_score: real("reputation_score").notNull().default(sql`0`),
  community_guidelines_accepted_at: text("community_guidelines_accepted_at"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("users_email_unique").on(table.email),
  check("users_check_0", sql`role in ('user', 'professional', 'facility_admin', 'moderator', 'admin')`),
  check("users_check_1", sql`status in ('active', 'warned', 'suspended', 'banned')`),
]);

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "no action" }),
  token_hash: text("token_hash").notNull(),
  expires_at: text("expires_at").notNull(),
  created_at: text("created_at").notNull(),
}, (table) => [
  index("sessions_token_hash_idx").on(table.token_hash),
  uniqueIndex("sessions_token_hash_unique").on(table.token_hash),
]);

export const specialties = sqliteTable("specialties", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  category: text("category").notNull(),
  active: integer("active").notNull().default(sql`1`),
}, (table) => [
  uniqueIndex("specialties_slug_unique").on(table.slug),
  uniqueIndex("specialties_name_unique").on(table.name),
  check("specialties_check_0", sql`category in ('mental_health', 'medical', 'other')`),
]);

export const study_types = sqliteTable("study_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  active: integer("active").notNull().default(sql`1`),
}, (table) => [
  uniqueIndex("study_types_slug_unique").on(table.slug),
  uniqueIndex("study_types_name_unique").on(table.name),
]);

export const locations = sqliteTable("locations", {
  id: text("id").primaryKey(),
  country_code: text("country_code").notNull().default(sql`'AR'`),
  province: text("province"),
  city: text("city").notNull(),
  zone: text("zone"),
  neighborhood: text("neighborhood"),
  lat: real("lat"),
  lng: real("lng"),
}, (table) => [
]);

export const professionals = sqliteTable("professionals", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  display_name: text("display_name").notNull(),
  bio: text("bio"),
  primary_specialty_id: text("primary_specialty_id").references(() => specialties.id, { onDelete: "no action", onUpdate: "no action" }),
  license_number: text("license_number"),
  institution: text("institution"),
  location_id: text("location_id").references(() => locations.id, { onDelete: "no action", onUpdate: "no action" }),
  address_public: text("address_public"),
  website_url: text("website_url"),
  public_phone: text("public_phone"),
  care_modes: text("care_modes").notNull().default(sql`'[]'`),
  verification_status: text("verification_status").notNull().default(sql`'community'`),
  claimed_by: text("claimed_by").references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  claim_status: text("claim_status"),
  source_notes: text("source_notes"),
  created_by: text("created_by").references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
  is_demo: integer("is_demo").notNull().default(sql`0`),
}, (table) => [
  index("professionals_specialty_idx").on(table.primary_specialty_id),
  index("professionals_status_idx").on(table.verification_status),
  index("professionals_slug_idx").on(table.slug),
  uniqueIndex("professionals_slug_unique").on(table.slug),
  check("professionals_check_0", sql`verification_status in ('community', 'incomplete', 'verified', 'claimed', 'suspended')`),
  check("professionals_check_1", sql`claim_status is null or claim_status in ('pending', 'approved', 'rejected', 'revoked')`),
  check("professionals_check_2", sql`is_demo in (0, 1)`),
]);

export const professional_specialties = sqliteTable("professional_specialties", {
  professional_id: text("professional_id").references(() => professionals.id, { onDelete: "cascade", onUpdate: "no action" }),
  specialty_id: text("specialty_id").references(() => specialties.id, { onDelete: "restrict", onUpdate: "no action" }),
}, (table) => [
  primaryKey({ columns: [table.professional_id, table.specialty_id] }),
]);

export const facilities = sqliteTable("facilities", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  facility_type: text("facility_type").notNull(),
  location_id: text("location_id").references(() => locations.id, { onDelete: "no action", onUpdate: "no action" }),
  address_public: text("address_public"),
  website_url: text("website_url"),
  public_phone: text("public_phone"),
  verification_status: text("verification_status").notNull().default(sql`'community'`),
  claimed_by: text("claimed_by").references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  claim_status: text("claim_status"),
  source_notes: text("source_notes"),
  created_by: text("created_by").references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
  is_demo: integer("is_demo").notNull().default(sql`0`),
}, (table) => [
  index("facilities_status_idx").on(table.verification_status),
  index("facilities_slug_idx").on(table.slug),
  uniqueIndex("facilities_slug_unique").on(table.slug),
  check("facilities_check_0", sql`facility_type in ('diagnostic_center', 'clinic', 'lab', 'hospital', 'other')`),
  check("facilities_check_1", sql`verification_status in ('community', 'incomplete', 'verified', 'claimed', 'suspended')`),
  check("facilities_check_2", sql`claim_status is null or claim_status in ('pending', 'approved', 'rejected', 'revoked')`),
  check("facilities_check_3", sql`is_demo in (0, 1)`),
]);

export const facility_study_types = sqliteTable("facility_study_types", {
  facility_id: text("facility_id").references(() => facilities.id, { onDelete: "cascade", onUpdate: "no action" }),
  study_type_id: text("study_type_id").references(() => study_types.id, { onDelete: "restrict", onUpdate: "no action" }),
}, (table) => [
  primaryKey({ columns: [table.facility_id, table.study_type_id] }),
]);

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  author_id: text("author_id").notNull().references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  professional_id: text("professional_id").references(() => professionals.id, { onDelete: "cascade", onUpdate: "no action" }),
  facility_id: text("facility_id").references(() => facilities.id, { onDelete: "cascade", onUpdate: "no action" }),
  overall_rating: integer("overall_rating").notNull(),
  visit_type: text("visit_type"),
  study_type_id: text("study_type_id").references(() => study_types.id, { onDelete: "no action", onUpdate: "no action" }),
  approx_visit_month: text("approx_visit_month"),
  comment: text("comment"),
  anonymous: integer("anonymous").notNull().default(sql`1`),
  status: text("status").notNull().default(sql`'pending'`),
  moderation_note: text("moderation_note"),
  helpful_count: integer("helpful_count").notNull().default(sql`0`),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
}, (table) => [
  index("reviews_facility_status_idx").on(table.facility_id, table.status),
  index("reviews_professional_status_idx").on(table.professional_id, table.status),
  check("reviews_check_0", sql`overall_rating between 1 and 5`),
  check("reviews_check_1", sql`status in ('pending', 'published', 'hidden', 'removed')`),
  check("reviews_check_2", sql`(professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null)`),
]);

export const review_scores = sqliteTable("review_scores", {
  id: text("id").primaryKey(),
  review_id: text("review_id").notNull().references(() => reviews.id, { onDelete: "cascade", onUpdate: "no action" }),
  score_key: text("score_key").notNull(),
  score_value: integer("score_value").notNull(),
}, (table) => [
  uniqueIndex("review_scores_review_id_score_key_unique").on(table.review_id, table.score_key),
  check("review_scores_check_0", sql`score_value between 1 and 5`),
]);

export const facility_review_answers = sqliteTable("facility_review_answers", {
  review_id: text("review_id").primaryKey().references(() => reviews.id, { onDelete: "cascade", onUpdate: "no action" }),
  commented_findings_frequency: text("commented_findings_frequency"),
  preference_requested: integer("preference_requested"),
  preference_respected: integer("preference_respected"),
}, (table) => [
  check("facility_review_answers_check_0", sql`commented_findings_frequency is null or commented_findings_frequency in ('never', 'almost_never', 'sometimes', 'frequently', 'always')`),
]);

export const review_helpful_votes = sqliteTable("review_helpful_votes", {
  review_id: text("review_id").references(() => reviews.id, { onDelete: "cascade", onUpdate: "no action" }),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade", onUpdate: "no action" }),
  created_at: text("created_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.review_id, table.user_id] }),
]);

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  reporter_id: text("reporter_id").notNull().references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  review_id: text("review_id").references(() => reviews.id, { onDelete: "cascade", onUpdate: "no action" }),
  professional_id: text("professional_id").references(() => professionals.id, { onDelete: "cascade", onUpdate: "no action" }),
  facility_id: text("facility_id").references(() => facilities.id, { onDelete: "cascade", onUpdate: "no action" }),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").notNull().default(sql`'open'`),
  handled_by: text("handled_by").references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  handled_at: text("handled_at"),
  created_at: text("created_at").notNull(),
}, (table) => [
  index("reports_status_idx").on(table.status),
  check("reports_check_0", sql`status in ('open', 'reviewing', 'resolved', 'dismissed')`),
  check("reports_check_1", sql`
    (case when review_id is not null then 1 else 0 end) +
    (case when professional_id is not null then 1 else 0 end) +
    (case when facility_id is not null then 1 else 0 end) = 1
  `),
]);

export const profile_suggestions = sqliteTable("profile_suggestions", {
  id: text("id").primaryKey(),
  submitted_by: text("submitted_by").notNull().references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  target_type: text("target_type").notNull(),
  professional_id: text("professional_id").references(() => professionals.id, { onDelete: "no action", onUpdate: "no action" }),
  facility_id: text("facility_id").references(() => facilities.id, { onDelete: "no action", onUpdate: "no action" }),
  payload_json: text("payload_json").notNull(),
  status: text("status").notNull().default(sql`'pending'`),
  reviewed_by: text("reviewed_by").references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  reviewed_at: text("reviewed_at"),
  created_at: text("created_at").notNull(),
}, (table) => [
  index("profile_suggestions_status_idx").on(table.status),
]);

export const profile_claims = sqliteTable("profile_claims", {
  id: text("id").primaryKey(),
  claimant_id: text("claimant_id").notNull().references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  professional_id: text("professional_id").references(() => professionals.id, { onDelete: "no action", onUpdate: "no action" }),
  facility_id: text("facility_id").references(() => facilities.id, { onDelete: "no action", onUpdate: "no action" }),
  status: text("status").notNull().default(sql`'pending'`),
  evidence_url: text("evidence_url"),
  notes: text("notes"),
  reviewed_by: text("reviewed_by").references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  reviewed_at: text("reviewed_at"),
  created_at: text("created_at").notNull(),
}, (table) => [
  check("profile_claims_check_0", sql`status in ('pending', 'approved', 'rejected', 'revoked')`),
  check("profile_claims_check_1", sql`(professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null)`),
]);

export const professional_replies = sqliteTable("professional_replies", {
  id: text("id").primaryKey(),
  review_id: text("review_id").notNull().references(() => reviews.id, { onDelete: "cascade", onUpdate: "no action" }),
  author_id: text("author_id").notNull().references(() => users.id, { onDelete: "no action", onUpdate: "no action" }),
  body: text("body").notNull(),
  status: text("status").notNull().default(sql`'pending'`),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
}, (table) => [
  check("professional_replies_check_0", sql`status in ('pending', 'published', 'hidden', 'removed')`),
]);

export const favorites = sqliteTable("favorites", {
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade", onUpdate: "no action" }),
  professional_id: text("professional_id").references(() => professionals.id, { onDelete: "cascade", onUpdate: "no action" }),
  facility_id: text("facility_id").references(() => facilities.id, { onDelete: "cascade", onUpdate: "no action" }),
  created_at: text("created_at").notNull(),
}, (table) => [
  uniqueIndex("favorites_facility_unique").on(table.user_id, table.facility_id).where(sql`facility_id is not null`),
  uniqueIndex("favorites_professional_unique").on(table.user_id, table.professional_id).where(sql`professional_id is not null`),
  check("favorites_check_0", sql`(professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null)`),
]);

export const profile_rating_summaries = sqliteTable("profile_rating_summaries", {
  id: text("id").primaryKey(),
  professional_id: text("professional_id").references(() => professionals.id, { onDelete: "cascade", onUpdate: "no action" }),
  facility_id: text("facility_id").references(() => facilities.id, { onDelete: "cascade", onUpdate: "no action" }),
  published_review_count: integer("published_review_count").notNull().default(sql`0`),
  overall_average: real("overall_average"),
  anxiety_compatibility_average: real("anxiety_compatibility_average"),
  confidence_score: real("confidence_score").notNull().default(sql`0`),
  score_breakdown_json: text("score_breakdown_json").notNull().default(sql`'{}'`),
  updated_at: text("updated_at").notNull(),
}, (table) => [
  check("profile_rating_summaries_check_0", sql`(professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null)`),
]);
