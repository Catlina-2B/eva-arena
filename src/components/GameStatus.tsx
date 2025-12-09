import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, AlertCircle } from "lucide-react";
import type { GameState } from "../types";

interface GameStatusProps {
    gameState: GameState;
}

export function GameStatus({ gameState }: GameStatusProps) {
    const { round, currentBlock, totalBlocks, phase, prizePool, agents } = gameState;

    const progress = (currentBlock / totalBlocks) * 100;

    const getPhaseColor = (p: string) => {
        switch (p) {
            case 'BIDDING': return 'bg-blue-500/80 text-blue-100';
            case 'TRADING': return 'bg-emerald-500/80 text-emerald-100';
            case 'LIQUIDATION': return 'bg-rose-500/80 text-rose-100';
            default: return 'bg-slate-500/80';
        }
    };

    // Leaderboard Logic
    const sortedAgents = [...agents].sort((a, b) => b.tokenBalance - a.tokenBalance);
    const top3 = sortedAgents.slice(0, 3);
    const userAgent = agents.find(a => a.isUser);
    const userRank = sortedAgents.findIndex(a => a.isUser) + 1;

    // Calculate gap to next rank or top 3
    let gapMessage = "";
    if (userAgent) {
        if (userRank === 1) {
            const gap = userAgent.tokenBalance - (sortedAgents[1]?.tokenBalance || 0);
            gapMessage = `Leading by ${gap.toFixed(2)} Tokens!`;
        } else {
            const targetRank = Math.min(userRank - 1, 3); // Aim for next rank, or at least top 3
            const targetAgent = sortedAgents[targetRank - 1];
            if (targetAgent) {
                const gap = targetAgent.tokenBalance - userAgent.tokenBalance;
                gapMessage = `${gap.toFixed(2)} Tokens behind #${targetRank}`;
            }
        }
    }

    return (
        <Card className="w-full mb-4 glass-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                    <CardTitle className="text-xl font-bold tracking-tight">Round {round}</CardTitle>
                    <Badge className={`${getPhaseColor(phase)} border-0 px-3 py-1 font-mono`}>
                        {phase}
                    </Badge>
                </div>
                <div className="text-right">
                     <span className="text-xs text-muted-foreground uppercase tracking-widest">Prize Pool</span>
                     <div className="text-2xl font-bold text-amber-400 drop-shadow-sm">{prizePool.toFixed(2)} SOL</div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress Bar & Block Info */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                        <span>Block {currentBlock}</span>
                        <span>{totalBlocks} Blocks</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-secondary/30" indicatorClassName={
                        phase === 'TRADING' ? 'bg-emerald-500' : phase === 'LIQUIDATION' ? 'bg-rose-500' : 'bg-blue-500'
                    } />
                </div>

                {/* Top 3 & User Gap (FOMO Section) */}
                {phase !== 'BIDDING' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Top 3 Mini Leaderboard */}
                        <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wider">
                                <Trophy className="w-3 h-3 text-yellow-500" /> Top Holders
                            </div>
                            <div className="flex justify-between items-end gap-2">
                                {top3.map((agent, idx) => (
                                    <div key={idx} className="flex-1 text-center">
                                        <div className={`text-xs font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : 'text-amber-700'}`}>
                                            #{idx + 1}
                                        </div>
                                        <div className="text-[10px] truncate max-w-[60px] mx-auto opacity-70">{agent.name}</div>
                                        <div className="text-xs font-mono">{agent.tokenBalance.toFixed(0)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* User Gap / FOMO */}
                        <div className="bg-gradient-to-br from-primary/10 to-purple-900/20 rounded-lg p-3 border border-primary/20 flex flex-col justify-center relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-1 opacity-10">
                                 <TrendingUp className="w-12 h-12" />
                             </div>
                             <div className="flex justify-between items-center mb-1">
                                 <span className="text-xs font-bold text-primary">Your Rank</span>
                                 <span className="text-lg font-bold font-mono">#{userRank}</span>
                             </div>
                             <div className="flex items-center gap-2 text-xs">
                                 <AlertCircle className="w-3 h-3 text-orange-400" />
                                 <span className="text-orange-300 font-medium animate-pulse">
                                     {gapMessage}
                                 </span>
                             </div>
                        </div>
                    </div>
                )}
                
                {phase === 'BIDDING' && (
                     <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/20 text-center">
                         <p className="text-sm text-blue-200">
                             Pre-Market Phase. Deposit SOL to secure your allocation!
                         </p>
                     </div>
                )}
            </CardContent>
        </Card>
    );
}
