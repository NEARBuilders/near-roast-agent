export interface AccountState {
  balance: string;
  locked: string;
  storage_bytes: number;
}

export interface NFTContract {
  contract_id: string;
  last_update_block_height: number | null;
}

export interface StakingPool {
  pool_id: string;
  last_update_block_height: number | null;
}

export interface TokenContract {
  balance: string;
  contract_id: string;
  last_update_block_height: number;
}

export interface FullAccountDetails {
  account_id: string;
  nfts: NFTContract[];
  pools: StakingPool[];
  state: AccountState;
  tokens: TokenContract[];
}

export interface Transaction {
  account_id: string;
  signer_id: string;
  transaction_hash: string;
  tx_block_height: number;
  tx_block_timestamp: number;
}

export interface AccountActivityResponse {
  account_txs: Transaction[];
  transactions: any[];
  total_txs?: number; // Only present when max_block_height is not provided
}

const FASTNEAR_API_SERVER_RS = "https://api.fastnear.com";
const FASTNEAR_EXPLORER = "https://explorer.main.fastnear.com";

export async function getFullAccountDetails(
  accountId: string,
): Promise<FullAccountDetails> {
  try {
    const response = await fetch(
      `${FASTNEAR_API_SERVER_RS}/v1/account/${accountId}/full`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FullAccountDetails = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching account details:", error);
    throw error;
  }
}

export async function getAccountActivity(
  accountId: string,
  maxBlockHeight?: number,
): Promise<AccountActivityResponse> {
  try {
    const response = await fetch(`${FASTNEAR_EXPLORER}/v0/account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_id: accountId,
        ...(maxBlockHeight && { max_block_height: maxBlockHeight }),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AccountActivityResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching account activity:", error);
    throw error;
  }
}

export async function getAllAccountActivity(
  accountId: string,
  pages: number = 3,
): Promise<Transaction[]> {
  try {
    // First call without maxBlockHeight to get total transactions
    const firstPage = await getAccountActivity(accountId);
    let allTransactions = [...firstPage.account_txs];

    if (!firstPage.total_txs || pages <= 1) {
      return allTransactions;
    }

    // Use the last transaction's block height from each page to fetch the next page
    let lastBlockHeight =
      allTransactions[allTransactions.length - 1].tx_block_height;

    for (
      let i = 1;
      i < pages && allTransactions.length < firstPage.total_txs;
      i++
    ) {
      const nextPage = await getAccountActivity(accountId, lastBlockHeight);
      if (nextPage.account_txs.length === 0) break;

      allTransactions = [...allTransactions, ...nextPage.account_txs];
      lastBlockHeight =
        nextPage.account_txs[nextPage.account_txs.length - 1].tx_block_height;
    }

    return allTransactions;
  } catch (error) {
    console.error("Error fetching all account activity:", error);
    throw error;
  }
}
