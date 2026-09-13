CREATE TABLE `directory_imports` (
	`id` text PRIMARY KEY NOT NULL,
	`applied_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `facility_specialties` (
	`facility_id` text NOT NULL,
	`specialty_id` text NOT NULL,
	PRIMARY KEY(`facility_id`, `specialty_id`),
	FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `profile_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`professional_id` text,
	`facility_id` text,
	`kind` text NOT NULL,
	`scope` text NOT NULL,
	`summary` text NOT NULL,
	`source_url` text NOT NULL,
	`source_title` text NOT NULL,
	`reviewed_at` text NOT NULL,
	FOREIGN KEY (`professional_id`) REFERENCES `professionals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "evidence_target" CHECK((professional_id is not null and facility_id is null) or (professional_id is null and facility_id is not null)),
	CONSTRAINT "evidence_kind" CHECK(kind in ('health_anxiety', 'ocd', 'dental_anxiety', 'claustrophobia', 'communication'))
);
--> statement-breakpoint
CREATE INDEX `evidence_professional_idx` ON `profile_evidence` (`professional_id`);--> statement-breakpoint
CREATE INDEX `evidence_facility_idx` ON `profile_evidence` (`facility_id`);