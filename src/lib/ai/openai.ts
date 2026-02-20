import OpenAI from "openai";

export async function generateWithOpenAI(
  posts: { content: string; authorName: string | null }[],
  prompt: string,
  apiKey: string,
  userContext?: string | null,
): Promise<string> {
  const client = new OpenAI({ apiKey });

  const postsContext = posts
    .map(
      (p, i) =>
        `--- Post ${i + 1}${p.authorName ? ` by ${p.authorName}` : ""} ---\n${p.content}`,
    )
    .join("\n\n");

  const contextSection = userContext?.trim()
    ? `\nABOUT THE USER (their LinkedIn voice/background):\n${userContext.trim()}\n`
    : "";

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a LinkedIn content creator assistant. Help users remix LinkedIn posts into original content in their own voice.

FORMATTING RULES — follow these exactly:
- Use single blank lines between sentences or short points (LinkedIn line breaks)
- The opening hook gets its own line, always
- Never write dense paragraphs — break after every 1-2 sentences or idea
- No bullet points or markdown — plain text only
- No hashtags unless the user asks
- Output ONLY the post text, no commentary, no preamble${userContext?.trim() ? `\n\nAbout this user:\n${userContext.trim()}` : ""}`,
      },
      {
        role: "user",
        content: `Remix the following LinkedIn posts into original content.
${contextSection}
INSPIRATION POSTS:
${postsContext}

USER INSTRUCTIONS:
${prompt}

Write a new, original LinkedIn post inspired by the posts above. Do NOT copy — remix the ideas, structure, or tone into something fresh. Use proper LinkedIn formatting with line breaks after every 1-2 sentences.`,
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
