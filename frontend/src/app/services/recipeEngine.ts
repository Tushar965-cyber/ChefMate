/**
 * ChefMate Client-Side Recipe Engine
 * 100% Local, zero-API recipe matching and filtering.
 */

export interface RecipeIngredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  image?: string;
  meal_type: string;
  cuisine: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  diet_type: string;
  servings?: number;
  ingredients: RecipeIngredient[];
  steps: string[];
}

export interface RecipeMatchResult {
  recipe: Recipe;
  matchPercentage: number;
  matchingIngredients: string[];
  missingIngredients: string[];
}

import recipesData from "../../../../data/recipes.json";

export const RECIPES_DATABASE: Recipe[] = recipesData as unknown as Recipe[];


function normalizeToken(token: string): string {
  let t = token.trim().toLowerCase().replace(/[^\w\s-]/g, "");
  if (t.endsWith("potatoes")) return t.slice(0, -2);
  if (t.endsWith("tomatoes")) return t.slice(0, -2);
  if (t.endsWith("ies") && t.length > 4) return t.slice(0, -3) + "y";
  if (t.endsWith("ves") && t.length > 4) return t.slice(0, -3) + "f";
  if (t.endsWith("es") && t.length > 3 && !t.endsWith("cheese") && !t.endsWith("sauce") && !t.endsWith("rice")) {
    return t.slice(0, -2);
  }
  if (t.endsWith("s") && t.length > 2 && !t.endsWith("ss") && !t.endsWith("peas") && !t.endsWith("beans")) {
    return t.slice(0, -1);
  }
  return t;
}

export function cleanIngredients(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];
  const parts = rawText.includes(",")
    ? rawText.split(",")
    : rawText.toLowerCase().includes(" and ")
    ? rawText.split(/\band\b/i)
    : rawText.split(/\s+/);

  const cleaned: string[] = [];
  const seen = new Set<string>();

  for (const p of parts) {
    const norm = normalizeToken(p);
    if (norm && !seen.has(norm) && norm.length > 1) {
      cleaned.push(norm);
      seen.add(norm);
    }
  }
  return cleaned;
}

function matchesCuisine(recipeCuisine: string, targetCuisine: string): boolean {
  const rc = (recipeCuisine || "").toLowerCase().replace(/\s*recipes?\s*$/i, "").replace(/\ufeff/g, "").trim();
  const tc = targetCuisine.toLowerCase().trim();
  if (!tc || tc === "any") return true;
  if (!rc) return true;
  if (rc === tc || rc.includes(tc) || tc.includes(rc)) return true;

  if (tc === "indian") {
    const indianRegions = [
      "south indian", "north indian", "punjabi", "bengali", "gujarati",
      "maharashtrian", "tamil", "chettinad", "andhra", "kerala",
      "sindhi", "rajasthani", "coorg", "udupi", "kashmiri", "mughlai",
      "hyderabadi", "goan", "awadhi", "konkan", "mangalorean", "indian"
    ];
    return indianRegions.some((reg) => rc.includes(reg) || reg.includes(rc));
  }
  if (tc === "italian") return rc.includes("italian");
  if (tc === "mexican") return rc.includes("mexican");
  if (tc === "chinese") return rc.includes("chinese") || rc.includes("asian");
  if (tc === "thai") return rc.includes("thai") || rc.includes("asian");
  if (tc === "american") return rc.includes("american") || rc.includes("continental");
  if (tc === "mediterranean") return rc.includes("mediterranean") || rc.includes("greek");

  return false;
}

function matchesMealType(recipeMeal: string, targetMeal: string): boolean {
  const rm = (recipeMeal || "").toLowerCase().trim();
  const tm = targetMeal.toLowerCase().trim();
  if (!tm || tm === "any") return true;
  if (!rm) return true;
  if (rm.includes(tm) || tm.includes(rm)) return true;
  if ((tm === "lunch" || tm === "dinner") && (rm === "lunch" || rm === "dinner")) return true;
  return false;
}

function matchesDiet(recipeDiet: string, targetDiet: string): boolean {
  const rd = (recipeDiet || "").toLowerCase().trim();
  const td = targetDiet.toLowerCase().trim();
  if (!td || td === "any") return true;
  if (!rd) return true;
  if (td === "vegetarian" || td === "veg") return rd === "vegetarian" || rd === "vegan";
  if (td === "vegan") return rd === "vegan";
  if (td.includes("non")) return rd.includes("non");
  return true;
}

export function findMatchingRecipes(
  userIngredients: string[],
  filters?: {
    mealType?: string;
    cuisine?: string;
    dietary?: string;
    maxMinutes?: number;
  }
): RecipeMatchResult[] {
  const normUser = userIngredients.map(normalizeToken).filter(Boolean);

  // Helper to filter pool given constraints
  const filterPool = (
    checkMeal: boolean,
    checkCuisine: boolean,
    checkDiet: boolean,
    checkTime: boolean
  ) => {
    return RECIPES_DATABASE.filter((r) => {
      if (checkMeal && filters?.mealType && filters.mealType !== "" && !matchesMealType(r.meal_type, filters.mealType)) {
        return false;
      }
      if (checkCuisine && filters?.cuisine && filters.cuisine !== "" && !matchesCuisine(r.cuisine, filters.cuisine)) {
        return false;
      }
      if (checkDiet && filters?.dietary && filters.dietary !== "" && !matchesDiet(r.diet_type, filters.dietary)) {
        return false;
      }
      if (checkTime && filters?.maxMinutes && filters.maxMinutes > 0) {
        if (r.prep_time + r.cook_time > filters.maxMinutes) return false;
      }
      return true;
    });
  };

  // Progressive relaxation:
  // 1. Full strict filters
  let pool = filterPool(true, true, true, true);

  // 2. If empty, relax time limit (time is the most common reason for 0 matches)
  if (pool.length === 0 && filters?.maxMinutes) {
    pool = filterPool(true, true, true, false);
  }

  // 3. If still empty, relax meal type (main courses are versatile)
  if (pool.length === 0 && filters?.mealType) {
    pool = filterPool(false, true, true, false);
  }

  // 4. If still empty, relax cuisine, preserve diet
  if (pool.length === 0 && filters?.cuisine) {
    pool = filterPool(false, false, true, false);
  }

  // 5. If still empty, fallback to all recipes
  if (pool.length === 0) {
    pool = [...RECIPES_DATABASE];
  }

  const results: RecipeMatchResult[] = [];

  for (const recipe of pool) {
    const matching: string[] = [];
    const missing: string[] = [];

    for (const item of recipe.ingredients) {
      const ingNameNorm = normalizeToken(item.name);
      const isMatched = normUser.some(
        (u) => ingNameNorm.includes(u) || u.includes(ingNameNorm)
      );
      if (isMatched) {
        matching.push(item.name);
      } else {
        missing.push(item.name);
      }
    }

    const total = recipe.ingredients.length;
    const matchPct = total > 0 ? Math.round((matching.length / total) * 100) : 0;

    if (normUser.length === 0 || matching.length > 0) {
      results.push({
        recipe,
        matchPercentage: normUser.length === 0 ? 85 : matchPct,
        matchingIngredients: matching,
        missingIngredients: missing,
      });
    }
  }

  // If user specified ingredients but no recipes in pool matched those ingredients,
  // search the entire database for ingredient matches!
  if (normUser.length > 0 && results.length === 0) {
    for (const recipe of RECIPES_DATABASE) {
      const matching: string[] = [];
      const missing: string[] = [];
      for (const item of recipe.ingredients) {
        const ingNameNorm = normalizeToken(item.name);
        const isMatched = normUser.some(
          (u) => ingNameNorm.includes(u) || u.includes(ingNameNorm)
        );
        if (isMatched) matching.push(item.name);
        else missing.push(item.name);
      }
      if (matching.length > 0) {
        const total = recipe.ingredients.length;
        results.push({
          recipe,
          matchPercentage: Math.round((matching.length / total) * 100),
          matchingIngredients: matching,
          missingIngredients: missing,
        });
      }
    }
  }

  // If STILL empty (e.g. nonsense filters + nonsense ingredients), return top 10 from pool
  if (results.length === 0 && pool.length > 0) {
    for (const recipe of pool.slice(0, 10)) {
      results.push({
        recipe,
        matchPercentage: 50,
        matchingIngredients: [],
        missingIngredients: recipe.ingredients.map((i) => i.name),
      });
    }
  }

  // Sort by match percentage descending, then shortest time ascending
  results.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    const timeA = a.recipe.prep_time + a.recipe.cook_time;
    const timeB = b.recipe.prep_time + b.recipe.cook_time;
    return timeA - timeB;
  });

  return results;
}
