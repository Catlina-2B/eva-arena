import { Connection, clusterApiUrl } from "@solana/web3.js";

/**
 * Solana RPC URL - defaults to mainnet
 */
const SOLANA_RPC_URL =
  import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta");

/**
 * Solana connection instance (singleton)
 */
let connection: Connection | null = null;

/**
 * Get Solana connection instance
 */
export function getSolanaConnection(): Connection {
  if (!connection) {
    connection = new Connection(SOLANA_RPC_URL, "confirmed");
  }

  return connection;
}

/**
 * Get current slot from Solana RPC
 */
export async function getCurrentSlot(): Promise<number> {
  const conn = getSolanaConnection();

  return conn.getSlot();
}
