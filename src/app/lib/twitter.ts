import { Scraper } from "agent-twitter-client";

interface TwitterCookie {
  key: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: string;
}

interface CookieCache {
  [username: string]: TwitterCookie[];
}

export class TwitterService {
  private client: Scraper;
  private isInitialized: boolean = false;
  private static instance: TwitterService;

  private constructor() {
    this.client = new Scraper();
  }

  public static getInstance(): TwitterService {
    if (!TwitterService.instance) {
      TwitterService.instance = new TwitterService();
    }
    return TwitterService.instance;
  }

  private async setCookiesFromArray(cookiesArray: TwitterCookie[]) {
    const cookieStrings = cookiesArray.map(
      (cookie) =>
        `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; ${cookie.secure ? "Secure" : ""
        }; ${cookie.httpOnly ? "HttpOnly" : ""}; SameSite=${cookie.sameSite || "Lax"
        }`
    );
    await this.client.setCookies(cookieStrings);
  }

  private async getCachedCookies(username: string): Promise<TwitterCookie[] | null> {
    try {
      // Try to read cookies from a local cache file
      const fs = await import('fs/promises');
      const path = await import('path');
      const cookiePath = path.join(process.cwd(), '.twitter-cookies.json');

      const data = await fs.readFile(cookiePath, 'utf-8');
      const cache: CookieCache = JSON.parse(data);

      if (cache[username]) {
        return cache[username];
      }
    } catch (error) {
      // If file doesn't exist or is invalid, return null
      return null;
    }
    return null;
  }

  private async cacheCookies(username: string, cookies: TwitterCookie[]) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const cookiePath = path.join(process.cwd(), '.twitter-cookies.json');

      let cache: CookieCache = {};
      try {
        const data = await fs.readFile(cookiePath, 'utf-8');
        cache = JSON.parse(data);
      } catch (error) {
        // If file doesn't exist, start with empty cache
      }

      cache[username] = cookies;
      await fs.writeFile(cookiePath, JSON.stringify(cache, null, 2));
    } catch (error) {
      console.error('Failed to cache cookies:', error);
    }
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      const username = process.env.TWITTER_USERNAME!;
      const password = process.env.TWITTER_PASSWORD!;
      const email = process.env.TWITTER_EMAIL!;

      // Check for cached cookies
      const cachedCookies = await this.getCachedCookies(username);
      if (cachedCookies) {
        await this.setCookiesFromArray(cachedCookies);
      }

      // Try to login with retries
      while (true) {
        try {
          await this.client.login(
            username,
            password,
            email,
          );

          if (await this.client.isLoggedIn()) {
            // Cache the new cookies
            const cookies = await this.client.getCookies();
            await this.cacheCookies(username, cookies);
            break;
          }
        } catch (error) {
          console.error('Failed to login to Twitter, retrying...', error);
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      this.isInitialized = true;
      console.info('Successfully logged in to Twitter');

    } catch (error) {
      console.error('Failed to initialize Twitter client:', error);
      throw error;
    }
  }

  async postTweet(tweet: string) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      const response = await this.client.sendTweet(tweet);
      const body: any = await response.json();
      return body?.data?.create_tweet?.tweet_results?.result.rest_id;
    } catch (error) {
      console.error('Error sending tweet:', error);
      throw error;
    }
  }

  async postTweetAndReply(tweet: string, reply: string) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Send initial test tweet
      const tweetId = await this.postTweet(tweet);

      // Wait a moment before replying
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reply to the test tweet
      await this.replyToTweet(tweetId, reply);
    } catch (error) {
      console.error('Error sending test tweet and reply:', error);
    }
  }

  private async replyToTweet(tweetId: string, message: string): Promise<void> {
    try {
      await this.client.sendTweet(message, tweetId); // Second parameter is the tweet to reply to
    } catch (error) {
      console.error('Error replying to tweet:', error);
      throw error;
    }
  }
}
