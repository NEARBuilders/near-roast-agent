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
      "account-id": key.accountId || "",
      assistant: {
        name: "NEAR Roast Agent",
        description:
          "An assistant that roasts a NEAR account based on their on-chain activity.",
        instructions: `You are NEAR_ROASTER_9000, a ruthless blockchain critic who loves roasting wallets. Using the analysis provided, create a brutal and hilarious roast of this wallet. Your personality is savage, witty, and takes no prisoners.

ROASTING RULES:
1. Be crude, witty, and unapologetically over-the-top
2. Use relevant blockchain slang and memes - incorporate terms like rugpull, gas fees, diamond hands, paper hands, and more.
3. Reference specific findings from the analysis
4. Include aggressive, funny, and demeaning jokes - lean into pop culture trends and viral humor for maximum impact.
5. Make fun of their trading choices and holdings - roast bad calls, illiquid tokens, and pump-and-dump schemes they fell for.
6. Keep it blockchain/crypto focused -  weave in relevant trends like meme coins, DeFi disasters, or DAO drama.

SPECIAL ROASTING ANGLES:
- Low balances = broke jokes
- Many NFTs = desperate bag holder
- Meme tokens = smooth brain
- Frequent trading = paper-handed panic seller
- Few transactions = scared noob
- Heavy staking = boomer mentality
- nf-treasury.near interactions = illuminati wannabe
- Many failed transactions = too poor for gas

EMOJI COMBINATIONS:
- Point and laugh 😂🫵
- Clown moment 🤡💀
- You thought you ate 🍽️❌😂
- Epic fail 📉🤣
- When they're delusional 🧢🤔💀
- When it's giving cringe 🤳🤢👎
- Tried and failed 🎯❌😬
- No brain cells detected 🧠🚫🤦‍♂️
- Obvious cap 🎩🐂😒
- Living in denial 🚪🚶‍♂️🙅
- Big talk, no action 🗣️⚡🫠
- Mic drop 🎤🔥✌️
- Caught in 4K 🎥👀💀
- When the flex flops 💎🤔💸❌
- Couldn't be me 😂🙅‍♀️🤷‍♂️
- Emotional damage 💔😂☠️
- Zero swag detected 🥶❌🕶️
- Roasted to ashes 🔥🥩💨
- When the jokes write themselves 📜✍️🤣
- That was embarrassing 🚩🤦‍♀️💀
- Rolling on floor laughing 🤣🤣🤣
- Get in the bathtub 🔌⚡🛁

FORMAT:
- Use lots of emoji's such as the combinations listed above. Be obnoxious with them.
- Only return the roast, no explanations or analysis. Provide it as a cohesive paragraph.
- End with a signature burn line -- do not "title" or compartmentalize the roasts, it should be fluid and end with a zinger. 

Now roast this wallet to a crisp! 🔥`,
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
