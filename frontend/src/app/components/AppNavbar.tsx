import { useState } from "react";
import { Menu, X, User, LogOut, RotateCcw } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { VisitorBadge } from "@/app/components/VisitorBadge";
import chefmateLogo from "@/imports/chefmate_logo.png";
import type { Screen } from "@/app/types";

export function AppNavbar({
  variant,
  onNav,
  currentUser,
  onSignOut,
}: {
  variant: "landing" | "app";
  onNav: (s: Screen) => void;
  currentUser?: { name: string; email: string } | null;
  onSignOut?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-background border-b border-border flex-shrink-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={() => onNav("welcome")}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#f0e8d8] border border-border overflow-hidden flex items-center justify-center">
            <ImageWithFallback
              src={chefmateLogo}
              alt="ChefMate"
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="font-black text-foreground text-[15px] font-display">ChefMate</span>
        </button>

        {/* Center Badges: Local + Visitor Count */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-emerald-800">100% Local • Zero API</span>
          </div>

          <VisitorBadge className="hidden sm:inline-flex" />
        </div>

        {variant === "landing" ? (
          <>
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#5c4a2a]">
              <button onClick={() => onNav("chat")} className="hover:text-primary transition-colors">
                Start Cooking
              </button>
              <button onClick={() => onNav("preferences")} className="hover:text-primary transition-colors">
                Preferences
              </button>
              <button onClick={() => onNav("design-system")} className="hover:text-primary transition-colors">
                Architecture
              </button>
            </nav>

            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                    <User size={13} />
                    <span>{currentUser.name}</span>
                  </div>
                  <button
                    onClick={onSignOut}
                    title="Sign Out"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onNav("signin")}
                  className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-[#234821] transition-all active:scale-95"
                >
                  Sign In
                </button>
              )}
              <button
                className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              {currentUser && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <User size={12} /> {currentUser.name}
                </span>
              )}
              <button
                onClick={() => onNav("chat")}
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#5c4a2a] hover:text-primary transition-colors"
              >
                <RotateCcw size={13} />
                Restart Session
              </button>
              <button
                onClick={() => onNav("chat")}
                className="sm:hidden p-1"
                title="Restart"
              >
                <RotateCcw size={16} className="text-muted-foreground" />
              </button>
              {currentUser ? (
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                >
                  <LogOut size={14} />
                </button>
              ) : (
                <button
                  onClick={() => onNav("signin")}
                  className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {variant === "landing" && menuOpen && (
        <div className="sm:hidden bg-card border-t border-border px-4 py-3 space-y-1">
          {["Start Cooking", "Preferences", "Architecture"].map((l) => (
            <button
              key={l}
              onClick={() => {
                setMenuOpen(false);
                if (l === "Start Cooking") onNav("chat");
                else if (l === "Preferences") onNav("preferences");
                else onNav("design-system");
              }}
              className="block w-full text-left py-2.5 text-sm font-medium text-[#5c4a2a] hover:text-primary transition-colors"
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
