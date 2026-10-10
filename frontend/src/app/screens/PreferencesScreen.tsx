import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppNavbar } from "@/app/components/AppNavbar";
import { BotMessage } from "@/app/components/ui/ChatBubbles";
import { PrefChip } from "@/app/components/ui/Chips";
import type { Screen } from "@/app/types";

export function PreferencesScreen({
  onBack,
  onGenerateWithPrefs,
  onNav,
}: {
  onBack: () => void;
  onGenerateWithPrefs: (prefs: { mealType: string; dietary: string; cookTime: string; cuisine: string }) => void;
  onNav: (s: Screen) => void;
}) {
  const [sel, setSel] = useState({
    mealType: "",
    dietary: "",
    cookTime: "",
    cuisine: "",
  });

  const groups: { label: string; key: keyof typeof sel; options: string[] }[] = [
    {
      label: "Meal Type (Optional)",
      key: "mealType",
      options: ["Breakfast 🍳", "Lunch 🍱", "Dinner 🍽️", "Snack 🍿", "Dessert 🍰"],
    },
    {
      label: "Food Preference",
      key: "dietary",
      options: ["Vegetarian 🌿", "Non-Veg 🍖"],
    },
    {
      label: "Cooking Time (Optional)",
      key: "cookTime",
      options: ["Under 15 min ⏱️", "Under 30 min ⏳", "Under 1 hour 🕐"],
    },
    {
      label: "Cuisine (Optional)",
      key: "cuisine",
      options: ["Indian 🍛", "Italian 🍕", "Mexican 🌮", "Chinese 🥢", "Thai 🍜"],
    },
  ];

  const stripEmoji = (label: string) => label.split(" ")[0];
  const isSelected = (key: keyof typeof sel, opt: string) => sel[key] === stripEmoji(opt);

  return (
    <div className="min-h-full flex flex-col bg-background">
      <AppNavbar variant="app" onNav={onNav} />

      <main className="flex-1 flex flex-col px-3 sm:px-6 py-4 sm:py-6">
        <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
          <div className="flex-1 flex flex-col bg-card rounded-2xl sm:rounded-3xl shadow-md border border-border overflow-hidden">
            <div className="px-4 sm:px-6 pt-5 pb-4">
              <BotMessage text="Pick your preferences below. Tap any option to select or deselect it:" />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 pb-4 space-y-5">
              {groups.map((g) => (
                <div key={g.key}>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-black uppercase tracking-wider text-[#5c4a2a]">{g.label}</p>
                    {sel[g.key] && (
                      <span className="text-[11px] font-bold text-primary">Selected: {sel[g.key]}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {g.options.map((opt) => (
                      <PrefChip
                        key={opt}
                        label={opt}
                        selected={isSelected(g.key, opt)}
                        onClick={() =>
                          setSel((prev) => ({
                            ...prev,
                            [g.key]: prev[g.key] === stripEmoji(opt) ? "" : stripEmoji(opt),
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-border flex items-center justify-between gap-3">
              <button
                onClick={() => setSel({ mealType: "", dietary: "", cookTime: "", cuisine: "" })}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear Selections
              </button>
              <button
                onClick={() => onGenerateWithPrefs(sel)}
                className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#234821] transition-all active:scale-95"
              >
                Generate Recipes <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
