import Anthropic from "@anthropic-ai/sdk";

export async function generateWithAnthropic(
  posts: { content: string; authorName: string | null }[],
  prompt: string,
  apiKey: string,
  userContext?: string | null,
): Promise<string> {
  const client = new Anthropic({ apiKey });

  const postsContext = posts
    .map(
      (p, i) =>
        `--- Post ${i + 1}${p.authorName ? ` by ${p.authorName}` : ""} ---\n${p.content}`,
    )
    .join("\n\n");

  const contextSection = userContext?.trim()
    ? `\nABOUT THE USER (their LinkedIn voice/background):\n${userContext.trim()}\n`
    : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a LinkedIn content creator assistant. The user wants to remix the following LinkedIn posts into original content in their own voice.

FORMATTING RULES — follow these exactly:
- Use single blank lines between sentences or short points (LinkedIn line breaks)
- The opening hook gets its own line, always
- Never write dense paragraphs — break after every 1-2 sentences or idea
- No bullet points or markdown — plain text only
- No hashtags unless the user asks
- Output ONLY the post text, no commentary, no preamble
${contextSection}
INSPIRATION POSTS:
${postsContext}

USER INSTRUCTIONS:
${prompt}

Write a new, original LinkedIn post inspired by the posts above. Follow the user's instructions. Do NOT copy — remix the ideas, structure, or tone into something fresh. Use proper LinkedIn formatting with line breaks after every 1-2 sentences.`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}
