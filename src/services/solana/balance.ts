import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { getSolanaConnection } from "./connection";

/**
 * USDC Mint 地址（从环境变量读取）
 */
const USDC_MINT = import.meta.env.VITE_USDC_MINT;

if (!USDC_MINT) {
  throw new Error("VITE_USDC_MINT environment variable is not set");
}

/**
 * 获取 USDC 账户余额（通过 ATA）
 * @param address 钱包地址
 * @returns USDC 余额（已从基础单位转换，USDC 有 6 位小数）
 */
export async function getBalance(address: string): Promise<number> {
  const connection = getSolanaConnection();
  const publicKey = new PublicKey(address);
  const usdcMint = new PublicKey(USDC_MINT);

  try {
    // 获取 ATA 地址
    const ata = await getAssociatedTokenAddress(
      usdcMint,
      publicKey,
      false, // allowOwnerOffCurve
      TOKEN_PROGRAM_ID,
    );

    // 获取代币账户余额
    const balance = await connection.getTokenAccountBalance(ata);

    // USDC 有 6 位小数
    return Number(balance.value.amount) / 1e6;
  } catch (error) {
    // 如果 ATA 不存在，返回 0
    console.warn(`[Balance] ATA not found for ${address}, returning 0:`, error);
    return 0;
  }
}

/**
 * 订阅 USDC 账户余额变化（通过 ATA）
 * @param address 钱包地址
 * @param onBalanceChange 余额变化回调
 * @returns 取消订阅函数
 */
export function subscribeBalance(
  address: string,
  onBalanceChange: (balance: number) => void,
): () => void {
  const connection = getSolanaConnection();
  const publicKey = new PublicKey(address);
  const usdcMint = new PublicKey(USDC_MINT);

  let subscriptionId: number | null = null;

  // 异步获取 ATA 并订阅
  (async () => {
    try {
      const ata = await getAssociatedTokenAddress(
        usdcMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
      );

      // 订阅 ATA 账户变化
      subscriptionId = connection.onAccountChange(
        ata,
        async (accountInfo) => {
          try {
            // 重新获取代币余额
            const balance = await connection.getTokenAccountBalance(ata);
            const balanceInUsdc = Number(balance.value.amount) / 1e6;

            onBalanceChange(balanceInUsdc);
          } catch (err) {
            console.error("[Balance] Failed to parse token balance:", err);
          }
        },
        "confirmed",
      );
    } catch (error) {
      console.error("[Balance] Failed to setup subscription:", error);
    }
  })();

  // 返回取消订阅函数
  return () => {
    if (subscriptionId !== null) {
      connection.removeAccountChangeListener(subscriptionId).catch((err) => {
        console.error("[Balance] Failed to unsubscribe:", err);
      });
    }
  };
}

