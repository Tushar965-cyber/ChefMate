"""
ChefMate - Dataset Importer & Converter
Downloads Cleaned_Indian_Food_Dataset.csv and converts it to ChefMate schema.
"""

import csv
import json
import os
import re
import urllib.request

DATASET_URL = (
    "https://huggingface.co/datasets/Anupam007/indian-recipe-dataset/resolve/main/Cleaned_Indian_Food_Dataset.csv"
)
CSV_PATH = os.path.join(os.path.dirname(__file__), "Cleaned_Indian_Food_Dataset.csv")
RECIPES_PATH = os.path.join(os.path.dirname(__file__), "recipes.json")


def download_dataset():
    if os.path.exists(CSV_PATH) and os.path.getsize(CSV_PATH) > 100000:
        print(f"[Notice] Dataset already downloaded at: {CSV_PATH}")
        return

    print(f"Downloading dataset from: {DATASET_URL} ...")
    req = urllib.request.Request(DATASET_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp, open(CSV_PATH, "wb") as out:
        chunk_size = 64 * 1024
        downloaded = 0
        while True:
            chunk = resp.read(chunk_size)
            if not chunk:
                break
            out.write(chunk)
            downloaded += len(chunk)
            if downloaded % (512 * 1024) == 0:
                print(f"  Downloaded: {downloaded // 1024} KB ...")

    print(f"Download complete: {os.path.getsize(CSV_PATH) // 1024} KB saved to {CSV_PATH}")


def infer_diet(name: str, ingredients_str: str) -> str:
    text = (name + " " + ingredients_str).lower()
    non_veg_keywords = ["chicken", "mutton", "egg", "fish", "prawn", "meat", "shrimp", "lamb", "pork", "beef", "keema"]
    for kw in non_veg_keywords:
        if re.search(rf"\b{kw}\b", text):
            return "non-vegetarian"

    dairy_keywords = ["ghee", "paneer", "milk", "curd", "butter", "cheese", "cream", "yogurt", "khoya", "malai"]
    for kw in dairy_keywords:
        if re.search(rf"\b{kw}\b", text):
            return "vegetarian"

    return "vegan"


def infer_meal_type(name: str) -> str:
    t = name.lower()
    if any(k in t for k in ["dosa", "idli", "paratha", "poha", "upma", "toast", "pancake", "chutney", "breakfast"]):
        return "breakfast"
    if any(k in t for k in ["halwa", "kheer", "sweet", "cake", "laddu", "ladoo", "barfi", "pudding", "payasam"]):
        return "dessert"
    if any(k in t for k in ["tikki", "pakora", "samosa", "chaat", "snack", "vada", "cutlet", "bonda", "fries"]):
        return "snack"
    if any(k in t for k in ["salad", "soup", "raita"]):
        return "lunch"
    return "dinner"


def clean_step(step_text: str) -> str:
    s = step_text.strip()
    s = re.sub(r"^\d+[\.\)]\s*", "", s)
    return s.strip()


def convert_and_merge(limit: int = 60):
    # Load existing recipes to preserve international diversity
    existing = []
    if os.path.exists(RECIPES_PATH):
        with open(RECIPES_PATH, "r", encoding="utf-8") as f:
            try:
                existing = json.load(f)
            except Exception:
                existing = []

    print(f"Preserving {len(existing)} existing baseline recipes.")

    imported = []
    seen_names = {r["name"].strip().lower() for r in existing}

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if len(imported) >= limit:
                break

            name = row.get("TranslatedRecipeName", "").strip()
            if not name or name.lower() in seen_names:
                continue

            raw_ings = row.get("Cleaned-Ingredients", "") or row.get("TranslatedIngredients", "")
            raw_instructions = row.get("TranslatedInstructions", "")
            raw_time = row.get("TotalTimeInMins", "30")

            if not raw_ings or not raw_instructions:
                continue

            # Parse ingredients
            ings_list = []
            for item in raw_ings.split(","):
                cleaned = item.strip().lower()
                cleaned = re.sub(r"[^\w\s-]", "", cleaned)
                if cleaned and len(cleaned) > 1:
                    ings_list.append({"name": cleaned})

            if len(ings_list) < 2:
                continue

            # Parse instructions into steps
            raw_steps = re.split(r"\.\s+|\n+", raw_instructions)
            steps = [clean_step(s) for s in raw_steps if len(clean_step(s)) > 15]

            if not steps:
                steps = [raw_instructions.strip()]

            # Total time handling
            try:
                total_time = int(float(raw_time))
                if total_time <= 0 or total_time > 240:
                    total_time = 30
            except ValueError:
                total_time = 30

            prep_time = min(15, max(5, total_time // 3))
            cook_time = max(total_time - prep_time, 5)

            cuisine = row.get("Cuisine", "Indian").strip().lower()
            if not cuisine or cuisine == "nan":
                cuisine = "indian"

            diet = infer_diet(name, raw_ings)
            meal_type = infer_meal_type(name)
            difficulty = "easy" if total_time <= 30 else ("medium" if total_time <= 60 else "hard")

            image_url = row.get("image-url", "").strip()
            if not image_url or image_url == "nan":
                image_url = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&h=440&fit=crop&auto=format"

            imported.append({
                "id": len(existing) + len(imported) + 1,
                "name": name,
                "description": f"A delightful {cuisine.capitalize()} style {name.lower()} with authentic flavors.",
                "image": image_url,
                "meal_type": meal_type,
                "cuisine": cuisine,
                "difficulty": difficulty,
                "prep_time": prep_time,
                "cook_time": cook_time,
                "diet_type": diet,
                "servings": 3,
                "ingredients": ings_list,
                "steps": steps,
            })
            seen_names.add(name.lower())

    all_recipes = existing + imported

    # Re-index IDs sequentially
    for idx, r in enumerate(all_recipes, 1):
        r["id"] = idx

    with open(RECIPES_PATH, "w", encoding="utf-8") as f:
        json.dump(all_recipes, f, indent=2)

    print(f"Successfully integrated {len(imported)} new recipes!")
    print(f"Total active recipes in database: {len(all_recipes)}")


if __name__ == "__main__":
    download_dataset()
    convert_and_merge(limit=60)
