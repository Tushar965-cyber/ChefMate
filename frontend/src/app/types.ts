// ─── Shared Types ─────────────────────────────────────────────────────────────

export type Screen =
  | "welcome"
  | "signin"
  | "chat"
  | "preferences"
  | "recipe-result"
  | "recipe-details"
  | "loading"
  | "no-result"
  | "error"
  | "design-system";

export interface User {
  name: string;
  email: string;
}

export interface FilterState {
  mealType?: string;
  cuisine?: string;
  dietary?: string;
  cookTime?: string;
}

export const NAV_ITEMS: { id: Screen; label: string }[] = [
  { id: "welcome", label: "Welcome" },
  { id: "signin", label: "Sign In" },
  { id: "chat", label: "Chat" },
  { id: "preferences", label: "Preferences" },
  { id: "recipe-result", label: "Recipe Result" },
  { id: "recipe-details", label: "Recipe Details" },
  { id: "loading", label: "Loading" },
  { id: "no-result", label: "No Result" },
  { id: "error", label: "Error" },
  { id: "design-system", label: "Design System" },
];

// Fallback mock recipe used when no real match is available
export const RECIPE_FALLBACK = {
  name: "Creamy Tuscan Garlic Pasta",
  description:
    "Rich penne tossed in a velvety garlic-parmesan cream sauce with sun-dried tomatoes and wilted spinach. Ready in 25 minutes.",
  image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700&h=440&fit=crop&auto=format",
  matchPercent: 94,
  time: "25 min",
  difficulty: "Easy",
  cuisine: "Italian",
  dietary: "Vegetarian",
  servings: 4,
  ingredients: [
    "300 g penne pasta",
    "3 cloves garlic, minced",
    "1 cup heavy cream",
    "½ cup sun-dried tomatoes, drained",
    "2 cups fresh baby spinach",
    "½ cup grated Parmesan",
    "2 tbsp extra-virgin olive oil",
    "Salt & cracked black pepper",
    "Fresh basil, to garnish",
  ],
  steps: [
    "Bring a large pot of well-salted water to the boil. Cook penne until al dente, about 10 minutes, then drain, reserving ½ cup pasta water.",
    "Warm olive oil in a wide skillet over medium heat. Add garlic and sauté 1–2 minutes until golden and fragrant — don't let it brown.",
    "Add sun-dried tomatoes and stir for 1 minute to release their flavour into the oil.",
    "Pour in heavy cream. Bring to a gentle simmer and let it reduce for 3–4 minutes until slightly thickened.",
    "Stir in Parmesan a handful at a time until the sauce is smooth and glossy. Season generously with salt and pepper.",
    "Add spinach and drained pasta; toss to coat. Loosen with reserved pasta water, a splash at a time, if too thick.",
    "Plate immediately and finish with torn basil leaves and extra Parmesan.",
  ],
};

export const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "bot" as const,
    text: "Hi! I'm ChefMate — your AI cooking companion. You can:\n• Tell me what ingredients you have (e.g. \"I have rice, tomato and onion\")\n• Ask for a cuisine (e.g. \"Indian vegetarian dinner\")\n• Or pick preferences using the button below!",
  },
];
