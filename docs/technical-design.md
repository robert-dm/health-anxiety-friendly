# Health Anxiety Friendly - Technical Design

## 1. Context

This document translates the MVP described in `doc/product-spec.md`, `doc/screens.md`, and `AGENTS.md` into an initial implementation design.

Note: the repository currently contains `doc/` while `AGENTS.md` references `docs/`. This file is created at `docs/technical-design.md` as requested.

## 2. Product Constraints That Affect Architecture

- Objective profile data, patient experiences, and community-derived scores must remain separate in storage and UI.
- Ratings must not be presented as objective medical-quality rankings.
- The system must avoid reassurance-seeking, symptom checking, diagnosis-seeking, and compulsive retesting loops.
- Anonymous public review publishing must be supported while preserving private author ownership.
- Community-created profiles must be visually and structurally distinguishable from verified or claimed profiles.
- Negative reviews must not be removable only because they are negative.
- Professionals and facilities can reply and request corrections to objective information.
- Sensitive personal data collection must be minimal: no diagnosis, medical history, DNI, date of birth, or home address.
- Moderation and reporting are MVP requirements, not later enhancements.

## 3. Proposed Project Structure

```text
app/
  (public)/
    page.tsx
    buscar/page.tsx
    profesionales/[slug]/page.tsx
    centros/[slug]/page.tsx
    guias/page.tsx
    como-funciona/page.tsx
  (auth)/
    ingresar/page.tsx
    registro/page.tsx
  (app)/
    cuenta/page.tsx
    agregar/page.tsx
    review/[targetType]/[targetId]/page.tsx
  admin/
    page.tsx
    profesionales/page.tsx
    centros/page.tsx
    reviews/page.tsx
    reportes/page.tsx
components/
  auth/
  layout/
  profiles/
  reviews/
  search/
  moderation/
  ui/
lib/
  supabase/
    client.ts
    server.ts
    middleware.ts
  auth/
    roles.ts
    guards.ts
  validation/
  ratings/
  search/
  moderation/
types/
  database.ts
  domain.ts
supabase/
  migrations/
  seed.sql
docs/
  technical-design.md
```

App Router route groups should keep public browsing, authenticated user flows, and admin workflows separate. Server Components should fetch public data where practical; mutations should use Server Actions or Route Handlers with server-side authorization.

## 4. Domain Model

### Auth and User Tables

Supabase Auth owns authentication. Public application metadata lives in normalized tables.

#### `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `anonymous_name text not null`
- `role user_role not null default 'user'`
- `status user_status not null default 'active'`
- `reputation_score numeric(6,2) not null default 0`
- `community_guidelines_accepted_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Enums:

- `user_role`: `user`, `professional`, `facility_admin`, `moderator`, `admin`
- `user_status`: `active`, `warned`, `suspended`, `banned`

### Taxonomy Tables

#### `specialties`

- `id uuid primary key`
- `name text not null unique`
- `slug text not null unique`
- `category specialty_category not null`
- `active boolean not null default true`

`specialty_category`: `mental_health`, `medical`, `other`

#### `study_types`

- `id uuid primary key`
- `name text not null unique`
- `slug text not null unique`
- `active boolean not null default true`

#### `locations`

- `id uuid primary key`
- `country_code text not null default 'AR'`
- `province text`
- `city text not null`
- `zone text`
- `neighborhood text`
- `lat numeric(9,6)`
- `lng numeric(9,6)`

Initial seed data should prioritize CABA and Gran Buenos Aires but keep the schema country-neutral.

### Professional Profiles

#### `professionals`

- `id uuid primary key`
- `slug text not null unique`
- `first_name text`
- `last_name text`
- `display_name text not null`
- `bio text`
- `primary_specialty_id uuid references specialties(id)`
- `license_number text`
- `institution text`
- `location_id uuid references locations(id)`
- `address_public text`
- `website_url text`
- `public_phone text`
- `care_modes care_mode[] not null default '{}'`
- `verification_status verification_status not null default 'community'`
- `claimed_by uuid references profiles(id)`
- `claim_status claim_status`
- `source_notes text`
- `created_by uuid references profiles(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Enums:

- `care_mode`: `in_person`, `virtual`
- `verification_status`: `community`, `incomplete`, `verified`, `claimed`, `suspended`
- `claim_status`: `pending`, `approved`, `rejected`, `revoked`

#### `professional_specialties`

- `professional_id uuid references professionals(id) on delete cascade`
- `specialty_id uuid references specialties(id) on delete restrict`
- primary key: `(professional_id, specialty_id)`

### Facility Profiles

#### `facilities`

- `id uuid primary key`
- `slug text not null unique`
- `name text not null`
- `description text`
- `facility_type facility_type not null`
- `location_id uuid references locations(id)`
- `address_public text`
- `website_url text`
- `public_phone text`
- `verification_status verification_status not null default 'community'`
- `claimed_by uuid references profiles(id)`
- `claim_status claim_status`
- `source_notes text`
- `created_by uuid references profiles(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

`facility_type`: `diagnostic_center`, `clinic`, `lab`, `hospital`, `other`

#### `facility_study_types`

- `facility_id uuid references facilities(id) on delete cascade`
- `study_type_id uuid references study_types(id) on delete restrict`
- primary key: `(facility_id, study_type_id)`

### Reviews

Use explicit nullable foreign keys with a check constraint instead of a polymorphic key.

#### `reviews`

- `id uuid primary key`
- `author_id uuid not null references profiles(id)`
- `professional_id uuid references professionals(id) on delete cascade`
- `facility_id uuid references facilities(id) on delete cascade`
- `overall_rating smallint not null check (overall_rating between 1 and 5)`
- `visit_type text`
- `study_type_id uuid references study_types(id)`
- `approx_visit_month date`
- `comment text`
- `anonymous boolean not null default true`
- `status review_status not null default 'pending'`
- `moderation_note text`
- `helpful_count integer not null default 0`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- check exactly one of `professional_id` or `facility_id` is present

`review_status`: `pending`, `published`, `hidden`, `removed`

The public review query must expose `anonymous_name` only when `anonymous = true`, and must never expose the author email.

#### `review_scores`

- `id uuid primary key`
- `review_id uuid not null references reviews(id) on delete cascade`
- `score_key text not null`
- `score_value smallint not null check (score_value between 1 and 5)`
- unique `(review_id, score_key)`

Professional score keys:

- `listening`
- `respect`
- `clear_communication`
- `non_alarmist`
- `avoids_reassurance_seeking`
- `respects_limits`
- `rational_tests`
- `uncertainty_support`
- `understands_health_anxiety`

Facility score keys:

- `staff_respect`
- `communication_preferences`
- `no_unrequested_findings`
- `avoids_speculation`
- `low_anxiety_procedure`
- `organization`
- `overall_experience`

#### `facility_review_answers`

- `review_id uuid primary key references reviews(id) on delete cascade`
- `commented_findings_frequency finding_frequency`
- `preference_requested boolean`
- `preference_respected boolean`

`finding_frequency`: `never`, `almost_never`, `sometimes`, `frequently`, `always`

### Review Feedback and Reports

#### `review_helpful_votes`

- `review_id uuid references reviews(id) on delete cascade`
- `user_id uuid references profiles(id) on delete cascade`
- `created_at timestamptz not null default now()`
- primary key `(review_id, user_id)`

#### `reports`

- `id uuid primary key`
- `reporter_id uuid not null references profiles(id)`
- `review_id uuid references reviews(id) on delete cascade`
- `professional_id uuid references professionals(id) on delete cascade`
- `facility_id uuid references facilities(id) on delete cascade`
- `reason report_reason not null`
- `details text`
- `status report_status not null default 'open'`
- `handled_by uuid references profiles(id)`
- `handled_at timestamptz`
- `created_at timestamptz not null default now()`
- check exactly one reported target is present

`report_reason`: `personal_data`, `harassment`, `spam`, `false_information`, `dangerous_medical_content`, `fabricated_experience`, `conflict_of_interest`, `reassurance_seeking`, `diagnosis_seeking`, `rating_manipulation`, `other`

`report_status`: `open`, `reviewing`, `resolved`, `dismissed`

### Suggestions and Corrections

#### `profile_suggestions`

- `id uuid primary key`
- `submitted_by uuid not null references profiles(id)`
- `target_type suggestion_target_type not null`
- `professional_id uuid references professionals(id)`
- `facility_id uuid references facilities(id)`
- `payload jsonb not null`
- `status suggestion_status not null default 'pending'`
- `reviewed_by uuid references profiles(id)`
- `reviewed_at timestamptz`
- `created_at timestamptz not null default now()`

`suggestion_target_type`: `new_professional`, `new_facility`, `professional_correction`, `facility_correction`

`suggestion_status`: `pending`, `published`, `verified`, `rejected`, `needs_more_info`

`payload` should be validated at the application boundary and can store form-specific proposal data without prematurely adding many sparse columns.

### Claims and Replies

#### `profile_claims`

- `id uuid primary key`
- `claimant_id uuid not null references profiles(id)`
- `professional_id uuid references professionals(id)`
- `facility_id uuid references facilities(id)`
- `status claim_status not null default 'pending'`
- `evidence_url text`
- `notes text`
- `reviewed_by uuid references profiles(id)`
- `reviewed_at timestamptz`
- `created_at timestamptz not null default now()`
- check exactly one claim target is present

#### `professional_replies`

- `id uuid primary key`
- `review_id uuid not null references reviews(id) on delete cascade`
- `author_id uuid not null references profiles(id)`
- `body text not null`
- `status reply_status not null default 'pending'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

`reply_status`: `pending`, `published`, `hidden`, `removed`

### Favorites

#### `favorites`

- `user_id uuid references profiles(id) on delete cascade`
- `professional_id uuid references professionals(id) on delete cascade`
- `facility_id uuid references facilities(id) on delete cascade`
- `created_at timestamptz not null default now()`
- primary key should include `user_id` plus the present target
- check exactly one favorite target is present

### Aggregates

#### `profile_rating_summaries`

- `id uuid primary key`
- `professional_id uuid references professionals(id) on delete cascade`
- `facility_id uuid references facilities(id) on delete cascade`
- `published_review_count integer not null default 0`
- `overall_average numeric(3,2)`
- `anxiety_compatibility_average numeric(3,2)`
- `confidence_score numeric(5,4) not null default 0`
- `score_breakdown jsonb not null default '{}'`
- `updated_at timestamptz not null default now()`
- check exactly one target is present

This table is maintained server-side only. Clients must not directly write aggregate scores.

## 5. Entity Relationships

- A `profile` maps one-to-one to a Supabase Auth user.
- A `professional` has one primary specialty and zero or more secondary specialties.
- A `facility` has zero or more supported study types.
- A `review` belongs to one user and exactly one target: professional or facility.
- A `review` has multiple structured `review_scores`.
- Facility reviews can additionally have one `facility_review_answers` row.
- A `report` targets exactly one review, professional, or facility.
- A `profile_suggestion` can create a new profile or propose corrections to an existing profile.
- A `profile_claim` links a professional or facility admin to a profile after admin approval.
- A `professional_reply` belongs to one review and is authored by an approved claimant or admin.
- A `favorite` belongs to one user and exactly one target.
- A `profile_rating_summary` belongs to exactly one professional or facility.

## 6. Supabase RLS Strategy

RLS should be enabled on every public schema table.

### Helper Functions

Create stable SQL functions:

- `auth.uid()` for current user identity.
- `public.current_user_role()` returns the current user's role from `profiles`.
- `public.is_admin()` returns true for `admin` or `moderator`.
- `public.owns_professional(professional_id uuid)` checks approved claim ownership.
- `public.owns_facility(facility_id uuid)` checks approved claim ownership.

### Public Read Policies

- Published professionals and facilities are readable by everyone unless suspended.
- Published reviews are readable by everyone.
- Public review reads should go through a view such as `public_reviews` that hides author identity when anonymous.
- Taxonomy tables and locations are publicly readable.
- Rating summaries are publicly readable.

### Authenticated User Policies

- Users can read and update their own `profiles` row except protected fields: `role`, `status`, `reputation_score`.
- Users can create reviews as themselves only.
- Users can update their own reviews while status is `pending` or `published`; edits may reset status to `pending`.
- Users can request deletion or set their own review to a user-hidden state, subject to moderation requirements.
- Users can create reports as themselves.
- Users can create profile suggestions as themselves.
- Users can manage their own favorites.
- Users can create helpful votes once per review and cannot vote on their own review.

### Professional and Facility Owner Policies

- Approved claimants can propose corrections through `profile_suggestions`.
- Approved claimants can create replies to reviews for claimed targets.
- Replies should default to `pending` unless admin policy later allows trusted immediate publishing.
- Claimants cannot delete or hide patient reviews.
- Claimants cannot mark themselves verified.

### Admin Policies

Admins and moderators can:

- Read all rows needed for moderation.
- Update verification status.
- Approve or reject suggestions and claims.
- Change review, reply, report, and user statuses.
- Update taxonomy data.
- Trigger aggregate recalculation through trusted server paths.

### Aggregate Protection

- No client role can insert, update, or delete `profile_rating_summaries`.
- Aggregates are updated by database triggers, Edge Functions, or server-only code using service-role credentials.
- Service-role credentials must never be exposed to browser bundles.

## 7. Search and Ranking

Initial search can use PostgreSQL full-text search plus filters:

- professional/facility name
- specialty
- study type
- city, zone, neighborhood
- care mode
- verification status
- published review count
- compatibility score

Ranking should not sort purely by stars. The initial ranking score should combine:

- text relevance
- target type match
- location relevance
- anxiety compatibility average
- published review count
- confidence score
- verification signal

Low sample sizes should display clear copy such as "Pocas experiencias publicadas" and should not be treated as reliable top rankings.

## 8. Validation and Moderation

All user-generated content must be validated before insert:

- length limits for comments, reports, suggestions, and replies
- required structured scores
- no diagnosis, medical history, study results, DNI, date of birth, home address, or third-party identifying information requested in forms
- comments default to `pending` if moderation tooling is active

MVP moderation can be admin-reviewed without automated classification. The schema must still preserve explicit status and report records.

## 9. Implementation Phases

### Phase 1 - Foundation

- Create Next.js App Router project with TypeScript and Tailwind.
- Configure Supabase clients for browser and server.
- Add environment variable contract.
- Add authentication pages.
- Add profile creation trigger for new auth users.
- Create initial migrations for taxonomy, profiles, professionals, facilities, reviews, reports, and RLS.

### Phase 2 - Public Browsing

- Implement home search entry.
- Implement `/buscar` with professional and facility result cards.
- Implement professional profile page.
- Implement facility profile page.
- Add rating summary display with low-sample disclaimers.
- Keep community, verified, and claimed status visually distinct.

### Phase 3 - Reviews

- Implement authenticated review form.
- Add structured rating forms for professionals and facilities.
- Support anonymous public display.
- Add review editing for authors.
- Add helpful votes.
- Add report action on reviews.

### Phase 4 - Suggestions and Favorites

- Implement `/agregar` for professionals and facilities.
- Add suggestion status tracking in `/cuenta`.
- Add favorites if time allows.

### Phase 5 - Moderation and Admin

- Implement `/admin` guard.
- Add queues for pending professionals, facilities, reviews, replies, reports, and claims.
- Add actions for publish, hide, remove, reject, request edit, warn user, and suspend user.

### Phase 6 - Claims and Replies

- Implement claim request flow.
- Add admin approval.
- Allow approved claimants to submit public replies subject to moderation.

### Phase 7 - Guides

- Add static educational pages under `/guias` and `/como-funciona`.
- Keep copy aligned with the no-reassurance product rule.

## 10. Migration Plan

1. Create database enums.
2. Create taxonomy and location tables.
3. Create `profiles` and auth user trigger.
4. Create professional and facility profile tables.
5. Create reviews, structured scores, and facility-specific answers.
6. Create reporting, helpful votes, favorites, suggestions, claims, replies.
7. Create aggregate summary table.
8. Create public-safe views for reviews and profile summaries.
9. Enable RLS on all tables.
10. Add read policies for public content.
11. Add owner policies for users.
12. Add claimant policies for replies and correction requests.
13. Add admin policies.
14. Seed specialties, study types, and initial locations for CABA and Gran Buenos Aires.
15. Add indexes for search, slugs, foreign keys, status fields, and common filters.

Recommended indexes:

- `professionals(slug)`
- `professionals(verification_status)`
- `professionals(primary_specialty_id)`
- `facilities(slug)`
- `facilities(verification_status)`
- `reviews(professional_id, status)`
- `reviews(facility_id, status)`
- `reports(status)`
- `profile_suggestions(status)`
- full-text indexes over professional display name, specialty names, facility names, and study types

## 11. Product Ambiguities Affecting Architecture

- Whether reviews should publish immediately or always enter moderation. The schema supports both, but MVP policy should decide default status.
- Whether negative reviews can be edited after publication without re-moderation. Recommended: edits reset to `pending`.
- Whether professionals can reply immediately after claim approval. Recommended: replies start as `pending` for MVP.
- Whether users can delete published reviews or only request removal. Recommended: allow user removal from public display while preserving audit data.
- How to verify professional/facility identity in Argentina. The schema supports evidence URLs and admin notes, but operational policy is needed.
- Whether "quality/information" score is manually curated, computed from verification completeness, or both.
- Whether guide content is static markdown, CMS-backed, or database-backed. Static pages are enough for MVP.
- Whether search needs geospatial distance in MVP. Plain location filters are likely enough for CABA/GBA; latitude/longitude leaves room for distance later.
- How strict content moderation should be around medical claims in comments. MVP should reject or hide explicit diagnoses, study results, and dangerous advice.

## 12. Initial Build Recommendation

Start with the data model and RLS, then implement read-only public browsing against seeded data before adding review writes. This reduces the risk of building UI flows that later conflict with authorization, moderation, or anonymity requirements.
