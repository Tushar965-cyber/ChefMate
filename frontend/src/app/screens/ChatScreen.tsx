import { useState, useRef, useEffect } from "react";
import { Send, Search, Settings } from "lucide-react";
import { AppNavbar } from "@/app/components/AppNavbar";
import { BotMessage, UserMessage, TypingDots } from "@/app/components/ui/ChatBubbles";
import { SuggestionChip } from "@/app/components/ui/Chips";
import { INITIAL_MESSAGES } from "@/app/types";
import type { Screen } from "@/app/types";

/** Detect if the user message looks like an ingredient list */
export function detectIngredients(text: string): { isIngredientQuery: boolean; ingredients: string[] } {
  const lower = text.toLowerCase().trim();

  const patterns = [
    /i\s+have\s+(.+)/i,
    /i've\s+got\s+(.+)/i,
    /i\s+got\s+(.+)/i,
    /using\s+(.+)/i,
    /ingredients?\s*[:\-]\s*(.+)/i,
    /make\s+(?:something\s+)?with\s+(.+)/i,
    /cook\s+(?:something\s+)?with\s+(.+)/i,
    /use\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m && m[1]) {
      const raw = m[1].trim();
      const parts = raw
        .split(/,|\band\b/i)
        .map((p) => p.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, ""))
        .filter((p) => p.length > 1);
      if (parts.length > 0) {
        return { isIngredientQuery: true, ingredients: parts };
      }
    }
  }

  if (lower.includes(",")) {
    const parts = lower.split(",").map((p) => p.trim()).filter((p) => p.length > 1 && /^[a-z\s-]+$/.test(p));
    if (parts.length >= 2) {
      return { isIngredientQuery: true, ingredients: parts };
    }
  }

  return { isIngredientQuery: false, ingredients: [] };
}

export function buildBotReply(text: string, detected: { isIngredientQuery: boolean; ingredients: string[] }): string {
  const lower = text.toLowerCase();

  if (detected.isIngredientQuery && detected.ingredients.length > 0) {
    const ingList = detected.ingredients.slice(0, 6).join(", ");
    return `Got it! I found these ingredients: ${ingList}. Let me search for the best matching recipes...`;
  }
  if (lower.includes("vegetarian") || lower.includes("vegan")) {
    return "Looking for vegetarian recipes that match your taste. Searching now...";
  }
  if (lower.includes("indian")) {
    return "Great! Searching through our Indian recipe collection for the best match...";
  }
  if (lower.includes("breakfast")) {
    return "Finding quick breakfast options for you. One moment...";
  }
  if (lower.includes("surprise") || lower.includes("anything") || lower.includes("random")) {
    return "Surprise it is! Picking a great recipe just for you...";
  }
  return `Searching our recipe collection for "${text.slice(0, 40)}${text.length > 40 ? "..." : ""}"...`;
}

export function ChatScreen({
  onSearch,
  onPreferences,
  onNav,
}: {
  onSearch: (text: string, detectedIngredients?: string[]) => void;
  onPreferences: () => void;
  onNav: (s: Screen) => void;
}) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Random recipe 🎲",
    "Vegetarian 🌿",
    "Indian dinner 🍛",
    "Under 30 minutes ⏱️",
  ];

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg = { id: Date.now(), role: "user" as const, text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const detected = detectIngredients(text);
    const reply = buildBotReply(text, detected);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot" as const, text: reply },
      ]);
      setTimeout(() => {
        onSearch(text, detected.isIngredientQuery ? detected.ingredients : undefined);
      }, 500);
    }, 900);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="min-h-full flex flex-col bg-background">
      <AppNavbar variant="app" onNav={onNav} />

      <main className="flex-1 flex flex-col px-3 sm:px-6 py-4 sm:py-6">
        <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
          <div className="flex-1 flex flex-col bg-card rounded-2xl sm:rounded-3xl shadow-md overflow-hidden border border-border">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 py-5 space-y-4 min-h-[300px]">
              {messages.map((msg) =>
                msg.role === "bot"
                  ? <BotMessage key={msg.id} text={msg.text} />
                  : <UserMessage key={msg.id} text={msg.text} />
              )}
              {isTyping && <TypingDots />}
              <div ref={endRef} />
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 border-t border-border">
              <div className="px-4 sm:px-6 pt-3 pb-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">Try:</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <SuggestionChip key={s} label={s} onClick={() => sendMessage(s)} />
                  ))}
                  <button
                    onClick={onPreferences}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-all duration-150 active:scale-95 flex items-center gap-1"
                  >
                    <Settings size={11} /> Preferences
                  </button>
                </div>
              </div>

              <div className="px-4 sm:px-6 pb-4">
                <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-background focus-within:border-primary transition-colors">
                  <Search size={16} className="text-muted-foreground flex-shrink-0" />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder="e.g. I have rice, tomato and onion..."
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isTyping}
                    className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#234821] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
                  >
                    Send <Send size={12} />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 px-1">
                  Tip: Say <span className="font-semibold text-primary">&quot;I have rice, onion, tomato&quot;</span> to match by ingredients
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
