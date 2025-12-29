import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen bg-eva-dark">
      {/* Global cyber grid background - z-0 to stay behind content */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 cyber-grid-bg cyber-grid-anim" />
        <div className="cyber-grid-fade-mask" />
        <div className="cyber-scan-line-global" />
      </div>
      {/* Content wrapper - z-10 to stay above background effects */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-3 flex-grow pt-20 pb-8">
          {children}
        </main>
        <footer className="w-full border-t border-eva-border py-4">
          <div className="container mx-auto px-3">
            <div className="flex items-center justify-between text-xs text-eva-text-dim">
              <span>© 2024 EVA Arena. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <a className="hover:text-eva-text transition-colors" href="#">
                  Terms
                </a>
                <a className="hover:text-eva-text transition-colors" href="#">
                  Privacy
                </a>
                <a className="hover:text-eva-text transition-colors" href="#">
                  Docs
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
