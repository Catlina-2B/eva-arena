import { create } from 'zustand';

export type TemplateType = 'MYSTERY_TREND' | 'WHALE_HUNTER' | 'YIELD_FARMER' | 'DEGEN_SCALPER';
export type ModelType = 'CLAUDE' | 'GPT-5' | 'GROK' | 'QWEN';
export type RoleType = 'CORE_TREND' | 'HEDGE' | 'HIGH_VOL' | 'CASH';

// New Types for Cerebrum
export type RiskProfile = 'very_conservative' | 'conservative' | 'balanced' | 'aggressive';
export type TimeHorizon = 'intraday' | 'swing' | 'position';
export type Objective = 'max_drawdown_minimized' | 'sharpe_maximized' | 'capital_preservation' | 'capture_large_trends';

export interface ScenarioDetail {
  enabled: boolean;
  canEmitAction: boolean;
}

export interface ScenarioConfig {
  quick: {
    token_info: ScenarioDetail;
    perps_trade: ScenarioDetail;
  };
  dialog: {
    portfolio_analysis: ScenarioDetail;
    risk_management: ScenarioDetail;
    trade_execution: ScenarioDetail;
  };
}

interface CloneConfig {
  // Legacy / High Level
  template: TemplateType;
  reasoningModel: ModelType;
  role: RoleType;
  
  // Module 1: Identity & Goals
  riskProfile: RiskProfile;
  timeHorizon: TimeHorizon;
  objectives: Objective[];
  maxRiskPerTradePct: number;
  maxDailyDrawdownPct: number;

  // Module 2: Cerberus Roles (Weights 0-100)
  structuralistWeight: number;
  quantWeight: number;
  strategistWeight: number;
  riskGovernorWeight: number;

  // Module 3: Market View (Weights 0-100)
  dogWeight: number;
  tailWeight: number;

  // Module 4: Risk & Position Sizing
  maxOpenPositions: number;
  maxCorrelatedLongExposurePct: number;
  highVolAtrPctThreshold: number;
  highVolSizeMultiplier: number;

  // Module 5: Scenarios
  scenarios: ScenarioConfig;

  // Legacy props
  leverage: number;
  momentumSensitivity: number;
  timeframe: number;
}

interface NodeDirectives {
  observer: string;
  memory: string;
  reasoning: string;
  opinion: string;
  evaluation: string;
  execution: string;
  [key: string]: string; // Allow dynamic keys for added nodes
}

interface SimulationState {
  balance: number;
  selectedAssets: string[];
  config: {
    volatility: number;
    winRateBias: number;
    durationDays: number;
  };
  results: {
    totalPnl: number;
    returnPct: number;
    sharpe: number;
    winRate: number;
    fees: number;
    trades: number;
    history: number[]; // Equity curve
  } | null;
}

// Expanded modal types for all nodes
export type ActiveModalType = 'NONE' | 'OBSERVER' | 'MEMORY' | 'REASONING' | 'OPINION' | 'EVALUATION' | 'EXECUTION' | 'SIMULATION';

interface CloneStore {
  // Config
  config: CloneConfig;
  setConfig: (key: keyof CloneConfig, value: any) => void;
  setScenarioConfig: (category: 'quick' | 'dialog', key: string, field: keyof ScenarioDetail, value: boolean) => void;
  toggleObjective: (objective: Objective) => void;
  
  // Node Specific Prompts
  nodeDirectives: NodeDirectives;
  setNodeDirective: (key: string, value: string) => void;

  // UI State
  activeModal: ActiveModalType;
  openModal: (modal: ActiveModalType) => void;
  
  // View Navigation
  activeView: 'DESIGNER' | 'LEADERBOARD' | 'TERMINAL';
  setActiveView: (view: 'DESIGNER' | 'LEADERBOARD' | 'TERMINAL') => void;
  
  // Panel States
  isConfigPanelOpen: boolean;
  toggleConfigPanel: () => void;
  
  isMarketplaceOpen: boolean;
  toggleMarketplace: () => void;
  
  // Simulation
  simulation: SimulationState;
  setSimulation: (key: keyof SimulationState, value: any) => void;
  setSimulationConfig: (key: string, value: number) => void;
  setSimulationResults: (results: SimulationState['results']) => void;
  toggleAsset: (asset: string) => void;
}

export const useCloneStore = create<CloneStore>((set) => ({
  // Default Config
  config: {
    template: 'MYSTERY_TREND',
    reasoningModel: 'CLAUDE',
    role: 'CORE_TREND',
    
    // Module 1
    riskProfile: 'balanced',
    timeHorizon: 'swing',
    objectives: ['sharpe_maximized', 'capital_preservation'],
    maxRiskPerTradePct: 1.0,
    maxDailyDrawdownPct: 2.5,
    
    // Module 2
    structuralistWeight: 60,
    quantWeight: 40,
    strategistWeight: 50,
    riskGovernorWeight: 90,
    
    // Module 3
    dogWeight: 70,
    tailWeight: 30,

    // Module 4
    maxOpenPositions: 3,
    maxCorrelatedLongExposurePct: 25,
    highVolAtrPctThreshold: 4.0,
    highVolSizeMultiplier: 0.5,

    // Module 5
    scenarios: {
      quick: {
        token_info: { enabled: true, canEmitAction: false },
        perps_trade: { enabled: true, canEmitAction: true }
      },
      dialog: {
        portfolio_analysis: { enabled: true, canEmitAction: false },
        risk_management: { enabled: true, canEmitAction: false },
        trade_execution: { enabled: true, canEmitAction: true }
      }
    },

    leverage: 5,
    momentumSensitivity: 1,
    timeframe: 1,
  },

  setConfig: (key, value) => set((state) => ({
    config: { ...state.config, [key]: value }
  })),

  setScenarioConfig: (category, key, field, value) => set((state) => ({
    config: {
      ...state.config,
      scenarios: {
        ...state.config.scenarios,
        [category]: {
          ...state.config.scenarios[category],
          [key]: {
            ...state.config.scenarios[category][key as any],
            [field]: value
          }
        }
      }
    }
  })),

  toggleObjective: (objective) => set((state) => {
    const current = state.config.objectives;
    const exists = current.includes(objective);
    let next: Objective[];
    if (exists) {
      next = current.filter(o => o !== objective);
    } else {
      next = [...current, objective];
    }
    return { config: { ...state.config, objectives: next } };
  }),

  // Default Node Directives
  nodeDirectives: {
    observer: "Monitor HL/Poly feeds. Filter for >$1M 24h vol.",
    memory: "Retrieve last 4h swing points and RAG context.",
    reasoning: "Identify 'Dog vs Tail' divergence pattern.",
    opinion: "Buffer signal: BULLISH if Funding < 0.",
    evaluation: "Check max drawdown < 1.5% NAV.",
    execution: "Execute TWAP over 30mins.",
  },
  setNodeDirective: (key, value) => set((state) => ({
    nodeDirectives: { ...state.nodeDirectives, [key]: value }
  })),

  // UI State
  activeModal: 'NONE',
  openModal: (modal) => set({ activeModal: modal }),
  
  activeView: 'DESIGNER',
  setActiveView: (view) => set({ activeView: view }),

  // Drawer State
  isConfigPanelOpen: true,
  toggleConfigPanel: () => set((state) => ({ isConfigPanelOpen: !state.isConfigPanelOpen, isMarketplaceOpen: false })),

  isMarketplaceOpen: false,
  toggleMarketplace: () => set((state) => ({ isMarketplaceOpen: !state.isMarketplaceOpen, isConfigPanelOpen: false })),

  // Simulation Defaults
  simulation: {
    balance: 10000,
    selectedAssets: ['BTC', 'ETH'],
    config: {
      volatility: 50,
      winRateBias: 55,
      durationDays: 30,
    },
    results: null
  },
  setSimulation: (key, value) => set((state) => ({
    simulation: { ...state.simulation, [key]: value }
  })),
  setSimulationConfig: (key, value) => set((state) => ({
    simulation: { 
      ...state.simulation, 
      config: { ...state.simulation.config, [key]: value } 
    }
  })),
  setSimulationResults: (results) => set((state) => ({
    simulation: { ...state.simulation, results }
  })),
  toggleAsset: (asset) => set((state) => {
    const current = state.simulation.selectedAssets;
    const next = current.includes(asset) 
      ? current.filter(a => a !== asset)
      : [...current, asset];
    return { simulation: { ...state.simulation, selectedAssets: next } };
  }),
}));

