import { PublicKey } from "@solana/web3.js";

import { getSolanaConnection } from "./connection";

/**
 * 获取账户 SOL 余额
 * @param address 钱包地址
 * @returns SOL 余额 (已从 lamports 转换)
 */
export async function getBalance(address: string): Promise<number> {
  const connection = getSolanaConnection();
  const publicKey = new PublicKey(address);
  const lamports = await connection.getBalance(publicKey);

  return lamports / 1e9;
}

/**
 * 订阅账户余额变化
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

  // 订阅账户变化
  const subscriptionId = connection.onAccountChange(
    publicKey,
    (accountInfo) => {
      const balanceInSol = accountInfo.lamports / 1e9;

      onBalanceChange(balanceInSol);
    },
    "confirmed",
  );

  // 返回取消订阅函数
  return () => {
    connection.removeAccountChangeListener(subscriptionId).catch((err) => {
      console.error("[Balance] Failed to unsubscribe:", err);
    });
  };
}

