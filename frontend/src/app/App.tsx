import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  RECIPES_DATABASE,
  cleanIngredients,
  findMatchingRecipes,
  type RecipeMatchResult,
} from "@/app/services/recipeEngine";
import {
  WelcomeScreen,
  ChatScreen,
  PreferencesScreen,
  RecipeResultScreen,
  RecipeDetailsScreen,
  SignInScreen,
  LoadingState,
  NoResultState,
  ErrorState,
  DesignSystemScreen,
} from "@/app/screens";
import { NAV_ITEMS, type Screen, type User, type FilterState } from "@/app/types";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [searchResults, setSearchResults] = useState<RecipeMatchResult[]>(() =>
    findMatchingRecipes([])
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const nav = (s: Screen) => setScreen(s);

  const handleChatSearch = (text: string, detectedIngredients?: string[]) => {
    const lower = text.toLowerCase();

    // Use detected ingredients from chat or extract keywords
    let ings: string[];
    if (detectedIngredients && detectedIngredients.length > 0) {
      ings = detectedIngredients;
    } else {
      const extracted = cleanIngredients(text);
      const ignore = new Set([
        "i", "have", "got", "recipe", "dinner", "lunch", "breakfast",
        "want", "quick", "something", "under", "minutes", "min", "make",
        "vegetarian", "vegan", "indian", "italian", "mexican", "chinese", "thai"
      ]);
      const filtered = extracted.filter((w) => !ignore.has(w));
      ings = filtered.length > 0 ? filtered : [];
    }

    // Handle Random Recipe / Surprise
    if (lower.includes("random") || lower.includes("surprise")) {
      const allMatches = findMatchingRecipes([]);
      const randomIdx = Math.floor(Math.random() * allMatches.length);
      setSearchResults(allMatches);
      setCurrentIndex(randomIdx);
      setScreen("recipe-result");
      return;
    }

    // Detect diet, cuisine, and time constraints in natural language
    const updatedFilters = { ...activeFilters };
    if (lower.includes("vegetarian") || lower.includes("veg ")) updatedFilters.dietary = "Vegetarian";
    if (lower.includes("vegan")) updatedFilters.dietary = "Vegan";
    if (lower.includes("non-veg") || lower.includes("chicken") || lower.includes("meat") || lower.includes("egg")) {
      updatedFilters.dietary = "Non-Veg";
    }
    if (lower.includes("under 15") || lower.includes("15 min")) updatedFilters.cookTime = "Under 15 min";
    else if (lower.includes("under 30") || lower.includes("30 min")) updatedFilters.cookTime = "Under 30 min";
    if (lower.includes("italian")) updatedFilters.cuisine = "Italian";
    if (lower.includes("indian")) updatedFilters.cuisine = "Indian";
    if (lower.includes("mexican")) updatedFilters.cuisine = "Mexican";
    if (lower.includes("chinese")) updatedFilters.cuisine = "Chinese";
    if (lower.includes("thai")) updatedFilters.cuisine = "Thai";

    // For pure ingredient queries, clear restrictive filters to maximize matching recipes
    if (detectedIngredients && detectedIngredients.length > 0) {
      updatedFilters.cuisine = undefined;
      updatedFilters.dietary = undefined;
      updatedFilters.mealType = undefined;
    }

    setActiveIngredients(ings);
    setActiveFilters(updatedFilters);

    let maxM: number | undefined = undefined;
    if (updatedFilters.cookTime?.includes("15")) maxM = 15;
    else if (updatedFilters.cookTime?.includes("30")) maxM = 30;
    else if (updatedFilters.cookTime?.includes("hour")) maxM = 60;

    const matches = findMatchingRecipes(ings, {
      mealType: updatedFilters.mealType,
      cuisine: updatedFilters.cuisine,
      dietary: updatedFilters.dietary,
      maxMinutes: maxM,
    });

    setSearchResults(matches);
    setCurrentIndex(0);
    setScreen(matches.length > 0 ? "recipe-result" : "no-result");
  };

  const handlePreferencesApply = (prefs: {
    mealType: string;
    dietary: string;
    cookTime: string;
    cuisine: string;
  }) => {
    setActiveFilters(prefs);
    let maxM: number | undefined = undefined;
    if (prefs.cookTime.includes("15")) maxM = 15;
    else if (prefs.cookTime.includes("30")) maxM = 30;
    else if (prefs.cookTime.includes("hour")) maxM = 60;

    const matches = findMatchingRecipes(activeIngredients, {
      mealType: prefs.mealType || undefined,
      cuisine: prefs.cuisine || undefined,
      dietary: prefs.dietary || undefined,
      maxMinutes: maxM,
    });

    setSearchResults(matches);
    setCurrentIndex(0);
    setScreen(matches.length > 0 ? "recipe-result" : "no-result");
  };

  const handleShowAnother = () => {
    if (searchResults.length <= 1) {
      nav("chat");
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % searchResults.length);
  };

  const currentMatch = searchResults[currentIndex] || searchResults[0];
  const activeRecipe = currentMatch?.recipe || RECIPES_DATABASE[0];

  return (
    <div className="h-screen flex flex-col bg-[#120b05]">
      {/* Demo screen switcher */}
      <div className="flex-shrink-0 bg-[#0d0804] border-b border-white/10 px-3 py-1.5 flex gap-1 overflow-x-auto scrollbar-hide">
        {NAV_ITEMS.map((n) => (
          <button
            key={n.id}
            onClick={() => setScreen(n.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              screen === n.id ? "bg-primary text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {n.label}
          </button>
        ))}
        {currentUser && (
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-emerald-400 font-semibold">
            <CheckCircle2 size={11} />
            {currentUser.name}
          </div>
        )}
      </div>

      {/* Active Screen */}
      <div className="flex-1 overflow-auto bg-background">
        {screen === "welcome" && <WelcomeScreen onStart={() => nav("chat")} onNav={nav} />}
        {screen === "signin" && (
          <SignInScreen
            onSuccess={(user) => {
              setCurrentUser(user);
              setScreen("chat");
            }}
            onNav={nav}
          />
        )}
        {screen === "chat" && (
          <ChatScreen
            onSearch={handleChatSearch}
            onPreferences={() => nav("preferences")}
            onNav={nav}
          />
        )}
        {screen === "preferences" && (
          <PreferencesScreen
            onBack={() => nav("chat")}
            onGenerateWithPrefs={handlePreferencesApply}
            onNav={nav}
          />
        )}
        {screen === "recipe-result" && (
          <RecipeResultScreen
            matchResult={currentMatch}
            onView={() => nav("recipe-details")}
            onAnother={handleShowAnother}
            onPrefs={() => nav("preferences")}
            onNav={nav}
          />
        )}
        {screen === "recipe-details" && (
          <RecipeDetailsScreen
            recipe={activeRecipe}
            matchingIngredients={currentMatch?.matchingIngredients}
            onBack={() => nav("recipe-result")}
            onFindAnother={() => nav("chat")}
            onNav={nav}
          />
        )}
        {screen === "loading" && <LoadingState onNav={nav} />}
        {screen === "no-result" && (
          <NoResultState
            onTryAgain={() => nav("chat")}
            onPrefs={() => nav("preferences")}
            onNav={nav}
          />
        )}
        {screen === "error" && <ErrorState onRetry={() => nav("chat")} onNav={nav} />}
        {screen === "design-system" && <DesignSystemScreen onNav={nav} />}
      </div>
    </div>
  );
}
