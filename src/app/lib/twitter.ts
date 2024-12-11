import { Scraper } from "agent-twitter-client";

const scraper = new Scraper();

// Initialize Twitter client on module load
async function initializeTwitter() {
  if (!process.env.TWITTER_USERNAME || 
      !process.env.TWITTER_PASSWORD || 
      !process.env.TWITTER_EMAIL
  ) {
       // !process.env.TWITTER_API_KEY || 
      // !process.env.TWITTER_API_SECRET_KEY || 
      // !process.env.TWITTER_ACCESS_TOKEN || 
      // !process.env.TWITTER_ACCESS_TOKEN_SECRET) {
    throw new Error('Missing required Twitter environment variables');
  }

  // Hey what's up guys
  // Can we talk about the roast agent?
  
  // Was this project discussed with David before it was started? He's OOO until the 12th, one day before 13th.
  // 
  // I understand a goal is to launch this on Product Hunt, but the most effective audience are people with lots of NEAR activity.
  // And creating a Bitte account to test it out, you will always be roasted for having no balance.
  // 
  // Luis, thank you for your responses
  // I have other clients to complete,
  // I don't want to be confused with the 

  await scraper.login(
    process.env.TWITTER_USERNAME,
    process.env.TWITTER_PASSWORD,
    process.env.TWITTER_EMAIL
    // process.env.TWITTER_API_KEY,
    // process.env.TWITTER_API_SECRET_KEY,
    // process.env.TWITTER_ACCESS_TOKEN,
    // process.env.TWITTER_ACCESS_TOKEN_SECRET,
  );
}

// Initialize on module load
initializeTwitter().catch(console.error);

interface PollData {
  options: Array<{ label: string }>;
  duration_minutes: number;
}

interface TweetOptions {
  poll?: PollData;
}

/**
 * Splits a long text into tweet-sized chunks and posts them as a thread
 * @param text The text to split and tweet
 * @param options Optional tweet options (like polls, which only work on the first tweet)
 * @returns Array of tweet IDs in the thread
 * @throws Error if tweet posting fails
 */
export async function sendThreadedTweet(text: string, options?: TweetOptions): Promise<string[]> {
  const MAX_TWEET_LENGTH = 280;
  const tweetIds: string[] = [];
  
  // Split text into chunks based on newlines and length
  const chunks: string[] = [];
  const paragraphs = text.split('\n');
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed tweet length, save current chunk
    if (currentChunk.length + paragraph.length + 1 > MAX_TWEET_LENGTH) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      // Add paragraph to current chunk
      currentChunk = currentChunk ? `${currentChunk}\n${paragraph}` : paragraph;
    }
  }
  // Add final chunk if there's anything left
  if (currentChunk) chunks.push(currentChunk.trim());
  
  // If text fits in a single tweet, just send it
  if (chunks.length === 1) {
    console.log("sending ", chunks[0]);
    const tweet = await scraper.sendTweetV2(chunks[0], undefined, options);
    if (!tweet?.id) throw new Error('Failed to post tweet');
    return [tweet.id];
  }
  
  // Post thread
  let lastTweetId: string | undefined;
  for (let i = 0; i < chunks.length; i++) {
    const isFirst = i === 0;
    console.log("sending ", chunks[i]);
    const tweet = await scraper.sendTweetV2(
      chunks[i],
      lastTweetId ?? undefined,
      isFirst ? options : undefined
    );
    if (!tweet?.id) throw new Error(`Failed to post tweet ${i + 1} in thread`);
    tweetIds.push(tweet.id);
    lastTweetId = tweet.id;
  }
  
  return tweetIds;
}

export { scraper };
