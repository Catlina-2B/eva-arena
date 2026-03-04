import type { BehaviorChangeSummary } from "@/types/api";

const ArrowIcon = () => (
  <svg fill="none" height="12" viewBox="0 0 12 12" width="12">
    <path
      d="M2 6h8M7 3l3 3-3 3"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
    />
  </svg>
);

const AlertIcon = () => (
  <svg fill="none" height="12" viewBox="0 0 12 12" width="12">
    <path
      d="M6 1L11 10H1L6 1Z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.2"
    />
    <path
      d="M6 5v2M6 8.5v.01"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.2"
    />
  </svg>
);

export function BehaviorChangeCard({
  summary,
}: {
  summary: BehaviorChangeSummary;
}) {
  return (
    <div className="bg-[#0d1117] border border-[rgba(108,225,130,0.15)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-2">
        <span className="text-[#6ce182] text-xs font-mono font-bold tracking-wider">
          BEHAVIOR CHANGES
        </span>
      </div>

      {/* Changes List */}
      <div className="divide-y divide-[rgba(255,255,255,0.03)]">
        {summary.changes.map((change, index) => (
          <div key={index} className="px-4 py-3 space-y-1.5">
            {/* Parameter name */}
            <div className="text-xs font-mono font-semibold text-white/90">
              {change.parameter}
            </div>

            {/* Before -> After */}
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-red-400/80 line-through">
                {change.before ?? "Not set"}
              </span>
              <ArrowIcon />
              <span className="text-[#6ce182]">{change.after}</span>
            </div>

            {/* Impact */}
            <p className="text-[11px] text-white/50 leading-relaxed">
              {change.impact}
            </p>
          </div>
        ))}
      </div>

      {/* Overall Impact */}
      <div className="px-4 py-2.5 bg-[#6ce182]/5 border-t border-[rgba(108,225,130,0.1)]">
        <p className="text-xs text-[#6ce182]/90 font-mono leading-relaxed">
          {summary.overallImpact}
        </p>
      </div>

      {/* Risk Note */}
      {summary.riskNote && (
        <div className="px-4 py-2.5 bg-yellow-500/5 border-t border-yellow-500/10 flex items-start gap-2">
          <span className="text-yellow-400 mt-0.5 shrink-0">
            <AlertIcon />
          </span>
          <p className="text-[11px] text-yellow-400/80 font-mono leading-relaxed">
            {summary.riskNote}
          </p>
        </div>
      )}
    </div>
  );
}
