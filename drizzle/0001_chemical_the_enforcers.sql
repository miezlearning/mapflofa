CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"excerpt" text NOT NULL,
	"image" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "task" CASCADE;