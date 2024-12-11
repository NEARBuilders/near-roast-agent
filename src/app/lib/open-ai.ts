import OpenAI from "openai";
import { ResponseFormatJSONSchema } from 'openai/resources/shared.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runLLMInference(
  prompt: string,
  summary: string,
  responseSchema: ResponseFormatJSONSchema.JSONSchema
): Promise<string> {
  try {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: summary,
        },
      ],
      temperature: 0.8, // be more creative
      response_format: {
        json_schema: responseSchema,
        type: "json_schema"
      }
    });

    return response.choices[0].message.parsed || "No summary generated";
  } catch (error) {
    console.error("Error in LLM inference:", error);
    throw error;
  }
}
