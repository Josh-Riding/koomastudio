ALTER TABLE "t3tryouts_user" ADD COLUMN "subscription_status" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "t3tryouts_user" ADD COLUMN "stripe_customer_id" varchar(255);--> statement-breakpoint
ALTER TABLE "t3tryouts_user" ADD COLUMN "stripe_subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "t3tryouts_user" ADD COLUMN "subscription_period_end" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t3tryouts_user" ADD COLUMN "post_save_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "t3tryouts_user" ADD COLUMN "post_save_window_start" timestamp with time zone;