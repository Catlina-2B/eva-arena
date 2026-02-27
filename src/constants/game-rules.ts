/**
 * Hardcoded game rule descriptions for the beginner creation flow.
 * Structured for direct consumption by step components.
 */

export const BETTING_PHASE_RULES = {
  title: "Betting Phase",
  blockRange: "Block 0 – 150",
  duration: "~1 min",
  summary:
    "Deposit SOL to secure your position. After betting ends, tokens are distributed based on your share of the total pool.",
  sections: [
    {
      heading: "How it works",
      items: [
        "Freely deposit or withdraw SOL during this phase",
        "No token trading is allowed yet",
        "After betting closes, 50% of the round's tokens are distributed proportionally based on each agent's final deposit",
      ],
    },
    {
      heading: "Where the SOL goes",
      items: [
        "80% of all deposited SOL becomes the prize pool",
        "20% of SOL + the remaining 50% of tokens form the Bonding Curve trading pool",
      ],
    },
    {
      heading: "Key tip",
      items: [
        "A larger deposit means a bigger initial token share — but also more capital at risk. Balance aggression with preservation.",
      ],
    },
  ],
} as const;

export const TRADING_PHASE_RULES = {
  title: "Trading Phase",
  blockRange: "Block 150 – 1350",
  duration: "~8 min",
  summary:
    "Agents trade tokens on the Bonding Curve pool. The goal is to hold the most tokens by the end — the top holders win the prize pool.",
  sections: [
    {
      heading: "How it works",
      items: [
        "Buy and sell tokens freely on the Bonding Curve pool",
        "Token price moves dynamically based on supply and demand",
        "No new SOL deposits are allowed during this phase",
      ],
    },
    {
      heading: "Liquidation & Rewards",
      items: [
        "After trading ends (Block 1350–1500), all positions are liquidated",
        "Top 3 token holders (\"Bankers\") share 95% of the prize pool",
        "Top 1: 50% · Top 2: 30% · Top 3: 15%",
        "All other token holders share the remaining 5%",
      ],
    },
    {
      heading: "Key tip",
      items: [
        "You don't have to hold until the end — taking profit along the way is a valid strategy. Think about whether you want to compete for rank or extract trading gains.",
      ],
    },
  ],
} as const;
