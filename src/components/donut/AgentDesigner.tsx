import React, { useCallback } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider, useReactFlow } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import { Play, Database, Eye, BrainCircuit, Home } from 'lucide-react';
import { useCloneStore } from './store';
import { ConfigPanel } from './ConfigPanel';
import { MarketNode, MemoryNode, ReasoningNode, OpinionNode, EvaluationNode, ExecutionNode, CardNode } from './CustomNodes';
import { ObserverModal, MemoryModal, ReasoningModal, OpinionModal, EvaluationModal, ExecutionModal } from './Modals';
import { Link } from 'react-router-dom';

// --- CUSTOM NODE TYPES ---
const nodeTypes = {
  market: MarketNode,
  memory: MemoryNode,
  reasoning: ReasoningNode,
  opinion: OpinionNode,
  evaluation: EvaluationNode,
  execution: ExecutionNode,
  card: CardNode, // Register new node type
};

// --- INITIAL GRAPH LAYOUT ---
const initialNodes: Node[] = [
  { id: '1', position: { x: 0, y: 150 }, data: { label: 'OBSERVER' }, type: 'market' },
  { id: '2', position: { x: 300, y: 150 }, data: { label: 'MEMORY' }, type: 'memory' },
  { id: '3', position: { x: 600, y: 150 }, data: { label: 'REASONING' }, type: 'reasoning' },
  { id: '4', position: { x: 900, y: 150 }, data: { label: 'OPINION' }, type: 'opinion' },
  { id: '5', position: { x: 1200, y: 150 }, data: { label: 'EVALUATION' }, type: 'evaluation' },
  { id: '6', position: { x: 1500, y: 150 }, data: { label: 'EXECUTION' }, type: 'execution' },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00f2ff', strokeWidth: 2 } }, 
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#00ff41', strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#ff6b00', strokeWidth: 2 } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
];

// --- WRAPPER COMPONENT FOR REACT FLOW HOOKS ---
const FlowContent = () => {
    const { 
        activeModal, openModal, isConfigPanelOpen, toggleConfigPanel, 
    } = useCloneStore();
    
    const { screenToFlowPosition, setNodes } = useReactFlow();

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const payloadStr = event.dataTransfer.getData('application/payload');

            // Check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const payload = JSON.parse(payloadStr);
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `node_${Date.now()}`,
                type,
                position,
                data: { ...payload }, // Pass card data (label, rarity, etc)
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        switch (node.type) {
            case 'market':
                openModal('OBSERVER');
                break;
            case 'memory':
                openModal('MEMORY');
                break;
            case 'reasoning':
                openModal('REASONING');
                break;
            case 'opinion':
                openModal('OPINION');
                break;
            case 'evaluation':
                openModal('EVALUATION');
                break;
            case 'execution':
                openModal('EXECUTION');
                break;
            default:
                break;
        }
    }, [openModal]);

    return (
        <div className="flex-1 flex flex-col relative min-w-0 w-full h-full" onDrop={onDrop} onDragOver={onDragOver}>
             {/* Top Bar */}
             <div className="h-16 border-b border-gray-800 bg-black/40 flex items-center justify-between px-6 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-gray-500 hover:text-neon-blue transition-colors">
                        <Home size={20} />
                    </Link>
                    <h1 className="text-lg font-bold tracking-[0.2em] text-white"></h1>
                </div>
                <div className="flex gap-4 items-center">
                   {!isConfigPanelOpen && (
                     <button 
                       onClick={toggleConfigPanel}
                       className="flex items-center gap-2 px-4 py-2 border border-neon-blue text-neon-blue text-xs hover:bg-neon-blue/10 transition-colors"
                     >
                       <BrainCircuit size={14} /> SHOW CEREBRUM
                     </button>
                   )}
                   <button 
                     onClick={() => openModal('SIMULATION')}
                     className="flex items-center gap-2 px-6 py-2 bg-matrix-green text-black font-bold text-xs tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(0,255,65,0.4)] transition-all"
                   >
                     <Play size={14} /> DEPLOY AGENT
                   </button>
                </div>
             </div>

             {/* Canvas */}
             <div className="flex-1 relative bg-grid-pattern bg-size-[30px_30px]">
                <ReactFlow 
                  defaultNodes={initialNodes} 
                  defaultEdges={initialEdges} 
                  nodeTypes={nodeTypes}
                  onNodeClick={onNodeClick}
                  fitView
                  proOptions={{ hideAttribution: true }}
                  className="bg-retro-black"
                >
                  <Background color="#1e293b" gap={30} size={1} />
                  <Controls className="bg-black! border-gray-800! fill-white!" />
                </ReactFlow>

                 {/* Floating Data Widgets */}
                 <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                     <Widget icon={<Database size={14}/>} label="Sources" value="HYPERLIQUID, POLY" color="text-neon-blue" />
                     <Widget icon={<Eye size={14}/>} label="Sentiment" value="FEAR (24)" color="text-red-500" />
                 </div>
             </div>

             {/* Bottom Status Bar */}
             <div className="h-8 border-t border-gray-800 bg-black flex items-center px-4 justify-between text-[10px] text-gray-500 shrink-0">
                <div className="flex gap-4">
                  <span>SYSTEM: <span className="text-matrix-green">ONLINE</span></span>
                  <span>LATENCY: 12ms</span>
                </div>
                <div>
                  CERBERUS PROTOCOL ACTIVE
                </div>
             </div>
        </div>
    );
}

export function AgentDesigner() {
  const { activeModal } = useCloneStore();
  
  return (
    <div className="h-screen w-full flex bg-retro-black overflow-hidden font-mono text-white selection:bg-neon-blue selection:text-black">
      <ReactFlowProvider>
          <FlowContent />
          <ConfigPanel />
      </ReactFlowProvider>
      
      {/* MODALS */}
      {activeModal === 'OBSERVER' && <ObserverModal />}
      {activeModal === 'MEMORY' && <MemoryModal />}
      {activeModal === 'REASONING' && <ReasoningModal />}
      {activeModal === 'OPINION' && <OpinionModal />}
      {activeModal === 'EVALUATION' && <EvaluationModal />}
      {activeModal === 'EXECUTION' && <ExecutionModal />}
    </div>
  );
}

const Widget = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="bg-black/80 border border-gray-800 p-3 backdrop-blur-md shadow-lg min-w-[180px]">
    <div className={`flex items-center gap-2 mb-1 ${color}`}>{icon} <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span></div>
    <div className="text-xs font-bold pl-6 text-white">{value}</div>
  </div>
);

export default AgentDesigner;

