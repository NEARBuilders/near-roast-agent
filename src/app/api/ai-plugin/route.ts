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
        instructions:
          "Get information for a given fungible token or swaps one token for another.",
        tools: [{ type: "generate-transaction" }],
      },
    },
    paths: {
      "/api/roast/{accountId}": {
        get: {
          tags: ["accountId"],
          summary: "Analyze NEAR account and provide roast",
          description:
            "This endpoint returns a roast for the provided accountId.",
          operationId: "get-token-metadata",
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
