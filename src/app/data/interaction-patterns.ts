export interface Interaction {
  contract_id: string;
  count: number;
}

export interface InteractionPattern {
  pattern: string[];
  name: string;
  category:
    | "trader"
    | "farmer"
    | "gambler"
    | "collector"
    | "bot"
    | "whale"
    | "cabal"
    | "failure"
    | "ethereum"
    | "ecosystem";
  reputation: string;
}

export const INTERACTION_PATTERNS: InteractionPattern[] = [
  {
    pattern: ["v2.ref-finance.near", "wrap.near"],
    name: "DeFi Degen",
    category: "trader",
    reputation: "Loves losing money on DEXes",
  },
  {
    pattern: ["meme-farming_011.ref-labs.near"],
    name: "Ref Finance Meme Farming",
    category: "farmer",
    reputation: "Farming memes instead of getting a real job",
  },
  {
    pattern: ["social.near"],
    name: "Near Social",
    category: "ecosystem",
    reputation: "interacting with an insocial blockchain",
  },
  {
    pattern: ["devhub.near"],
    name: "DevHub",
    category: "cabal",
    reputation: "Getting paid to review each other's code that nobody uses",
  },
  {
    pattern: ["distributor_of_merit.near"],
    name: "Purge, confess your sins",
    category: "farmer",
    reputation: "Farming good boy points to make up for your sins",
  },
  {
    pattern: [
      "app.herewallet.near",
      "team.herewallet.near",
      "owner.herewallet.near",
      "storage.herewallet.near",
    ],
    name: "HERE wallet",
    category: "trader",
    reputation:
      "Using a wallet that shows you how much money you're losing in real-time",
  },
  {
    pattern: ["rainbow-bridge.near"],
    name: "Bridge Explorer",
    category: "gambler",
    reputation: "Can't decide which chain to lose money on",
  },
  {
    pattern: ["aurora"],
    name: "Aurora Network",
    category: "ethereum",
    reputation:
      "only 5 people use it but trust me it's gonna be huge, bigger than ethereum",
  },
  {
    pattern: ["usn"],
    name: "USN",
    category: "failure",
    reputation:
      "still convinced USN will re-peg and save you from that -40% loss",
  },
  {
    pattern: ["wuipod.near"],
    name: "Wild User Interviews",
    category: "ecosystem",
    reputation: "so edgy, you listen to podcasts about NEAR",
  },
  {
    pattern: [
      "user.intear.near",
      "intear.sputnik-dao.near",
      "intear.near",
      "tipbot.intear.near",
      "moderator.intear.near",
      "agent.intear.near",
    ],
    name: "INTEAR",
    category: "gambler",
    reputation: "slimey degen trader, tech way cooler than you'll ever be",
  },
  {
    pattern: [
      "nfeco01.near",
      "nfeco02.near",
      "nfeco03.near",
      "nfeco04.near",
      "nfeco05.near",
      "nfeco06.near",
      "nfeco07.near",
      "nfeco08.near",
      "nfendowment00.near",
      "nfendowment01.near",
      "nfendowment02.near",
      "nfendowment03.near",
      "nfendowment04.near",
      "nfendowment05.near",
      "nf-finance.near",
      "nf-finance1.near",
      "nf-payouts.near",
      "nf-payments.near",
      "nf-payments2.near",
    ],
    name: "NEAR Foundation",
    category: "cabal",
    reputation:
      "Living off that sweet sweet foundation money, must be nice to be chosen",
  },
  {
    pattern: ["nearbuilders.near", "build.sputnik-dao.near"],
    name: "Build DAO",
    category: "ecosystem",
    reputation: "call yourself builders but can't win a hackathon",
  },
  {
    pattern: ["sharddog.near", "minter1.sharddog.near", "minter.sharddog.near", "raffle.sharddog.near", "claim.sharddog.near", "mint.sharddog.near"],
    name: "Shard Dog",
    category: "collector",
    reputation: "farming for shart dogs"
  }
  // what else...
];
