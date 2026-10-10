"""
ChefMate - Core Recipe Matching and Filtering Logic
Implements Steps 6, 8, 9, 10, and 11 of the PRD.
"""

import json
import os
import re
from typing import List, Dict, Any, Optional


def load_recipes(filepath: str) -> List[Dict[str, Any]]:
    """
    Step 6: Safely loads recipe records from a JSON file.
    Displays helpful messages if the file is missing or contains invalid JSON.
    """
    if not os.path.exists(filepath):
        print(f"[Error] Recipe database file not found at: {filepath}")
        return []
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, list):
                print(f"[Error] Expected a list of recipes in {filepath}, got {type(data).__name__}")
                return []
            return data
    except json.JSONDecodeError as err:
        print(f"[Error] Failed to parse JSON in {filepath}: {err}")
        return []
    except Exception as err:
        print(f"[Error] Unexpected error while loading {filepath}: {err}")
        return []


def normalize_ingredient_token(token: str) -> str:
    """
    Normalizes an ingredient word:
    - Strips leading/trailing punctuation
    - Handles simple plurals (tomatoes -> tomato, onions -> onion, etc.)
    """
    t = token.strip().lower()
    t = re.sub(r"[^\w\s-]", "", t)

    # Common culinary plural forms
    if t.endswith("potatoes"):
        return t[:-2]  # potato
    if t.endswith("tomatoes"):
        return t[:-2]  # tomato
    if t.endswith("ies") and len(t) > 4:
        return t[:-3] + "y"
    if t.endswith("ves") and len(t) > 4:
        return t[:-3] + "f"
    if t.endswith("es") and len(t) > 3 and not t.endswith(("cheese", "sauce", "rice")):
        return t[:-2]
    if t.endswith("s") and len(t) > 2 and not t.endswith(("ss", "us", "is", "peas", "beans", "lentils")):
        return t[:-1]
    return t


def clean_ingredients(raw_text: str) -> List[str]:
    """
    Step 8: Cleans and normalizes user ingredient input:
    - Converts to lowercase
    - Splits at commas (and 'and' if no comma found)
    - Removes extra spaces and empty tokens
    - Applies normalization
    """
    if not raw_text or not raw_text.strip():
        return []

    # If user used commas, split by comma; otherwise split on 'and'
    if "," in raw_text:
        parts = raw_text.split(",")
    elif " and " in raw_text.lower():
        parts = re.split(r"\band\b", raw_text, flags=re.IGNORECASE)
    else:
        parts = raw_text.split()

    cleaned = []
    seen = set()
    for part in parts:
        token = normalize_ingredient_token(part)
        if token and token not in seen and len(token) > 1:
            cleaned.append(token)
            seen.add(token)

    return cleaned


def is_ingredient_match(user_ing: str, recipe_ing_name: str) -> bool:
    """
    Checks if a user ingredient matches a recipe ingredient name.
    Supports exact token matches and word boundary inclusion.
    """
    u = normalize_ingredient_token(user_ing)
    r = recipe_ing_name.lower()
    r_tokens = [normalize_ingredient_token(w) for w in re.findall(r"\w+", r)]

    if u in r_tokens:
        return True
    if u in r:
        return True
    return False


def calculate_match(user_ingredients: List[str], recipe: Dict[str, Any]) -> Dict[str, Any]:
    """
    Step 9: Compares user ingredients with recipe requirements.
    Formula:
        match_percentage = (matching_recipe_ingredients / total_recipe_ingredients) * 100
    """
    recipe_ingredients = recipe.get("ingredients", [])
    total_recipe_count = len(recipe_ingredients)

    if total_recipe_count == 0:
        return {
            "recipe": recipe,
            "matching_ingredients": [],
            "missing_ingredients": [],
            "matching_count": 0,
            "total_count": 0,
            "match_percentage": 0.0,
        }

    matching = []
    missing = []

    for item in recipe_ingredients:
        ing_name = item.get("name", "") if isinstance(item, dict) else str(item)
        matched = any(is_ingredient_match(u, ing_name) for u in user_ingredients)
        if matched:
            matching.append(ing_name)
        else:
            missing.append(ing_name)

    matching_count = len(matching)
    pct = round((matching_count / total_recipe_count) * 100.0, 1)

    return {
        "recipe": recipe,
        "matching_ingredients": matching,
        "missing_ingredients": missing,
        "matching_count": matching_count,
        "total_count": total_recipe_count,
        "match_percentage": pct,
    }


INDIAN_REGIONAL_CUISINES = {
    "south indian", "punjabi", "bengali", "chettinad", "andhra", "kashmiri",
    "gujarati", "mughlai", "rajasthani", "kerala", "tamil", "maharashtrian",
    "goan", "awadhi", "lucknowi", "sindhi", "assamese", "oriya", "hyderabadi",
    "north indian", "udupi", "konkan", "mangalorean", "coorg", "indian"
}


def matches_cuisine(recipe_cuisine: str, requested: str) -> bool:
    if not requested or not requested.strip():
        return True
    rc = (recipe_cuisine or "").lower().strip()
    req = requested.lower().strip()
    if not rc:
        return True
    if rc == req or req in rc or rc in req:
        return True
    if req == "indian":
        if any(reg in rc for reg in INDIAN_REGIONAL_CUISINES):
            return True
    return False


def matches_diet(recipe_diet: str, requested: str) -> bool:
    if not requested or not requested.strip():
        return True
    rd = (recipe_diet or "").lower().strip()
    req = requested.lower().strip()
    if not rd:
        return True
    if req in ("vegetarian", "veg"):
        return rd in ("vegetarian", "vegan", "veg")
    if req in ("vegan",):
        return rd == "vegan"
    if req in ("non-vegetarian", "non-veg", "non veg"):
        return rd in ("non-vegetarian", "non-veg", "non veg")
    return req in rd or rd in req


def apply_filters(
    recipes: List[Dict[str, Any]],
    meal_type: Optional[str] = None,
    cuisine: Optional[str] = None,
    diet_type: Optional[str] = None,
    max_time: Optional[int] = None,
    difficulty: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Step 10: Applies optional constraint filters.
    Total time = prep_time + cook_time.
    """
    filtered = []
    for r in recipes:
        # Meal type filter
        if meal_type and meal_type.strip():
            req_meal = meal_type.strip().lower()
            rec_meal = r.get("meal_type", "").lower()
            if req_meal not in rec_meal and rec_meal not in req_meal:
                continue

        # Cuisine filter
        if cuisine and cuisine.strip():
            if not matches_cuisine(r.get("cuisine", ""), cuisine):
                continue

        # Dietary filter
        if diet_type and diet_type.strip():
            if not matches_diet(r.get("diet_type", ""), diet_type):
                continue

        # Max cooking + prep time filter
        if max_time is not None and max_time > 0:
            total_time = int(r.get("prep_time", 0)) + int(r.get("cook_time", 0))
            if total_time > max_time:
                continue

        # Difficulty filter
        if difficulty and difficulty.strip():
            if r.get("difficulty", "").lower() != difficulty.strip().lower():
                continue

        filtered.append(r)

    return filtered


def find_matches(
    recipes: List[Dict[str, Any]],
    user_ingredients: List[str],
    filters: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Step 11: Main entry point for searching and ranking:
    1. Applies selected filters.
    2. Calculates score for each remaining recipe.
    3. If zero matches, relaxes constraints progressively so user is never stranded.
    4. Sorts from highest score to lowest.
    """
    filters = filters or {}
    active_recipes = apply_filters(
        recipes,
        meal_type=filters.get("meal_type"),
        cuisine=filters.get("cuisine"),
        diet_type=filters.get("diet_type"),
        max_time=filters.get("max_time"),
        difficulty=filters.get("difficulty"),
    )

    # Fallback relaxation 1: relax max_time constraint
    if not active_recipes and filters.get("max_time"):
        active_recipes = apply_filters(
            recipes,
            meal_type=filters.get("meal_type"),
            cuisine=filters.get("cuisine"),
            diet_type=filters.get("diet_type"),
            difficulty=filters.get("difficulty"),
        )

    # Fallback relaxation 2: relax meal_type
    if not active_recipes and filters.get("meal_type"):
        active_recipes = apply_filters(
            recipes,
            cuisine=filters.get("cuisine"),
            diet_type=filters.get("diet_type"),
            difficulty=filters.get("difficulty"),
        )

    # Fallback relaxation 3: keep only diet restriction
    if not active_recipes and filters.get("diet_type"):
        active_recipes = apply_filters(
            recipes,
            diet_type=filters.get("diet_type"),
        )

    # If still empty, use all recipes
    if not active_recipes:
        active_recipes = recipes

    results = []
    for r in active_recipes:
        match_info = calculate_match(user_ingredients, r)
        # Prune recipes with zero matches only if ingredients were explicitly provided
        if user_ingredients and match_info["matching_count"] == 0:
            continue
        results.append(match_info)

    # If no ingredients were provided (filter browsing) and results is empty, provide top recipes from filtered set
    if not results and active_recipes and not user_ingredients:
        for r in active_recipes[:10]:
            results.append({
                "recipe": r,
                "matching_ingredients": [],
                "missing_ingredients": [
                    item.get("name", "") if isinstance(item, dict) else str(item)
                    for item in r.get("ingredients", [])
                ],
                "matching_count": 0,
                "total_count": len(r.get("ingredients", [])),
                "match_percentage": 50.0,
            })

    # Sort descending by match percentage, then ascending by total preparation time
    results.sort(
        key=lambda x: (
            x["match_percentage"],
            - (int(x["recipe"].get("prep_time", 0)) + int(x["recipe"].get("cook_time", 0))),
        ),
        reverse=True,
    )

    return results
