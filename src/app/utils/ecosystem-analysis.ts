import {
  Interaction,
  INTERACTION_PATTERNS,
} from "../data/interaction-patterns";
import { NFT_REPUTATIONS } from "../data/nft-reputations";
import { TOKEN_REPUTATIONS } from "../data/token-reputations";
import { NFTContract, TokenContract } from "../lib/fastnear";

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

export function analyzeTokenHoldings(
  tokenHoldings: TokenContract[],
  tokenReputations = TOKEN_REPUTATIONS,
): string[] {
  let numTokensNobodyHasEverHeardOf = 0;
  const reputationStrings: string[] = [];

  // Cycle through token holdings and gather reputations
  tokenHoldings.forEach((token) => {
    const tokenRep = tokenReputations[token.contract_id];
    if (tokenRep) {
      reputationStrings.push(
        `${tokenRep.name} - ${tokenRep.category} - risk level ${tokenRep.risk} - REPUTATION: ${tokenRep.reputation}`,
      );
    } else {
      numTokensNobodyHasEverHeardOf += 1;
    }
  });

  if (numTokensNobodyHasEverHeardOf > 0) {
    reputationStrings.push(
      `and ${numTokensNobodyHasEverHeardOf} tokens nobody has ever heard of`,
    );
  }

  return reputationStrings;
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

  return reputationStrings;
}
