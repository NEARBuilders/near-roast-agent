import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runLLMInference(prompt: string, summary: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // should we use a better model?
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: summary,
        },
      ],
      temperature: 0.8
    });

    return response.choices[0].message.content || "No summary generated";
  } catch (error) {
    console.error("Error in LLM inference:", error);
    throw error;
  }
}
