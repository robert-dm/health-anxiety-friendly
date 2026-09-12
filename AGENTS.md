# AGENTS.md — Health Anxiety Friendly

## Project purpose

Build the MVP for Health Anxiety Friendly: a community-driven directory of healthcare professionals and diagnostic centers designed to help people with health anxiety / health-related OCD find care environments with clear, respectful, non-alarmist communication.

## Read first

Before making architectural or product decisions, read:
- `docs/product-spec.md`
- `docs/screens.md`

These files define the intended product behavior and UX.

## Required stack

- Plain HTML
- CSS
- Vanilla JavaScript
- Node.js
- SQLite
- Server-managed sessions
- GitHub

Avoid frontend frameworks unless the user explicitly changes direction again.

## Core product rules

1. Separate objective professional information from subjective patient experiences.
2. Never present community ratings as objective medical-quality rankings.
3. Do not design features that encourage reassurance-seeking, symptom checking, repeated testing, or diagnosis-seeking.
4. Registered users may publish reviews anonymously.
5. Community-added profiles must be visually distinct from verified profiles.
6. Negative reviews must not be removable merely because they are negative.
7. Professionals/institutions may reply and request corrections to objective data.
8. Store as little sensitive user data as possible.
9. Do not request diagnosis, medical history, DNI, date of birth, or home address.
10. Moderation and abuse-reporting are part of the MVP.

## MVP scope

Implement:
- authentication
- professional profiles
- facility profiles
- search and filters
- structured ratings
- reviews
- anonymous review publishing
- professional/facility suggestions
- favorites if practical
- reporting/moderation
- basic admin area

Do not implement yet:
- payments
- appointment booking
- direct messaging
- AI diagnosis or medical advice
- native mobile apps
- advertising

## UX principles

- Mobile first
- Calm visual language
- Clear hierarchy
- Minimal medical imagery
- Avoid alarmist UI
- Avoid gamifying reassurance
- Make it easy to distinguish verified information from community reports

## Engineering expectations

Before implementing major features:
1. Inspect the existing project.
2. Preserve established patterns unless there is a strong reason to change them.
3. Prefer small, reviewable changes.
4. Keep JavaScript small, modular, and progressively enhanced.
5. Use server-side authorization where appropriate.
6. Enforce user ownership and admin permissions in server-side route handlers.
7. Never expose secrets, session signing keys, or database files to the client.
8. Keep secrets in environment variables and never commit them.
9. Add validation for all user-generated content.
10. Treat moderation state as explicit data, not only UI state.

## Database design guidance

Prefer normalized tables and explicit relationships.

Suggested entities:
- profiles/users
- professionals
- facilities
- specialties
- services/study types
- reviews
- review_scores
- reports
- favorites
- profile_suggestions
- professional_claims
- professional_replies

Do not use a single polymorphic foreign key unless it materially simplifies the schema without weakening integrity. Prefer explicit relationships where practical.

## Rating design

Keep:
- overall rating
- health-anxiety-specific structured ratings
- aggregate counts

Do not display an aggregate as reliable when sample size is too small.

Leave room for a confidence-weighted ranking later.

## Security

Use server-side authorization so that:
- users can update only their own profile data
- users can create reviews as themselves
- public review display can hide author identity when `anonymous = true`
- users can edit/delete only their own reviews, subject to moderation rules
- admin operations require an admin role
- users cannot mark themselves verified
- users cannot directly modify aggregate scores

## Moderation

Reviews should support states such as:
- pending
- published
- hidden
- removed

Reports should support:
- open
- reviewing
- resolved
- dismissed

Preserve auditability where practical.

## Initial geography

Optimize initial UX for:
- CABA
- Gran Buenos Aires

Do not hardcode the system so tightly that expansion to the rest of Argentina or other countries requires a rewrite.

## First task for Codex

Before building UI, produce:
1. proposed project structure
2. database schema
3. entity relationships
4. server-side authorization strategy
5. implementation phases
6. migration plan
7. any product ambiguities that materially affect architecture

Write this to:
`docs/technical-design.md`

Then proceed with implementation only after the design is internally coherent with `docs/product-spec.md` and `docs/screens.md`.
