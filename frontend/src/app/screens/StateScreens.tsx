import { AlertCircle, RefreshCw } from "lucide-react";
import { AppNavbar } from "@/app/components/AppNavbar";
import { Button } from "@/app/components/ui/button";
import { IllustrationBowl, IllustrationEmpty } from "@/app/components/ui/Illustrations";
import type { Screen } from "@/app/types";

export function LoadingState({ onNav }: { onNav: (s: Screen) => void }) {
  return (
    <div className="min-h-full flex flex-col bg-background">
      <AppNavbar variant="app" onNav={onNav} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-32 h-20 mb-6 opacity-70">
          <IllustrationBowl />
        </div>
        <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin mb-5" />
        <h3 className="font-black text-foreground font-display text-lg mb-2">Finding your perfect recipe...</h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          ChefMate is searching through thousands of recipes to find your ideal match.
        </p>
      </div>
    </div>
  );
}

export function NoResultState({
  onTryAgain,
  onPrefs,
  onNav,
}: {
  onTryAgain: () => void;
  onPrefs: () => void;
  onNav: (s: Screen) => void;
}) {
  return (
    <div className="min-h-full flex flex-col bg-background">
      <AppNavbar variant="app" onNav={onNav} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-28 h-28 mb-5">
          <IllustrationEmpty />
        </div>
        <h3 className="font-black text-foreground font-display text-xl mb-2">No recipes found</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
          We couldn&apos;t find an exact match. Try broadening your ingredients or adjusting preferences.
        </p>
        <div className="space-y-2 w-full max-w-xs">
          <Button size="md" onClick={onTryAgain} className="w-full">
            Try Different Ingredients
          </Button>
          <Button variant="outline" size="md" onClick={onPrefs} className="w-full">
            Change Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorState({
  onRetry,
  onNav,
}: {
  onRetry: () => void;
  onNav: (s: Screen) => void;
}) {
  return (
    <div className="min-h-full flex flex-col bg-background">
      <AppNavbar variant="app" onNav={onNav} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
          <AlertCircle size={28} className="text-destructive" />
        </div>
        <h3 className="font-black text-foreground font-display text-xl mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-xs leading-relaxed">
          ChefMate had trouble connecting to the recipe engine. Check your connection and try again.
        </p>
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 mb-6 w-full max-w-xs text-left">
          <p className="text-xs text-destructive font-mono">Error: Backend service unavailable (503)</p>
          <p className="text-xs text-destructive/60 font-mono mt-0.5">POST /api/v1/recommend — timeout after 10 s</p>
        </div>
        <Button onClick={onRetry} className="w-full max-w-xs">
          <RefreshCw size={15} /> Try Again
        </Button>
      </div>
    </div>
  );
}
