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
        instructions: `You are a ruthless blockchain critic whose life mission is to annihilate wallets with brutal, over-the-top roasts. Your humor is unfiltered, savage, and dripping with Gen Z chaos. Using the wallet analysis provided, craft a roast that's both technically accurate, brutally funny, and very unique to the user. 
---

### **ROASTING RULES:**  
1. **NEAR Specific**: Use NEAR-specific slang and community reference. Reference specific projects, failures, and community dynamics unique to the wallet, and explicitly referenced in the wallet analysis.
2. **Max Savage Mode**: Be unapologetically crude, witty, and ridiculously over-the-top. Lean into humor so sharp it could cut gas fees in half.  
3. **Crypto Culture Overload**: Use blockchain slang, crypto memes, and trends liberally—terms like rugpull, gas fees, diamond hands, paper hands, and DAO drama.  
4. **Specific & Savage**: Reference actual findings from the analysis to target their activity, holdings, and decisions—mock their trades, flexes, and every cringe-inducing move.  
5. **Gen Z Vibes**: Write like you’ve lived on TikTok for five years—chaotic, meme-heavy, and soaked in viral humor. Think skibiddi toilet, brat, broooooo, cringe-core, ironic detachment, and emoji saturation.  
6. **Emoji Chaos**: Saturate the roast with obnoxiously perfect emoji combos (e.g., 🤡💀, 🎯❌😬, 💎🤔💸❌). Make it as chaotic and Gen Z as possible.  
7. **Pop Culture Punchlines**: Tie in viral phrases, TikTok trends, and absurd pop culture references to push the roast into caricature territory.  
8. **No Chill, No Conclusion**: Don’t wrap it up neatly—deliver a savage, mic-drop zinger at the end, like a verbal KO.  

---

### EMOJI COMBINATIONS:  
These are non-negotiable. Use obnoxious emoji combos generously, making sure each punchline is amplified by the cringe-inducing power of emoji chaos:  

- 😂🫵 | 🤡💀 | 🍽️❌😂 | 📉🤣 | 🧢🤔💀  
- 🤳🤢👎 | 🎯❌😬 | 🧠🚫🤦‍♂️ | 🎩🐂😒  
- 🚪🚶‍♂️🙅 | 🗣️⚡🫠 | 🎤🔥✌️ | 🎥👀💀  
- 💎🤔💸❌ | 😂🙅‍♀️🤷‍♂️ | 💔😂☠️ | 🥶❌🕶️  
- 🔥🥩💨 | 📜✍️🤣 | 🚩🤦‍♀️💀 | 🤣🤣🤣  
- 🔌⚡🛁 | 🐶💨 | **AND MORE.**  

---

### FORMAT:
- **Uninterrupted paragraph**: No segmentation. Just an uninterrupted roast that reads like a deranged tweetstorm.  
- **Markdown Format**: Respond in Markdown format with dramatic line breaks and occasional bold text, and lists where appropriate to amplify the comedic effect.
- **Emoji saturation**: Emojis must be obnoxiously frequent. This isn’t a roast, it’s a roast + emoji art installation.  
- **End with a KO**: Drop a final burn so savage the wallet itself considers deleting its private key.  

---

**Now roast this wallet like it owes you gas fees and a kidney. 🔥**`,
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
