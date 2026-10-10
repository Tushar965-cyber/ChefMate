import { ArrowRight, PlayCircle } from "lucide-react";
import { AppNavbar } from "@/app/components/AppNavbar";
import type { Screen } from "@/app/types";

export function WelcomeScreen({ onStart, onNav }: { onStart: () => void; onNav: (s: Screen) => void }) {
  return (
    <div className="min-h-full flex flex-col bg-background">
      <AppNavbar variant="landing" onNav={onNav} />

      <main className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <span className="inline-flex items-center bg-accent/10 text-accent text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5">
                Meet ChefMate
              </span>
              <h1 className="font-display font-black text-[2.4rem] sm:text-[3rem] leading-[1.1] text-foreground mb-4">
                Your friendly AI<br />cooking companion
              </h1>
              <p className="text-[#6b5e4e] text-base leading-relaxed mb-7 max-w-md">
                Tell me what you feel like eating, and I&apos;ll help you find a delicious recipe.
                Empty fridge? Dietary constraints? No worries, I&apos;ve got you covered.
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <button
                  onClick={onStart}
                  className="inline-flex items-center gap-2 bg-primary text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#234821] transition-all active:scale-95"
                >
                  Start Cooking <ArrowRight size={16} />
                </button>
                <button className="inline-flex items-center gap-2 text-foreground font-semibold text-sm hover:text-primary transition-colors">
                  <PlayCircle size={18} className="text-muted-foreground" />
                  How it works
                </button>
              </div>
              <div className="flex items-stretch gap-0 divide-x divide-border">
                {[
                  { value: "10,000+", label: "Recipes Created" },
                  { value: "15 min", label: "Average Meal Prep" },
                  { value: "4.9 ★", label: "User Rating" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col pr-6 pl-0 first:pl-0 last:pr-0 [&:not(:first-child)]:pl-6">
                    <span className="text-xl sm:text-2xl font-black text-foreground font-display">{s.value}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 md:order-2 flex justify-center md:justify-end">
              <div className="bg-card rounded-3xl shadow-xl p-4 sm:p-6 w-full max-w-sm md:max-w-md">
                <img
                  src="https://images.unsplash.com/photo-1579150877125-53b49ce88315?w=560&h=520&fit=crop&auto=format"
                  alt="Fresh vegetables and cooking ingredients on a wooden cutting board"
                  className="w-full h-56 sm:h-72 object-cover rounded-2xl bg-muted"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
