CREATE TABLE IF NOT EXISTS "t3tryouts_extension_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "t3tryouts_extension_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3tryouts_extension_tokens" ADD CONSTRAINT "t3tryouts_extension_tokens_user_id_t3tryouts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t3tryouts_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "extension_tokens_user_id_idx" ON "t3tryouts_extension_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "extension_tokens_token_hash_idx" ON "t3tryouts_extension_tokens" USING btree ("token_hash");