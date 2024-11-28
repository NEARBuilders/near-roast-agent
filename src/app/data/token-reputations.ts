export interface ContractMetadata {
  name: string;
  category: "defi" | "nft" | "gaming" | "dao" | "meme" | "stablecoin" | "scam" | "project";
  risk: "safe" | "medium" | "degen" | "mega-degen";
  reputation: string;
}

export const TOKEN_REPUTATIONS: Record<string, ContractMetadata> = {
  "ndc.tkn.near": {
    name: "NDC",
    category: "meme",
    risk: "mega-degen",
    reputation: "a failed community experiment, tryna be a baddie"
  },
  "jumptoken.jumpfinance.near": {
    name: "JUMP",
    category: "defi",
    risk: "degen",
    reputation: "failed DEX will never be our lord and savior ref finance"
  },
  "drip.popula.near": {
    name: "DRIP",
    category: "project",
    risk: "safe",
    reputation: "honestly so cool, you deserve the world"
  },
  "token.v2.ref-finance.near": {
    name: "REF",
    category: "defi",
    risk: "medium",
    reputation: "you stake your memes too"
  },
  "token.lonkingnearbackto2024.near": {
    name: "LONK",
    category: "meme",
    risk: "degen",
    reputation: "Lonking NEAR back to 2024, whatever that means"
  },
  "bean.tkn.near": {
    name: "BEAN",
    category: "meme",
    risk: "mega-degen",
    reputation: "You're on Mr.Bean's wild ride"
  },
  "dragoneggsmeme.near": {
    name: "EGG",
    category: "meme",
    risk: "mega-degen",
    reputation: "dragon eggs in your mouth"
  },
  "pussy.laboratory.jumpfinance.near": {
    name: "PUSSY",
    category: "meme",
    risk: "mega-degen",
    reputation: "Holding pussy cuz you can't get any"
  },
  "shit.0xshitzu.near": {
    name: "SHIT",
    category: "meme",
    risk: "degen",
    reputation: "A literal shit coin"
  },
  "rich.tkn.near": {
    name: "RICH",
    category: "meme",
    risk: "mega-degen",
    reputation: "Holding rich cuz you never will be"
  },
  "xjumptoken.jumpfinance.near": {
    name: "xJUMP",
    category: "defi",
    risk: "degen",
    reputation: "Pumping "
  },
  "nearnvidia.near": {
    name: "NVIDIA",
    category: "meme",
    risk: "mega-degen",
    reputation: "graphics card meme that failed and had to act like a girl"
  },
  "blackdragon.tkn.near": {
    name: "BLACKDRAGON",
    category: "meme",
    risk: "safe",
    reputation: "Suck-up goodie two shoes, favored by the foundation, scales tipped in your favor" // TODO
  },
  "nearrewards.near": {
    name: "NEARREWARDS",
    category: "scam",
    risk: "safe",
    reputation: "You have 1000 NEAR to claim from a scam"
  },
  "wrap.near": {
    name: "WNEAR",
    category: "defi",
    risk: "safe",
    reputation: "Don't know what to spend your NEAR on, I don't blame you"
  },
  "intel.tkn.near": {
    name: "INTEL",
    category: "meme",
    risk: "mega-degen",
    reputation: "another graphics card meme nobody cares about"
  },
  "slush.tkn.near": {
    name: "SLUSH",
    category: "meme",
    risk: "mega-degen",
    reputation: "slush my balls in your mouth"
  },
  "babyblackdragon.tkn.near": {
    name: "BABYBLACKDRAGON",
    category: "meme",
    risk: "mega-degen",
    reputation: "Always "
  },
  "avb.tkn.near": {
    name: "AVB",
    category: "meme",
    risk: "mega-degen",
    reputation: "holding massive fucking asshole, sorry you won't get on his podcast"
  },
  "hat.tkn.near": {
    name: "HAT",
    category: "meme",
    risk: "mega-degen",
    reputation: "you need a helmet you're so autistic"
  },
  "token.0xshitzu.near": {
    name: "SHITZU",
    category: "meme",
    risk: "mega-degen",
    reputation: "april fools joke"
  },
  "usdt.tether-token.near": {
    name: "USDT",
    category: "stablecoin",
    risk: "mega-degen",
    reputation: "Tether is going to collapse"
  },
  "poppy-0.meme-cooking-test.near": {
    name: "POPPY",
    category: "meme",
    risk: "mega-degen",
    reputation: "some failed Frontier Labs project"
  },
  "chill-129.meme-cooking.near": {
    name: "CHILL",
    category: "meme",
    risk: "mega-degen",
    reputation: "you got rugged and were chill about it"
  },
  "nkok.tkn.near": {
    name: "NKOK",
    category: "meme",
    risk: "mega-degen",
    reputation: "what even is this, you like lady boys"
  },
  "4illia-222.meme-cooking.near": {
    name: "4ILLIA",
    category: "meme",
    risk: "mega-degen",
    reputation: "you love riding Illia's dick"
  },
  "kat.token0.near": {
    name: "KAT",
    category: "meme",
    risk: "mega-degen",
    reputation: "Meerkat"
  },
  "purge-558.meme-cooking.near": {
    name: "PURGE",
    category: "meme",
    risk: "degen",
    reputation: "you're a sinner and a suck-up"
  },
  "gnear-229.meme-cooking.near": {
    name: "GNEAR",
    category: "meme",
    risk: "mega-degen",
    reputation: "the only AI bot that will say good morning to you"
  },
  "hijack-252.meme-cooking.near": {
    name: "HIJACK",
    category: "meme",
    risk: "mega-degen",
    reputation: "still holding onto a failed marketing stunt"
  },
  "token.sweat": {
    name: "SWEATCOIN",
    category: "project",
    risk: "medium",
    reputation: "getting paid in magic internet money to stop being so fat"
  },
  // what else???
};