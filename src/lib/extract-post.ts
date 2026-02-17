export interface ExtractedPost {
  content: string;
  authorName: string | null;
  authorUrl: string | null;
  postUrl: string | null;
  embedUrl: string | null;
  mediaType: "photo" | "video" | "carousel" | null;
  ogImage: string | null;
}

/**
 * Extract a LinkedIn post from user input.
 * Hierarchy: embed code/URL > copy link URL > fail to manual
 */
export async function extractFromLinkedInInput(
  input: string,
): Promise<ExtractedPost | null> {
  const trimmed = input.trim();

  // 1. Check for embed code (iframe snippet)
  const embedUrl = parseEmbedUrl(trimmed);
  if (embedUrl) {
    return extractFromEmbedUrl(embedUrl);
  }

  // 2. Check for direct embed URL
  if (trimmed.includes("linkedin.com/embed/")) {
    return extractFromEmbedUrl(trimmed);
  }

  // 3. Check for feed/update URL — convert to embed
  if (
    trimmed.includes("linkedin.com/") &&
    trimmed.includes("feed/update/")
  ) {
    const urnMatch = /urn:li:\w+:\d+/.exec(trimmed);
    if (urnMatch?.[0]) {
      const embed = `https://www.linkedin.com/embed/feed/update/${urnMatch[0]}`;
      return extractFromEmbedUrl(embed);
    }
  }

  // 4. Check for regular LinkedIn post URL (copy link)
  if (trimmed.includes("linkedin.com/") && trimmed.includes("/posts/")) {
    return extractFromPostUrl(trimmed);
  }

  return null;
}

/** Parse an embed URL out of an iframe snippet */
function parseEmbedUrl(input: string): string | null {
  const match = /src=["']([^"']*linkedin\.com\/embed\/[^"']*)["']/i.exec(
    input,
  );
  return match?.[1] ?? null;
}

/** Ensure the embed URL is expanded (remove collapsed=1) */
function getExpandedEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("collapsed");
    return parsed.toString();
  } catch {
    return url.replace(/[?&]collapsed=\d+/, "");
  }
}

/** Get the clean embed URL for storage (keep collapsed for display) */
function getDisplayEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Keep original or set collapsed for compact display
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Fetch the LinkedIn embed page and extract post content */
async function extractFromEmbedUrl(
  rawEmbedUrl: string,
): Promise<ExtractedPost | null> {
  try {
    // Fetch the EXPANDED version (no collapsed param) to get full text
    const expandedUrl = getExpandedEmbedUrl(rawEmbedUrl);

    const response = await fetch(expandedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract post content
    const content = extractEmbedContent(html);
    if (!content) return null;

    // Extract author
    const authorName = extractEmbedAuthor(html);

    // Extract author URL
    const authorUrl = extractEmbedAuthorUrl(html);

    // Get original post URL from embed page
    const postUrl = extractEmbedPostUrl(html);

    // Detect media type
    const mediaType = detectMediaType(html);

    // Get image
    const ogImage = extractMeta(html, "og:image");

    return {
      content,
      authorName,
      authorUrl,
      postUrl,
      embedUrl: expandedUrl,
      mediaType,
      ogImage: ogImage ?? null,
    };
  } catch {
    return null;
  }
}

/** Extract post text from embed HTML */
function extractEmbedContent(html: string): string | null {
  // 1. Primary: <p class="attributed-text-segment-list__content ...">
  const attrListMatch =
    /<p[^>]*class="[^"]*attributed-text-segment-list__content[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(
      html,
    );
  if (attrListMatch?.[1]) {
    const cleaned = cleanHtml(attrListMatch[1]);
    if (cleaned.length > 10) return cleaned;
  }

  // 2. data-test-id="main-feed-activity-embed-card__commentary"
  const commentaryMatch =
    /<p[^>]*data-test-id="main-feed-activity-embed-card__commentary"[^>]*>([\s\S]*?)<\/p>/i.exec(
      html,
    );
  if (commentaryMatch?.[1]) {
    const cleaned = cleanHtml(commentaryMatch[1]);
    if (cleaned.length > 10) return cleaned;
  }

  // 3. Fallback: og:description (full text on embed pages)
  const ogDesc = extractMeta(html, "og:description");
  if (ogDesc && ogDesc.length > 10) return ogDesc;

  // 4. meta name="description"
  const metaDesc = extractMetaName(html, "description");
  if (metaDesc && metaDesc.length > 10) return metaDesc;

  return null;
}

/** Extract author name from embed HTML */
function extractEmbedAuthor(html: string): string | null {
  // 1. data-tracking-control-name="public_post_embed_feed-actor-name"
  const trackingMatch =
    /<a[^>]*data-tracking-control-name="public_post_embed_feed-actor-name"[^>]*>([\s\S]*?)<\/a>/i.exec(
      html,
    );
  if (trackingMatch?.[1]) {
    const name = cleanHtml(trackingMatch[1]).trim();
    if (name) return name;
  }

  // 2. og:title fallback — "Post text... | AuthorName"
  const ogTitle = extractMeta(html, "og:title");
  if (ogTitle) {
    // LinkedIn embed og:title format: "Post text... | Author Name"
    const pipeMatch = /\|\s*([^|]+?)\s*$/.exec(ogTitle);
    if (pipeMatch?.[1]) return pipeMatch[1].trim();
    const onMatch = /^(.+?)\s+on\s+LinkedIn/i.exec(ogTitle);
    if (onMatch?.[1]) return onMatch[1].trim();
  }

  return null;
}

/** Extract author profile URL */
function extractEmbedAuthorUrl(html: string): string | null {
  // Match linkedin.com/in/ URLs (may have country subdomain like id.linkedin.com)
  const match =
    /href=["'](https:\/\/[^"']*linkedin\.com\/in\/[^"'?]+)/i.exec(html);
  return match?.[1] ?? null;
}

/** Try to extract the original post URL from the embed page */
function extractEmbedPostUrl(html: string): string | null {
  const linkMatch =
    /href=["'](https:\/\/www\.linkedin\.com\/(?:feed\/update|posts)\/[^"']+)["']/i.exec(
      html,
    );
  return linkMatch?.[1] ?? null;
}

/** Detect media type from embed HTML */
function detectMediaType(
  html: string,
): "photo" | "video" | "carousel" | null {
  const lowerHtml = html.toLowerCase();

  // Video detection
  if (
    lowerHtml.includes("<video") ||
    lowerHtml.includes("feed-shared-video") ||
    lowerHtml.includes("video-player")
  ) {
    return "video";
  }

  // Carousel / document detection
  if (
    lowerHtml.includes("carousel") ||
    lowerHtml.includes("document-player") ||
    lowerHtml.includes("feed-shared-carousel")
  ) {
    return "carousel";
  }

  // Photo detection — look for feed-images-content list with images
  if (lowerHtml.includes("feed-images-content")) {
    // Count image items to distinguish single photo from multi
    const imageItems = html.match(/<li[^>]*class="[^"]*bg-color-background/gi);
    if (imageItems && imageItems.length > 1) {
      return "carousel";
    }
    return "photo";
  }

  return null;
}

/** Fallback: extract from a regular post URL using OG tags */
async function extractFromPostUrl(
  url: string,
): Promise<ExtractedPost | null> {
  try {
    const parsedUrl = new URL(url);
    const cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;

    const response = await fetch(cleanUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const html = await response.text();

    const ogTitle = extractMeta(html, "og:title");
    const ogDescription = extractMeta(html, "og:description");
    const ogImage = extractMeta(html, "og:image");

    let authorName: string | null = null;
    if (ogTitle) {
      const match = /^(.+?)\s+on\s+LinkedIn/i.exec(ogTitle);
      if (match?.[1]) authorName = match[1];
    }

    const content = ogDescription ?? ogTitle ?? "";
    if (!content) return null;

    return {
      content,
      authorName,
      authorUrl: null,
      postUrl: cleanUrl,
      embedUrl: null,
      mediaType: null,
      ogImage: ogImage ?? null,
    };
  } catch {
    return null;
  }
}

function extractMetaName(html: string, name: string): string | null {
  const regex = new RegExp(
    `<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const match = regex.exec(html);
  if (match?.[1]) return decodeHtmlEntities(match[1]);

  const regex2 = new RegExp(
    `<meta[^>]*content=["']([^"']*?)["'][^>]*name=["']${name}["']`,
    "i",
  );
  const match2 = regex2.exec(html);
  return match2?.[1] ? decodeHtmlEntities(match2[1]) : null;
}

function extractMeta(html: string, property: string): string | null {
  const regex = new RegExp(
    `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const match = regex.exec(html);
  if (match?.[1]) return decodeHtmlEntities(match[1]);

  const regex2 = new RegExp(
    `<meta[^>]*content=["']([^"']*?)["'][^>]*property=["']${property}["']`,
    "i",
  );
  const match2 = regex2.exec(html);
  return match2?.[1] ? decodeHtmlEntities(match2[1]) : null;
}

function cleanHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}
