import { useState } from "react";
import { ArrowLeft, Bookmark, Search } from "lucide-react";
import { AppNavbar } from "@/app/components/AppNavbar";
import { Button, CheckboxItem } from "@/app/components/ui/button";
import { RecipeImage } from "@/app/components/RecipeImage";
import { RECIPE_FALLBACK } from "@/app/types";
import type { Screen } from "@/app/types";
import type { Recipe } from "@/app/services/recipeEngine";

export function RecipeDetailsScreen({
  recipe,
  onBack,
  onFindAnother,
  onNav,
}: {
  recipe?: Recipe;
  matchingIngredients?: string[];
  onBack: () => void;
  onFindAnother: () => void;
  onNav: (s: Screen) => void;
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState(false);
  const r = recipe || (RECIPE_FALLBACK as unknown as Recipe);

  const ingredientList = Array.isArray(r.ingredients)
    ? r.ingredients.map((ing) =>
        typeof ing === "string" ? ing : `${ing.quantity ? ing.quantity + " " : ""}${ing.name}`
      )
    : RECIPE_FALLBACK.ingredients;

  const stepsList = Array.isArray(r.steps) ? r.steps : RECIPE_FALLBACK.steps;
  const image = r.image || RECIPE_FALLBACK.image;

  return (
    <div className="min-h-full flex flex-col bg-background">
      <AppNavbar variant="app" onNav={onNav} />

      {/* Back bar */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-2.5 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <span className="text-muted-foreground">·</span>
        <p className="text-sm font-semibold text-foreground truncate font-display">{r.name}</p>
        <button
          onClick={() => setSaved((v) => !v)}
          className={`ml-auto transition-colors ${saved ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <RecipeImage
          src={image}
          alt={r.name}
          cuisine={r.cuisine}
          className="w-full h-44 sm:h-56 object-cover bg-muted"
        />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-6">
          {/* Ingredients */}
          <div>
            <h3 className="font-black text-foreground font-display mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-accent flex items-center justify-center text-white text-xs">🛒</span>
              Ingredients
            </h3>
            <div className="bg-card rounded-2xl p-4 space-y-3 border border-border shadow-sm">
              {ingredientList.map((ing, i) => (
                <CheckboxItem
                  key={i}
                  label={ing}
                  checked={!!checked[i]}
                  onChange={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                />
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="font-black text-foreground font-display mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center text-white text-xs">👨‍🍳</span>
              Cooking Instructions
            </h3>
            <div className="space-y-3">
              {stepsList.map((step, i) => (
                <div key={i} className="bg-card rounded-2xl p-4 border border-border shadow-sm flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="space-y-2 pb-4">
            <Button
              size="lg"
              variant={saved ? "secondary" : "primary"}
              onClick={() => setSaved((v) => !v)}
              className="w-full"
            >
              <Bookmark size={15} /> {saved ? "Saved!" : "Save Recipe"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onBack} className="flex-1">
                <ArrowLeft size={13} /> Back to Results
              </Button>
              <Button variant="ghost" size="sm" onClick={onFindAnother} className="flex-1">
                <Search size={13} /> Find Another
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
