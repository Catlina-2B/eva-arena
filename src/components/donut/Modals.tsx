import React from 'react';
import { X, HardDrive, Brain, Zap, MessageSquare, Database, Server, Wifi, ShieldCheck, Activity } from 'lucide-react';
import { useCloneStore } from './store';
import type { ModelType } from './store';
import { RetroSlider, RetroToggle, RetroPill } from './RetroComponents';

// --- WRAPPER ---
const ModalWrapper = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="w-full max-w-2xl bg-[#09090b] border border-gray-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
        <h3 className="text-neon-blue font-bold tracking-widest text-lg flex items-center gap-2">
          {title}
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

// --- 1. OBSERVER MODAL ---
export const ObserverModal = () => {
  const { openModal } = useCloneStore();
  
  const hyperLiquidData = {
    symbol: "SOL-USD",
    bid_depth_10bps: 145000.23,
    ask_depth_10bps: 132000.11,
    imbalance: 0.098,
    spread_ma_5m: 0.02,
    funding_predicted: 0.0042
  };

  const polymarketData = {
    market_id: "0x892...",
    question: "Will SOL break $200 in Oct?",
    yes_price: 0.62,
    volume_24h: 1250000,
    implied_probability: 0.62
  };

  return (
    <ModalWrapper title="OBSERVER :: DATA STREAMS" onClose={() => openModal('NONE')}>
       <div className="space-y-6">
          <div className="flex gap-4">
             <div className="flex-1 border border-neon-blue/30 bg-neon-blue/5 p-3 rounded flex items-center justify-between">
                <div className="flex items-center gap-2 text-neon-blue text-xs font-bold"><Wifi size={14}/> HYPERLIQUID</div>
                <div className="flex items-center gap-1 text-[10px] text-matrix-green"><div className="w-1.5 h-1.5 rounded-full bg-matrix-green animate-pulse"/> LIVE 12ms</div>
             </div>
             <div className="flex-1 border border-purple-500/30 bg-purple-500/5 p-3 rounded flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold"><Database size={14}/> POLYMARKET</div>
                 <div className="flex items-center gap-1 text-[10px] text-matrix-green"><div className="w-1.5 h-1.5 rounded-full bg-matrix-green animate-pulse"/> LIVE 450ms</div>
             </div>
          </div>

          <div className="border border-blue-900/50 bg-blue-900/10 p-4 rounded-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-3">
               <span className="text-neon-blue font-bold text-sm">ORDERBOOK DEPTH SNAPSHOT</span>
               <span className="text-gray-500 text-xs">2ms ago</span>
             </div>
             <pre className="text-[11px] font-mono text-blue-200 leading-relaxed overflow-x-auto">
               {JSON.stringify(hyperLiquidData, null, 2)}
             </pre>
          </div>

          <div className="border border-purple-900/50 bg-purple-900/10 p-4 rounded-sm">
             <div className="flex justify-between items-center mb-3">
               <span className="text-purple-400 font-bold text-sm">PREDICTION MARKET SENTIMENT</span>
               <span className="text-gray-500 text-xs">150ms ago</span>
             </div>
             <pre className="text-[11px] font-mono text-purple-200 leading-relaxed overflow-x-auto">
               {JSON.stringify(polymarketData, null, 2)}
             </pre>
          </div>
       </div>
    </ModalWrapper>
  );
};

// --- 2. MEMORY MODAL ---
export const MemoryModal = () => {
    const { openModal } = useCloneStore();
    return (
        <ModalWrapper title="MEMORY :: VECTOR STORE CONFIG" onClose={() => openModal('NONE')}>
            <div className="space-y-8">
                 <div className="flex items-center gap-4 p-4 border border-matrix-green/30 bg-matrix-green/5 rounded">
                    <div className="bg-matrix-green/20 p-2 rounded"><Server size={24} className="text-matrix-green"/></div>
                    <div>
                        <div className="text-sm font-bold text-white">PINECOE INDEX: main-v2</div>
                        <div className="text-xs text-gray-500">Status: <span className="text-matrix-green">CONNECTED</span> | Vectors: 1.2M</div>
                    </div>
                 </div>

                 <RetroSlider 
                    label="CONTEXT WINDOW (TOKENS)" 
                    stops={['4K', '16K', '32K', '128K']} 
                    value={2} 
                    onChange={() => {}}
                    color="neon-blue"
                />

                <RetroSlider 
                    label="RETRIEVAL STRATEGY" 
                    stops={['STRICT_RECENCY', 'SEMANTIC_HYBRID', 'MAX_RELEVANCE']} 
                    value={1} 
                    onChange={() => {}}
                    color="neon-orange"
                />

                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-800 bg-gray-900 p-3 rounded">
                        <div className="text-[10px] text-gray-400 font-bold mb-2">LONG TERM STORAGE</div>
                        <RetroToggle checked={true} onChange={() => {}} label="Archive Trade Logs" />
                        <div className="mt-2"><RetroToggle checked={true} onChange={() => {}} label="Pattern Recognition" /></div>
                    </div>
                    <div className="border border-gray-800 bg-gray-900 p-3 rounded">
                        <div className="text-[10px] text-gray-400 font-bold mb-2">SHORT TERM BUFFER</div>
                        <RetroToggle checked={true} onChange={() => {}} label="Price Tick Stream" />
                        <div className="mt-2"><RetroToggle checked={false} onChange={() => {}} label="Discord Firehose" /></div>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    )
}

// --- 3. REASONING MODAL ---
export const ReasoningModal = () => {
    const { openModal, config, setConfig } = useCloneStore();
    const models: ModelType[] = ['CLAUDE', 'GPT-5', 'GROK', 'QWEN'];

    return (
        <ModalWrapper title="REASONING :: COGNITIVE ENGINE" onClose={() => openModal('NONE')}>
            <div className="space-y-8">
                <div className="space-y-3">
                    <label className="text-xs font-bold text-neon-orange tracking-widest">FOUNDATION MODEL</label>
                    <div className="flex gap-2">
                        {models.map(m => (
                            <RetroPill 
                                key={m} 
                                label={m} 
                                selected={config.reasoningModel === m} 
                                onClick={() => setConfig('reasoningModel', m)} 
                            />
                        ))}
                    </div>
                </div>

                <div className="p-4 border border-gray-800 bg-gray-900/50 rounded flex gap-4 items-center">
                    <Brain size={24} className="text-neon-orange" />
                    <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-gray-400">TEMPERATURE</span>
                            <span className="text-neon-orange">0.7</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-neon-orange w-[70%]"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-gray-700 bg-black rounded">
                        <div className="text-[10px] text-gray-500 font-bold mb-2 uppercase">System 2 Thinking</div>
                        <RetroToggle checked={true} onChange={() => {}} label="Chain of Thought" />
                    </div>
                    <div className="p-3 border border-gray-700 bg-black rounded">
                        <div className="text-[10px] text-gray-500 font-bold mb-2 uppercase">Safety Layer</div>
                        <RetroToggle checked={false} onChange={() => {}} label="Strict Alignment" />
                    </div>
                </div>
            </div>
        </ModalWrapper>
    )
}

// --- 4. OPINION MODAL ---
export const OpinionModal = () => {
    const { openModal } = useCloneStore();
    return (
        <ModalWrapper title="OPINION :: SIGNAL SYNTHESIS" onClose={() => openModal('NONE')}>
            <div className="space-y-6">
                <RetroSlider 
                    label="SENTIMENT SOURCE WEIGHTING" 
                    stops={['PURE PRICE', 'BALANCED', 'NEWS HEAVY']} 
                    value={1} 
                    onChange={() => {}}
                />

                <div className="space-y-2">
                    <div className="text-xs font-bold text-blue-400 tracking-widest mb-2">INPUT FEEDS</div>
                    {[
                        { name: 'Twitter / X Firehose', active: true, weight: 'High' },
                        { name: 'On-Chain Whale Watch', active: true, weight: 'Critical' },
                        { name: 'Macro Economic Calendar', active: false, weight: 'Low' },
                        { name: 'Discord Alpha Groups', active: true, weight: 'Medium' }
                    ].map((feed, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border border-gray-800 bg-gray-900/30 rounded">
                            <div className="flex items-center gap-3">
                                <MessageSquare size={14} className="text-gray-500"/>
                                <span className="text-xs text-gray-300">{feed.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] text-blue-400 font-mono">{feed.weight}</span>
                                <RetroToggle checked={feed.active} onChange={() => {}} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ModalWrapper>
    )
}

// --- 5. EVALUATION MODAL ---
export const EvaluationModal = () => {
    const { openModal, config, setConfig } = useCloneStore();
    return (
        <ModalWrapper title="EVALUATION :: RISK GATEWAY" onClose={() => openModal('NONE')}>
            <div className="space-y-6">
                 <div className="bg-purple-900/10 border border-purple-900/50 p-4 rounded flex items-center gap-4">
                    <ShieldCheck size={32} className="text-purple-500" />
                    <div>
                        <div className="text-sm font-bold text-purple-200">PORTFOLIO GUARD ACTIVE</div>
                        <div className="text-xs text-purple-400/60">Rejects trades violating VaR limits.</div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Hard Stop Loss (%)</label>
                        <input 
                            type="number" 
                            className="w-full bg-black border border-gray-700 p-2 text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
                            defaultValue={2.5}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Min Risk/Reward</label>
                        <input 
                            type="number" 
                            className="w-full bg-black border border-gray-700 p-2 text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
                            defaultValue={1.5}
                        />
                    </div>
                 </div>

                 <RetroSlider 
                    label="DRAWDOWN TOLERANCE" 
                    stops={['TIGHT (1%)', 'STANDARD (3%)', 'LOOSE (5%)', 'YOLO']} 
                    value={config.riskProfile === 'conservative' ? 0 : config.riskProfile === 'aggressive' ? 3 : 1} 
                    onChange={() => {}}
                    color="neon-orange"
                />
            </div>
        </ModalWrapper>
    )
}

// --- 6. EXECUTION MODAL ---
export const ExecutionModal = () => {
    const { openModal } = useCloneStore();
    return (
        <ModalWrapper title="EXECUTION :: ROUTER CONFIG" onClose={() => openModal('NONE')}>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-gray-700 bg-gray-900 rounded hover:border-white cursor-pointer transition-colors">
                        <div className="text-[10px] text-gray-400 font-bold mb-1">STRATEGY</div>
                        <div className="text-lg font-bold text-white flex items-center gap-2"><Activity size={16}/> TWAP</div>
                    </div>
                     <div className="p-3 border border-gray-700 bg-gray-900 rounded hover:border-white cursor-pointer transition-colors">
                        <div className="text-[10px] text-gray-400 font-bold mb-1">AGGRESSIVENESS</div>
                        <div className="text-lg font-bold text-white flex items-center gap-2"><Zap size={16}/> PASSIVE</div>
                    </div>
                </div>

                <RetroSlider 
                    label="MAX SLIPPAGE TOLERANCE" 
                    stops={['0.1%', '0.5%', '1.0%', 'UNLIMITED']} 
                    value={1} 
                    onChange={() => {}}
                    color="neon-blue"
                />

                <div className="space-y-2">
                    <div className="text-xs font-bold text-white tracking-widest mb-2">VENUE ROUTING</div>
                    <div className="flex flex-col gap-2">
                         <div className="flex items-center justify-between p-2 border border-gray-800 bg-black rounded">
                            <span className="text-xs text-gray-400">Hyperliquid (Perps)</span>
                            <RetroToggle checked={true} onChange={() => {}} label="Primary" />
                         </div>
                         <div className="flex items-center justify-between p-2 border border-gray-800 bg-black rounded">
                            <span className="text-xs text-gray-400">Uniswap V3 (Spot)</span>
                            <RetroToggle checked={true} onChange={() => {}} label="Backup" />
                         </div>
                         <div className="flex items-center justify-between p-2 border border-gray-800 bg-black rounded">
                            <span className="text-xs text-gray-400">Binance (CEX)</span>
                            <RetroToggle checked={false} onChange={() => {}} label="Disabled" />
                         </div>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    )
}

