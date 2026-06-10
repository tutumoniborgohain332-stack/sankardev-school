"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card text-card-foreground p-8 rounded-2xl shadow-xl border border-border text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-4 font-serif">Something went wrong!</h2>
        <p className="text-muted-foreground mb-8">
          An unexpected error occurred while loading this page. Please try again or contact support if the issue persists.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.location.href = "/"} variant="outline">
            Go Home
          </Button>
          <Button onClick={() => reset()}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
