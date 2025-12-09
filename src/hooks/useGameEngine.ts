import { useState, useEffect, useCallback, useRef } from 'react';
import type {
    GameState,
    Phase,
    Agent,
    AgentType
} from '../types';
import {
    BIDDING_BLOCKS,
    TRADING_BLOCKS,
    LIQUIDATION_BLOCKS,
    TOTAL_ROUND_BLOCKS,
    BLOCKS_PER_TICK,
    TICK_RATE_MS,
    INITIAL_SOL_RESERVE_RATIO,
    INITIAL_TOKEN_RESERVE_RATIO,
    PRIZE_POOL_RATIO
} from '../types';

const INITIAL_TOKEN_SUPPLY = 100;

const generateBots = (count: number): Agent[] => {
    const bots: Agent[] = [];
    const types: AgentType[] = ['BOT_HOLDER', 'BOT_ARBITRAGE', 'BOT_SNIPER'];

    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        bots.push({
            id: `bot-${i}`,
            name: `Bot ${type.split('_')[1]} ${i + 1}`,
            type,
            initialSol: 100,
            currentSol: 100,
            tokenBalance: 0,
            depositedSol: 0,
            isUser: false,
            isActive: true,
            strategy: getDefaultStrategyForType(type),
            description: `Auto-generated ${type.split('_')[1]} bot`
        });
    }
    return bots;
};

const getDefaultStrategyForType = (type: AgentType): string => {
    switch (type) {
        case 'BOT_HOLDER':
            return `你是一个长期持有者策略的交易机器人。你的行为准则：
1. 在投标阶段积极投入资金
2. 在交易阶段主要持有，很少卖出
3. 只在价格极高时才考虑部分获利了结
4. 风险偏好：保守`;
        case 'BOT_ARBITRAGE':
            return `你是一个套利交易策略的机器人。你的行为准则：
1. 密切关注价格波动，寻找套利机会
2. 在价格偏低时买入，价格偏高时卖出
3. 执行高频率、小幅度的交易
4. 风险偏好：中等`;
        case 'BOT_SNIPER':
            return `你是一个狙击交易策略的机器人。你的行为准则：
1. 耐心等待最佳交易时机
2. 在市场恐慌时大量买入
3. 在价格飙升时果断卖出
4. 风险偏好：激进`;
        default:
            return '';
    }
};

// Helper pure function for swap logic
const calculateSwap = (
    amm: GameState['amm'], 
    amount: number, 
    direction: 'BUY' | 'SELL'
): { newSolReserve: number, newTokenReserve: number, amountOut: number } | null => {
    const { solReserve, tokenReserve, k, feeRate } = amm;
    
    if (direction === 'BUY') {
        const amountAfterFee = amount * (1 - feeRate);
        const newSol = solReserve + amountAfterFee;
        const newToken = k / newSol;
        const tokenOut = tokenReserve - newToken;
        if (tokenOut <= 0) return null;
        return { newSolReserve: newSol, newTokenReserve: newToken, amountOut: tokenOut };
    } else {
        const newToken = tokenReserve + amount;
        const newSol = k / newToken;
        const solOutRaw = solReserve - newSol;
        const solOut = solOutRaw * (1 - feeRate);
        if (solOut <= 0) return null;
        return { newSolReserve: solReserve - solOut, newTokenReserve: newToken, amountOut: solOut };
    }
};

export const useGameEngine = () => {
    const [trenches, setTrenches] = useState<GameState[]>([]);
    const [activeTrenchId, setActiveTrenchId] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const trenchCounterRef = useRef(0);

    // Helper to create a new trench
    const createTrench = useCallback(() => {
        const id = `trench-${Date.now()}`;
        const name = `TOKEN-${Math.floor(Math.random() * 10000)}`;
        const newTrench: GameState = {
            id,
            name,
            round: 1,
            currentBlock: 0,
            totalBlocks: TOTAL_ROUND_BLOCKS,
            phase: 'BIDDING',
            amm: { solReserve: 0, tokenReserve: 0, k: 0, feeRate: 0.0025 },
            prizePool: 0,
            priceHistory: [],
            agents: [
                {
                    id: 'user',
                    name: 'You',
                    type: 'USER',
                    initialSol: 100,
                    currentSol: 100,
                    tokenBalance: 0,
                    depositedSol: 0,
                    isUser: true,
                    isActive: true,
                    strategy: '',
                    description: 'Human player'
                },
                ...generateBots(9)
            ],
            logs: [`Trench ${name} created!`, 'Phase: BIDDING (0-100 Blocks). Place your bets!']
        };

        setTrenches(prev => {
            const updated = [newTrench, ...prev];
            if (!activeTrenchId) setActiveTrenchId(id);
            return updated;
        });

        if (!activeTrenchId) setActiveTrenchId(id);
    }, [activeTrenchId]);

    // Initial Trench
    useEffect(() => {
        if (trenches.length === 0) {
            const id = `trench-${Date.now()}`;
            const name = `TOKEN-${Math.floor(Math.random() * 10000)}`;
            const newTrench: GameState = {
                id,
                name,
                round: 1,
                currentBlock: 0,
                totalBlocks: TOTAL_ROUND_BLOCKS,
                phase: 'BIDDING',
                amm: { solReserve: 0, tokenReserve: 0, k: 0, feeRate: 0.0025 },
                prizePool: 0,
                priceHistory: [],
                agents: [
                    {
                        id: 'user',
                        name: 'You',
                        type: 'USER',
                        initialSol: 100,
                        currentSol: 100,
                        tokenBalance: 0,
                        depositedSol: 0,
                        isUser: true,
                        isActive: true,
                        strategy: '',
                        description: 'Human player'
                    },
                    ...generateBots(9)
                ],
                logs: [`Trench ${name} created!`, 'Phase: BIDDING (0-100 Blocks). Place your bets!']
            };

            setTrenches([newTrench]);
            setActiveTrenchId(id);
        }
    }, []);

    // Helper to update a specific trench
    const updateTrench = (trenchId: string, updater: (trench: GameState) => GameState) => {
        setTrenches(prev => prev.map(t => t.id === trenchId ? updater(t) : t));
    };

    // Phase Transition Logic (Pure function)
    const getNextPhase = (currentBlock: number): Phase => {
        if (currentBlock <= BIDDING_BLOCKS) {
            return 'BIDDING';
        } else if (currentBlock <= BIDDING_BLOCKS + TRADING_BLOCKS) {
            return 'TRADING';
        } else if (currentBlock <= TOTAL_ROUND_BLOCKS) {
            return 'LIQUIDATION';
        }
        return 'ENDED';
    };

    // Initialize AMM Logic
    const initializeAMM = (trench: GameState): GameState => {
        const totalBid = trench.agents.reduce((sum, a) => sum + a.depositedSol, 0);
        if (totalBid === 0) return trench;

        const ammSol = totalBid * INITIAL_SOL_RESERVE_RATIO;
        const prizeSol = totalBid * PRIZE_POOL_RATIO;
        const ammTokens = INITIAL_TOKEN_SUPPLY * INITIAL_TOKEN_RESERVE_RATIO;
        const distributeTokens = INITIAL_TOKEN_SUPPLY * 0.5;

        const newAgents = trench.agents.map(agent => {
            if (agent.depositedSol > 0) {
                const share = agent.depositedSol / totalBid;
                return {
                    ...agent,
                    tokenBalance: distributeTokens * share,
                    currentSol: agent.currentSol - agent.depositedSol
                };
            }
            return agent;
        });

        const k = ammSol * ammTokens;
        const initialPrice = ammSol / ammTokens;

        return {
            ...trench,
            phase: 'TRADING',
            amm: { ...trench.amm, solReserve: ammSol, tokenReserve: ammTokens, k },
            prizePool: prizeSol,
            agents: newAgents,
            priceHistory: [{ time: Date.now() / 1000, price: initialPrice }],
            logs: [`Bidding ended! Total Bid: ${totalBid.toFixed(2)} SOL`, `AMM Initialized`, ...trench.logs]
        };
    };

    // Game Loop
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTrenches(prevTrenches => {
                    return prevTrenches.map(trench => {
                        if (trench.phase === 'ENDED') return trench;

                        const newBlock = trench.currentBlock + BLOCKS_PER_TICK;
                        const nextPhase = getNextPhase(newBlock);
                        let updatedTrench = { ...trench, currentBlock: newBlock, phase: nextPhase };

                        // Phase transition: BIDDING -> TRADING
                        if (trench.phase === 'BIDDING' && nextPhase === 'TRADING') {
                            updatedTrench = initializeAMM(updatedTrench);
                        }

                        // Record price history in TRADING phase
                        if (updatedTrench.phase === 'TRADING' && updatedTrench.amm.tokenReserve > 0) {
                            const currentPrice = updatedTrench.amm.solReserve / updatedTrench.amm.tokenReserve;
                            // Add price point every tick for smooth streaming (600 points for 60s)
                            // Only add if price changed or if list is empty to avoid pure duplicates if needed, 
                            // but for time-series, consistent intervals are better.
                            updatedTrench.priceHistory = [...updatedTrench.priceHistory, { time: Date.now() / 1000, price: currentPrice }];
                        }

                        // Bot Logic
                        // 1. Bidding Bots
                        if (updatedTrench.phase === 'BIDDING' && Math.random() > 0.7) { // More active bidding bots (was 0.95)
                            const randomBotIndex = Math.floor(Math.random() * (updatedTrench.agents.length - 1)) + 1; // Skip user
                            const bot = updatedTrench.agents[randomBotIndex];
                            if (bot && bot.depositedSol < bot.initialSol * 0.8) {
                                const amount = Math.floor(Math.random() * 15) + 1; // Larger bids (was 5)
                                updatedTrench.agents[randomBotIndex].depositedSol += amount;
                                updatedTrench.logs = [`${bot.name} deposited ${amount} SOL`, ...updatedTrench.logs].slice(0, 50);
                            }
                        }

                        // 2. Trading Bots
                        if (updatedTrench.phase === 'TRADING' && Math.random() > 0.6) { // More active trading bots (was 0.8)
                            const randomBotIndex = Math.floor(Math.random() * (updatedTrench.agents.length - 1)) + 1;
                            const bot = updatedTrench.agents[randomBotIndex];
                            
                            if (bot && bot.isActive) {
                                const isBuy = Math.random() > 0.5;
                                let tradeResult = null;
                                let amount = 0;

                                if (isBuy && bot.currentSol > 1) {
                                    amount = Math.random() * 5 + 0.5; // Buy 0.5 - 5.5 SOL (was 0.1 - 2.1)
                                    tradeResult = calculateSwap(updatedTrench.amm, amount, 'BUY');
                                    if (tradeResult) {
                                        updatedTrench.amm = { ...updatedTrench.amm, solReserve: tradeResult.newSolReserve, tokenReserve: tradeResult.newTokenReserve };
                                        updatedTrench.agents[randomBotIndex].currentSol -= amount;
                                        updatedTrench.agents[randomBotIndex].tokenBalance += tradeResult.amountOut;
                                        updatedTrench.logs = [`${bot.name} bought ${tradeResult.amountOut.toFixed(2)} Tokens`, ...updatedTrench.logs].slice(0, 50);
                                    }
                                } else if (!isBuy && bot.tokenBalance > 0.1) {
                                    amount = Math.random() * (bot.tokenBalance * 0.8); // Sell up to 80% (was 50%)
                                    tradeResult = calculateSwap(updatedTrench.amm, amount, 'SELL');
                                    if (tradeResult) {
                                        updatedTrench.amm = { ...updatedTrench.amm, solReserve: tradeResult.newSolReserve, tokenReserve: tradeResult.newTokenReserve };
                                        updatedTrench.agents[randomBotIndex].tokenBalance -= amount;
                                        updatedTrench.agents[randomBotIndex].currentSol += tradeResult.amountOut;
                                        updatedTrench.logs = [`${bot.name} sold ${amount.toFixed(2)} Tokens`, ...updatedTrench.logs].slice(0, 50);
                                    }
                                }
                            }
                        }

                        return updatedTrench;
                    });
                });

                // Spawn new trench less frequently for demo (every 5 mins)
                trenchCounterRef.current += 1;
                if (trenchCounterRef.current >= 300) {
                    createTrench();
                    trenchCounterRef.current = 0;
                }

            }, TICK_RATE_MS);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, createTrench]);


    // Actions
    const deposit = (trenchId: string, agentId: string, amount: number) => {
        updateTrench(trenchId, (trench) => {
            if (trench.phase !== 'BIDDING') return trench;
            const agents = trench.agents.map(a => {
                if (a.id === agentId && a.currentSol >= amount) {
                    return { ...a, depositedSol: a.depositedSol + amount };
                }
                return a;
            });
            return { ...trench, agents, logs: [`${agentId === 'user' ? 'You' : agentId} deposited ${amount} SOL`, ...trench.logs] };
        });
    };

    const swap = (trenchId: string, agentId: string, amount: number, direction: 'BUY' | 'SELL') => {
        updateTrench(trenchId, (trench) => {
            if (trench.phase !== 'TRADING') return trench;

            const agent = trench.agents.find(a => a.id === agentId);
            if (!agent) return trench;

            const result = calculateSwap(trench.amm, amount, direction);
            
            if (!result) return trench; // Swap failed (insufficient funds or pool error)

            if (direction === 'BUY') {
                if (agent.currentSol < amount) return trench;
                
                const newAgents = trench.agents.map(a => a.id === agentId ? { 
                    ...a, 
                    currentSol: a.currentSol - amount, 
                    tokenBalance: a.tokenBalance + result.amountOut 
                } : a);

                return { 
                    ...trench, 
                    amm: { ...trench.amm, solReserve: result.newSolReserve, tokenReserve: result.newTokenReserve }, 
                    agents: newAgents, 
                    logs: [`${agent.name} bought ${result.amountOut.toFixed(2)} Tokens`, ...trench.logs] 
                };
            } else {
                if (agent.tokenBalance < amount) return trench;
                
                const newAgents = trench.agents.map(a => a.id === agentId ? { 
                    ...a, 
                    currentSol: a.currentSol + result.amountOut, 
                    tokenBalance: a.tokenBalance - amount 
                } : a);

                return { 
                    ...trench, 
                    amm: { ...trench.amm, solReserve: result.newSolReserve, tokenReserve: result.newTokenReserve }, 
                    agents: newAgents, 
                    logs: [`${agent.name} sold ${amount.toFixed(2)} Tokens`, ...trench.logs] 
                };
            }
        });
    };

    // Agent Management Actions
    const createAgent = (agentData: Omit<Agent, 'id' | 'currentSol' | 'tokenBalance' | 'depositedSol'>) => {
        const newAgent: Agent = {
            ...agentData,
            id: `custom-${Date.now()}`,
            currentSol: agentData.initialSol,
            tokenBalance: 0,
            depositedSol: 0
        };

        // Add agent to all active trenches
        setTrenches(prev => prev.map(trench => {
            if (trench.phase === 'BIDDING' || trench.phase === 'TRADING') {
                return {
                    ...trench,
                    agents: [...trench.agents, newAgent],
                    logs: [`New agent ${newAgent.name} joined the battle!`, ...trench.logs]
                };
            }
            return trench;
        }));
    };

    const updateAgent = (agentId: string, updates: Partial<Agent>) => {
        setTrenches(prev => prev.map(trench => ({
            ...trench,
            agents: trench.agents.map(agent =>
                agent.id === agentId ? { ...agent, ...updates } : agent
            ),
            logs: updates.strategy 
                ? [`Agent ${trench.agents.find(a => a.id === agentId)?.name} strategy updated`, ...trench.logs]
                : trench.logs
        })));
    };

    const deleteAgent = (agentId: string) => {
        setTrenches(prev => prev.map(trench => ({
            ...trench,
            agents: trench.agents.filter(agent => agent.id !== agentId),
            logs: [`Agent removed from battle`, ...trench.logs]
        })));
    };

    // DEBUG: Shuffle agents to test leaderboard animation
    const debugShuffleAgents = () => {
        setTrenches(prev => prev.map(trench => {
            if (trench.phase === 'TRADING' || trench.phase === 'BIDDING') {
                const shuffledAgents = trench.agents.map(agent => {
                    if (Math.random() > 0.5) {
                        const change = (Math.random() - 0.5) * 50; // Random change +/- 25
                        if (trench.phase === 'BIDDING') {
                             return { ...agent, depositedSol: Math.max(0, agent.depositedSol + change) };
                        } else {
                             return { ...agent, tokenBalance: Math.max(0, agent.tokenBalance + change) };
                        }
                    }
                    return agent;
                });
                return { ...trench, agents: shuffledAgents };
            }
            return trench;
        }));
    };

    // Get all unique agents across trenches
    const getAllAgents = (): Agent[] => {
        const agentMap = new Map<string, Agent>();
        trenches.forEach(trench => {
            trench.agents.forEach(agent => {
                if (!agentMap.has(agent.id) || trench.id === activeTrenchId) {
                    agentMap.set(agent.id, agent);
                }
            });
        });
        return Array.from(agentMap.values());
    };

    return {
        trenches,
        activeTrenchId,
        setActiveTrenchId,
        activeTrench: trenches.find(t => t.id === activeTrenchId),
        agents: getAllAgents(),
        actions: {
            start: () => setIsRunning(true),
            pause: () => setIsRunning(false),
            deposit,
            swap,
            createAgent,
            updateAgent,
            deleteAgent,
            debugShuffleAgents
        }
    };
};
