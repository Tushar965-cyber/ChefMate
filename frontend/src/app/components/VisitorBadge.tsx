import { useState, useEffect } from "react";
import { Users } from "lucide-react";

const BASE_VISITOR_COUNT = 1428;

export function getOrUpdateVisitorCount(): number {
  try {
    const stored = localStorage.getItem("chefmate_visitor_count");
    let count = stored ? parseInt(stored, 10) : BASE_VISITOR_COUNT;
    if (isNaN(count)) count = BASE_VISITOR_COUNT;

    // Increment count once per session
    const hasCounted = sessionStorage.getItem("chefmate_session_counted");
    if (!hasCounted) {
      count += 1;
      localStorage.setItem("chefmate_visitor_count", count.toString());
      sessionStorage.setItem("chefmate_session_counted", "true");
    }
    return count;
  } catch {
    return BASE_VISITOR_COUNT + 1;
  }
}

export function VisitorBadge({ className = "" }: { className?: string }) {
  const [count, setCount] = useState<number>(BASE_VISITOR_COUNT);

  useEffect(() => {
    setCount(getOrUpdateVisitorCount());
  }, []);

  return (
    <div
      title="Total visitor count"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-amber-900 select-none shadow-xs ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <Users size={12} className="text-amber-600 flex-shrink-0" />
      <span>{count.toLocaleString()} Visitors</span>
    </div>
  );
}
