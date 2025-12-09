import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useCloneStore } from './store';
import type { RiskProfile, TimeHorizon, Objective, ScenarioDetail } from './store';
import { RetroSlider, RetroPill, RetroToggle } from './RetroComponents';
import { BrainCircuit, X, Terminal, Copy, Shield, Target, Scale, Clock, AlertTriangle, Layers, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';

// --- TYPES ---
interface PromptSegment {
  id: string;
  text: string;
  highlightKey?: string;
}

export const ConfigPanel: React.FC = () => {
  const { config, setConfig, setScenarioConfig, isConfigPanelOpen, toggleConfigPanel, nodeDirectives, toggleObjective } = useCloneStore();
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const promptContainerRef = useRef<HTMLDivElement>(null);
  
  // --- PROMPT SEGMENT GENERATION ---
  const promptSegments: PromptSegment[] = useMemo(() => {
    const segments: PromptSegment[] = [];
    let idCounter = 0;
    const add = (text: string, highlightKey?: string) => {
      segments.push({ id: `seg-${idCounter++}`, text, highlightKey });
    };

    // HEADER
    add(`# ROLE: AI TRADING AGENT (DONUT EXECUTION LAYER)\n`);
    add(`// Engine: ${config.reasoningModel} | Date: ${new Date().toISOString().split('T')[0]}\n\n`);

    // 1. IDENTITY
    add(`## 1. IDENTITY & CORE DIRECTIVES\n`);
    add(`Your Profile: `);
    add(config.riskProfile.toUpperCase(), 'riskProfile');
    add(`\nTime Horizon: `);
    add(config.timeHorizon.toUpperCase(), 'timeHorizon');
    add(`\n\nYour Prioritized Objectives:\n`);
    
    const objectivesText = config.objectives.length > 0
      ? config.objectives.map((obj, i) => `${i + 1}. ${obj.toUpperCase().replace(/_/g, ' ')}`).join('\n')
      : "NONE SELECTED";
    add(objectivesText, 'objectives');
    add(`\n\n`);

    // RISK CONSTRAINTS
    add(`Risk Constraints (Global):\n`);
    add(`- Max Risk Per Trade: ${config.maxRiskPerTradePct}% of NAV.\n`, 'maxRiskPerTradePct');
    add(`- Max Daily Drawdown: ${config.maxDailyDrawdownPct}% of NAV.\n`, 'maxDailyDrawdownPct');
    add(`If a trade proposal violates these, you MUST REJECT IT.\n\n`);

    // 2. CERBERUS
    add(`## 2. THE CERBERUS FRAMEWORK (Internal Weighted Voting)\n`);
    add(`You evaluate every market state through four sub-roles. You must weigh their inputs as follows:\n\n`);
    add(`1. STRUCTURALIST (Weight: ${config.structuralistWeight}): `, 'structuralistWeight');
    add(`Analyzes price structure, higher timeframe trends, and key levels.\n`);
    add(`2. QUANT (Weight: ${config.quantWeight}): `, 'quantWeight');
    add(`Analyzes data, funding rates, OI, and statistical anomalies.\n`);
    add(`3. STRATEGIST (Weight: ${config.strategistWeight}): `, 'strategistWeight');
    add(`Synthesizes setups and narrative alignment.\n`);
    add(`4. RISK GOVERNOR (Weight: ${config.riskGovernorWeight}): `, 'riskGovernorWeight');
    add(`Enforces caps and correlation limits. Has VETO power.\n\n`);

    // 3. DOG VS TAIL
    add(`## 3. DOG VS TAIL (Edge Calculation)\n`);
    add(`You must calculate market edge based on the following balance:\n`);
    add(`- "Dog" (Structure/Spot): ${config.dogWeight}% importance.\n`, 'dogWeight');
    add(`- "Tail" (Derivatives/Narrative): ${config.tailWeight}% importance.\n\n`, 'tailWeight');

    const conflictText = config.dogWeight > config.tailWeight
        ? `When Structure (Dog) and Sentiment (Tail) disagree, prioritize Structure. Default to NO TRADE unless Structure is pristine.`
        : `When Structure (Dog) and Sentiment (Tail) disagree, prioritize Sentiment/Momentum even if against structure.`;
    add(conflictText, config.dogWeight > config.tailWeight ? 'dogWeight' : 'tailWeight');
    add(`\n\n`);

    // 4. POSITION SIZING
    add(`## 4. POSITION SIZING & RISK VETO\n`);
    add(`- Max Open Positions: ${config.maxOpenPositions}\n`, 'maxOpenPositions');
    add(`- Max Correlated Long Exposure: ${config.maxCorrelatedLongExposurePct}% of NAV (VETO if exceeded)\n`, 'maxCorrelatedLongExposurePct');
    add(`- Volatility Guard: If Asset ATR% > ${config.highVolAtrPctThreshold}%, `, 'highVolAtrPctThreshold');
    add(`reduce position size by ${(1 - config.highVolSizeMultiplier) * 100}%.\n\n`, 'highVolSizeMultiplier');

    // 5. SCENARIOS
    add(`## 5. SCENARIO ROUTING POLICIES\n`);
    add(`You are operating in a specific scenario context. Adhere to these permissions:\n`);
    
    // Quick
    Object.entries(config.scenarios.quick).forEach(([key, val]) => {
        const detail = val as ScenarioDetail;
        const status = !detail.enabled ? 'DISABLED. Do not process.' : detail.canEmitAction ? 'ENABLED. Authorized to propose <action> trades.' : 'ANALYSIS ONLY. <action> block is FORBIDDEN.';
        add(`- Scenario /${key}: ${status}\n`, `scenario_quick_${key}`);
    });
    // Dialog
    Object.entries(config.scenarios.dialog).forEach(([key, val]) => {
        const detail = val as ScenarioDetail;
        const status = !detail.enabled ? 'DISABLED. Do not process.' : detail.canEmitAction ? 'ENABLED. Authorized to propose <action> trades.' : 'ANALYSIS ONLY. <action> block is FORBIDDEN.';
        add(`- Scenario /${key}: ${status}\n`, `scenario_dialog_${key}`);
    });
    add(`\n`);

    // 6. UNIVERSAL
    add(`## 6. UNIVERSAL FRAMEWORK\nContext -> Edge -> Cost -> Risk -> Route/Stand Down.\n\n`);

    // 7. OUTPUT
    add(`## 7. OUTPUT FORMAT\nYou must output in this XML-like structure:\n\n<thinking>\n [Internal monologue analyzing Cerberus inputs, calculating weighted edge, and checking filters]\n</thinking>\n\n<report>\n [User facing explanation. Be concise. Explain WHY a trade is taken or WHY "No Trade" was decided.]\n</report>\n\n<action>\n [OPTIONAL: Only if permitted by scenario and filters passed. JSON format for order execution.]\n</action>\n\n`);

    // 8. NODES
    add(`## 8. PIPELINE NODES (Specific Logic)\n`);
    Object.entries(nodeDirectives).forEach(([key, val]) => {
         add(`[${key.toUpperCase()}]: ${val}\n`);
    });

    return segments;
  }, [config, nodeDirectives]);

  // Derived full text for copy
  const fullPromptText = useMemo(() => promptSegments.map(s => s.text).join(''), [promptSegments]);

  // Scroll to highlighted segment
  useEffect(() => {
    if (hoveredField && promptContainerRef.current) {
        const el = document.getElementById(`prompt-highlight-${hoveredField}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [hoveredField]);

  // UI Helpers
  const objectivesList: Objective[] = ['max_drawdown_minimized', 'sharpe_maximized', 'capital_preservation', 'capture_large_trends'];
  const riskProfiles: RiskProfile[] = ['very_conservative', 'conservative', 'balanced', 'aggressive'];
  const timeHorizons: TimeHorizon[] = ['intraday', 'swing', 'position'];

  // Wrapper to handle hover
  const ControlGroup = ({ field, children, className }: { field: string, children: React.ReactNode, className?: string }) => (
    <div 
        onMouseEnter={() => setHoveredField(field)}
        onMouseLeave={() => setHoveredField(null)}
        className={clsx("transition-all duration-300", 
            hoveredField && hoveredField === field ? "bg-white/5 border-l-2 border-neon-blue pl-2 -ml-2 rounded-r" : "",
            className
        )}
    >
        {children}
    </div>
  );

  return (
    <div 
      className={clsx(
        "fixed top-16 right-0 bottom-0 w-[450px] bg-retro-black/95 border-l border-neon-blue z-40 transition-transform duration-300 transform flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]",
        isConfigPanelOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* HEADER */}
      <div className="p-5 border-b border-gray-800 bg-black/40 flex justify-between items-center shrink-0 backdrop-blur-md">
        <h2 className="text-neon-blue font-bold tracking-[0.2em] text-sm flex items-center gap-2">
          <BrainCircuit size={18} className="animate-pulse" /> AGENT CEREBRUM
        </h2>
        <button onClick={toggleConfigPanel} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
        </button>
      </div>

      {/* SCROLLABLE CONFIG CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-6 relative">
        
        {/* SECTION 1: IDENTITY */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">
                <Target size={14} /> Identity & Objectives
            </div>
            
            <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Risk Profile</label>
                <ControlGroup field="riskProfile">
                    <div className="grid grid-cols-2 gap-2">
                        {riskProfiles.map(p => (
                            <RetroPill 
                                key={p} 
                                label={p.replace('_', ' ').toUpperCase()} 
                                selected={config.riskProfile === p}
                                onClick={() => setConfig('riskProfile', p)}
                            />
                        ))}
                    </div>
                </ControlGroup>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Time Horizon</label>
                <ControlGroup field="timeHorizon">
                    <div className="flex gap-2">
                        {timeHorizons.map(h => (
                            <RetroPill 
                                key={h} 
                                label={h.toUpperCase()} 
                                selected={config.timeHorizon === h}
                                onClick={() => setConfig('timeHorizon', h)}
                            />
                        ))}
                    </div>
                </ControlGroup>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-bold uppercase">Core Objectives (Multi-select)</label>
                <ControlGroup field="objectives">
                    <div className="grid grid-cols-1 gap-2">
                        {objectivesList.map(obj => (
                            <div 
                                key={obj}
                                onClick={() => toggleObjective(obj)}
                                className={clsx(
                                    "cursor-pointer p-2 border text-[10px] font-mono flex items-center gap-3 transition-all",
                                    config.objectives.includes(obj) 
                                        ? "bg-neon-blue/10 border-neon-blue text-white" 
                                        : "bg-black border-gray-800 text-gray-500 hover:border-gray-600"
                                )}
                            >
                                <div className={clsx("w-3 h-3 border flex items-center justify-center", config.objectives.includes(obj) ? "border-neon-blue bg-neon-blue" : "border-gray-600")}>
                                    {config.objectives.includes(obj) && <span className="text-black text-[8px]">✓</span>}
                                </div>
                                {obj.toUpperCase().replace(/_/g, ' ')}
                            </div>
                        ))}
                    </div>
                </ControlGroup>
            </div>
        </section>

        {/* SECTION 2: RISK */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">
                <Shield size={14} /> Risk Constraints
            </div>
            <div className="grid grid-cols-2 gap-4">
                <ControlGroup field="maxRiskPerTradePct">
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Max Risk / Trade</label>
                    <div className="relative">
                        <input 
                            type="number" step="0.1" 
                            value={config.maxRiskPerTradePct}
                            onChange={(e) => setConfig('maxRiskPerTradePct', parseFloat(e.target.value))}
                            className="w-full bg-black border border-gray-700 p-2 text-white font-mono text-sm focus:border-neon-blue focus:outline-none"
                        />
                        <span className="absolute right-2 top-2.5 text-gray-500 text-xs">%</span>
                    </div>
                </ControlGroup>
                <ControlGroup field="maxDailyDrawdownPct">
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Max Daily DD</label>
                    <div className="relative">
                        <input 
                            type="number" step="0.5" 
                            value={config.maxDailyDrawdownPct}
                            onChange={(e) => setConfig('maxDailyDrawdownPct', parseFloat(e.target.value))}
                            className="w-full bg-black border border-gray-700 p-2 text-white font-mono text-sm focus:border-neon-blue focus:outline-none"
                        />
                        <span className="absolute right-2 top-2.5 text-gray-500 text-xs">%</span>
                    </div>
                </ControlGroup>
            </div>
        </section>

        {/* SECTION 3: CERBERUS */}
        <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">
                <Scale size={14} /> Cerberus Framework
            </div>
            
            <ControlGroup field="structuralistWeight">
                <RetroSlider 
                    label="STRUCTURALIST (Trend/Levels)" 
                    stops={['0', '25', '50', '75', '100']} 
                    value={config.structuralistWeight / 25} 
                    onChange={(v) => setConfig('structuralistWeight', v * 25)}
                />
            </ControlGroup>
            <ControlGroup field="quantWeight">
                <RetroSlider 
                    label="QUANT (Data/Stats)" 
                    stops={['0', '25', '50', '75', '100']} 
                    value={config.quantWeight / 25} 
                    onChange={(v) => setConfig('quantWeight', v * 25)}
                />
            </ControlGroup>
            <ControlGroup field="strategistWeight">
                <RetroSlider 
                    label="STRATEGIST (Narrative/Setup)" 
                    stops={['0', '25', '50', '75', '100']} 
                    value={config.strategistWeight / 25} 
                    onChange={(v) => setConfig('strategistWeight', v * 25)}
                />
            </ControlGroup>
            <ControlGroup field="riskGovernorWeight">
                <div className="p-3 border border-orange-900/50 bg-orange-900/10 rounded">
                    <RetroSlider 
                        label="RISK GOVERNOR (Veto Power)" 
                        stops={['WEAK', 'MODERATE', 'STRONG', 'IRONCLAD', 'TOTAL']} 
                        value={config.riskGovernorWeight / 25} 
                        onChange={(v) => setConfig('riskGovernorWeight', v * 25)}
                        color="neon-orange"
                    />
                    <div className="flex items-center gap-2 text-[10px] text-orange-400 mt-2">
                        <AlertTriangle size={12} />
                        High governor weight increases "NO TRADE" frequency.
                    </div>
                </div>
            </ControlGroup>
        </section>

        {/* SECTION 4: DOG VS TAIL */}
        <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">
                <Clock size={14} /> Edge Calculation
            </div>
            <div className="flex gap-4">
                 <div className="flex-1">
                    <ControlGroup field="dogWeight">
                        <label className="text-[10px] text-neon-blue font-bold uppercase block mb-2">DOG (Structure)</label>
                        <input 
                            type="range" min="0" max="100" 
                            value={config.dogWeight}
                            onChange={(e) => setConfig('dogWeight', parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-blue"
                        />
                        <div className="text-right text-xs text-white font-mono mt-1">{config.dogWeight}%</div>
                    </ControlGroup>
                 </div>
                 <div className="flex-1">
                    <ControlGroup field="tailWeight">
                        <label className="text-[10px] text-cyber-pink font-bold uppercase block mb-2">TAIL (Sentiment)</label>
                        <input 
                            type="range" min="0" max="100" 
                            value={config.tailWeight}
                            onChange={(e) => setConfig('tailWeight', parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyber-pink"
                        />
                        <div className="text-right text-xs text-white font-mono mt-1">{config.tailWeight}%</div>
                    </ControlGroup>
                 </div>
            </div>
        </section>

        {/* SECTION 5: RISK & SIZING */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">
                <Layers size={14} /> Risk & Sizing Rules
            </div>
            <div className="grid grid-cols-2 gap-4">
                <ControlGroup field="maxOpenPositions">
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Max Positions</label>
                    <input 
                        type="number" min="1" max="20"
                        value={config.maxOpenPositions}
                        onChange={(e) => setConfig('maxOpenPositions', parseInt(e.target.value))}
                        className="w-full bg-black border border-gray-700 p-2 text-white font-mono text-sm focus:border-neon-blue focus:outline-none"
                    />
                </ControlGroup>
                <ControlGroup field="maxCorrelatedLongExposurePct">
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Max Corr Exposure</label>
                    <div className="relative">
                        <input 
                            type="number" min="1" max="100"
                            value={config.maxCorrelatedLongExposurePct}
                            onChange={(e) => setConfig('maxCorrelatedLongExposurePct', parseFloat(e.target.value))}
                            className="w-full bg-black border border-gray-700 p-2 text-white font-mono text-sm focus:border-neon-blue focus:outline-none"
                        />
                        <span className="absolute right-2 top-2.5 text-gray-500 text-xs">%</span>
                    </div>
                </ControlGroup>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-900">
                <label className="text-[10px] text-gray-500 font-bold uppercase block">High Volatility Guard</label>
                <div className="flex gap-4 items-center">
                   <div className="flex-1">
                      <ControlGroup field="highVolAtrPctThreshold">
                          <div className="text-[9px] text-gray-600 mb-1">ATR Threshold</div>
                          <input 
                                type="number" step="0.5"
                                value={config.highVolAtrPctThreshold}
                                onChange={(e) => setConfig('highVolAtrPctThreshold', parseFloat(e.target.value))}
                                className="w-full bg-black border border-gray-700 p-1.5 text-white font-mono text-xs focus:border-neon-blue focus:outline-none"
                          />
                      </ControlGroup>
                   </div>
                   <div className="flex-1">
                       <ControlGroup field="highVolSizeMultiplier">
                           <div className="text-[9px] text-gray-600 mb-1">Size Multiplier</div>
                           <input 
                                type="range" min="0.1" max="1.0" step="0.1"
                                value={config.highVolSizeMultiplier}
                                onChange={(e) => setConfig('highVolSizeMultiplier', parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="text-right text-[10px] text-orange-500">{config.highVolSizeMultiplier}x</div>
                       </ControlGroup>
                   </div>
                </div>
            </div>
        </section>

        {/* SECTION 6: SCENARIO ROUTING */}
        <section className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">
                <MessageSquare size={14} /> Scenario Routing
            </div>
            
            {/* QUICK CMDS */}
            <div>
               <div className="text-[9px] text-neon-blue font-bold uppercase mb-2">Quick Commands</div>
               <div className="space-y-2">
                  {Object.entries(config.scenarios.quick).map(([key, val]) => {
                      const detail = val as ScenarioDetail;
                      return (
                      <ControlGroup key={key} field={`scenario_quick_${key}`}>
                          <div className="flex items-center justify-between p-2 border border-gray-800 bg-gray-900/30 rounded">
                              <span className="text-[10px] font-mono text-gray-300">/{key}</span>
                              <div className="flex gap-4">
                                  <RetroToggle 
                                    checked={detail.enabled} 
                                    onChange={(c) => setScenarioConfig('quick', key, 'enabled', c)}
                                    label="Active"
                                  />
                                  <RetroToggle 
                                    checked={detail.canEmitAction} 
                                    onChange={(c) => setScenarioConfig('quick', key, 'canEmitAction', c)}
                                    label="Trade"
                                    disabled={!detail.enabled}
                                  />
                              </div>
                          </div>
                      </ControlGroup>
                  )})}
               </div>
            </div>

            {/* DIALOGS */}
            <div>
               <div className="text-[9px] text-purple-400 font-bold uppercase mb-2">Dialog Flows</div>
               <div className="space-y-2">
                  {Object.entries(config.scenarios.dialog).map(([key, val]) => {
                      const detail = val as ScenarioDetail;
                      return (
                      <ControlGroup key={key} field={`scenario_dialog_${key}`}>
                          <div className="flex items-center justify-between p-2 border border-gray-800 bg-gray-900/30 rounded">
                              <span className="text-[10px] font-mono text-gray-300">/{key}</span>
                              <div className="flex gap-4">
                                  <RetroToggle 
                                    checked={detail.enabled} 
                                    onChange={(c) => setScenarioConfig('dialog', key, 'enabled', c)}
                                    label="Active"
                                  />
                                  <RetroToggle 
                                    checked={detail.canEmitAction} 
                                    onChange={(c) => setScenarioConfig('dialog', key, 'canEmitAction', c)}
                                    label="Trade"
                                    disabled={!detail.enabled}
                                  />
                              </div>
                          </div>
                      </ControlGroup>
                  )})}
               </div>
            </div>
        </section>

      </div>

      {/* FIXED FOOTER: PROMPT PREVIEW */}
      <div className="p-4 bg-retro-black border-t border-gray-800 shrink-0 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <section className="bg-black border border-gray-800 rounded p-2 relative group flex flex-col h-96">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-gray-900/80 rounded backdrop-blur">
                <button 
                    onClick={() => navigator.clipboard.writeText(fullPromptText)}
                    className="p-1.5 text-gray-400 hover:text-white"
                >
                    <Copy size={12} />
                </button>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-matrix-green font-mono mb-2 shrink-0">
                <Terminal size={12} /> COMPILED SYSTEM PROMPT
            </div>
            
            {/* RICH TEXT RENDERER */}
            <div 
                ref={promptContainerRef}
                className="w-full flex-1 bg-transparent text-[10px] font-mono text-gray-400 overflow-y-auto whitespace-pre-wrap leading-relaxed custom-scrollbar p-1"
            >
                {promptSegments.map((seg) => (
                    <span 
                        key={seg.id}
                        id={seg.highlightKey ? `prompt-highlight-${seg.highlightKey}` : undefined}
                        className={clsx(
                            "transition-all duration-300",
                            hoveredField 
                                ? (seg.highlightKey === hoveredField 
                                    ? "bg-neon-blue/20 text-white shadow-[0_0_10px_rgba(0,242,255,0.3)] font-bold px-1 rounded" 
                                    : "opacity-30 blur-[0.5px]")
                                : (seg.highlightKey ? "text-gray-300" : "text-gray-500")
                        )}
                    >
                        {seg.text}
                    </span>
                ))}
            </div>
        </section>
      </div>

    </div>
  );
};

