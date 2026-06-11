CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"visitor_hash" text NOT NULL,
	"referer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "content" text;--> statement-breakpoint
CREATE INDEX "page_views_time_idx" ON "page_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "page_views_path_idx" ON "page_views" USING btree ("path","created_at");--> statement-breakpoint
CREATE INDEX "page_views_visitor_idx" ON "page_views" USING btree ("visitor_hash","created_at");--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_slug_unique" UNIQUE("slug");