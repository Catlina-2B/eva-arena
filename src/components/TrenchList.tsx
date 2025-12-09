import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GameState } from "../types";

interface TrenchListProps {
    trenches: GameState[];
    activeTrenchId: string | null;
    onSelectTrench: (id: string) => void;
}

export function TrenchList({ trenches, activeTrenchId, onSelectTrench }: TrenchListProps) {
    const getPhaseColor = (p: string) => {
        switch (p) {
            case 'BIDDING': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'TRADING': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'LIQUIDATION': return 'bg-red-500/20 text-red-400 border-red-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    return (
        <Card className="h-full rounded-none border-y-0 border-l-0 glass-border-subtle">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold tracking-wider text-primary neon-text">
                    TRENCHES
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-60px)]">
                <ScrollArea className="h-full px-4">
                    <div className="space-y-2 pb-4">
                        {trenches.map((trench) => (
                            <div
                                key={trench.id}
                                onClick={() => onSelectTrench(trench.id)}
                                className={`
                                    cursor-pointer p-3 rounded-md transition-all duration-200
                                    ${activeTrenchId === trench.id
                                        ? 'glass-card glass-card-hover border-primary/30'
                                        : 'glass-border hover:glass-card-hover'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono font-bold text-sm">{trench.name}</span>
                                    <Badge variant="outline" className={`text-[10px] px-1 py-0 h-5 ${getPhaseColor(trench.phase)}`}>
                                        {trench.phase}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                                    <span>Pool: {trench.prizePool.toFixed(1)} SOL</span>
                                    <span>{Math.floor(trench.timeLeft / 60)}:{(trench.timeLeft % 60).toString().padStart(2, '0')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
