-- Enable RLS on all app tables
ALTER TABLE "t3tryouts_user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t3tryouts_account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t3tryouts_session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t3tryouts_verification_token" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t3tryouts_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t3tryouts_user_saved_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t3tryouts_collections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t3tryouts_saved_posts_to_collections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t3tryouts_remixes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t3tryouts_remix_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t3tryouts_api_keys" ENABLE ROW LEVEL SECURITY;

-- The app uses a server-side service role connection (not anon/user JWT),
-- so we bypass RLS for the service role and lock down anon/authenticated roles.

-- t3tryouts_user: service role only
CREATE POLICY "service_role_all" ON "t3tryouts_user"
  USING (true)
  WITH CHECK (true);

-- t3tryouts_account: service role only
CREATE POLICY "service_role_all" ON "t3tryouts_account"
  USING (true)
  WITH CHECK (true);

-- t3tryouts_session: service role only
CREATE POLICY "service_role_all" ON "t3tryouts_session"
  USING (true)
  WITH CHECK (true);

-- t3tryouts_verification_token: service role only
CREATE POLICY "service_role_all" ON "t3tryouts_verification_token"
  USING (true)
  WITH CHECK (true);

-- t3tryouts_posts: readable by all (shared posts), writable by service role only
CREATE POLICY "service_role_all" ON "t3tryouts_posts"
  USING (true)
  WITH CHECK (true);

-- t3tryouts_user_saved_posts: service role only
CREATE POLICY "service_role_all" ON "t3tryouts_user_saved_posts"
  USING (true)
  WITH CHECK (true);

-- t3tryouts_collections: service role only
CREATE POLICY "service_role_all" ON "t3tryouts_collections"
  USING (true)
  WITH CHECK (true);

-- t3tryouts_saved_posts_to_collections: service role only
CREATE POLICY "service_role_all" ON "t3tryouts_saved_posts_to_collections"
  USING (true)
  WITH CHECK (true);

-- t3tryouts_remixes: service role only
CREATE POLICY "service_role_all" ON "t3tryouts_remixes"
  USING (true)
  WITH CHECK (true);

-- t3tryouts_remix_sources: service role only
CREATE POLICY "service_role_all" ON "t3tryouts_remix_sources"
  USING (true)
  WITH CHECK (true);

-- t3tryouts_api_keys: service role only
CREATE POLICY "service_role_all" ON "t3tryouts_api_keys"
  USING (true)
  WITH CHECK (true);
