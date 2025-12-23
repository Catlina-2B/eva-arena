import { EvaCard, EvaCardContent, EvaButton } from "@/components/ui";

interface CreateAgentCardProps {
  onCreate?: () => void;
}

export function CreateAgentCard({ onCreate }: CreateAgentCardProps) {
  return (
    <EvaCard className="text-center">
      <EvaCardContent className="py-8">
        {/* Robot Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-eva-primary flex items-center justify-center">
          <svg
            className="w-8 h-8 text-eva-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {/* Robot head */}
            <rect
              height="10"
              rx="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              width="12"
              x="6"
              y="8"
            />
            {/* Antenna */}
            <line
              strokeLinecap="round"
              strokeWidth={1.5}
              x1="12"
              x2="12"
              y1="8"
              y2="5"
            />
            <circle cx="12" cy="4" fill="currentColor" r="1" />
            {/* Eyes */}
            <circle cx="9.5" cy="12" fill="currentColor" r="1" />
            <circle cx="14.5" cy="12" fill="currentColor" r="1" />
            {/* Mouth */}
            <line
              strokeLinecap="round"
              strokeWidth={1.5}
              x1="9"
              x2="15"
              y1="15"
              y2="15"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold tracking-wider uppercase text-eva-text mb-3">
          Create Your Agent
        </h3>

        {/* Description */}
        <p className="text-sm text-eva-text-dim mb-6 max-w-xs mx-auto leading-relaxed">
          Your haven't created an Agent yet. Quickly create your Agent and let
          it join the game.
        </p>

        {/* CTA */}
        <EvaButton
          fullWidth
          className="tracking-wider uppercase"
          variant="primary"
          onClick={onCreate}
        >
          Create Agent
        </EvaButton>
      </EvaCardContent>
    </EvaCard>
  );
}
