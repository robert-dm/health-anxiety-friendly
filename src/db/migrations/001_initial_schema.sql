create table if not exists migrations (
  id text primary key,
  applied_at text not null
);

create table if not exists users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  display_name text,
  anonymous_name text not null,
  role text not null default 'user' check (role in ('user', 'professional', 'facility_admin', 'moderator', 'admin')),
  status text not null default 'active' check (status in ('active', 'warned', 'suspended', 'banned')),
  reputation_score real not null default 0,
  community_guidelines_accepted_at text,
  created_at text not null,
  updated_at text not null
);

create table if not exists sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at text not null,
  created_at text not null
);

create table if not exists specialties (
  id text primary key,
  name text not null unique,
  slug text not null unique,
  category text not null check (category in ('mental_health', 'medical', 'other')),
  active integer not null default 1
);

create table if not exists study_types (
  id text primary key,
  name text not null unique,
  slug text not null unique,
  active integer not null default 1
);

create table if not exists locations (
  id text primary key,
  country_code text not null default 'AR',
  province text,
  city text not null,
  zone text,
  neighborhood text,
  lat real,
  lng real
);

create table if not exists professionals (
  id text primary key,
  slug text not null unique,
  first_name text,
  last_name text,
  display_name text not null,
  bio text,
  primary_specialty_id text references specialties(id),
  license_number text,
  institution text,
  location_id text references locations(id),
  address_public text,
  website_url text,
  public_phone text,
  care_modes text not null default '[]',
  verification_status text not null default 'community' check (verification_status in ('community', 'incomplete', 'verified', 'claimed', 'suspended')),
  claimed_by text references users(id),
  claim_status text check (claim_status is null or claim_status in ('pending', 'approved', 'rejected', 'revoked')),
  source_notes text,
  created_by text references users(id),
  created_at text not null,
  updated_at text not null
);

create table if not exists professional_specialties (
  professional_id text references professionals(id) on delete cascade,
  specialty_id text references specialties(id) on delete restrict,
  primary key (professional_id, specialty_id)
);

create table if not exists facilities (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text,
  facility_type text not null check (facility_type in ('diagnostic_center', 'clinic', 'lab', 'hospital', 'other')),
  location_id text references locations(id),
  address_public text,
  website_url text,
  public_phone text,
  verification_status text not null default 'community' check (verification_status in ('community', 'incomplete', 'verified', 'claimed', 'suspended')),
  claimed_by text references users(id),
  claim_status text check (claim_status is null or claim_status in ('pending', 'approved', 'rejected', 'revoked')),
  source_notes text,
  created_by text references users(id),
  created_at text not null,
  updated_at text not null
);

create table if not exists facility_study_types (
  facility_id text references facilities(id) on delete cascade,
  study_type_id text references study_types(id) on delete restrict,
  primary key (facility_id, study_type_id)
);

create table if not exists reviews (
  id text primary key,
  author_id text not null references users(id),
  professional_id text references professionals(id) on delete cascade,
  facility_id text references facilities(id) on delete cascade,
  overall_rating integer not null check (overall_rating between 1 and 5),
  visit_type text,
  study_type_id text references study_types(id),
  approx_visit_month text,
  comment text,
  anonymous integer not null default 1,
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden', 'removed')),
  moderation_note text,
  helpful_count integer not null default 0,
  created_at text not null,
  updated_at text not null,
  check ((professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null))
);

create table if not exists review_scores (
  id text primary key,
  review_id text not null references reviews(id) on delete cascade,
  score_key text not null,
  score_value integer not null check (score_value between 1 and 5),
  unique (review_id, score_key)
);

create table if not exists facility_review_answers (
  review_id text primary key references reviews(id) on delete cascade,
  commented_findings_frequency text check (commented_findings_frequency is null or commented_findings_frequency in ('never', 'almost_never', 'sometimes', 'frequently', 'always')),
  preference_requested integer,
  preference_respected integer
);

create table if not exists review_helpful_votes (
  review_id text references reviews(id) on delete cascade,
  user_id text references users(id) on delete cascade,
  created_at text not null,
  primary key (review_id, user_id)
);

create table if not exists reports (
  id text primary key,
  reporter_id text not null references users(id),
  review_id text references reviews(id) on delete cascade,
  professional_id text references professionals(id) on delete cascade,
  facility_id text references facilities(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  handled_by text references users(id),
  handled_at text,
  created_at text not null,
  check (
    (case when review_id is not null then 1 else 0 end) +
    (case when professional_id is not null then 1 else 0 end) +
    (case when facility_id is not null then 1 else 0 end) = 1
  )
);

create table if not exists profile_suggestions (
  id text primary key,
  submitted_by text not null references users(id),
  target_type text not null,
  professional_id text references professionals(id),
  facility_id text references facilities(id),
  payload_json text not null,
  status text not null default 'pending',
  reviewed_by text references users(id),
  reviewed_at text,
  created_at text not null
);

create table if not exists profile_claims (
  id text primary key,
  claimant_id text not null references users(id),
  professional_id text references professionals(id),
  facility_id text references facilities(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'revoked')),
  evidence_url text,
  notes text,
  reviewed_by text references users(id),
  reviewed_at text,
  created_at text not null,
  check ((professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null))
);

create table if not exists professional_replies (
  id text primary key,
  review_id text not null references reviews(id) on delete cascade,
  author_id text not null references users(id),
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden', 'removed')),
  created_at text not null,
  updated_at text not null
);

create table if not exists favorites (
  user_id text references users(id) on delete cascade,
  professional_id text references professionals(id) on delete cascade,
  facility_id text references facilities(id) on delete cascade,
  created_at text not null,
  check ((professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null))
);

create unique index if not exists favorites_professional_unique on favorites(user_id, professional_id) where professional_id is not null;
create unique index if not exists favorites_facility_unique on favorites(user_id, facility_id) where facility_id is not null;

create table if not exists profile_rating_summaries (
  id text primary key,
  professional_id text references professionals(id) on delete cascade,
  facility_id text references facilities(id) on delete cascade,
  published_review_count integer not null default 0,
  overall_average real,
  anxiety_compatibility_average real,
  confidence_score real not null default 0,
  score_breakdown_json text not null default '{}',
  updated_at text not null,
  check ((professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null))
);

create index if not exists professionals_slug_idx on professionals(slug);
create index if not exists professionals_status_idx on professionals(verification_status);
create index if not exists professionals_specialty_idx on professionals(primary_specialty_id);
create index if not exists facilities_slug_idx on facilities(slug);
create index if not exists facilities_status_idx on facilities(verification_status);
create index if not exists reviews_professional_status_idx on reviews(professional_id, status);
create index if not exists reviews_facility_status_idx on reviews(facility_id, status);
create index if not exists reports_status_idx on reports(status);
create index if not exists profile_suggestions_status_idx on profile_suggestions(status);
create index if not exists sessions_token_hash_idx on sessions(token_hash);
