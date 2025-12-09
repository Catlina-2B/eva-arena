import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Activity, Database, Cpu, Wifi, HardDrive, Zap, MessageSquare, ClipboardCheck, Box, ShieldCheck, Gem } from 'lucide-react';
import { useCloneStore } from './store';

interface NodeWrapperProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  glowColor?: string;
}

const NodeWrapper = ({ children, className = '', borderColor = 'border-gray-700', glowColor = 'rgba(0,0,0,0.5)' }: NodeWrapperProps) => (
  <div 
    className={`relative min-w-[240px] bg-black/90 border ${borderColor} p-0 font-mono group transition-all duration-300 ${className}`}
    style={{ boxShadow: `0 0 20px ${glowColor}` }}
  >
    {/* Decorative corner markers */}
    <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-current opacity-50"></div>
    <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-current opacity-50"></div>
    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-current opacity-50"></div>
    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-current opacity-50"></div>
    
    {/* Scanline overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
    
    <div className="relative z-10">
        {children}
    </div>
  </div>
);

// --- SHARED INPUT COMPONENT ---
interface NodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  colorClass?: string;
}

const NodeInput = ({ value, onChange, placeholder = '', colorClass = "text-gray-400" }: NodeInputProps) => (
  <textarea
    className={`nodrag w-full bg-black/50 border border-gray-800 rounded p-2 text-[10px] font-mono focus:outline-none focus:border-current resize-none h-16 leading-relaxed ${colorClass}`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    spellCheck={false}
  />
);

// --- NEW COLLECTIBLE CARD NODE ---
export const CardNode = memo(({ data, id }: any) => {
    const { nodeDirectives, setNodeDirective } = useCloneStore();
    const directiveKey = `card_${id}`; // Unique key for this instance
    const title = data.label || 'UNKNOWN MODULE';
    const rarity = data.rarity || 'COMMON';
    
    let borderColor = 'border-gray-600';
    let textColor = 'text-gray-400';
    let Icon = Box;

    if (rarity === 'LEGENDARY') {
        borderColor = 'border-amber-400';
        textColor = 'text-amber-400';
        Icon = Gem;
    } else if (rarity === 'RARE') {
        borderColor = 'border-cyber-pink';
        textColor = 'text-cyber-pink';
        Icon = Zap;
    } else if (rarity === 'UNCOMMON') {
        borderColor = 'border-neon-blue';
        textColor = 'text-neon-blue';
        Icon = Activity;
    }

    return (
        <NodeWrapper borderColor={borderColor} glowColor={rarity === 'LEGENDARY' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(0,0,0,0.5)'}>
             <Handle type="target" position={Position.Top} className={`!bg-black !border !border-current !w-3 !h-3 !rounded-none ${textColor}`} />
             
             <div className={`flex items-center justify-between p-2 border-b ${borderColor} bg-white/5`}>
                <div className={`flex items-center gap-2 font-bold text-xs tracking-wider ${textColor}`}>
                    <Icon size={14} />
                    {title}
                </div>
                <span className="text-[8px] bg-black/50 px-1 border border-gray-800 rounded text-gray-400">{rarity}</span>
             </div>

             <div className="p-3 bg-black/80 space-y-2">
                 <div className="text-[9px] text-gray-500 uppercase tracking-widest">{data.type || 'MODULE'} CONFIG</div>
                 <NodeInput 
                    value={nodeDirectives[directiveKey] || data.defaultPrompt || ''}
                    onChange={(v) => setNodeDirective(directiveKey, v)}
                    placeholder="Enter module logic..."
                    colorClass={textColor}
                 />
             </div>
             
             <Handle type="source" position={Position.Bottom} className={`!bg-black !border !border-current !w-3 !h-3 !rounded-none ${textColor}`} />
        </NodeWrapper>
    )
});

// --- 1. OBSERVER ---
export const MarketNode = memo(({ data }: any) => {
  const { nodeDirectives, setNodeDirective } = useCloneStore();
  
  return (
    <NodeWrapper borderColor="border-neon-blue" className="text-neon-blue hover:scale-105">
      <div className="flex items-center justify-between bg-neon-blue/10 p-2 border-b border-neon-blue/30">
        <div className="flex items-center gap-2">
            <Activity size={16} className="animate-pulse" />
            <span className="text-xs font-bold tracking-wider">OBSERVER</span>
        </div>
        <Wifi size={12} className="opacity-70" />
      </div>
      <div className="p-3 space-y-2">
        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Directive (Editable)</div>
        <NodeInput 
           value={nodeDirectives.observer}
           onChange={(v) => setNodeDirective('observer', v)}
           colorClass="text-neon-blue focus:border-neon-blue"
        />
        <div className="flex justify-between items-center pt-2 border-t border-gray-800">
             <span className="text-[9px] text-gray-500">FEED STATUS</span>
             <span className="text-[9px] text-neon-blue animate-pulse">LIVE</span>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-neon-blue !w-3 !h-3 !border-none !rounded-none" 
        style={{ right: -6, top: '50%' }}
      />
    </NodeWrapper>
  );
});

// --- 2. MEMORY ---
export const MemoryNode = memo(({ data }: any) => {
  const { nodeDirectives, setNodeDirective } = useCloneStore();

  return (
    <NodeWrapper borderColor="border-matrix-green" className="text-matrix-green hover:scale-105">
      <Handle type="target" position={Position.Left} className="!bg-matrix-green !w-3 !h-3 !border-none !rounded-none" style={{ left: -6, top: '50%' }}/>

      <div className="flex items-center justify-between bg-matrix-green/10 p-2 border-b border-matrix-green/30">
        <div className="flex items-center gap-2">
            <Database size={16} />
            <span className="text-xs font-bold tracking-wider">MEMORY</span>
        </div>
        <HardDrive size={12} className="opacity-70" />
      </div>
      
      <div className="p-3 space-y-2">
        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Context Rule</div>
        <NodeInput 
           value={nodeDirectives.memory}
           onChange={(v) => setNodeDirective('memory', v)}
           colorClass="text-matrix-green focus:border-matrix-green"
        />
      </div>

      <Handle type="source" position={Position.Right} className="!bg-matrix-green !w-3 !h-3 !border-none !rounded-none" style={{ right: -6, top: '50%' }}/>
    </NodeWrapper>
  );
});

// --- 3. REASONING ---
export const ReasoningNode = memo(({ data }: any) => {
  const { nodeDirectives, setNodeDirective } = useCloneStore();

  return (
    <NodeWrapper borderColor="border-neon-orange" className="text-neon-orange hover:scale-105">
      <Handle type="target" position={Position.Left} className="!bg-neon-orange !w-3 !h-3 !border-none !rounded-none" style={{ left: -6, top: '50%' }}/>
      <Handle type="source" position={Position.Right} className="!bg-neon-orange !w-3 !h-3 !border-none !rounded-none" style={{ right: -6, top: '50%' }}/>

      <div className="flex items-center justify-between bg-neon-orange/10 p-2 border-b border-neon-orange/30">
        <div className="flex items-center gap-2">
            <Cpu size={16} className="animate-spin-slow" />
            <span className="text-xs font-bold tracking-wider">REASONING</span>
        </div>
        <Zap size={12} className="opacity-70" />
      </div>
      
      <div className="p-3 flex flex-col items-center space-y-2 w-full">
         <div className="text-[10px] text-gray-400 uppercase tracking-widest w-full text-left">Cognitive Task</div>
         <NodeInput 
           value={nodeDirectives.reasoning}
           onChange={(v) => setNodeDirective('reasoning', v)}
           colorClass="text-neon-orange focus:border-neon-orange"
        />
        <div className="w-full h-[1px] bg-neon-orange/30 my-1"></div>
        <div className="flex justify-between w-full text-[9px] text-neon-orange/80">
            <span>MODEL: CLAUDE-3.5</span>
            <span>TOKEN: 8k</span>
        </div>
      </div>
    </NodeWrapper>
  );
});

// --- 4. OPINION STORAGE ---
export const OpinionNode = memo(({ data }: any) => {
    const { nodeDirectives, setNodeDirective } = useCloneStore();

    return (
      <NodeWrapper borderColor="border-blue-400" className="text-blue-400 hover:scale-105">
        <Handle type="target" position={Position.Left} className="!bg-blue-400 !w-3 !h-3 !border-none !rounded-none" style={{ left: -6, top: '50%' }}/>
        <Handle type="source" position={Position.Right} className="!bg-blue-400 !w-3 !h-3 !border-none !rounded-none" style={{ right: -6, top: '50%' }}/>
  
        <div className="flex items-center justify-between bg-blue-400/10 p-2 border-b border-blue-400/30">
          <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span className="text-xs font-bold tracking-wider">OPINION</span>
          </div>
        </div>
        
        <div className="p-3 space-y-2">
           <div className="text-[10px] text-gray-400 uppercase tracking-widest">Signal Formatting</div>
           <NodeInput 
             value={nodeDirectives.opinion}
             onChange={(v) => setNodeDirective('opinion', v)}
             colorClass="text-blue-400 focus:border-blue-400"
          />
        </div>
      </NodeWrapper>
    );
  });

// --- 5. TRADE EVALUATION ---
export const EvaluationNode = memo(({ data }: any) => {
    const { nodeDirectives, setNodeDirective } = useCloneStore();

    return (
      <NodeWrapper borderColor="border-purple-500" className="text-purple-500 hover:scale-105">
        <Handle type="target" position={Position.Left} className="!bg-purple-500 !w-3 !h-3 !border-none !rounded-none" style={{ left: -6, top: '50%' }}/>
        <Handle type="source" position={Position.Right} className="!bg-purple-500 !w-3 !h-3 !border-none !rounded-none" style={{ right: -6, top: '50%' }}/>
  
        <div className="flex items-center justify-between bg-purple-500/10 p-2 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
              <ClipboardCheck size={16} />
              <span className="text-xs font-bold tracking-wider">EVALUATION</span>
          </div>
        </div>
        
        <div className="p-3 space-y-2">
             <div className="text-[10px] text-gray-400 uppercase tracking-widest">Risk Guardrails</div>
             <NodeInput 
               value={nodeDirectives.evaluation}
               onChange={(v) => setNodeDirective('evaluation', v)}
               colorClass="text-purple-500 focus:border-purple-500"
            />
        </div>
      </NodeWrapper>
    );
  });

// --- 6. EXECUTION ---
export const ExecutionNode = memo(({ data }: any) => {
    const { nodeDirectives, setNodeDirective } = useCloneStore();

    return (
      <NodeWrapper borderColor="border-white" className="text-white hover:scale-105">
        <Handle type="target" position={Position.Left} className="!bg-white !w-3 !h-3 !border-none !rounded-none" style={{ left: -6, top: '50%' }}/>
  
        <div className="flex items-center justify-between bg-white/10 p-2 border-b border-white/30">
          <div className="flex items-center gap-2">
              <Zap size={16} />
              <span className="text-xs font-bold tracking-wider">EXECUTION</span>
          </div>
        </div>
        
        <div className="p-3 space-y-2">
             <div className="text-[10px] text-gray-400 uppercase tracking-widest">Execution Style</div>
             <NodeInput 
               value={nodeDirectives.execution}
               onChange={(v) => setNodeDirective('execution', v)}
               colorClass="text-white focus:border-white"
            />
        </div>
      </NodeWrapper>
    );
  });

