import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { extensionTokens, posts, userSavedPosts, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getEffectiveStatus } from "@/server/api/routers/subscription";

const FREE_SAVE_LIMIT = 10;
const WINDOW_DAYS = 30;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// In-memory rate limiter: 30 saves/min per token hash
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(tokenHash: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(tokenHash);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(tokenHash, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= 30) return false;

  entry.count++;
  return true;
}

const saveBodySchema = z.object({
  content: z.string().min(1),
  authorName: z.string().optional(),
  authorUrl: z.string().optional(),
  postUrl: z.string().optional(),
  embedUrl: z.string().optional(),
  mediaType: z.enum(["photo", "video", "carousel"]).optional(),
  ogImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  // Auth
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  const rawToken = authHeader.slice(7);
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const [tokenRow] = await db
    .select()
    .from(extensionTokens)
    .where(eq(extensionTokens.tokenHash, tokenHash))
    .limit(1);

  if (!tokenRow) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  // Check user subscription (extension is Pro-only)
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, tokenRow.userId),
    columns: {
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
      postSaveCount: true,
      postSaveWindowStart: true,
    },
  });

  if (!userRecord || getEffectiveStatus(userRecord) !== "pro") {
    return NextResponse.json(
      { error: "Extension requires a Pro subscription." },
      { status: 403, headers: CORS_HEADERS },
    );
  }

  // Rate limit
  if (!checkRateLimit(tokenHash)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 30 saves per minute." },
      { status: 429, headers: CORS_HEADERS },
    );
  }

  // Validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const parsed = saveBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const { content, authorName, authorUrl, postUrl, embedUrl, mediaType, ogImage, tags, notes } = parsed.data;

  // Upsert post (dedup by postUrl)
  let postId: string;

  if (postUrl) {
    const existing = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.postUrl, postUrl))
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      postId = existing[0].id;
    } else {
      const [inserted] = await db
        .insert(posts)
        .values({ content, authorName, authorUrl, postUrl, embedUrl, mediaType, ogImage })
        .returning({ id: posts.id });
      postId = inserted!.id;
    }
  } else {
    const [inserted] = await db
      .insert(posts)
      .values({ content, authorName, authorUrl, embedUrl, mediaType, ogImage })
      .returning({ id: posts.id });
    postId = inserted!.id;
  }

  // Save to user's library
  const [savedPost] = await db
    .insert(userSavedPosts)
    .values({ userId: tokenRow.userId, postId, tags: tags ?? [], notes: notes ?? null })
    .returning({ id: userSavedPosts.id });

  return NextResponse.json(
    { success: true, id: savedPost!.id },
    { status: 200, headers: CORS_HEADERS },
  );
}
