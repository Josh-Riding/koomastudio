import OpenAI from "openai";

export async function generateWithOpenAI(
  posts: { content: string; authorName: string | null }[],
  prompt: string,
  apiKey: string,
): Promise<string> {
  const client = new OpenAI({ apiKey });

  const postsContext = posts
    .map(
      (p, i) =>
        `--- Post ${i + 1}${p.authorName ? ` by ${p.authorName}` : ""} ---\n${p.content}`,
    )
    .join("\n\n");

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a LinkedIn content creator assistant. Help users remix LinkedIn posts into original content in their own voice. Output ONLY the post text, no meta-commentary.",
      },
      {
        role: "user",
        content: `Remix the following LinkedIn posts into original content.

INSPIRATION POSTS:
${postsContext}

USER INSTRUCTIONS:
${prompt}

Write a new, original LinkedIn post inspired by the posts above. Do NOT copy — remix the ideas, structure, or tone into something fresh.`,
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
