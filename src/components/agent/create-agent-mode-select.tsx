export type CreateMode = "select" | "beginner" | "expert";

interface ModeSelectProps {
  onSelect: (mode: "beginner" | "expert") => void;
}

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M4 10H16M16 10L11 5M16 10L11 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function CreateAgentModeSelect({ onSelect }: ModeSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-[32px] font-display text-white tracking-wider">
          Create Agent
        </h1>
        <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
          Choose how you'd like to get started
        </p>
      </div>

      <div className="flex gap-6 w-full max-w-[720px]">
        {/* Beginner Card */}
        <button
          type="button"
          className="group flex-1 bg-[#0d0f17] border border-[#1f2937] p-8 text-left transition-all duration-200 hover:border-[#6ce182]/60 hover:bg-[#0d0f17]/80"
          onClick={() => onSelect("beginner")}
        >
          <h2 className="text-xl font-display text-white tracking-wide mb-4">
            Beginner
          </h2>
          <p className="text-sm text-[#9ca3af] leading-relaxed mb-6">
            Let EVA walk you through the arena rules and help you craft your
            first Agent, step by step.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6ce182] uppercase tracking-wider group-hover:gap-2.5 transition-all">
            Get Started <ArrowIcon />
          </span>
        </button>

        {/* Experienced Card */}
        <button
          type="button"
          className="group flex-1 bg-[#0d0f17] border border-[#1f2937] p-8 text-left transition-all duration-200 hover:border-[#6ce182]/60 hover:bg-[#0d0f17]/80"
          onClick={() => onSelect("expert")}
        >
          <h2 className="text-xl font-display text-white tracking-wide mb-4">
            Experienced Player
          </h2>
          <p className="text-sm text-[#9ca3af] leading-relaxed mb-6">
            You can define and customize your own Agent.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6ce182] uppercase tracking-wider group-hover:gap-2.5 transition-all">
            Jump In <ArrowIcon />
          </span>
        </button>
      </div>
    </div>
  );
}
