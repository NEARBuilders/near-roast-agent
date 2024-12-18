interface Token {
  id: string;
  symbol: string;
  icon?: string | null;
  amount: string;
  usdValue: string | null;
  hasPrice: boolean;
  isParsed: boolean;
}

interface UnclaimedReward extends Token {}

interface FarmingPool {
  pool_id: number;
  seed: string;
  shares: string;
  account_shares_prct: string;
  unclaimedRewards: UnclaimedReward[];
  tokens: Token[];
  totalUSDValue: number;
}

interface MemePool {
  seed: string;
  tokens: Token[];
  unclaimedRewards: UnclaimedReward[];
  totalUSDValue: number;
}

interface RefFinance {
  farming: FarmingPool[];
  deposits: boolean;
  pooling: boolean;
  meme: MemePool[];
}

interface Defi {
  burrow: boolean;
  ref: RefFinance;
}

interface BalanceToken {
  contract: string;
  amount: number | string;
  symbol: string;
  isParsed: boolean;
  usdValue: string | null;
  tokenPrice: string | null;
  tokenPriceDate: string | null;
}

export interface Wealth {
  defi: {
    burrow: boolean;
    ref: RefFinance;
  };
  balance: BalanceToken[];
}

export async function getWealth(accountId: string): Promise<Wealth | null> {
  const apiKey = process.env.PIKESPEAK_API_KEY;
  if (!apiKey) {
    throw new Error('PIKESPEAK_API_KEY environment variable is not set');
  }

  const response = await fetch(
    `https://api.pikespeak.ai/account/wealth/${accountId}`,
    {
      headers: {
        accept: 'application/json',
        'x-api-key': apiKey,
      },
    }
  );

  if (!response.ok) {
    console.error(`Pikespeak HTTP error! status: ${response.status}`);
    return null;
  }

  return response.json();
}
