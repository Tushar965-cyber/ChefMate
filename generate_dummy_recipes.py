# generate_dummy_recipes.py
"""Utility script to bulk‑add dummy Indian recipes to `data/recipes.json`.
It ensures the project has at least 500 recipes (including the existing ones).
Each generated recipe gets a unique ID, a simple name, a short description,
ingredients, steps and a distinct Unsplash image URL.
"""
import json
import os
import random

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
RECIPES_PATH = os.path.join(PROJECT_ROOT, "data", "recipes.json")

# Load existing recipes
with open(RECIPES_PATH, "r", encoding="utf-8") as f:
    recipes = json.load(f)

existing_ids = {r["id"] for r in recipes}
next_id = max(existing_ids) + 1 if existing_ids else 1

TARGET_COUNT = 500

# Simple pools for random generation
names = [
    "Paneer Tikka", "Dal Makhani", "Palak Paneer", "Bhindi Masala",
    "Raita", "Gajar ka Halwa", "Masoor Dal", "Rajma", "Pav Bhaji",
    "Poha", "Idli", "Dhokla", "Biryani", "Kheer", "Gulab Jamun"
]
ingredients_pool = [
    ("paneer", "200 g"), ("tomato", "2"), ("onion", "1"), ("garlic", "3 cloves"),
    ("ginger", "1 tsp"), ("cumin seeds", "1 tsp"), ("turmeric", "1/2 tsp"),
    ("chili powder", "1 tsp"), ("garam masala", "1 tsp"), ("oil", "2 tbsp"),
    ("butter", "1 tbsp"), ("cream", "1/2 cup"), ("potato", "2 medium"),
    ("cauliflower", "1 small head"), ("peas", "1/2 cup"), ("carrot", "1"),
    ("spinach", "2 cups"), ("milk", "1 cup"), ("sugar", "2 tbsp")
]
steps_template = [
    "Heat oil in a pan and add {spice}.",
    "Add {main_ingredient} and sauté for a few minutes.",
    "Stir in tomatoes and cook until soft.",
    "Add remaining spices and simmer until the sauce thickens.",
    "Finish with garnish and serve hot."
]

while len(recipes) < TARGET_COUNT:
    name = random.choice(names) + f" {next_id}"  # make name unique
    recipe = {
        "id": next_id,
        "name": name,
        "description": f"A tasty Indian {name.lower()} recipe.",
        "meal_type": random.choice(["breakfast", "lunch", "dinner", "snack", "drink"]),
        "cuisine": "indian",
        "difficulty": random.choice(["easy", "medium", "hard"]),
        "prep_time": random.randint(5, 20),
        "cook_time": random.randint(10, 40),
        "diet_type": random.choice(["vegetarian", "vegan", "non-vegetarian"]),
        "ingredients": [
            {"name": ing, "quantity": qty}
            for ing, qty in random.sample(ingredients_pool, k=5)
        ],
        "steps": [
            step.format(
                spice=random.choice(["cumin seeds", "mustard seeds", "asafoetida"]),
                main_ingredient=random.choice(["paneer", "potato", "cauliflower", "chickpeas"])
            )
            for step in steps_template
        ],
        # Use Unsplash random image (duplicate query doesn’t matter for placeholders)
        "image": f"https://source.unsplash.com/featured/700x440?indian-food,{next_id}"
    }
    recipes.append(recipe)
    next_id += 1

# Write back the expanded list
with open(RECIPES_PATH, "w", encoding="utf-8") as f:
    json.dump(recipes, f, ensure_ascii=False, indent=2)

print(f"Added recipes up to {len(recipes)} total entries.")
