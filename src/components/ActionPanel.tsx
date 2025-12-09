import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Agent, Phase } from "../types";

interface ActionPanelProps {
    phase: Phase;
    user: Agent;
    onDeposit: (amount: number) => void;
    onSwap: (amount: number, direction: 'BUY' | 'SELL') => void;
    onDebugShuffle?: () => void;
}

const DEFAULT_QUICK_AMOUNTS = [0.1, 0.5, 1, 5];

export function ActionPanel({ phase, user, onDeposit, onSwap, onDebugShuffle }: ActionPanelProps) {
    const [amount, setAmount] = useState("");
    const [quickAmounts, setQuickAmounts] = useLocalStorage<number[]>('eva-quick-amounts', DEFAULT_QUICK_AMOUNTS);
    const [isEditingQuickAmounts, setIsEditingQuickAmounts] = useState(false);
    const [editAmounts, setEditAmounts] = useState<string[]>(quickAmounts.map(String));

    const handleDeposit = () => {
        const val = parseFloat(amount);
        if (!isNaN(val) && val > 0) {
            onDeposit(val);
            setAmount("");
        }
    };

    const handleQuickBid = (quickAmount: number) => {
        setAmount(String(quickAmount));
    };

    const handleSwap = (direction: 'BUY' | 'SELL') => {
        const val = parseFloat(amount);
        if (!isNaN(val) && val > 0) {
            onSwap(val, direction);
            setAmount("");
        }
    };

    const handleSaveQuickAmounts = () => {
        const newAmounts = editAmounts
            .map(a => parseFloat(a))
            .filter(a => !isNaN(a) && a > 0)
            .slice(0, 6); // Max 6 quick amounts

        if (newAmounts.length > 0) {
            setQuickAmounts(newAmounts);
            setIsEditingQuickAmounts(false);
        }
    };

    const handleCancelEdit = () => {
        setEditAmounts(quickAmounts.map(String));
        setIsEditingQuickAmounts(false);
    };

    const addEditAmount = () => {
        if (editAmounts.length < 6) {
            setEditAmounts([...editAmounts, ""]);
        }
    };

    const removeEditAmount = (index: number) => {
        setEditAmounts(editAmounts.filter((_, i) => i !== index));
    };

    const updateEditAmount = (index: number, value: string) => {
        const newAmounts = [...editAmounts];
        newAmounts[index] = value;
        setEditAmounts(newAmounts);
    };

    return (
        <Card className="glass-card h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <div className="flex justify-between items-center">
                    <CardTitle>Actions</CardTitle>
                    {/* Debug Button for Leaderboard Animation */}
                    {onDebugShuffle && (
                        <Button 
                            variant="outline" 
                            size="xs" 
                            className="h-6 text-[10px] border-dashed opacity-50 hover:opacity-100"
                            onClick={onDebugShuffle}
                        >
                            Shuffle Ranks
                        </Button>
                    )}
                </div>
                <CardDescription>
                    Wallet: {user.currentSol.toFixed(2)} SOL | {user.tokenBalance.toFixed(2)} Tokens
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-auto">
                {phase === 'BIDDING' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium">Bid Amount (SOL)</label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setIsEditingQuickAmounts(!isEditingQuickAmounts)}
                                >
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </div>
                            <Input
                                type="number"
                                placeholder="Enter SOL amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />

                            {/* Quick Amount Buttons */}
                            {!isEditingQuickAmounts && (
                                <div className="grid grid-cols-4 gap-2">
                                    {quickAmounts.map((qa, idx) => (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            size="sm"
                                            className="glass-border-subtle hover:glass-card-hover text-xs"
                                            onClick={() => handleQuickBid(qa)}
                                        >
                                            {qa}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Quick Amount Settings */}
                            {isEditingQuickAmounts && (
                                <div className="space-y-2 p-3 glass-border rounded-md">
                                    <p className="text-xs text-muted-foreground mb-2">Edit Quick Amounts (max 6)</p>
                                    {editAmounts.map((amt, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Amount"
                                                value={amt}
                                                onChange={(e) => updateEditAmount(idx, e.target.value)}
                                                className="text-sm"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeEditAmount(idx)}
                                                className="px-2"
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}
                                    {editAmounts.length < 6 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={addEditAmount}
                                            className="w-full text-xs"
                                        >
                                            + Add
                                        </Button>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            onClick={handleSaveQuickAmounts}
                                            className="flex-1"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancelEdit}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Button className="w-full" onClick={handleDeposit}>
                            Place Bid
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            Your Current Bid: {user.depositedSol.toFixed(2)} SOL
                        </p>
                    </div>
                )}

                {phase === 'TRADING' && (
                    <Tabs defaultValue="buy" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="buy">Buy</TabsTrigger>
                            <TabsTrigger value="sell">Sell</TabsTrigger>
                        </TabsList>
                        <TabsContent value="buy" className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount (SOL)</label>
                                <Input
                                    type="number"
                                    placeholder="SOL to spend"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleSwap('BUY')}>
                                Buy Tokens
                            </Button>
                        </TabsContent>
                        <TabsContent value="sell" className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount (Tokens)</label>
                                <Input
                                    type="number"
                                    placeholder="Tokens to sell"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => handleSwap('SELL')}>
                                Sell Tokens
                            </Button>
                        </TabsContent>
                    </Tabs>
                )}

                {phase === 'LIQUIDATION' && (
                    <div className="text-center py-8 text-muted-foreground">
                        Trading is closed. Calculating results...
                    </div>
                )}

                {phase === 'ENDED' && (
                    <div className="text-center py-8 font-bold text-green-600">
                        Game Over! Check the leaderboard.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
