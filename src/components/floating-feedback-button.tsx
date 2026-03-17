import clsx from "clsx";

const FEEDBACK_URL = "https://forms.gle/CuMzubzZ6GiBEHNo8";

export function FloatingFeedbackButton() {
  const handleClick = () => {
    window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      className={clsx(
        "fixed z-50 flex items-center justify-center",
        "px-4 py-2 rounded-full",
        "bg-eva-darker border-2 border-eva-secondary/60",
        "shadow-lg shadow-eva-secondary/20",
        "hover:border-eva-secondary hover:shadow-eva-secondary/40",
        "transition-all duration-300 ease-out",
        "cursor-pointer",
        "bottom-6 left-4",
        "text-xs font-mono uppercase tracking-wider text-eva-secondary",
      )}
      onClick={handleClick}
    >
      Feedback
    </button>
  );
}
