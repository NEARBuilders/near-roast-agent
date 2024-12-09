import { getAccountSummary } from "@/app/utils/account-summary";
import { generateRoast } from "@/app/utils/generate-roast";
import { isValidNearAccount } from "@/app/utils/validate";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

type CacheEntry = {
  roast: string;
  timestamp: number;
};

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const app = new Elysia({ prefix: "/api", aot: false })
  .use(swagger())
  .get("/roast/:accountId", async ({ params: { accountId } }) => {
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

        console.log("generated roast.")

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
