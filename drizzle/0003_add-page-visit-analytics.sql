CREATE TABLE "page_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"visitor_id" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" integer,
	"path" text NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "page_visits_visitor_idx" ON "page_visits" USING btree ("visitor_id","created_at");--> statement-breakpoint
CREATE INDEX "page_visits_resource_idx" ON "page_visits" USING btree ("resource","resource_id","created_at");--> statement-breakpoint
CREATE INDEX "page_visits_created_idx" ON "page_visits" USING btree ("created_at");