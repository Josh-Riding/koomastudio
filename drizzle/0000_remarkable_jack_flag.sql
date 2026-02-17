CREATE TABLE IF NOT EXISTS "t3tryouts_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "t3tryouts_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t3tryouts_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"encrypted_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t3tryouts_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t3tryouts_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"author_name" varchar(255),
	"author_url" varchar(1024),
	"post_url" varchar(1024),
	"embed_url" varchar(1024),
	"media_type" varchar(20),
	"og_image" varchar(1024),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "t3tryouts_posts_post_url_unique" UNIQUE("post_url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t3tryouts_remix_sources" (
	"remix_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	CONSTRAINT "t3tryouts_remix_sources_remix_id_post_id_pk" PRIMARY KEY("remix_id","post_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t3tryouts_remixes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"prompt_used" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"ai_provider" varchar(50),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t3tryouts_saved_posts_to_collections" (
	"user_saved_post_id" uuid NOT NULL,
	"collection_id" uuid NOT NULL,
	CONSTRAINT "t3tryouts_saved_posts_to_collections_user_saved_post_id_collection_id_pk" PRIMARY KEY("user_saved_post_id","collection_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t3tryouts_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t3tryouts_user_saved_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"post_id" uuid NOT NULL,
	"tags" text[],
	"notes" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t3tryouts_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"role" text DEFAULT 'USER' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "t3tryouts_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "t3tryouts_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_account" ADD CONSTRAINT "t3tryouts_account_user_id_t3tryouts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t3tryouts_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_api_keys" ADD CONSTRAINT "t3tryouts_api_keys_user_id_t3tryouts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t3tryouts_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_collections" ADD CONSTRAINT "t3tryouts_collections_user_id_t3tryouts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t3tryouts_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_remix_sources" ADD CONSTRAINT "t3tryouts_remix_sources_remix_id_t3tryouts_remixes_id_fk" FOREIGN KEY ("remix_id") REFERENCES "public"."t3tryouts_remixes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_remix_sources" ADD CONSTRAINT "t3tryouts_remix_sources_post_id_t3tryouts_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."t3tryouts_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_remixes" ADD CONSTRAINT "t3tryouts_remixes_user_id_t3tryouts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t3tryouts_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_saved_posts_to_collections" ADD CONSTRAINT "t3tryouts_saved_posts_to_collections_user_saved_post_id_t3tryouts_user_saved_posts_id_fk" FOREIGN KEY ("user_saved_post_id") REFERENCES "public"."t3tryouts_user_saved_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_saved_posts_to_collections" ADD CONSTRAINT "t3tryouts_saved_posts_to_collections_collection_id_t3tryouts_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."t3tryouts_collections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_session" ADD CONSTRAINT "t3tryouts_session_user_id_t3tryouts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t3tryouts_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_user_saved_posts" ADD CONSTRAINT "t3tryouts_user_saved_posts_user_id_t3tryouts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t3tryouts_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_user_saved_posts" ADD CONSTRAINT "t3tryouts_user_saved_posts_post_id_t3tryouts_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."t3tryouts_posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "t3tryouts_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_keys_user_provider_idx" ON "t3tryouts_api_keys" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collections_user_id_idx" ON "t3tryouts_collections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_url_idx" ON "t3tryouts_posts" USING btree ("post_url");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "remixes_user_id_idx" ON "t3tryouts_remixes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "remixes_status_idx" ON "t3tryouts_remixes" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "t3tryouts_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_saved_posts_user_id_idx" ON "t3tryouts_user_saved_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_saved_posts_post_id_idx" ON "t3tryouts_user_saved_posts" USING btree ("post_id");