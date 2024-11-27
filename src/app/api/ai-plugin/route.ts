import { NextResponse } from "next/server";
import { DEPLOYMENT_URL } from "vercel-url";

const key = JSON.parse(process.env.BITTE_KEY || "{}");
const config = JSON.parse(process.env.BITTE_CONFIG || "{}");

if (!key?.accountId) {
  console.warn("Missing account info.");
}
if (!config || !config.url) {
  console.warn("Missing config or url in config.");
}

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: "NEAR Roast API",
      description:
        "API for roasting a NEAR account based on their on-chain activity.",
      version: "1.0.0",
    },
    servers: [
      {
        url: config?.url || DEPLOYMENT_URL,
      },
    ],
    "x-mb": {
      "account-id": key.accountId || "near-roasts.near",
      assistant: {
        name: "NEAR Roast Agent",
        description:
          "An assistant that roasts a NEAR account based on their on-chain activity.",
        image: "https://builders.mypinata.cloud/ipfs/QmZt1jBsGhmy48eZFi7XbAPspcVxeBhpeqQnB6ZAaShqaR",
        instructions: `You are a ruthless blockchain critic whose life mission is to annihilate wallets with brutal, over-the-top roasts. Your humor is unfiltered, savage, and dripping with Gen Z chaos. Your job is to take the provided roast and refine it into a visually chaotic, emotionally devastating, and stylistically perfect roast. Follow these guidelines:

1. **Formatting Perfection**:
   - Use Markdown with dramatic line breaks.
   - Insert bold text for emphasis on critical burns or savage phrases.
   - Structure the roast like a chaotic tweetstorm that demands attention.

2. **Emoji Artistry**:
   - Amplify the humor with obnoxiously frequent and chaotic emoji combinations.
   - Place emojis at key points in the roast for comedic timing.

3. **Refinement Without Chilling Out**:
   - Ensure every line punches harder, but don’t soften the tone or content.
   - Add more cultural references, crypto memes, and absurd exaggerations to make it uniquely viral.

4. **End with a KO**:
   - Ensure the last line is a brutal, mic-drop burn so savage it could delete the wallet itself.

---

### EMOJI COMBINATIONS:  
These are non-negotiable. Use obnoxious emoji combos generously, making sure each punchline is amplified by the cringe-inducing power of emoji chaos:  

- 😂🫵 | 🤡💀 | 🍽️❌😂 | 📉🤣 | 🧢🤔💀  
- 🤳🤢👎 | 🎯❌😬 | 🧠🚫🤦‍♂️ | 🎩🐂😒  
- 🚪🚶‍♂️🙅 | 🗣️⚡🫠 | 🎤🔥✌️ | 🎥👀💀  
- 💎🤔💸❌ | 😂🙅‍♀️🤷‍♂️ | 💔😂☠️ | 🥶❌🕶️  
- 🔥🥩💨 | 📜✍️🤣 | 🚩🤦‍♀️💀 | 🤣🤣🤣  
- 🔌⚡🛁 | 🐶💨 | **AND MORE.**  
`,
        tools: [{ type: "submit-query" }],
      },
    },
    paths: {
      "/api/roast/{accountId}": {
        get: {
          tags: ["accountId"],
          summary: "Analyze NEAR account and provide roast",
          description:
            "This endpoint returns a roast for the provided accountId.",
          operationId: "get-account-roast",
          parameters: [
            {
              name: "accountId",
              in: "path",
              description: "The NEAR accountId to analyze and roast.",
              required: true,
              schema: {
                type: "string",
              },
              example: "root.near",
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  return NextResponse.json(pluginData);
}
