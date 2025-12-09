import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TradingViewChart } from "./TradingViewChart";
import { SimplePriceChart } from "./SimplePriceChart";
import { LineChart, BarChart3, Coins } from "lucide-react";
import type { AMM, Phase } from "../types";

interface AMMVisualProps {
    amm: AMM;
    priceHistory: { time: number; price: number }[];
    phase: Phase;
    totalBid?: number;
}

export function AMMVisual({ amm, priceHistory, phase, totalBid = 0 }: AMMVisualProps) {
    const { solReserve, tokenReserve } = amm;
    const [chartMode, setChartMode] = useState<'simple' | 'pro'>('simple');

    const price = tokenReserve > 0 ? solReserve / tokenReserve : 0;

    // Pre-Market UI for BIDDING phase
    if (phase === 'BIDDING') {
        return (
            <Card className="h-full flex flex-col glass-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Pre-Market Status</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                        <Coins className="w-24 h-24 text-primary relative z-10 animate-bounce" />
                    </div>
                    
                    <div className="space-y-2 max-w-md">
                        <h2 className="text-2xl font-bold tracking-tight">Pre-Market Betting</h2>
                        <p className="text-muted-foreground">
                            The market is not yet live. Deposit SOL into your Agent to secure an initial allocation of tokens.
                            Token price will be determined by total pool liquidity when trading starts.
                        </p>
                        <div className="pt-4">
                            <div className="inline-flex flex-col items-center bg-primary/10 border border-primary/20 px-6 py-3 rounded-xl">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Current Total Bid</span>
                                <span className="text-3xl font-bold text-primary drop-shadow-lg">{totalBid.toFixed(2)} SOL</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full max-w-lg mt-8">
                         <div className="bg-muted/10 p-4 rounded-lg border border-border/20 backdrop-blur">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pool Allocation</p>
                            <p className="text-xl font-mono font-bold text-foreground">50%</p>
                         </div>
                         <div className="bg-muted/10 p-4 rounded-lg border border-border/20 backdrop-blur">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">LP Allocation</p>
                            <p className="text-xl font-mono font-bold text-foreground">20%</p>
                         </div>
                         <div className="bg-muted/10 p-4 rounded-lg border border-border/20 backdrop-blur">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Prize Fund</p>
                            <p className="text-xl font-mono font-bold text-yellow-500">80%</p>
                         </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col glass-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">AMM Pool</CardTitle>
                <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
                    <Button 
                        variant={chartMode === 'simple' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setChartMode('simple')}
                        className="h-6 px-2 text-xs"
                    >
                       <LineChart className="w-3 h-3 mr-1" /> Simple
                    </Button>
                    <Button 
                        variant={chartMode === 'pro' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setChartMode('pro')}
                        className="h-6 px-2 text-xs"
                    >
                       <BarChart3 className="w-3 h-3 mr-1" /> Pro
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Chart Area */}
                <div className="flex-1 min-h-[300px] lg:min-h-[400px]">
                    {chartMode === 'simple' ? (
                         <SimplePriceChart data={priceHistory} />
                    ) : (
                        <TradingViewChart symbol="TOKEN/SOL" interval="1" />
                    )}
                </div>

                {/* Pool Stats - Compact */}
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 glass-border rounded-lg">
                            <p className="text-xs text-muted-foreground">SOL Reserve</p>
                            <p className="text-lg font-bold">{solReserve.toFixed(2)}</p>
                        </div>
                        <div className="p-3 glass-border rounded-lg">
                            <p className="text-xs text-muted-foreground">Token Reserve</p>
                            <p className="text-lg font-bold">{tokenReserve.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="text-center p-3 glass-border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                        <p className="text-2xl font-bold text-primary">
                            {price.toFixed(4)} <span className="text-xs text-muted-foreground">SOL/Token</span>
                        </p>
                    </div>

                    <div className="text-xs text-muted-foreground text-center">
                        Constant Product (k): {amm.k.toFixed(0)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
