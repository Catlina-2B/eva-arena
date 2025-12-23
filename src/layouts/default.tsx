import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen bg-eva-dark">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-20 pb-8">
        {children}
      </main>
      <footer className="w-full border-t border-eva-border py-4">
        <div className="container mx-auto max-w-7xl px-6">
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
  );
}
