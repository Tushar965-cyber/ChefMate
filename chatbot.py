"""
ChefMate - Chatbot Conversation Engine
Implements Step 12, 13, and 14 of the PRD:
- Conversational dialogue management
- Intent classification and entity extraction
- State preservation across turns
- Clear user prompts and friendly responses
"""

import os
import re
from typing import Dict, Any, List, Optional
try:
    from .recipe_logic import load_recipes, clean_ingredients, find_matches
    from .train_model import predict_intent
except (ImportError, ValueError):
    from recipe_logic import load_recipes, clean_ingredients, find_matches
    from train_model import predict_intent

RECIPES_FILE = os.path.join(os.path.dirname(__file__), "recipes.json")


class ChefMateBot:
    """Manages the dialogue session and state for ChefMate."""

    def __init__(self, recipes_path: str = RECIPES_FILE):
        self.recipes = load_recipes(recipes_path)
        self.reset_session()

    def reset_session(self):
        """Resets the search context and filters."""
        self.user_ingredients: List[str] = []
        self.filters: Dict[str, Any] = {
            "meal_type": None,
            "cuisine": None,
            "diet_type": None,
            "max_time": None,
            "difficulty": None,
        }
        self.last_results: List[Dict[str, Any]] = []
        self.active_recipe: Optional[Dict[str, Any]] = None

    def extract_preferences_from_text(self, text: str):
        """Extracts meal type, cuisine, time, and diet from natural language."""
        t = text.lower()

        # Dietary
        if "vegan" in t:
            self.filters["diet_type"] = "vegan"
        elif "non-veg" in t or "non veg" in t or "chicken" in t or "meat" in t or "egg" in t:
            self.filters["diet_type"] = "non-vegetarian"
        elif "veg" in t or "vegetarian" in t:
            self.filters["diet_type"] = "vegetarian"

        # Meal type
        for mt in ["breakfast", "lunch", "dinner", "snack", "dessert"]:
            if mt in t:
                self.filters["meal_type"] = mt
                break

        # Cuisine
        for c in ["indian", "italian", "mexican", "chinese", "thai", "american", "mediterranean"]:
            if c in t:
                self.filters["cuisine"] = c
                break

        # Cooking time (e.g., "30 min", "under 15 minutes", "25m")
        time_match = re.search(r"\b(\d+)\s*(?:min|mins|minutes|m)\b", t)
        if time_match:
            try:
                self.filters["max_time"] = int(time_match.group(1))
            except ValueError:
                pass

    def run_search(self) -> List[Dict[str, Any]]:
        """Executes recipe matching with current ingredients and active filters."""
        self.last_results = find_matches(self.recipes, self.user_ingredients, self.filters)
        return self.last_results

    def process_message(self, user_text: str) -> str:
        """
        Handles an incoming user message and returns the chatbot's response.
        Uses intent prediction and rule extraction.
        """
        text = user_text.strip()
        if not text:
            return "ChefMate: I didn't catch that. Please type what ingredients you have, or choose an option."

        # Quick number selection if user has active results on screen
        if self.last_results and text.isdigit():
            idx = int(text)
            if idx == 0:
                self.reset_session()
                return "ChefMate: Search reset! Tell me what ingredients you have to start a new search."
            if 1 <= idx <= len(self.last_results):
                match_info = self.last_results[idx - 1]
                recipe = match_info["recipe"]
                self.active_recipe = recipe
                return self.format_recipe_detail(match_info)
            else:
                return f"ChefMate: Please enter a valid number between 1 and {len(self.last_results)} (or 0 to reset)."

        # Predict user intent
        intent = predict_intent(text)

        # Extract any embedded preferences
        self.extract_preferences_from_text(text)

        # Handle intents
        if intent == "greeting":
            return (
                "ChefMate: Hello! I'm your friendly kitchen companion.\n"
                "Tell me what ingredients you have at home (e.g. 'rice, tomato, onion'), "
                "or your preferred cuisine / meal type!"
            )

        elif intent == "restart":
            self.reset_session()
            return "ChefMate: All preferences cleared. What ingredients are in your kitchen today?"

        elif intent == "exit":
            return "ChefMate: Happy cooking! Hope to see you again soon. Goodbye! 👋"

        elif intent == "ask_recipe":
            # If ingredients exist or provided in text
            extracted_ings = clean_ingredients(text)
            ignore = {"have", "got", "kitchen", "today", "want", "cook", "recipe", "recommend", "dinner", "lunch", "breakfast", "what", "should", "make", "for", "can", "give", "suggest", "find", "food", "eat", "ideas"}
            cleaned = [i for i in extracted_ings if i not in ignore]
            if cleaned:
                self.user_ingredients = cleaned

            if not self.user_ingredients:
                # Provide top recommended recipes
                results = self.run_search()
                if results:
                    return f"ChefMate: Here are popular dishes you can make:\n\n" + self.format_search_results(results)
                return (
                    "ChefMate: What ingredients do you have on hand? "
                    "Tell me what you have (e.g., 'I have chicken and garlic') or pick your preferences!"
                )
            results = self.run_search()
            if not results:
                return f"ChefMate: I searched for recipes with {', '.join(self.user_ingredients)}, but couldn't find any. Try adding more ingredients!"
            return self.format_search_results(results)

        elif intent == "provide_ingredients" or "," in text:
            # Clean ingredients from conversational phrasing
            cleaned_text = re.sub(r"^(i\s+have|i\s+got|available\s+ingredients?|in\s+my\s+kitchen|using|my\s+ingredients\s+are|we\s+have)\s*[:\-]?\s*", "", text, flags=re.IGNORECASE)
            extracted_ings = clean_ingredients(cleaned_text)
            ignore = {"have", "got", "kitchen", "today", "want", "cook", "recipe", "recommend", "dinner", "lunch", "breakfast", "fridge", "home", "available", "ingredients", "using"}
            cleaned = [i for i in extracted_ings if i not in ignore]

            if cleaned:
                self.user_ingredients = cleaned

            if not self.user_ingredients:
                return (
                    "ChefMate: What ingredients do you have on hand? "
                    "Enter them separated by commas (e.g., 'rice, tomato, onion')."
                )

            # Perform search
            results = self.run_search()
            if not results:
                return (
                    f"ChefMate: I searched for recipes with {', '.join(self.user_ingredients)}, "
                    "but couldn't find any matching your criteria.\n"
                    "Try relaxing your filters (e.g. cooking time or cuisine) or adding more ingredients."
                )

            return self.format_search_results(results)

        elif intent in ("choose_diet", "choose_meal_type", "choose_cuisine", "choose_time"):
            if self.user_ingredients:
                results = self.run_search()
                if results:
                    return f"ChefMate: Updated your preferences! Here are the best matches:\n\n" + self.format_search_results(results)
                else:
                    return (
                        f"ChefMate: Preferences updated. No recipes matched all criteria with {', '.join(self.user_ingredients)}.\n"
                        "Try relaxing the filters or typing 'reset' to start over."
                    )
            else:
                return (
                    f"ChefMate: Got your preferences! Now, what ingredients do you have in your kitchen? "
                    "(e.g., 'eggs, cheese, bread')"
                )

        elif intent == "show_details":
            if self.last_results:
                return (
                    "ChefMate: Enter the recipe number (1, 2, 3...) to view complete preparation steps, "
                    "or 0 to start a new search."
                )
            else:
                return "ChefMate: Please first search for recipes by entering your available ingredients."

        # Default fallback
        extracted = clean_ingredients(text)
        if extracted:
            self.user_ingredients = extracted
            results = self.run_search()
            if results:
                return self.format_search_results(results)

        return (
            "ChefMate: You can tell me what ingredients you have (e.g. 'rice, tomato, onion'), "
            "ask for 'dinner recipes under 30 minutes', or type 'reset' to start over."
        )

    def format_search_results(self, results: List[Dict[str, Any]]) -> str:
        """Formats the list of ranked matches for terminal display (PRD Step 11)."""
        lines = [
            f"ChefMate: Found {len(results)} matching recipe(s) for you!\n",
            "Matching Recipes:",
            "--------------------------------------------------"
        ]
        for i, item in enumerate(results[:5], 1):
            r = item["recipe"]
            pct = item["match_percentage"]
            total_time = int(r.get("prep_time", 0)) + int(r.get("cook_time", 0))
            diff = r.get("difficulty", "easy").capitalize()
            cuisine = r.get("cuisine", "").capitalize()
            matched_str = ", ".join(item["matching_ingredients"][:4])
            lines.append(
                f"{i}. {r['name']} — {pct}% match\n"
                f"   Time: {total_time} mins | Difficulty: {diff} | Cuisine: {cuisine}\n"
                f"   Matched Ingredients: {matched_str}"
            )
        lines.append("--------------------------------------------------")
        lines.append("Enter a recipe number (1-5) to view cooking instructions, or 0 to start a new search:")
        return "\n".join(lines)

    def format_recipe_detail(self, match_info: Dict[str, Any]) -> str:
        """Formats the detailed view of a single recipe (PRD Step 12)."""
        r = match_info["recipe"]
        total_time = int(r.get("prep_time", 0)) + int(r.get("cook_time", 0))
        lines = [
            "\n" + "=" * 55,
            f"  {r['name'].upper()}",
            "=" * 55,
            f"Description:  {r.get('description', '')}",
            f"Cuisine:      {r.get('cuisine', '').capitalize()} | Diet: {r.get('diet_type', '').capitalize()}",
            f"Time:         {total_time} mins (Prep: {r.get('prep_time', 0)}m, Cook: {r.get('cook_time', 0)}m)",
            f"Difficulty:   {r.get('difficulty', '').capitalize()} | Match: {match_info.get('match_percentage', 100)}%",
            "\n[INGREDIENTS]:"
        ]

        for ing in r.get("ingredients", []):
            name = ing.get("name", "")
            qty = ing.get("quantity", "")
            status = "[x] HAVE" if name in match_info.get("matching_ingredients", []) else "[ ] NEED"
            lines.append(f"  {status:8} {name.title()}: {qty}")

        lines.append("\n[COOKING STEPS]:")
        for i, step in enumerate(r.get("steps", []), 1):
            lines.append(f"  {i}. {step}")

        lines.append("=" * 55)
        lines.append("Enter another recipe number, '0' to search again, or 'exit' to quit:")
        return "\n".join(lines)
