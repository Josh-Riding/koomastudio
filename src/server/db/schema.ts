import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `t3tryouts_${name}`);

// ==================== AUTH TABLES (unchanged) ====================

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  role: text("role").default("USER").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  savedPosts: many(userSavedPosts),
  collections: many(collections),
  remixes: many(remixes),
  apiKeys: many(apiKeys),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// ==================== NEW TABLES ====================

// LinkedIn posts (shared, stored once)
export const posts = createTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    authorName: varchar("author_name", { length: 255 }),
    authorUrl: varchar("author_url", { length: 1024 }),
    postUrl: varchar("post_url", { length: 1024 }).unique(),
    embedUrl: varchar("embed_url", { length: 1024 }),
    mediaType: varchar("media_type", { length: 20 }),
    ogImage: varchar("og_image", { length: 1024 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    postUrlIdx: index("post_url_idx").on(table.postUrl),
  }),
);

export const postsRelations = relations(posts, ({ many }) => ({
  userSavedPosts: many(userSavedPosts),
  remixSources: many(remixSources),
}));

// User's saved post library (junction: users <-> posts)
export const userSavedPosts = createTable(
  "user_saved_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id),
    tags: text("tags").array(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("user_saved_posts_user_id_idx").on(table.userId),
    postIdIdx: index("user_saved_posts_post_id_idx").on(table.postId),
  }),
);

export const userSavedPostsRelations = relations(
  userSavedPosts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [userSavedPosts.userId],
      references: [users.id],
    }),
    post: one(posts, {
      fields: [userSavedPosts.postId],
      references: [posts.id],
    }),
    collections: many(savedPostsToCollections),
  }),
);

// Collections
export const collections = createTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("collections_user_id_idx").on(table.userId),
  }),
);

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  savedPosts: many(savedPostsToCollections),
}));

// Junction: user_saved_posts <-> collections
export const savedPostsToCollections = createTable(
  "saved_posts_to_collections",
  {
    userSavedPostId: uuid("user_saved_post_id")
      .notNull()
      .references(() => userSavedPosts.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.userSavedPostId, table.collectionId],
    }),
  }),
);

export const savedPostsToCollectionsRelations = relations(
  savedPostsToCollections,
  ({ one }) => ({
    userSavedPost: one(userSavedPosts, {
      fields: [savedPostsToCollections.userSavedPostId],
      references: [userSavedPosts.id],
    }),
    collection: one(collections, {
      fields: [savedPostsToCollections.collectionId],
      references: [collections.id],
    }),
  }),
);

// AI-generated remixes
export const remixes = createTable(
  "remixes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    promptUsed: text("prompt_used"),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft"),
    aiProvider: varchar("ai_provider", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    userIdIdx: index("remixes_user_id_idx").on(table.userId),
    statusIdx: index("remixes_status_idx").on(table.status),
  }),
);

export const remixesRelations = relations(remixes, ({ one, many }) => ({
  user: one(users, { fields: [remixes.userId], references: [users.id] }),
  sources: many(remixSources),
}));

// Junction: which saved posts inspired a remix
export const remixSources = createTable(
  "remix_sources",
  {
    remixId: uuid("remix_id")
      .notNull()
      .references(() => remixes.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.remixId, table.postId],
    }),
  }),
);

export const remixSourcesRelations = relations(remixSources, ({ one }) => ({
  remix: one(remixes, {
    fields: [remixSources.remixId],
    references: [remixes.id],
  }),
  post: one(posts, {
    fields: [remixSources.postId],
    references: [posts.id],
  }),
}));

// Encrypted user API keys (BYOK)
export const apiKeys = createTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    provider: varchar("provider", { length: 50 }).notNull(),
    encryptedKey: text("encrypted_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    userProviderIdx: index("api_keys_user_provider_idx").on(
      table.userId,
      table.provider,
    ),
  }),
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));
