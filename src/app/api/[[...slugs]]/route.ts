import { getAccountSummary } from "@/app/utils/account-summary";
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
  .get("/roast/:accountId", async ({ params: { accountId }, set }) => {
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
        // Use cached roast if it's not expired
        roast = cachedEntry.roast;
      } else {
        // Analyze account and get summary
        console.log("getting account summary...");
        const summary = await getAccountSummary(accountId);
        roast = summary; // we could do some roasting here, but just returning directly and gonna tweek the instructions instead
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
