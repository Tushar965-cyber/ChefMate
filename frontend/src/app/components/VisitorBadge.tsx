import { useState, useEffect } from "react";
import { Users } from "lucide-react";

const BASE_VISITOR_COUNT = 0;
const STORAGE_KEY = "chefmate_visitor_count_v2";

export function getOrUpdateVisitorCount(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let count = stored !== null ? parseInt(stored, 10) : BASE_VISITOR_COUNT;
    if (isNaN(count)) count = BASE_VISITOR_COUNT;

    // Increment count once per session
    const hasCounted = sessionStorage.getItem("chefmate_session_counted_v2");
    if (!hasCounted) {
      count += 1;
      localStorage.setItem(STORAGE_KEY, count.toString());
      sessionStorage.setItem("chefmate_session_counted_v2", "true");
    }
    return count;
  } catch {
    return 1;
  }
}

export function resetVisitorCount(): number {
  try {
    localStorage.setItem(STORAGE_KEY, "0");
    sessionStorage.removeItem("chefmate_session_counted_v2");
  } catch {
    // ignore
  }
  return 0;
}

export function VisitorBadge({ className = "" }: { className?: string }) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    setCount(getOrUpdateVisitorCount());
  }, []);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Do you want to reset the visitor counter back to 0?")) {
      const resetVal = resetVisitorCount();
      setCount(resetVal);
    }
  };

  return (
    <div
      onClick={handleReset}
      title="Total visitor count (Click to reset)"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-amber-900 select-none shadow-xs cursor-pointer hover:bg-amber-500/20 transition-colors ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <Users size={12} className="text-amber-600 flex-shrink-0" />
      <span>{count.toLocaleString()} Visitors</span>
    </div>
  );
}
