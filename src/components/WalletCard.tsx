import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Wallet } from '../types';
import { 
    Copy, 
    Download, 
    Eye, 
    EyeOff, 
    Bot, 
    User,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

interface WalletCardProps {
    wallet: Wallet;
    onExportPrivateKey: (walletId: string) => Promise<string>;
    onUpdateWallet: (walletId: string, updates: Partial<Wallet>) => void;
}

export function WalletCard({ wallet, onExportPrivateKey, onUpdateWallet }: WalletCardProps) {
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportedKey, setExportedKey] = useState<string>('');
    const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const formatAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        // Toast notification would go here
        console.log(`${type} copied to clipboard`);
    };

    const handleExportPrivateKey = async () => {
        if (confirmText !== 'EXPORT') return;
        
        setIsExporting(true);
        try {
            const privateKey = await onExportPrivateKey(wallet.id);
            setExportedKey(privateKey);
            onUpdateWallet(wallet.id, { isExported: true });
        } catch (error) {
            console.error('Failed to export private key:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const getTotalTokenValue = () => {
        return Object.values(wallet.balance.tokens).reduce((sum, balance) => sum + balance, 0);
    };

    return (
        <>
            <Card className="glass-border hover:glass-card-hover transition-all duration-200">
                <CardContent className="p-3 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {wallet.agentId ? (
                                <Bot className="w-4 h-4 text-primary flex-shrink-0" />
                            ) : (
                                <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="text-sm font-semibold truncate">{wallet.name}</span>
                                    {wallet.isExported && (
                                        <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400 px-1">
                                            已导出
                                        </Badge>
                                    )}
                                </div>
                                {wallet.agentName && (
                                    <Badge className="text-xs bg-primary/20 text-primary border-primary/30 mb-1">
                                        {wallet.agentName}
                                    </Badge>
                                )}
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {formatAddress(wallet.address)}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(wallet.address, 'Address')}
                                        className="p-0.5 h-4 w-4 hover:bg-primary/10"
                                    >
                                        <Copy className="w-2.5 h-2.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Balance Section - Compact */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">余额</span>
                            <span className="text-sm font-semibold text-emerald-400">
                                {wallet.balance.sol.toFixed(2)} SOL
                            </span>
                        </div>
                        
                        {getTotalTokenValue() > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">代币</span>
                                <span className="text-xs font-medium text-yellow-400">
                                    {getTotalTokenValue().toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tokens Detail - Simplified */}
                    {Object.keys(wallet.balance.tokens).length > 0 && (
                        <div className="space-y-1">
                            <Separator className="bg-border/30" />
                            <div className="space-y-1">
                                {Object.entries(wallet.balance.tokens).slice(0, 2).map(([tokenAddress, balance]) => (
                                    <div key={tokenAddress} className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-mono">
                                            {formatAddress(tokenAddress)}
                                        </span>
                                        <span className="text-yellow-400">{balance.toFixed(2)}</span>
                                    </div>
                                ))}
                                {Object.keys(wallet.balance.tokens).length > 2 && (
                                    <div className="text-xs text-muted-foreground text-center">
                                        +{Object.keys(wallet.balance.tokens).length - 2} 更多...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions - Compact */}
                    <div className="flex gap-1 pt-1">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(wallet.address, 'Address')}
                            className="flex-1 border-border/50 text-xs h-7 px-2"
                        >
                            <Copy className="w-3 h-3 mr-1" />
                            复制
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsExportDialogOpen(true)}
                            className="flex-1 border-orange-500/50 text-orange-400 hover:bg-orange-500/10 text-xs h-7 px-2"
                        >
                            <Download className="w-3 h-3 mr-1" />
                            导出
                        </Button>
                    </div>

                    {/* Wallet Info - Minimal */}
                    <div className="text-xs text-muted-foreground">
                        <div>{new Date(wallet.createdAt).toLocaleDateString()}</div>
                    </div>
                </CardContent>
            </Card>

            {/* Export Private Key Dialog */}
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogContent className="glass-card max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-orange-400 font-mono flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            导出私钥
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Alert className="border-orange-500/30 bg-orange-500/10">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            <AlertDescription className="text-orange-300">
                                <strong>安全警告:</strong> 私钥是访问您钱包的唯一凭证。请妥善保管，不要与任何人分享。
                            </AlertDescription>
                        </Alert>

                        {!exportedKey ? (
                            <>
                                <div className="space-y-2">
                                    <Label className="text-sm">
                                        请输入 <code className="bg-primary/20 px-1 rounded text-primary">EXPORT</code> 确认导出
                                    </Label>
                                    <Input
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        placeholder="输入 EXPORT"
                                        className="glass-border font-mono"
                                    />
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsExportDialogOpen(false)}
                                        className="flex-1"
                                    >
                                        取消
                                    </Button>
                                    <Button
                                        onClick={handleExportPrivateKey}
                                        disabled={confirmText !== 'EXPORT' || isExporting}
                                        className="flex-1 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 border-orange-500"
                                    >
                                        {isExporting ? '导出中...' : '确认导出'}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <Alert className="border-green-500/30 bg-green-500/10">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <AlertDescription className="text-green-300">
                                        私钥已成功导出！请立即复制并安全保存。
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <Label className="text-sm">私钥</Label>
                                    <div className="relative">
                                        <Input
                                            value={exportedKey}
                                            readOnly
                                            type={isPrivateKeyVisible ? 'text' : 'password'}
                                            className="glass-border font-mono pr-16 text-xs"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setIsPrivateKeyVisible(!isPrivateKeyVisible)}
                                                className="p-1 h-6 w-6"
                                            >
                                                {isPrivateKeyVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyToClipboard(exportedKey, 'Private key')}
                                                className="p-1 h-6 w-6"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => {
                                        setIsExportDialogOpen(false);
                                        setExportedKey('');
                                        setConfirmText('');
                                        setIsPrivateKeyVisible(false);
                                    }}
                                    className="w-full"
                                >
                                    完成
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}