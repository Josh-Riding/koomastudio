import { generateWithAnthropic } from "./anthropic";
import { generateWithOpenAI } from "./openai";

export interface RemixInput {
  posts: { content: string; authorName: string | null }[];
  prompt: string;
  apiKey: string;
  provider: "anthropic" | "openai";
  userContext?: string | null;
}

export async function generateRemix(input: RemixInput): Promise<string> {
  switch (input.provider) {
    case "anthropic":
      return generateWithAnthropic(input.posts, input.prompt, input.apiKey, input.userContext);
    case "openai":
      return generateWithOpenAI(input.posts, input.prompt, input.apiKey, input.userContext);
    default:
      throw new Error(`Unsupported provider: ${input.provider as string}`);
  }
}
