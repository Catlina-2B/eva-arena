import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AgentForm } from './AgentForm';
import type { Agent, AgentType } from '../types';
import { Plus, Bot, User, Settings, Trash2 } from 'lucide-react';

interface AgentManagerProps {
    agents: Agent[];
    onCreateAgent: (agent: Omit<Agent, 'id' | 'currentSol' | 'tokenBalance' | 'depositedSol'>) => void;
    onUpdateAgent: (id: string, updates: Partial<Agent>) => void;
    onDeleteAgent: (id: string) => void;
}

export function AgentManager({ agents, onCreateAgent, onUpdateAgent, onDeleteAgent }: AgentManagerProps) {
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const getAgentTypeColor = (type: AgentType) => {
        switch (type) {
            case 'USER': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'BOT_HOLDER': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'BOT_ARBITRAGE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'BOT_SNIPER': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'BOT_CUSTOM': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getAgentTypeLabel = (type: AgentType) => {
        switch (type) {
            case 'USER': return 'User';
            case 'BOT_HOLDER': return 'Holder';
            case 'BOT_ARBITRAGE': return 'Arbitrage';
            case 'BOT_SNIPER': return 'Sniper';
            case 'BOT_CUSTOM': return 'Custom';
            default: return type;
        }
    };

    const handleCreateAgent = (agentData: Omit<Agent, 'id' | 'currentSol' | 'tokenBalance' | 'depositedSol'>) => {
        onCreateAgent(agentData);
        setIsCreateDialogOpen(false);
    };

    const handleEditAgent = (agentData: Omit<Agent, 'id' | 'currentSol' | 'tokenBalance' | 'depositedSol'>) => {
        if (editingAgent) {
            onUpdateAgent(editingAgent.id, agentData);
            setEditingAgent(null);
            setIsEditDialogOpen(false);
        }
    };

    const startEditAgent = (agent: Agent) => {
        setEditingAgent(agent);
        setIsEditDialogOpen(true);
    };

    return (
        <Card className="glass-card h-full">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-mono text-primary">Agent管理器</CardTitle>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="neon-border bg-primary/20 hover:bg-primary/40">
                                <Plus className="w-4 h-4 mr-2" />
                                新增Agent
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-primary font-mono">创建新Agent</DialogTitle>
                            </DialogHeader>
                            <AgentForm onSubmit={handleCreateAgent} />
                        </DialogContent>
                    </Dialog>
                </div>
                <Separator className="bg-border/30" />
            </CardHeader>

            <CardContent className="p-0">
                <ScrollArea className="h-[500px] px-6 pb-6">
                    <div className="space-y-3">
                        {agents.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">暂无Agent</p>
                                <p className="text-xs">点击上方按钮创建新Agent</p>
                            </div>
                        ) : (
                            agents.map((agent) => (
                                <Card key={agent.id} className="glass-border hover:glass-card-hover transition-all duration-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3 flex-1">
                                                <div className="flex-shrink-0 mt-1">
                                                    {agent.isUser ? (
                                                        <User className="w-5 h-5 text-blue-400" />
                                                    ) : (
                                                        <Bot className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                                                        <Badge className={`text-xs ${getAgentTypeColor(agent.type)}`}>
                                                            {getAgentTypeLabel(agent.type)}
                                                        </Badge>
                                                        {!agent.isActive && (
                                                            <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                                                                未激活
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    
                                                    {agent.description && (
                                                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                                            {agent.description}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-muted-foreground">初始:</span>
                                                            <span className="ml-1 text-primary">{agent.initialSol}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">当前:</span>
                                                            <span className="ml-1 text-emerald-400">{agent.currentSol.toFixed(2)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">代币:</span>
                                                            <span className="ml-1 text-yellow-400">{agent.tokenBalance.toFixed(2)}</span>
                                                        </div>
                                                    </div>

                                                    {agent.strategy && (
                                                        <div className="mt-2 p-2 bg-background/30 rounded border border-border/20">
                                                            <p className="text-xs text-muted-foreground mb-1">策略:</p>
                                                            <p className="text-xs text-foreground/80 line-clamp-2 font-mono">
                                                                {agent.strategy}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex space-x-1 ml-2">
                                                {!agent.isUser && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => startEditAgent(agent)}
                                                        className="p-1 h-6 w-6 hover:bg-primary/10"
                                                    >
                                                        <Settings className="w-3 h-3" />
                                                    </Button>
                                                )}
                                                {!agent.isUser && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => onDeleteAgent(agent.id)}
                                                        className="p-1 h-6 w-6 hover:bg-destructive/10 text-destructive/60 hover:text-destructive"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="glass-card max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-primary font-mono">编辑Agent策略</DialogTitle>
                    </DialogHeader>
                    {editingAgent && (
                        <AgentForm 
                            initialData={editingAgent}
                            onSubmit={handleEditAgent}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}