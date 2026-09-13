CREATE TABLE `facilities` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`facility_type` text NOT NULL,
	`location_id` text,
	`address_public` text,
	`website_url` text,
	`public_phone` text,
	`verification_status` text DEFAULT 'community' NOT NULL,
	`claimed_by` text,
	`claim_status` text,
	`source_notes` text,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`is_demo` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`claimed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "facilities_check_0" CHECK(facility_type in ('diagnostic_center', 'clinic', 'lab', 'hospital', 'other')),
	CONSTRAINT "facilities_check_1" CHECK(verification_status in ('community', 'incomplete', 'verified', 'claimed', 'suspended')),
	CONSTRAINT "facilities_check_2" CHECK(claim_status is null or claim_status in ('pending', 'approved', 'rejected', 'revoked')),
	CONSTRAINT "facilities_check_3" CHECK(is_demo in (0, 1))
);
--> statement-breakpoint
CREATE INDEX `facilities_status_idx` ON `facilities` (`verification_status`);--> statement-breakpoint
CREATE INDEX `facilities_slug_idx` ON `facilities` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `facilities_slug_unique` ON `facilities` (`slug`);--> statement-breakpoint
CREATE TABLE `facility_review_answers` (
	`review_id` text PRIMARY KEY NOT NULL,
	`commented_findings_frequency` text,
	`preference_requested` integer,
	`preference_respected` integer,
	FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "facility_review_answers_check_0" CHECK(commented_findings_frequency is null or commented_findings_frequency in ('never', 'almost_never', 'sometimes', 'frequently', 'always'))
);
--> statement-breakpoint
CREATE TABLE `facility_study_types` (
	`facility_id` text,
	`study_type_id` text,
	PRIMARY KEY(`facility_id`, `study_type_id`),
	FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`study_type_id`) REFERENCES `study_types`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`user_id` text,
	`professional_id` text,
	`facility_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`professional_id`) REFERENCES `professionals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "favorites_check_0" CHECK((professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `favorites_facility_unique` ON `favorites` (`user_id`,`facility_id`) WHERE facility_id is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `favorites_professional_unique` ON `favorites` (`user_id`,`professional_id`) WHERE professional_id is not null;--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`country_code` text DEFAULT 'AR' NOT NULL,
	`province` text,
	`city` text NOT NULL,
	`zone` text,
	`neighborhood` text,
	`lat` real,
	`lng` real
);
--> statement-breakpoint
CREATE TABLE `professional_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`review_id` text NOT NULL,
	`author_id` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "professional_replies_check_0" CHECK(status in ('pending', 'published', 'hidden', 'removed'))
);
--> statement-breakpoint
CREATE TABLE `professional_specialties` (
	`professional_id` text,
	`specialty_id` text,
	PRIMARY KEY(`professional_id`, `specialty_id`),
	FOREIGN KEY (`professional_id`) REFERENCES `professionals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `professionals` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`display_name` text NOT NULL,
	`bio` text,
	`primary_specialty_id` text,
	`license_number` text,
	`institution` text,
	`location_id` text,
	`address_public` text,
	`website_url` text,
	`public_phone` text,
	`care_modes` text DEFAULT '[]' NOT NULL,
	`verification_status` text DEFAULT 'community' NOT NULL,
	`claimed_by` text,
	`claim_status` text,
	`source_notes` text,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`is_demo` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`primary_specialty_id`) REFERENCES `specialties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`claimed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "professionals_check_0" CHECK(verification_status in ('community', 'incomplete', 'verified', 'claimed', 'suspended')),
	CONSTRAINT "professionals_check_1" CHECK(claim_status is null or claim_status in ('pending', 'approved', 'rejected', 'revoked')),
	CONSTRAINT "professionals_check_2" CHECK(is_demo in (0, 1))
);
--> statement-breakpoint
CREATE INDEX `professionals_specialty_idx` ON `professionals` (`primary_specialty_id`);--> statement-breakpoint
CREATE INDEX `professionals_status_idx` ON `professionals` (`verification_status`);--> statement-breakpoint
CREATE INDEX `professionals_slug_idx` ON `professionals` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `professionals_slug_unique` ON `professionals` (`slug`);--> statement-breakpoint
CREATE TABLE `profile_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`claimant_id` text NOT NULL,
	`professional_id` text,
	`facility_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`evidence_url` text,
	`notes` text,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`claimant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`professional_id`) REFERENCES `professionals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "profile_claims_check_0" CHECK(status in ('pending', 'approved', 'rejected', 'revoked')),
	CONSTRAINT "profile_claims_check_1" CHECK((professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null))
);
--> statement-breakpoint
CREATE TABLE `profile_rating_summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`professional_id` text,
	`facility_id` text,
	`published_review_count` integer DEFAULT 0 NOT NULL,
	`overall_average` real,
	`anxiety_compatibility_average` real,
	`confidence_score` real DEFAULT 0 NOT NULL,
	`score_breakdown_json` text DEFAULT '{}' NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`professional_id`) REFERENCES `professionals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "profile_rating_summaries_check_0" CHECK((professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null))
);
--> statement-breakpoint
CREATE TABLE `profile_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`submitted_by` text NOT NULL,
	`target_type` text NOT NULL,
	`professional_id` text,
	`facility_id` text,
	`payload_json` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`professional_id`) REFERENCES `professionals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `profile_suggestions_status_idx` ON `profile_suggestions` (`status`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`review_id` text,
	`professional_id` text,
	`facility_id` text,
	`reason` text NOT NULL,
	`details` text,
	`status` text DEFAULT 'open' NOT NULL,
	`handled_by` text,
	`handled_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`professional_id`) REFERENCES `professionals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`handled_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "reports_check_0" CHECK(status in ('open', 'reviewing', 'resolved', 'dismissed')),
	CONSTRAINT "reports_check_1" CHECK(
    (case when review_id is not null then 1 else 0 end) +
    (case when professional_id is not null then 1 else 0 end) +
    (case when facility_id is not null then 1 else 0 end) = 1
  )
);
--> statement-breakpoint
CREATE INDEX `reports_status_idx` ON `reports` (`status`);--> statement-breakpoint
CREATE TABLE `review_helpful_votes` (
	`review_id` text,
	`user_id` text,
	`created_at` text NOT NULL,
	PRIMARY KEY(`review_id`, `user_id`),
	FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `review_scores` (
	`id` text PRIMARY KEY NOT NULL,
	`review_id` text NOT NULL,
	`score_key` text NOT NULL,
	`score_value` integer NOT NULL,
	FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "review_scores_check_0" CHECK(score_value between 1 and 5)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `review_scores_review_id_score_key_unique` ON `review_scores` (`review_id`,`score_key`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`professional_id` text,
	`facility_id` text,
	`overall_rating` integer NOT NULL,
	`visit_type` text,
	`study_type_id` text,
	`approx_visit_month` text,
	`comment` text,
	`anonymous` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`moderation_note` text,
	`helpful_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`professional_id`) REFERENCES `professionals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`study_type_id`) REFERENCES `study_types`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "reviews_check_0" CHECK(overall_rating between 1 and 5),
	CONSTRAINT "reviews_check_1" CHECK(status in ('pending', 'published', 'hidden', 'removed')),
	CONSTRAINT "reviews_check_2" CHECK((professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null))
);
--> statement-breakpoint
CREATE INDEX `reviews_facility_status_idx` ON `reviews` (`facility_id`,`status`);--> statement-breakpoint
CREATE INDEX `reviews_professional_status_idx` ON `reviews` (`professional_id`,`status`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_token_hash_idx` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE TABLE `specialties` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`category` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	CONSTRAINT "specialties_check_0" CHECK(category in ('mental_health', 'medical', 'other'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `specialties_slug_unique` ON `specialties` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `specialties_name_unique` ON `specialties` (`name`);--> statement-breakpoint
CREATE TABLE `study_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `study_types_slug_unique` ON `study_types` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `study_types_name_unique` ON `study_types` (`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text,
	`anonymous_name` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`reputation_score` real DEFAULT 0 NOT NULL,
	`community_guidelines_accepted_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "users_check_0" CHECK(role in ('user', 'professional', 'facility_admin', 'moderator', 'admin')),
	CONSTRAINT "users_check_1" CHECK(status in ('active', 'warned', 'suspended', 'banned'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);