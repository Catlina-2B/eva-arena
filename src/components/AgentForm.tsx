import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { Agent, AgentType } from '../types';

interface AgentFormProps {
    initialData?: Partial<Agent>;
    onSubmit: (data: Omit<Agent, 'id' | 'currentSol' | 'tokenBalance' | 'depositedSol'>) => void;
}

export function AgentForm({ initialData, onSubmit }: AgentFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        type: (initialData?.type as AgentType) || 'BOT_CUSTOM',
        initialSol: initialData?.initialSol || 100,
        strategy: initialData?.strategy || '',
        description: initialData?.description || '',
        isActive: initialData?.isActive ?? true,
        isUser: initialData?.isUser || false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const agentTypeOptions = [
        { value: 'BOT_HOLDER', label: 'Holder Bot', description: '长期持有策略的机器人' },
        { value: 'BOT_ARBITRAGE', label: 'Arbitrage Bot', description: '套利交易策略的机器人' },
        { value: 'BOT_SNIPER', label: 'Sniper Bot', description: '狙击交易策略的机器人' },
        { value: 'BOT_CUSTOM', label: 'Custom Bot', description: '自定义策略的机器人' }
    ];

    const predefinedStrategies = {
        BOT_HOLDER: `你是一个长期持有者策略的交易机器人。你的行为准则：
1. 在投标阶段积极投入资金
2. 在交易阶段主要持有，很少卖出
3. 只在价格极高时才考虑部分获利了结
4. 风险偏好：保守`,
        
        BOT_ARBITRAGE: `你是一个套利交易策略的机器人。你的行为准则：
1. 密切关注价格波动，寻找套利机会
2. 在价格偏低时买入，价格偏高时卖出
3. 执行高频率、小幅度的交易
4. 风险偏好：中等`,
        
        BOT_SNIPER: `你是一个狙击交易策略的机器人。你的行为准则：
1. 耐心等待最佳交易时机
2. 在市场恐慌时大量买入
3. 在价格飙升时果断卖出
4. 风险偏好：激进`,
        
        BOT_CUSTOM: ''
    };

    const handleTypeChange = (newType: string) => {
        const type = newType as AgentType;
        setFormData(prev => ({
            ...prev,
            type,
            strategy: type in predefinedStrategies ? predefinedStrategies[type as keyof typeof predefinedStrategies] : prev.strategy
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Agent名称不能为空';
        }
        
        if (formData.initialSol <= 0) {
            newErrors.initialSol = '初始SOL必须大于0';
        }
        
        if (formData.type === 'BOT_CUSTOM' && !formData.strategy.trim()) {
            newErrors.strategy = '自定义策略不能为空';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        onSubmit({
            name: formData.name.trim(),
            type: formData.type,
            initialSol: formData.initialSol,
            strategy: formData.strategy.trim(),
            description: formData.description.trim(),
            isActive: formData.isActive,
            isUser: formData.isUser
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-mono text-foreground">
                            Agent名称 *
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="输入Agent名称..."
                            className={`glass-border ${errors.name ? 'border-destructive' : ''}`}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="initialSol" className="text-sm font-mono text-foreground">
                            初始SOL *
                        </Label>
                        <Input
                            id="initialSol"
                            type="number"
                            min="1"
                            value={formData.initialSol}
                            onChange={(e) => setFormData(prev => ({ ...prev, initialSol: Number(e.target.value) }))}
                            className={`glass-border ${errors.initialSol ? 'border-destructive' : ''}`}
                        />
                        {errors.initialSol && <p className="text-xs text-destructive">{errors.initialSol}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-mono text-foreground">Agent类型 *</Label>
                    <Select value={formData.type} onValueChange={handleTypeChange}>
                        <SelectTrigger className="glass-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-border/20">
                            {agentTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex flex-col items-start">
                                        <span>{option.label}</span>
                                        <span className="text-xs text-muted-foreground">{option.description}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-mono text-foreground">
                        描述信息
                    </Label>
                    <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Agent描述（可选）..."
                        className="glass-border"
                    />
                </div>
            </div>

            <Separator className="bg-border/30" />

            {/* Strategy Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-mono text-foreground">
                        交易策略 {formData.type === 'BOT_CUSTOM' && '*'}
                    </Label>
                    {formData.type !== 'BOT_CUSTOM' && (
                        <span className="text-xs text-muted-foreground">预设策略已自动填充</span>
                    )}
                </div>
                
                <Card className="glass-border p-4">
                    <Textarea
                        value={formData.strategy}
                        onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value }))}
                        placeholder="输入AI策略提示词..."
                        className={`min-h-[200px] glass-border resize-none font-mono text-sm ${errors.strategy ? 'border-destructive' : ''}`}
                        readOnly={formData.type !== 'BOT_CUSTOM'}
                    />
                    {errors.strategy && <p className="text-xs text-destructive mt-2">{errors.strategy}</p>}
                    
                    <div className="mt-3 pt-3 border-t border-border/20">
                        <p className="text-xs text-muted-foreground">
                            💡 提示: 策略应该描述Agent在不同阶段的行为模式，包括投标策略、交易决策和风险偏好等。
                        </p>
                    </div>
                </Card>
            </div>

            <Separator className="bg-border/30" />

            {/* Settings */}
            <div className="space-y-4">
                <Label className="text-sm font-mono text-foreground">设置</Label>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm">激活状态</p>
                        <p className="text-xs text-muted-foreground">
                            激活的Agent将参与游戏交易
                        </p>
                    </div>
                    <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                </div>
            </div>

            <Separator className="bg-border/30" />

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="border-border/50"
                >
                    取消
                </Button>
                <Button 
                    type="submit" 
                    className="neon-border bg-primary/20 hover:bg-primary/40 text-primary border-primary"
                >
                    {initialData ? '更新Agent' : '创建Agent'}
                </Button>
            </div>
        </form>
    );
}