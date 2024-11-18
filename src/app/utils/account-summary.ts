import {
  AccountActivityResponse,
  FullAccountDetails,
  getAccountActivity,
  getAllAccountActivity,
  getFullAccountDetails,
  Transaction,
} from "../lib/fastnear";
import { runLLMInference } from "../lib/open-ai";

interface AccountSummaryData {
  account_id: string;
  state: {
    balance: string;
    storage: number;
  };
  assets: {
    totalTokens: number;
    significantTokens: Array<{
      contract: string;
      balance: string;
    }>;
    totalNFTs: number;
    nftCollections: string[];
  };
  activity: {
    totalTransactions: number;
    recentTransactions: Array<{
      type: string;
      timestamp: number;
      details: string;
    }>;
    uniqueInteractions: string[];
  };
  staking: {
    pools: string[];
  };
}

function formatNearAmount(amount: string): string {
  const nearValue = Number(amount) / 10 ** 24;
  return `${nearValue.toFixed(2)} NEAR`;
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp / 1000000).toISOString();
}

function getUniqueItems(items: string[]): string[] {
  return Array.from(new Set(items));
}

function processAccountData(
  details: FullAccountDetails,
  allActivity: AccountActivityResponse,
): AccountSummaryData {
  // Process balance
  const nearBalance = formatNearAmount(details.state.balance);

  // Process tokens - filter out empty balances
  const significantTokens = details.tokens
    .filter((token) => token.balance && token.balance !== "0")
    .map((token) => ({
      contract: token.contract_id,
      balance: token.balance,
    }));

  const allTransactions = allActivity.account_txs;

  // Process unique interactions from transactions
  const uniqueInteractions = getUniqueItems(
    allTransactions.map((tx) => tx.signer_id),
  );
  // Format recent transactions
  const recentTransactions = allTransactions.slice(0, 10).map((tx) => ({
    type: "transaction",
    timestamp: tx.tx_block_timestamp,
    details: `Interaction with ${tx.signer_id}`,
  }));

  return {
    account_id: details.account_id,
    state: {
      balance: nearBalance,
      storage: details.state.storage_bytes,
    },
    assets: {
      totalTokens: details.tokens.length,
      significantTokens,
      totalNFTs: details.nfts.length,
      nftCollections: details.nfts.map((nft) => nft.contract_id),
    },
    activity: {
      totalTransactions: allActivity.txs_count || 0,
      recentTransactions,
      uniqueInteractions,
    },
    staking: {
      pools: details.pools.map((pool) => pool.pool_id),
    },
  };
}

function createSummaryPrompt(data: AccountSummaryData): string {
  return `Please provide a comprehensive summary of this NEAR account (${data.account_id}):

Account Overview:
- Current balance: ${data.state.balance}
- Storage usage: ${data.state.storage} bytes

Assets:
- Holds ${data.assets.totalTokens} different tokens
- Notable token holdings: ${data.assets.significantTokens
    .map((t) => `${t.balance} of ${t.contract}`)
    .join(", ")}
- NFT Collections (${data.assets.totalNFTs}): ${data.assets.nftCollections.join(", ")}

Activity:
- Total transactions: ${data.activity.totalTransactions}
- Recent activity: ${data.activity.recentTransactions
    .map((tx) => `${formatTimestamp(tx.timestamp)}: ${tx.details}`)
    .join("\n")}
- Unique interactions: ${data.activity.uniqueInteractions.length} different accounts

Staking:
- Active in ${data.staking.pools.length} staking pools: ${data.staking.pools.join(", ")}

Please analyze this data and provide:
1. A summary of the account's main activities and holdings
2. Notable patterns in transaction history
3. Assessment of the account's engagement with the NEAR ecosystem
4. Any interesting observations about the account's behavior`;
}

export async function getAccountSummary(accountId: string): Promise<string> {
  const MAX_NUM_PAGES = 20; // maximum pages of transaction data to fetch (200/page = 4000 txs)
  try {
    // Fetch all required data
    const [details, allActivity] = await Promise.all([
      getFullAccountDetails(accountId),
      getAllAccountActivity(accountId, MAX_NUM_PAGES),
    ]);

    // Process the data into a structured format
    const processedData = processAccountData(details, allActivity);

    // Create the prompt for LLM
    const prompt = createSummaryPrompt(processedData);

    // Run LLM inference on structured account data
    const summary = await runLLMInference(prompt);

    return summary;
  } catch (error) {
    console.error("Error generating account summary:", error);
    throw error;
  }
}
