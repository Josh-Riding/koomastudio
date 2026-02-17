import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { savedPostsRouter } from "./routers/saved-posts";
import { collectionsRouter } from "./routers/collections";
import { apiKeysRouter } from "./routers/api-keys";
import { remixesRouter } from "./routers/remixes";

export const appRouter = createTRPCRouter({
  savedPosts: savedPostsRouter,
  collections: collectionsRouter,
  apiKeys: apiKeysRouter,
  remixes: remixesRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
