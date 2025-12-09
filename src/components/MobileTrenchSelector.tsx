import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GameState } from "../types";

interface MobileTrenchSelectorProps {
    trenches: GameState[];
    activeTrenchId: string | null;
    onSelectTrench: (id: string) => void;
}

export function MobileTrenchSelector({ trenches, activeTrenchId, onSelectTrench }: MobileTrenchSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const activeTrench = trenches.find(t => t.id === activeTrenchId);

    const getPhaseColor = (p: string) => {
        switch (p) {
            case 'BIDDING': return 'bg-blue-500/80';
            case 'TRADING': return 'bg-emerald-500/80';
            case 'LIQUIDATION': return 'bg-rose-500/80';
            default: return 'bg-slate-500/80';
        }
    };

    const handleSelectTrench = (id: string) => {
        onSelectTrench(id);
        setIsOpen(false);
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Bottom Sheet */}
            <div className={`
                fixed bottom-0 left-0 right-0 z-50 md:hidden
                transition-transform duration-300 ease-out
                ${isOpen ? 'translate-y-0' : 'translate-y-full'}
            `}>
                <div className="glass-card rounded-t-2xl max-h-[70vh] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-border/20">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Select Trench</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 p-0"
                            >
                                ✕
                            </Button>
                        </div>
                    </div>

                    {/* Trench List */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-2">
                            {trenches.map((trench) => (
                                <button
                                    key={trench.id}
                                    onClick={() => handleSelectTrench(trench.id)}
                                    className={`
                                        w-full p-3 rounded-md text-left transition-all
                                        ${activeTrenchId === trench.id
                                            ? 'glass-card border-primary/30'
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
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden glass-card border-t border-border/20 safe-bottom">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full p-4 flex items-center justify-between active:bg-accent/20 transition-colors"
                >
                    <div className="flex-1 text-left">
                        {activeTrench ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-sm">{activeTrench.name}</span>
                                    <Badge variant="outline" className={`text-[10px] px-1 py-0 h-5 ${getPhaseColor(activeTrench.phase)}`}>
                                        {activeTrench.phase}
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono mt-1">
                                    Pool: {activeTrench.prizePool.toFixed(1)} SOL
                                </div>
                            </>
                        ) : (
                            <span className="text-sm text-muted-foreground">Select a trench</span>
                        )}
                    </div>
                    <ChevronUp className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </>
    );
}
