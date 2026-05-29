import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed as standalone app
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  // Only show button when Chrome is ready to install natively
  // This fires automatically on real HTTPS domains - one click, done!
  if (isInstalled || !deferredPrompt) return null;

  const handleInstall = async () => {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30 font-medium animate-pulse"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Install App</span>
    </Button>
  );
}
