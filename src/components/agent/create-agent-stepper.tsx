import { type ReactNode } from "react";

const STEPS = ["Name & Avatar", "Betting Strategy", "Trading Strategy"];

interface StepperProps {
  currentStep: number;
  children: ReactNode;
  onBack: () => void;
}

function StepIndicator({
  step,
  currentStep,
}: {
  step: number;
  currentStep: number;
}) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          isActive
            ? "bg-[#6ce182] text-black"
            : isCompleted
              ? "bg-[#6ce182]/20 text-[#6ce182]"
              : "bg-[#1f2937] text-[#6b7280]"
        }`}
      >
        {isCompleted ? (
          <svg fill="none" height="12" viewBox="0 0 12 12" width="12">
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        ) : (
          step
        )}
      </div>
      <span
        className={`text-xs font-medium uppercase tracking-wider transition-colors ${
          isActive
            ? "text-white"
            : isCompleted
              ? "text-[#6ce182]"
              : "text-[#6b7280]"
        }`}
      >
        {STEPS[step - 1]}
      </span>
    </div>
  );
}

function StepConnector({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div
      className={`h-px w-8 transition-colors ${
        isCompleted ? "bg-[#6ce182]/40" : "bg-[#1f2937]"
      }`}
    />
  );
}

export function CreateAgentStepper({
  currentStep,
  children,
  onBack,
}: StepperProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <StepIndicator currentStep={currentStep} step={1} />
        <StepConnector isCompleted={currentStep > 1} />
        <StepIndicator currentStep={currentStep} step={2} />
        <StepConnector isCompleted={currentStep > 2} />
        <StepIndicator currentStep={currentStep} step={3} />
      </div>

      {/* Step Content */}
      {children}
    </div>
  );
}
