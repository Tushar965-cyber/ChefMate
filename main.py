"""
ChefMate - Command-Line Interface Entry Point
Implements PRD Steps 1, 12, 13, 14, 16:
- Welcome message & consistent menu layout
- Guided preference collection
- Conversational chat mode
- Robust error handling and safe exit
"""

import sys
import os

# Ensure recipe_generator directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from recipe_logic import (
    load_recipes,
    clean_ingredients,
    find_matches,
)
from chatbot import ChefMateBot

RECIPES_FILE = os.path.join(os.path.dirname(__file__), "recipes.json")


def print_banner():
    print("=" * 60)
    print("   🍳  CHEFMATE — AI-Powered Recipe Generator (CLI)  🥗   ")
    print("=" * 60)
    print("Welcome! Tell me what ingredients you have, and I will recommend")
    print("the best recipes you can prepare right now.\n")


def print_menu():
    print("\n--- MAIN MENU ---")
    print("1. Find Recipe by Ingredients (Guided)")
    print("2. Conversational Chatbot Mode")
    print("3. Browse All Available Recipes")
    print("4. Exit")
    print("-----------------")


def guided_recipe_search(recipes):
    print("\n[Step 1: Ingredients]")
    raw_ing = input("Enter available ingredients (comma-separated, e.g. 'rice, tomato, onion'): ").strip()
    ingredients = clean_ingredients(raw_ing)

    if not ingredients:
        print("[Notice] No ingredients entered. Showing general recommendations.")

    print("\n[Step 2: Optional Filters — Press Enter to skip any filter]")
    meal_type = input("Choose meal type (breakfast, lunch, dinner, snack) [or Enter for any]: ").strip().lower()
    cuisine = input("Choose cuisine (indian, italian, mexican, chinese, thai, american) [or Enter for any]: ").strip().lower()
    diet_type = input("Dietary preference (vegetarian, vegan, non-vegetarian) [or Enter for any]: ").strip().lower()
    time_str = input("Maximum total time in minutes (e.g. 30) [or Enter for any]: ").strip()

    max_time = None
    if time_str:
        try:
            max_time = int(time_str)
            if max_time <= 0:
                print("[Warning] Time must be positive. Skipping time filter.")
                max_time = None
        except ValueError:
            print("[Warning] Invalid time entered. Skipping time filter.")

    filters = {
        "meal_type": meal_type if meal_type else None,
        "cuisine": cuisine if cuisine else None,
        "diet_type": diet_type if diet_type else None,
        "max_time": max_time,
    }

    print("\n[Searching for matching recipes...]")
    results = find_matches(recipes, ingredients, filters)

    if not results:
        print("\n[No Matches Found]")
        print("We couldn't find any recipes matching all your ingredients and filters.")
        print("Tip: Try removing some filters or adding more staple ingredients (e.g. oil, garlic, onion).")
        return

    print(f"\nFound {len(results)} matching recipe(s):")
    print("-" * 55)
    for i, item in enumerate(results, 1):
        r = item["recipe"]
        total_time = int(r.get("prep_time", 0)) + int(r.get("cook_time", 0))
        matched = ", ".join(item["matching_ingredients"]) if item["matching_ingredients"] else "None"
        print(f"{i}. {r['name']} — {item['match_percentage']}% Match")
        print(f"   Time: {total_time} mins | Cuisine: {r.get('cuisine', '').capitalize()} | Difficulty: {r.get('difficulty', '').capitalize()}")
        print(f"   Matched: {matched}")
        print()

    # Recipe Detail Selection (PRD Step 12)
    while True:
        choice = input(f"Enter recipe number (1-{len(results)}) to view instructions, or 0 to return to menu: ").strip()
        if not choice:
            continue
        if choice == "0":
            break
        if choice.isdigit() and 1 <= int(choice) <= len(results):
            selected = results[int(choice) - 1]
            r = selected["recipe"]
            total_time = int(r.get("prep_time", 0)) + int(r.get("cook_time", 0))

            print("\n" + "=" * 55)
            print(f"  {r['name'].upper()}")
            print("=" * 55)
            print(f"Description: {r.get('description', '')}")
            print(f"Cuisine:     {r.get('cuisine', '').capitalize()} | Diet: {r.get('diet_type', '').capitalize()}")
            print(f"Total Time:  {total_time} mins (Prep: {r.get('prep_time', 0)}m, Cook: {r.get('cook_time', 0)}m)")
            print(f"Match Score: {selected['match_percentage']}%")
            print("\nIngredients Needed:")
            for ing in r.get("ingredients", []):
                name = ing.get("name", "")
                qty = ing.get("quantity", "")
                mark = "[x]" if name in selected["matching_ingredients"] else "[ ]"
                print(f"  {mark} {name.title()}: {qty}")

            print("\nCooking Instructions:")
            for idx, step in enumerate(r.get("steps", []), 1):
                print(f"  {idx}. {step}")
            print("=" * 55)
        else:
            print(f"[Notice] Please enter a valid number between 1 and {len(results)}, or 0.")


def interactive_chat_mode():
    print("\n--- Conversational Mode ---")
    print("Talk with ChefMate! Type your messages naturally.")
    print("Examples: 'I have rice, tomato, onion', 'quick dinner under 20 mins', 'reset', or 'exit'.\n")
    bot = ChefMateBot()
    print("ChefMate: Hi! What ingredients do you have in your kitchen today?")

    while True:
        try:
            user_input = input("\nYou: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit", "bye"):
                print("ChefMate: Goodbye! Enjoy your cooking! 🍳")
                break
            response = bot.process_message(user_input)
            print(response)
        except (KeyboardInterrupt, EOFError):
            print("\nExiting chat mode...")
            break


def browse_all_recipes(recipes):
    print(f"\n--- Total Recipes in Database: {len(recipes)} ---")
    for i, r in enumerate(recipes, 1):
        total_time = int(r.get("prep_time", 0)) + int(r.get("cook_time", 0))
        print(f"{i:2d}. {r['name']:<32} | {r.get('cuisine', '').capitalize():<12} | {r.get('diet_type', '').capitalize():<14} | {total_time} mins")


def main():
    if "--test-run" in sys.argv:
        print("[ChefMate Self-Check] Initializing database...")
        recipes = load_recipes(RECIPES_FILE)
        assert len(recipes) > 0, "No recipes loaded"
        print(f"[ChefMate Self-Check] Successfully loaded {len(recipes)} recipes.")
        bot = ChefMateBot()
        test_resp = bot.process_message("I have rice, tomato, onion")
        assert "Tomato Rice" in test_resp, f"Unexpected response: {test_resp}"
        print("[ChefMate Self-Check] Bot response test PASSED.")
        return 0

    recipes = load_recipes(RECIPES_FILE)
    if not recipes:
        print("[Fatal] Unable to run ChefMate without recipe database. Exiting.")
        sys.exit(1)

    print_banner()

    while True:
        try:
            print_menu()
            choice = input("Enter your choice (1-4): ").strip()
            if choice == "1":
                guided_recipe_search(recipes)
            elif choice == "2":
                interactive_chat_mode()
            elif choice == "3":
                browse_all_recipes(recipes)
            elif choice == "4":
                print("\nThank you for using ChefMate! Happy cooking! 👋\n")
                break
            else:
                print("[Invalid Choice] Please choose 1, 2, 3, or 4.")
        except (KeyboardInterrupt, EOFError):
            print("\nSession interrupted. Exiting ChefMate. Goodbye!")
            break


if __name__ == "__main__":
    main()
