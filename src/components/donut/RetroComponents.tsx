import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- COMPONENTS ---

interface RetroSliderProps {
  label: string;
  stops: string[];
  value: number;
  onChange: (value: number) => void;
  color?: string;
}

export const RetroSlider: React.FC<RetroSliderProps> = ({ label, stops, value, onChange, color = 'neon-blue' }) => {
  const stepPercentage = 100 / (stops.length - 1);
  const activeColorClass = color === 'neon-orange' ? 'bg-neon-orange shadow-neon-orange' : 'bg-neon-blue shadow-neon-blue';
  const textColorClass = color === 'neon-orange' ? 'text-neon-orange' : 'text-neon-blue';

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex justify-between items-baseline">
        <label className={cn("font-bold text-xs tracking-widest uppercase", textColorClass)}>{label}</label>
        <span className="text-white text-xs font-mono">{stops[value]}</span>
      </div>
      <div className="relative h-6 py-2 select-none group cursor-pointer">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full"></div>
        
        {/* Fill */}
        <div 
          className={cn("absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-l-full transition-all duration-300 shadow-[0_0_8px_currentColor]", activeColorClass)}
          style={{ width: `${value * stepPercentage}%` }}
        ></div>
        
        {/* Thumb */}
        <div 
            className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black border-2 transition-transform z-10 hover:scale-125", 
              color === 'neon-orange' ? 'border-neon-orange' : 'border-neon-blue'
            )}
             style={{ left: `calc(${value * stepPercentage}% - 8px)` }}
        ></div>
        
        {/* Clickable Zones */}
        <div className="absolute inset-0 flex z-0">
            {stops.map((_, i) => (
                <div key={i} onClick={() => onChange(i)} className="flex-1" />
            ))}
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between text-[9px] text-gray-500 font-mono uppercase">
          {stops.map((stop, i) => (
             <span key={stop} className={i === value ? "text-white" : ""}>{stop}</span>
          ))}
      </div>
    </div>
  );
};

interface RetroCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

export const RetroCard: React.FC<RetroCardProps> = ({ selected, onClick, title, icon, subtitle }) => (
  <div 
    onClick={onClick}
    className={cn(
      "relative p-3 border cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center h-24",
      selected 
        ? "bg-neon-blue/10 border-neon-blue shadow-[0_0_15px_rgba(0,242,255,0.2)]" 
        : "bg-black/40 border-gray-800 hover:border-gray-600 hover:bg-gray-900"
    )}
  >
    {selected && <div className="absolute top-0 right-0 w-2 h-2 bg-neon-blue shadow-[0_0_5px_#00f2ff]" />}
    <div className={cn("transition-colors", selected ? "text-neon-blue" : "text-gray-500")}>
      {icon}
    </div>
    <div>
        <div className={cn("text-[10px] font-bold tracking-wider", selected ? "text-white" : "text-gray-400")}>{title}</div>
        {subtitle && <div className="text-[9px] text-gray-600 mt-1">{subtitle}</div>}
    </div>
  </div>
);

interface RetroPillProps {
  selected: boolean;
  onClick: () => void;
  label: string;
}

export const RetroPill: React.FC<RetroPillProps> = ({ selected, onClick, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest border transition-all",
      selected
        ? "bg-neon-blue text-black border-neon-blue shadow-[0_0_10px_rgba(0,242,255,0.4)]"
        : "bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white"
    )}
  >
    {label}
  </button>
);

export const RetroButton: React.FC<{ children: React.ReactNode; onClick?: () => void; primary?: boolean; className?: string }> = ({ children, onClick, primary, className }) => (
  <button 
    onClick={onClick}
    className={cn(
      "px-6 py-3 font-mono font-bold tracking-widest text-xs transition-all active:translate-y-1 w-full flex items-center justify-center gap-2",
      primary 
        ? "bg-neon-blue text-black border-b-2 border-blue-800 hover:brightness-110 shadow-[0_0_15px_rgba(0,242,255,0.3)]" 
        : "bg-transparent text-neon-blue border border-neon-blue hover:bg-neon-blue/10",
      className
    )}
  >
    {children}
  </button>
);

interface RetroToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const RetroToggle: React.FC<RetroToggleProps> = ({ checked, onChange, label, disabled }) => (
  <div className={cn("flex items-center gap-2", disabled && "opacity-50 pointer-events-none")}>
    <div 
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "w-8 h-4 rounded-full border flex items-center p-0.5 cursor-pointer transition-colors relative",
        checked ? "bg-neon-blue/20 border-neon-blue" : "bg-black border-gray-700"
      )}
    >
      <div className={cn(
        "w-2.5 h-2.5 rounded-full shadow-sm transition-transform duration-200",
        checked ? "translate-x-4 bg-neon-blue shadow-[0_0_5px_#00f2ff]" : "translate-x-0 bg-gray-500"
      )} />
    </div>
    {label && <span className="text-[10px] text-gray-400 font-mono tracking-wide">{label}</span>}
  </div>
);

