import { processAccount } from "../lib/chain-sleuth"

export async function getAccountSummary(accountId: string): Promise<string> {
  const accountSummary = await processAccount(accountId);
  console.log(accountSummary);
  // make a request to trigger processing
 return Promise.resolve("hi");
}