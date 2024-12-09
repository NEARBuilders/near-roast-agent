import { Interaction } from "../data/interaction-patterns";
import {
  AccountActivityResponse,
  FullAccountDetails,
  getAllAccountActivity,
  getFullAccountDetails,
  RecentTransaction,
  TokenContract,
  Transaction,
} from "../lib/fastnear";
import { runLLMInference } from "../lib/open-ai";
import {
  analyzeInteractionPatterns,
  analyzeNftHoldings,
  analyzeTokenHoldings,
} from "./ecosystem-analysis";

interface AccountSummaryData {
  account_id: string;
  state: {
    balance: string;
    storage: number;
  };
  assets: {
    totalTokens: number;
    tokenHoldings: TokenContract[];
    totalNFTs: number;
    nftHoldings: string[];
  };
  activity: {
    totalTransactions: number;
    recentTransactions: RecentTransaction[];
    uniqueInteractions: Interaction[];
  };
  analysis: {
    tokenHoldings: string[];
    nftHoldings: string[];
    interactionPatterns: Record<string, string>;
  };
  staking: {
    pools: string[]; // staking pools
  };
}

function formatNearAmount(amount: string): string {
  const nearValue = Number(amount) / 10 ** 24;
  return `${nearValue.toFixed(2)} NEAR`;
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp / 1000000).toISOString();
}

function getUniqueAddresses(
  transactions: Transaction[],
  recentTransactions: RecentTransaction[],
): Interaction[] {
  const addressCounts = new Map<string, number>();

  // Count both signer_id and account_id interactions
  transactions.forEach((tx) => {
    // Count signer_id
    addressCounts.set(tx.signer_id, (addressCounts.get(tx.signer_id) || 0) + 1);

    // Count account_id if it's different from signer_id
    if (tx.account_id !== tx.signer_id) {
      addressCounts.set(
        tx.account_id,
        (addressCounts.get(tx.account_id) || 0) + 1,
      );
    }
  });

  recentTransactions.forEach((tx) => {
    // Count signer_id
    addressCounts.set(
      tx.transaction.signer_id,
      (addressCounts.get(tx.transaction.signer_id) || 0) + 1,
    );

    // Count receiver_id if it's different from signer_id
    if (tx.transaction.receiver_id !== tx.transaction.signer_id) {
      addressCounts.set(
        tx.transaction.receiver_id,
        (addressCounts.get(tx.transaction.receiver_id) || 0) + 1,
      );
    }
  });

  return Array.from(addressCounts.entries()).map(([address, count]) => ({
    contract_id: address,
    count,
  }));
}

function processAccountData(
  details: FullAccountDetails,
  allActivity: AccountActivityResponse,
): AccountSummaryData {
  // Process balance
  const nearBalance = formatNearAmount(details.state.balance);

  const allTransactions = allActivity.account_txs;
  const recentTransactions = allActivity.transactions;

  // Process unique interactions from transactions
  const uniqueInteractions = getUniqueAddresses(
    allTransactions,
    recentTransactions,
  );

  const tokenAnalysis = analyzeTokenHoldings(details.tokens);
  const nftAnalysis = analyzeNftHoldings(details.nfts);
  const patterns = analyzeInteractionPatterns(uniqueInteractions);

  return {
    account_id: details.account_id,
    state: {
      balance: nearBalance,
      storage: details.state.storage_bytes,
    },
    assets: {
      totalTokens: details.tokens.length,
      tokenHoldings: details.tokens,
      totalNFTs: details.nfts.length,
      nftHoldings: details.nfts.map((nft) => nft.contract_id),
    },
    activity: {
      totalTransactions: allActivity.txs_count || 0,
      recentTransactions,
      uniqueInteractions,
    },
    analysis: {
      tokenHoldings: tokenAnalysis,
      nftHoldings: nftAnalysis,
      interactionPatterns: patterns,
    },
    staking: {
      pools: details.pools.map((pool) => pool.pool_id),
    },
  };
}

function createSummary(data: AccountSummaryData): string {
  // Analyze wealth level
  const balanceInNear = parseFloat(data.state.balance);
  const wealthAnalysis =
    balanceInNear < 10
      ? "Broke degen, needs a faucet"
      : balanceInNear < 100
        ? "calls themselves a NEAR OG but can't afford gas fees"
        : balanceInNear < 1000
          ? "medium balance energy, definitely lost it all on ref finance"
          : "whale alert 🚨 (in their dreams)";

  // Format transaction analysis
  const txCount = data.activity.totalTransactions;
  const activityLevel =
    txCount < 50
      ? "Barely uses their wallet"
      : txCount < 200
        ? "Regular degen"
        : txCount < 3000
          ? "No-life degen"
          : "Terminal blockchain addiction";

  // Format interaction analysis with reputations
  const interactionSummary = data.activity.uniqueInteractions
    .map((interaction) => {
      const reputation =
        data.analysis.interactionPatterns[interaction.contract_id];
      if (reputation) {
        return `- ${interaction.count}x with ${interaction.contract_id}: REPUTATION: ${reputation}`;
      }
      return `- ${interaction.count}x with ${interaction.contract_id}`;
    })
    .join("\n");

  return `🔍 On-Chain Analysis of ${data.account_id}

💰 WEALTH ANALYSIS:
- Current status: ${wealthAnalysis} with ${data.state.balance} NEAR
- Storage usage: ${data.state.storage} bytes of blockchain pollution

🏦 PORTFOLIO ANALYSIS:
Token Holdings (${data.assets.totalTokens} total):
${data.analysis.tokenHoldings.join("\n")}

NFT Collection (${data.assets.totalNFTs} total):
${data.analysis.nftHoldings.join("\n")}

📊 BEHAVIOR ANALYSIS:
Activity Level: ${activityLevel}
- ${txCount} total transactions
- ${data.activity.uniqueInteractions.length} unique contracts interacted with

Notable Interactions:
${interactionSummary}

🥩 STAKING BEHAVIOR:
${
  data.staking.pools.length === 0
    ? "Not staking anything, certified paper hands"
    : `Staking in ${data.staking.pools.length} pools: ${data.staking.pools.join(", ")}`
}

🎯 ANALYSIS SUMMARY:
This account shows all the classic signs of ${
    txCount > 1000
      ? "a terminally online degen"
      : txCount > 500
        ? "someone who needs to touch grass"
        : txCount > 100
          ? "your average NEAR user"
          : "a blockchain tourist"
  }

Their portfolio clearly indicates ${
    data.assets.totalTokens > 10
      ? "a severe addiction to shitcoins"
      : data.assets.totalTokens > 5
        ? "an aspiring shitcoin collector"
        : "someone who hasn't discovered meme tokens yet"
  }`;
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

    // Create the summary from processed data
    return createSummary(processedData);
  } catch (error) {
    console.error("Error generating account summary:", error);
    throw error;
  }
}
