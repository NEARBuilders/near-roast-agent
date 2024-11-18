import {
  AccountActivityResponse,
  FullAccountDetails,
  getAccountActivity,
  getAllAccountActivity,
  getFullAccountDetails,
  Transaction,
} from "../lib/fastnear";
import { runLLMInference } from "../lib/open-ai";
import { analyzeInteractionPatterns, analyzeSignificantContracts, ContractMetadata, InteractionPattern } from "./ecosystem-analysis";

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
  analysis: {
    significantContracts: Array<{contract: string; metadata: ContractMetadata; frequency: number}>;
    interactionPatterns: Array<{pattern: InteractionPattern; matchCount: number}>;
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

  const significantContracts = analyzeSignificantContracts(allTransactions);
  const interactionPatterns = analyzeInteractionPatterns(allTransactions);

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
      uniqueInteractions
    },
    analysis: {
      significantContracts,
      interactionPatterns
    },
    staking: {
      pools: details.pools.map((pool) => pool.pool_id),
    },
  };
}

function createSummaryPrompt(data: AccountSummaryData): string {
  return `As an advanced blockchain analysis agent, analyze this NEAR account (${data.account_id}) and organize the findings into these specific categories:

WEALTH_METRICS:
- Balance: ${data.state.balance}
- Total tokens: ${data.assets.totalTokens}
- Notable holdings: ${data.assets.significantTokens.map((t) => `${t.balance} of ${t.contract}`).join(", ")}
- NFT count: ${data.assets.totalNFTs}
- Collections: ${data.assets.nftCollections.join(", ")}

BEHAVIOR_PATTERNS:
- Transaction count: ${data.activity.totalTransactions}
- Recent actions: ${data.activity.recentTransactions.map((tx) => `${formatTimestamp(tx.timestamp)}: ${tx.details}`).join("\n")}
- Unique contacts: ${data.activity.uniqueInteractions.length}

DEGEN_ANALYSIS:
- Key contracts: ${data.analysis.significantContracts.map(c => 
    `${c.contract} (${c.metadata.name}): ${c.frequency} interactions - ${c.metadata.description}`
  ).join("\n")}
- Behavior patterns: ${data.analysis.interactionPatterns.map(p =>
    `${p.pattern.name}: ${p.matchCount} matches - ${p.pattern.description}`
  ).join("\n")}

ECOSYSTEM_ROLE:
- Active staking pools: ${data.staking.pools.join(", ")}

Analyze and categorize:
1. Account wealth tier (whale, average, poor)
2. Trading behavior (diamond hands, paper hands, degen)
3. Community involvement (active, lurker, ghost)
4. Investment style (NFT collector, token trader, staking focused)
5. Risk profile (conservative, moderate, degen)
`;
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

    console.log("\n PROMPT \n");
    console.log(prompt);
    console.log("\n");

    // Run LLM inference on structured account data
    const summary = await runLLMInference(prompt);

    return summary;
  } catch (error) {
    console.error("Error generating account summary:", error);
    throw error;
  }
}
