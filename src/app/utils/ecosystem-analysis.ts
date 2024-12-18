import {
  Interaction,
  INTERACTION_PATTERNS,
} from "../data/interaction-patterns";
import { NFT_REPUTATIONS } from "../data/nft-reputations";
import { TOKEN_REPUTATIONS } from "../data/token-reputations";
import { NFTContract, TokenContract } from "../lib/fastnear";
import { Wealth } from "../lib/pikespeak";

export function analyzeInteractionPatterns(
  interactions: Interaction[],
  patterns = INTERACTION_PATTERNS,
): Record<string, string> {
  const reputations: Record<string, string> = {};

  // For each interaction
  interactions.forEach((interaction) => {
    // Check each pattern to see if this interaction's contract_id matches
    patterns.forEach((pattern) => {
      if (pattern.pattern.includes(interaction.contract_id)) {
        // Add it to our reputations object with the contract_id as the key
        reputations[interaction.contract_id] = pattern.reputation;
      }
    });
  });

  return reputations;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface TokenReputation {
  text: string;
  usdValue: number | null;
  balance: string | null;
}

export function analyzeTokenHoldings(
  tokenHoldings: TokenContract[],
  wealth?: Wealth | null,
  tokenReputations = TOKEN_REPUTATIONS,
): string[] {
  let numTokensNobodyHasEverHeardOf = 0;
  const reputations: TokenReputation[] = [];

  // First process tokens from wealth data if available
  const processedContracts = new Set<string>();
  if (wealth?.balance) {
    wealth.balance
      .filter(token => token.isParsed && token.usdValue && token.symbol !== "NEAR" && token.symbol !== "NEAR [Storage]")
      .forEach(token => {
        processedContracts.add(token.contract);
        const tokenRep = tokenReputations[token.contract];
        if (tokenRep && token.usdValue) {
          const value = parseFloat(token.usdValue).toFixed(2);
          if (value === "0.00") return; // ignore worthless coins
          reputations.push({
            text: `${tokenRep.name} - ${tokenRep.category} - VALUE: $${parseFloat(token.usdValue).toFixed(2)} - risk level ${tokenRep.risk} - REPUTATION: ${tokenRep.reputation}`,
            usdValue: parseFloat(token.usdValue),
            balance: null
          });
        } else {
          numTokensNobodyHasEverHeardOf += 1;
        }
      });
  }

  // Then process remaining tokens from tokenHoldings that weren't in wealth data
  tokenHoldings.forEach((token) => {
    // Skip tokens already processed
    if (processedContracts.has(token.contract_id)) return;

    const tokenRep = tokenReputations[token.contract_id];
    if (tokenRep) {
      reputations.push({
        text: `${tokenRep.name} - ${tokenRep.category} - BALANCE: ${token.balance} - risk level ${tokenRep.risk} - REPUTATION: ${tokenRep.reputation}`,
        usdValue: null,
        balance: token.balance
      });
    } else {
      numTokensNobodyHasEverHeardOf += 1;
    }
  });

  // Sort by USD value first, then by balance
  const sortedReputations = reputations.sort((a, b) => {
    // If both have USD values, compare them
    if (a.usdValue !== null && b.usdValue !== null) {
      return b.usdValue - a.usdValue;
    }
    // If only one has USD value, prioritize it
    if (a.usdValue !== null) return -1;
    if (b.usdValue !== null) return 1;
    // If neither has USD value, compare balances
    if (a.balance && b.balance) {
      return parseFloat(b.balance) - parseFloat(a.balance);
    }
    // If only one has balance, prioritize it
    if (a.balance) return -1;
    if (b.balance) return 1;
    // If neither has value nor balance, maintain original order
    return 0;
  });

  const sortedStrings = sortedReputations.map(rep => rep.text);

  if (numTokensNobodyHasEverHeardOf > 0) {
    sortedStrings.push(
      `and ${numTokensNobodyHasEverHeardOf} tokens nobody has ever heard of`,
    );
  }

  return sortedStrings;
}

export function analyzeNftHoldings(
  nftHoldings: NFTContract[],
  nftReputations = NFT_REPUTATIONS,
): string[] {
  let numNftsNobodyHasEverHeardOf = 0;
  const reputationStrings: string[] = [];

  // Cycle through token holdings and gather reputations
  nftHoldings.forEach((nft) => {
    const tokenRep = nftReputations[nft.contract_id];
    if (tokenRep) {
      reputationStrings.push(
        `${tokenRep.name} - ${tokenRep.category} - risk level ${tokenRep.risk} - REPUTATION: ${tokenRep.reputation}`,
      );
    } else {
      numNftsNobodyHasEverHeardOf += 1;
    }
  });

  if (numNftsNobodyHasEverHeardOf > 0) {
    reputationStrings.push(
      `and ${numNftsNobodyHasEverHeardOf} nfts nobody has ever heard of`,
    );
  }

  return shuffleArray(reputationStrings);
}
