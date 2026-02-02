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
        "w-12 h-12 rounded-full",
        "bg-eva-darker border-2 border-eva-secondary/60",
        "shadow-lg shadow-eva-secondary/20",
        "hover:border-eva-secondary hover:shadow-eva-secondary/40",
        "transition-all duration-300 ease-out",
        "cursor-pointer",
        "bottom-6 left-4"
      )}
      title="Feedback"
      onClick={handleClick}
    >
      {/* Feedback / Message icon */}
      <svg
        className="w-6 h-6 text-eva-secondary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
    </button>
  );
}
