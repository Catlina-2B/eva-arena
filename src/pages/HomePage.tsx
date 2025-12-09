import { useGameEngine } from '../hooks/useGameEngine';
import { GameStatus } from '../components/GameStatus';
import { ActionPanel } from '../components/ActionPanel';
import { AMMVisual } from '../components/AMMVisual';
import { Leaderboard } from '../components/Leaderboard';
import { TrenchList } from '../components/TrenchList';
import { MobileTrenchSelector } from '../components/MobileTrenchSelector';
import { Navigation } from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function HomePage() {
    const { trenches, activeTrenchId, setActiveTrenchId, activeTrench, actions } = useGameEngine();

    return (
        <div className="min-h-screen bg-background p-0 font-sans dark text-foreground flex overflow-hidden w-full">
            {/* Desktop Sidebar - Hidden on Mobile, Narrower */}
            <div className="hidden md:block w-60 h-screen flex-shrink-0 glass-border-subtle">
                <TrenchList
                    trenches={trenches}
                    activeTrenchId={activeTrenchId}
                    onSelectTrench={setActiveTrenchId}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 h-screen flex flex-col p-4 md:p-8 pb-24 md:pb-8">
                <div className="w-full flex flex-col h-full">

                    {/* Header - Fixed Height */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 flex-shrink-0">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight neon-text">
                                EVA <span className="text-primary text-sm tracking-widest ml-2">WARZONE</span>
                            </h1>
                            {activeTrench && (
                                <p className="text-muted-foreground text-xs md:text-sm font-mono mt-1">
                                    OPERATION: {activeTrench.name}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2 items-center">
                            <Navigation />
                            <Button onClick={actions.start} variant="default" className="neon-border bg-primary/20 hover:bg-primary/40 text-primary border-primary text-sm md:text-base">
                                INITIALIZE SIM
                            </Button>
                            <Button onClick={actions.pause} variant="outline" className="border-border/50 text-sm md:text-base">
                                HALT
                            </Button>
                        </div>
                    </div>

                    {activeTrench ? (
                        <div className="flex flex-col h-full flex-1">
                            {/* Status Bar - Fixed Height */}
                            <div className="flex-shrink-0 mb-4">
                                <GameStatus gameState={activeTrench} />
                            </div>

                            {/* Main Grid - Full Height with Minimum Heights */}
                            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 flex-1 min-h-0">

                                {/* AMM Pool - 7 cols on desktop (7/10), full width on mobile with min height */}
                                <div className="lg:col-span-7 order-2 lg:order-1 flex flex-col min-h-[400px] lg:min-h-[500px]">
                                    <AMMVisual
                                        amm={activeTrench.amm}
                                        priceHistory={activeTrench.priceHistory || []}
                                        phase={activeTrench.phase}
                                        totalBid={activeTrench.agents.reduce((sum, a) => sum + a.depositedSol, 0)}
                                    />
                                </div>

                                {/* Right Panel: Split into Fixed Leaderboard and Actions */}
                                <div className="lg:col-span-3 order-1 lg:order-2 flex flex-col gap-4 h-full min-h-[500px]">

                                    {/* Fixed Leaderboard Section - Always visible */}
                                    <div className="flex-[0.4] min-h-[200px]">
                                        <Leaderboard
                                            agents={activeTrench.agents}
                                            currentRound={activeTrench.round}
                                            phase={activeTrench.phase}
                                            currentPrice={
                                                activeTrench.amm.tokenReserve > 0
                                                    ? activeTrench.amm.solReserve / activeTrench.amm.tokenReserve
                                                    : 0
                                            }
                                        />
                                    </div>

                                    {/* Action Panel Section */}
                                    <div className="flex-[0.6] min-h-[300px]">
                                        <Tabs defaultValue="actions" className="h-full flex flex-col">
                                            <TabsList className="grid w-full grid-cols-1 glass-border mb-4 flex-shrink-0 bg-background/20">
                                                <TabsTrigger
                                                    value="actions"
                                                    className="text-xs tab-highlight"
                                                >
                                                    操作
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="actions" className="mt-0 flex-1 min-h-0">
                                                <ActionPanel
                                                    phase={activeTrench.phase}
                                                    user={activeTrench.agents.find(a => a.isUser)!}
                                                    onDeposit={(amount) => actions.deposit(activeTrench.id, 'user', amount)}
                                                    onSwap={(amount, dir) => actions.swap(activeTrench.id, 'user', amount, dir)}
                                                    onDebugShuffle={actions.debugShuffleAgents}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </div>

                                {/* Mobile: Additional Content below Main Grid */}
                                <div className="lg:hidden col-span-1 order-3 space-y-4">
                                    <Leaderboard
                                        agents={activeTrench.agents}
                                        currentRound={activeTrench.round}
                                        phase={activeTrench.phase}
                                        currentPrice={
                                            activeTrench.amm.tokenReserve > 0
                                                ? activeTrench.amm.solReserve / activeTrench.amm.tokenReserve
                                                : 0
                                        }
                                    />

                                    {/* Tactical Log - Mobile only */}
                                    <Card className="glass-card">
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-sm font-mono text-muted-foreground">TACTICAL LOG</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 overflow-hidden">
                                            <ScrollArea className="h-40 w-full p-2">
                                                {activeTrench.logs.map((log, i) => (
                                                    <div key={i} className="text-xs font-mono border-b border-border/20 pb-1 mb-1 last:border-0 last:mb-0 text-emerald-400/70">
                                                        {`> ${log}`}
                                                    </div>
                                                ))}
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center border border-dashed border-border/50 rounded-lg min-h-[400px]">
                            <div className="text-center space-y-2 px-4">
                                <p className="text-lg md:text-xl font-bold text-muted-foreground">NO ACTIVE TRENCH SELECTED</p>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    {trenches.length > 0 ? 'Select a trench to engage.' : 'No trenches available.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileTrenchSelector
                trenches={trenches}
                activeTrenchId={activeTrenchId}
                onSelectTrench={setActiveTrenchId}
            />
        </div>
    );
}
