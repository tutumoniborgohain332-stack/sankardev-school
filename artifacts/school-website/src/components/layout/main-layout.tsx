import { Header } from "./header";
import { Footer } from "./footer";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background font-sans">
      <Header />
      <main className="flex-1 w-full relative">
        {children}
      </main>
      <Footer />
    </div>
  );
}
