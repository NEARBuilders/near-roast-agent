import { runLLMInference } from "../lib/open-ai";
import roastPrompt from '../data/roast-prompt.txt';

export async function generateRoast(summary: string): Promise<string> {
  try {
    // Run high temperature LLM inference on prompt and summary
    return await runLLMInference(roastPrompt, summary);
  } catch (error) {
    console.error("Error generating account roast:", error);
    throw error;
  }
}
