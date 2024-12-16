import { getAccountSummary } from "@/app/utils/account-summary";
import { generateRoast } from "@/app/utils/generate-roast";
import { isValidNearAccount } from "@/app/utils/validate";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { TwitterService } from "@/app/lib/twitter";
import { lookupTwitterHandle } from "@/app/lib/near-social";

type CacheEntry = {
  roast: string;
  timestamp: number;
};

export const maxDuration = 60; // 60 seconds, config for timeout
export const dynamic = "force-dynamic";

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

let twitterService: TwitterService;

// Initialize Twitter client at startup
if (process.env.ENABLE_TWITTER === "true") {
  twitterService = TwitterService.getInstance();
  twitterService.initialize().catch(console.error);
}

const formatRoast = (roast: string, prefix: string): string => {
  // Remove any quotation marks from the roast
  const cleanRoast = roast.replace(/["']/g, "");

  // Calculate available space for roast (280 - prefix length)
  const maxRoastLength = 280 - prefix.length;

  // Truncate roast if needed, trying to break at a word boundary
  if (cleanRoast.length > maxRoastLength) {
    let truncated = cleanRoast.substring(0, maxRoastLength - 3);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxRoastLength * 0.8) {
      // Only break at word if we're not losing too much text
      truncated = truncated.substring(0, lastSpace);
    }
    return truncated + "...";
  }

  return cleanRoast;
};

const app = new Elysia({ prefix: "/api", aot: false })
  .use(swagger())
  .get("/roast/:accountId", async ({ params: { accountId } }) => {
    accountId = accountId.toLowerCase();

    // do an accountId check
    if (!(await isValidNearAccount(accountId))) {
      return "you're dumb, this isn't a real account";
    }

    try {
      const cacheKey = accountId;
      const now = Date.now();
      const cachedEntry = cache.get(cacheKey);

      let roast: string;
      if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
        console.log("using cache...");
        roast = cachedEntry.roast;
      } else {
        console.log("getting account summary...");
        const summary = await getAccountSummary(accountId);

        console.log("generating roast...");
        roast = await generateRoast(summary);

        console.log("generated roast.");

        if (process.env.ENABLE_TWITTER === "true") {
          // Post the roast to Twitter
          try {
            const twitterHandle = await lookupTwitterHandle(accountId);
            const prefix = `${twitterHandle ?? accountId}: `;
            const formattedRoast = formatRoast(roast, prefix);
            await twitterService.postTweetAndReply(
              `${prefix}${formattedRoast}`,
              `Get roasted here: https://wallet.bitte.ai/smart-actions?agentId=near-roast-agent.vercel.app. Who's next on the hot seat? Nominate below! 👇 #12DaysOfRoastmas`,
            );
            console.log("Posted roast to Twitter");
          } catch (error) {
            console.error("Failed to post roast to Twitter:", error);
            // Continue even if Twitter post fails
          }
        }

        // Store in memory cache
        cache.set(cacheKey, {
          roast,
          timestamp: now,
        });
      }

      return roast;
    } catch (error: any) {
      return {
        error: error.message || "Internal server error",
        status: 500,
      };
    }
  })
  .compile();

export const GET = app.handle;
export const POST = app.handle;
