# DB Migration Workflow

## Every time you change the schema

1. Edit `src/server/db/schema.ts`
2. `npm run db:generate` — generates a new SQL file in `drizzle/`
3. `npm run db:migrate` — applies it to local postgres (test it)
4. `npm run db:migrate:prod` — deploys to Supabase

## Exploration

```bash
npm run db:studio        # local DB
npm run db:studio:prod   # Supabase DB
```

## Config files

- `drizzle.config.ts` — points to `DATABASE_URL` (local)
- `drizzle.config.supabase.ts` — points to `SUPABASE_DATABASE_URL` (Supabase)
