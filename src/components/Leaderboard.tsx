import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Agent, Phase } from "../types";

interface LeaderboardProps {
    agents: Agent[];
    currentRound: number;
    phase: Phase;
    currentPrice?: number;
}

const getMedalIcon = (rank: number): string => {
    switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '';
    }
};

export function Leaderboard({ agents, phase, currentPrice = 0 }: LeaderboardProps) {
    // Helper to calculate value for sorting/display
    const getValue = (agent: Agent) => {
        if (phase === 'BIDDING') return agent.depositedSol;
        return agent.currentSol + (agent.tokenBalance * currentPrice);
    };

    // 1. Sort all agents
    const sortedAgents = [...agents].sort((a, b) => getValue(b) - getValue(a));

    // 2. Get Top 3
    const top3 = sortedAgents.slice(0, 3);

    // 3. Find User
    const userIndex = sortedAgents.findIndex(a => a.isUser);
    const userAgent = sortedAgents[userIndex];
    const userRank = userIndex + 1;

    // 4. Determine agents to display
    let displayAgents = [...top3];
    if (userRank > 3 && userAgent) {
        displayAgents.push(userAgent);
    }

    // Calculate gap to #3 if user is not in top 3
    const rank3Value = top3[2] ? getValue(top3[2]) : 0;
    const userValue = userAgent ? getValue(userAgent) : 0;
    const gapToRank3 = rank3Value - userValue;

    return (
        <Card className="h-full overflow-hidden flex flex-col glass-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">
                    {phase === 'BIDDING' ? 'Top Bidders' : 'Top Traders'}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Rank</TableHead>
                            <TableHead>Agent</TableHead>
                            {phase === 'BIDDING' ? (
                                <TableHead className="text-right">Bid (SOL)</TableHead>
                            ) : (
                                <>
                                    <TableHead className="text-right hidden md:table-cell">Tokens</TableHead>
                                    <TableHead className="text-right">Est. Value</TableHead>
                                </>
                            )}
                        </TableRow>
                    </TableHeader>
                    {/* Replace TableBody with motion.tbody if needed, but layout usually works on tr within normal tbody if AnimatePresence is used carefully */}
                    <TableBody>
                        {displayAgents.map((agent, index) => {
                            // Correct rank calculation: if it's the 4th item in displayAgents but userRank > 3, use userRank
                            const isUserRow = agent.isUser;
                            const rank = isUserRow ? userRank : index + 1;
                            const medal = getMedalIcon(rank);

                            // Value calculations
                            const totalValue = getValue(agent);
                            const pnl = totalValue - agent.initialSol;
                            const pnlColor = pnl >= 0 ? "text-green-400" : "text-red-400";

                            return (
                                <TableRow
                                    key={agent.id}
                                    className={isUserRow ? "bg-muted/50 font-medium border-t-2 border-primary/20" : ""}
                                >
                                    <TableCell className="font-mono">
                                        <span className="flex items-center gap-1">
                                            {medal && <span className="text-lg">{medal}</span>}
                                            {!medal && rank}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm truncate max-w-[100px]">{agent.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{agent.type}</span>
                                            {/* Show Gap for User if not in Top 3 */}
                                            {isUserRow && userRank > 3 && (
                                                <span className="text-[10px] text-orange-400 mt-0.5">
                                                    Lagging {gapToRank3.toFixed(2)} to #3
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {phase === 'BIDDING' ? (
                                        <TableCell className="text-right font-mono text-sm">
                                            {agent.depositedSol.toFixed(2)}
                                        </TableCell>
                                    ) : (
                                        <>
                                            <TableCell className="text-right font-mono text-xs hidden md:table-cell text-muted-foreground">
                                                {agent.tokenBalance.toFixed(0)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm">
                                                <div className="flex flex-col items-end">
                                                    <span>{totalValue.toFixed(2)} SOL</span>
                                                    <span className={`text-[10px] ${pnlColor}`}>
                                                        {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
