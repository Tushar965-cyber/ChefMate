import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";

const CULINARY_FALLBACKS: Record<string, string> = {
  rice: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&h=440&fit=crop&auto=format",
  curry: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=700&h=440&fit=crop&auto=format",
  pasta: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700&h=440&fit=crop&auto=format",
  noodles: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700&h=440&fit=crop&auto=format",
  chicken: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=700&h=440&fit=crop&auto=format",
  tea: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=700&h=440&fit=crop&auto=format",
  chutney: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=700&h=440&fit=crop&auto=format",
  egg: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=700&h=440&fit=crop&auto=format",
  salad: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&h=440&fit=crop&auto=format",
  dessert: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=700&h=440&fit=crop&auto=format",
  default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&h=440&fit=crop&auto=format",
};

function getThematicFallback(name?: string, cuisine?: string): string {
  const n = (name || "").toLowerCase();
  const c = (cuisine || "").toLowerCase();
  if (n.includes("rice") || n.includes("biryani") || n.includes("pulao")) return CULINARY_FALLBACKS.rice;
  if (n.includes("noodle") || n.includes("pasta") || c.includes("italian")) return CULINARY_FALLBACKS.pasta;
  if (n.includes("chai") || n.includes("tea")) return CULINARY_FALLBACKS.tea;
  if (n.includes("chutney") || n.includes("pachadi")) return CULINARY_FALLBACKS.chutney;
  if (n.includes("chicken") || n.includes("mutton") || n.includes("meat")) return CULINARY_FALLBACKS.chicken;
  if (n.includes("egg") || n.includes("bhurji")) return CULINARY_FALLBACKS.egg;
  if (n.includes("salad")) return CULINARY_FALLBACKS.salad;
  if (n.includes("curry") || n.includes("masala") || n.includes("dal") || c.includes("indian")) return CULINARY_FALLBACKS.curry;
  return CULINARY_FALLBACKS.default;
}

export function RecipeImage({
  src,
  alt,
  cuisine,
  className = "",
}: {
  src?: string;
  alt: string;
  cuisine?: string;
  className?: string;
}) {
  const fallback = getThematicFallback(alt, cuisine);
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallback);
  const [hasFailedTwice, setHasFailedTwice] = useState(false);

  // Sync state whenever src or alt changes (e.g. clicking 'Show Another')
  const [prevProps, setPrevProps] = useState({ src, alt });
  if (prevProps.src !== src || prevProps.alt !== alt) {
    setPrevProps({ src, alt });
    setCurrentSrc(src || fallback);
    setHasFailedTwice(false);
  }

  const handleError = () => {
    if (currentSrc !== fallback) {
      // Step 1 fallback: Try thematic food photography
      setCurrentSrc(fallback);
    } else {
      // Step 2 fallback: Render offline culinary SVG card
      setHasFailedTwice(true);
    }
  };

  if (hasFailedTwice) {
    return (
      <div
        className={`w-full bg-gradient-to-br from-[#2D5A27] via-[#234821] to-[#122211] flex flex-col items-center justify-center p-6 text-white text-center select-none ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-2">
          <UtensilsCrossed size={24} className="text-white/90" />
        </div>
        <p className="font-bold text-sm max-w-xs line-clamp-1">{alt}</p>
        <span className="text-[11px] text-white/60 uppercase tracking-widest mt-1">
          {cuisine || "ChefMate Recipe"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={handleError}
      loading="lazy"
    />
  );
}
