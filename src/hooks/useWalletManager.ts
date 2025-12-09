import { useState, useCallback } from 'react';
import type { Wallet } from '../types';

// Mock Turnkey API - 在实际项目中这里会调用真实的Turnkey SDK
const mockTurnkeyAPI = {
    createWallet: async (_name: string): Promise<{ walletId: string; address: string }> => {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 生成模拟地址
        const address = `0x${Math.random().toString(16).substring(2, 42)}`;
        const walletId = `turnkey_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        return { walletId, address };
    },

    exportPrivateKey: async (_walletId: string): Promise<string> => {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 生成模拟私钥
        return `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    },

    getBalance: async (_address: string): Promise<{ sol: number; tokens: Record<string, number> }> => {
        // 模拟余额查询
        await new Promise(resolve => setTimeout(resolve, 300));

        return {
            sol: Math.random() * 100,
            tokens: {
                [`token_${Math.random().toString(36).substring(7)}`]: Math.random() * 1000
            }
        };
    }
};

export const useWalletManager = () => {
    const [wallets, setWallets] = useState<Wallet[]>([
        // 初始模拟数据
        {
            id: 'wallet-1',
            address: '0x742d35cc6cf138857d2443123456789012345678',
            name: '主钱包',
            balance: { sol: 45.67, tokens: {} },
            createdAt: Date.now() - 86400000,
            isExported: false,
            turnkeyWalletId: 'turnkey_main_wallet'
        }
    ]);

    const [isLoading, setIsLoading] = useState(false);

    // 创建新钱包
    const createWallet = useCallback(async (name: string, agentId?: string, agentName?: string): Promise<Wallet> => {
        setIsLoading(true);
        try {
            const { walletId, address } = await mockTurnkeyAPI.createWallet(name);
            const balance = await mockTurnkeyAPI.getBalance(address);

            const newWallet: Wallet = {
                id: `wallet-${Date.now()}`,
                address,
                name,
                agentId,
                agentName,
                balance,
                createdAt: Date.now(),
                isExported: false,
                turnkeyWalletId: walletId
            };

            setWallets(prev => [...prev, newWallet]);
            return newWallet;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 导出私钥
    const exportPrivateKey = useCallback(async (walletId: string): Promise<string> => {
        const wallet = wallets.find(w => w.id === walletId);
        if (!wallet) throw new Error('Wallet not found');

        return await mockTurnkeyAPI.exportPrivateKey(wallet.turnkeyWalletId);
    }, [wallets]);

    // 更新钱包信息
    const updateWallet = useCallback((walletId: string, updates: Partial<Wallet>) => {
        setWallets(prev => prev.map(wallet =>
            wallet.id === walletId ? { ...wallet, ...updates } : wallet
        ));
    }, []);

    // 删除钱包
    const deleteWallet = useCallback((walletId: string) => {
        setWallets(prev => prev.filter(wallet => wallet.id !== walletId));
    }, []);

    // 刷新余额
    const refreshBalances = useCallback(async () => {
        setIsLoading(true);
        try {
            const updatedWallets = await Promise.all(
                wallets.map(async (wallet) => {
                    try {
                        const balance = await mockTurnkeyAPI.getBalance(wallet.address);
                        return { ...wallet, balance };
                    } catch (error) {
                        console.error(`Failed to refresh balance for wallet ${wallet.id}:`, error);
                        return wallet;
                    }
                })
            );
            setWallets(updatedWallets);
        } finally {
            setIsLoading(false);
        }
    }, [wallets]);

    return {
        wallets,
        isLoading,
        actions: {
            createWallet,
            exportPrivateKey,
            updateWallet,
            deleteWallet,
            refreshBalances
        }
    };
};