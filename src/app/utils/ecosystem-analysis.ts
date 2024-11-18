import { Transaction } from "../lib/fastnear";

export interface ContractMetadata {
  name: string;
  category: "defi" | "nft" | "gaming" | "dao" | "meme" | "stablecoin" | "scam";
  risk: "safe" | "medium" | "degen" | "mega-degen";
  description: string;
}

export interface InteractionPattern {
  pattern: string[];
  name: string;
  category: "trader" | "farmer" | "gambler" | "collector" | "bot" | "whale";
  description: string;
}

const SIGNIFICANT_CONTRACTS: Record<string, ContractMetadata> = {
  "v2.ref-finance.near": {
    name: "Ref Finance",
    category: "defi",
    risk: "medium",
    description: "Popular DEX, probably degen trading",
  },
  "nf-treasury.near": {
    name: "NEAR Foundation Treasury",
    category: "dao",
    risk: "safe",
    description: "Illuminati confirmed",
  },
  "wrap.near": {
    name: "wNEAR",
    category: "defi",
    risk: "safe",
    description: "Wrapped NEAR, basic DeFi user",
  },
  // what else???
};

const INTERACTION_PATTERNS: InteractionPattern[] = [
  {
    pattern: ["v2.ref-finance.near", "wrap.near"],
    name: "DeFi Degen",
    category: "trader",
    description: "Loves losing money on DEXes",
  },
  {
    pattern: ["aurora", "rainbow-bridge.near"],
    name: "Bridge Explorer",
    category: "gambler",
    description: "Can't decide which chain to lose money on",
  },
  // what else...
];

export function analyzeSignificantContracts(
  transactions: Transaction[],
  contracts = SIGNIFICANT_CONTRACTS,
): Array<{ contract: string; metadata: ContractMetadata; frequency: number }> {
  const contractCounts = new Map<string, number>();

  // Count interactions with significant contracts
  transactions.forEach((tx) => {
    if (contracts[tx.signer_id]) {
      contractCounts.set(
        tx.signer_id,
        (contractCounts.get(tx.signer_id) || 0) + 1,
      );
    }
  });

  // Convert to array and sort by frequency
  return Array.from(contractCounts.entries())
    .map(([contract, frequency]) => ({
      contract,
      metadata: contracts[contract],
      frequency,
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

export function analyzeInteractionPatterns(
  transactions: Transaction[],
  patterns = INTERACTION_PATTERNS,
): Array<{ pattern: InteractionPattern; matchCount: number }> {
  return patterns
    .map((pattern) => ({
      pattern,
      matchCount: transactions.filter((tx) =>
        pattern.pattern.some(
          (p) => tx.signer_id.includes(p) || tx.signer_id.includes(p),
        ),
      ).length,
    }))
    .filter((result) => result.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);
}
