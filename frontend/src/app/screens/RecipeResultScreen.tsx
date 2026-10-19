import { Star, Clock, BarChart3, Globe, Salad, Users, RefreshCw, ArrowRight } from "lucide-react";
import { UtensilsCrossed } from "lucide-react";
import { AppNavbar } from "@/app/components/AppNavbar";
import { BotMessage } from "@/app/components/ui/ChatBubbles";
import { Button, Badge } from "@/app/components/ui/button";
import { RecipeImage } from "@/app/components/RecipeImage";
import { RECIPE_FALLBACK } from "@/app/types";
import type { Screen } from "@/app/types";
import type { RecipeMatchResult } from "@/app/services/recipeEngine";

export function RecipeResultScreen({
  matchResult,
  onView,
  onAnother,
  onPrefs,
  onNav,
}: {
  matchResult?: RecipeMatchResult;
  onView: () => void;
  onAnother: () => void;
  onPrefs: () => void;
  onNav: (s: Screen) => void;
}) {
  const r = matchResult ? matchResult.recipe : RECIPE_FALLBACK as any;
  const matchPct = matchResult ? matchResult.matchPercentage : RECIPE_FALLBACK.matchPercent;
  const totalTime = matchResult ? `${r.prep_time + r.cook_time} min` : RECIPE_FALLBACK.time;
  const servings = matchResult ? `${r.servings || 2} people` : `${RECIPE_FALLBACK.servings} people`;
  const image = r.image || RECIPE_FALLBACK.image;

  return (
    <div className="min-h-full flex flex-col bg-background">
      <AppNavbar variant="app" onNav={onNav} />
      <main className="flex-1 px-3 sm:px-6 py-4 sm:py-6 overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-4">
          <BotMessage text="Found a great match for you! Here's a recipe based on your ingredients and preferences:" />

          <div className="bg-card rounded-2xl shadow-md overflow-hidden border border-border">
            <div className="relative">
              <RecipeImage
                key={r.id || r.name}
                src={image}
                alt={r.name}
                cuisine={r.cuisine}
                className="w-full h-52 sm:h-64 object-cover bg-muted"
              />
              <div className="absolute top-3 right-3 bg-primary text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow">
                <Star size={11} fill="currentColor" /> {matchPct}% match
              </div>
            </div>
            <div className="p-5">
              <h2 className="text-xl font-black text-foreground font-display mb-1.5">{r.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{r.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { icon: <Clock size={14} />, label: "Time", value: totalTime },
                  { icon: <BarChart3 size={14} />, label: "Difficulty", value: r.difficulty },
                  { icon: <Globe size={14} />, label: "Cuisine", value: r.cuisine ? r.cuisine.charAt(0).toUpperCase() + r.cuisine.slice(1) : "Various" },
                  { icon: <Salad size={14} />, label: "Dietary", value: r.diet_type ? r.diet_type.charAt(0).toUpperCase() + r.diet_type.slice(1) : "Any" },
                  { icon: <Users size={14} />, label: "Servings", value: servings },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center text-accent">{m.icon}</div>
                    <div>
                      <p className="text-xs text-muted-foreground leading-none">{m.label}</p>
                      <p className="font-bold text-foreground text-sm">{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge label={r.diet_type || "Vegetarian"} color="green" />
                <Badge label={r.difficulty || "Easy"} color="orange" />
                <Badge label={r.cuisine || "Italian"} color="yellow" />
                <Badge label="100% Offline" color="sky" />
              </div>
            </div>
          </div>

          <div className="space-y-2 pb-4">
            <Button size="lg" onClick={onView} className="w-full">
              View Full Recipe <ArrowRight size={17} />
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onAnother} className="flex-1">
                <RefreshCw size={13} /> Show Another
              </Button>
              <Button variant="ghost" size="sm" onClick={onPrefs} className="flex-1">
                <UtensilsCrossed size={13} /> Change Prefs
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
