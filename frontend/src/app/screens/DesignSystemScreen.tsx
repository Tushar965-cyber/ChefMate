import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AppNavbar } from "@/app/components/AppNavbar";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import chefmateLogo from "@/imports/chefmate_logo.png";
import { Button, CheckboxItem } from "@/app/components/ui/button";
import { SuggestionChip, PrefChip } from "@/app/components/ui/Chips";
import { BotMessage, UserMessage, TypingDots } from "@/app/components/ui/ChatBubbles";
import { IllustrationBowl } from "@/app/components/ui/Illustrations";
import type { Screen } from "@/app/types";

export function DesignSystemScreen({ onNav }: { onNav: (s: Screen) => void }) {
  const [sampleChecked, setSampleChecked] = useState(true);

  return (
    <div className="min-h-full flex flex-col bg-background">
      <AppNavbar variant="landing" onNav={onNav} />

      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl border border-border bg-[#faf5eb] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
              <ImageWithFallback src={chefmateLogo} alt="ChefMate brand logo" className="w-16 h-16 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground font-display mb-1">
                ChefMate — Design System
              </h1>
              <p className="text-muted-foreground text-sm">
                Components, tokens, and visual language used throughout the app.
              </p>
            </div>
          </div>

          {/* Architecture annotation */}
          <div className="bg-primary/8 border-2 border-primary/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <p className="font-black text-primary mb-1.5 font-display">Architecture Note — 100% Local (Zero API)</p>
                <p className="text-sm text-[#3d5a38] leading-relaxed">
                  ChefMate runs <strong>100% locally with zero external APIs</strong> (no OpenAI, no cloud LLMs, no paid keys).
                  The recommendation engine runs entirely client-side using token normalization, constraint filtering,
                  and ingredient overlap scoring against a local structured recipe database.
                </p>
              </div>
            </div>
          </div>

          {/* Colors */}
          <section>
            <h2 className="text-lg font-black text-foreground font-display mb-4">Color Tokens</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Primary", hex: "#2D5A27" },
                { name: "Accent", hex: "#E8651A" },
                { name: "Background", hex: "#FBF5EB", light: true },
                { name: "Card", hex: "#FFFFFF", light: true },
                { name: "Foreground", hex: "#2C1810" },
                { name: "Muted FG", hex: "#7D6B5A" },
                { name: "Border", hex: "#E8DFD0", light: true },
                { name: "Bot Bubble", hex: "#F2EDE3", light: true },
              ].map((c) => (
                <div key={c.name} className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                  <div
                    className={`h-12 ${c.light ? "border-b border-border" : ""}`}
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{c.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section>
            <h2 className="text-lg font-black text-foreground font-display mb-4">Typography</h2>
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-5">
              {[
                {
                  label: "Hero — Fraunces 800",
                  sample: "Your friendly AI cooking companion",
                  cls: "text-3xl font-black font-display",
                },
                {
                  label: "Heading — Fraunces 700",
                  sample: "Creamy Tuscan Garlic Pasta",
                  cls: "text-xl font-bold font-display",
                },
                {
                  label: "Body — Nunito 400",
                  sample:
                    "A rich, flavorful pasta with sun-dried tomatoes, fresh spinach, and velvety garlic-parmesan sauce.",
                  cls: "text-base",
                },
                {
                  label: "Label — Nunito 800, tracked",
                  sample: "CHEFMATE",
                  cls: "text-[10px] font-black tracking-widest text-accent uppercase",
                },
              ].map((t) => (
                <div key={t.label} className="border-b border-muted last:border-0 pb-4 last:pb-0">
                  <p className="text-xs text-muted-foreground mb-1.5 font-mono">{t.label}</p>
                  <p className={t.cls}>{t.sample}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-lg font-black text-foreground font-display mb-4">Buttons</h2>
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
              </div>
            </div>
          </section>

          {/* Chips */}
          <section>
            <h2 className="text-lg font-black text-foreground font-display mb-4">Chips</h2>
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-mono">Suggestion chips</p>
                <div className="flex flex-wrap gap-2">
                  <SuggestionChip label="Vegetarian 🌿" selected />
                  <SuggestionChip label="Non-vegetarian 🍖" />
                  <SuggestionChip label="Under 30 minutes ⏱" />
                  <SuggestionChip label="Surprise me! ✨" />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-mono">Preference chips</p>
                <div className="flex flex-wrap gap-2">
                  <PrefChip label="Breakfast 🍳" selected />
                  <PrefChip label="Lunch 🍱" />
                  <PrefChip label="Vegetarian 🌿" selected />
                  <PrefChip label="Italian 🍕" />
                </div>
              </div>
            </div>
          </section>

          {/* Chat bubbles */}
          <section>
            <h2 className="text-lg font-black text-foreground font-display mb-4">Chat Bubbles</h2>
            <div className="bg-[#f8f2e8] rounded-2xl p-5 border border-border space-y-4">
              <BotMessage text="Hi! What would you like to cook today?" />
              <UserMessage text="I want a quick vegetarian dinner." />
              <TypingDots />
            </div>
          </section>

          {/* Checkboxes */}
          <section>
            <h2 className="text-lg font-black text-foreground font-display mb-4">Checkboxes</h2>
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-3">
              <CheckboxItem label="300 g penne pasta" checked={sampleChecked} onChange={setSampleChecked} />
              <CheckboxItem label="3 cloves garlic, minced" checked={false} onChange={() => {}} />
              <CheckboxItem label="1 cup heavy cream" checked={false} onChange={() => {}} />
            </div>
          </section>

          {/* Brand + illustrations */}
          <section>
            <h2 className="text-lg font-black text-foreground font-display mb-4">Brand &amp; Illustrations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 bg-[#faf5eb] border border-border rounded-2xl p-5 flex items-center gap-5 shadow-sm">
                <ImageWithFallback
                  src={chefmateLogo}
                  alt="ChefMate brand logo"
                  className="w-28 h-28 object-contain flex-shrink-0"
                />
                <div>
                  <p className="font-black text-foreground font-display">Brand Logo</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">chefmate_logo.png</p>
                  <p className="text-xs text-muted-foreground mt-1">Used: landing hero, chat avatars, navbar</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm">
                <div className="w-20 h-14">
                  <IllustrationBowl />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-foreground">Loading Bowl</p>
                  <p className="text-xs text-muted-foreground">Loading state</p>
                </div>
              </div>
            </div>
          </section>

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
