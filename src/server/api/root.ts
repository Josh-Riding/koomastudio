import { feedbackRouter } from "./routers/feedback";
import { notesRouter } from "@/server/api/routers/notes";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { notifyRouter } from "./routers/notify";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  feedback: feedbackRouter,
  notes: notesRouter,
  notify: notifyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
