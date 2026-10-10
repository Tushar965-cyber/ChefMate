export function SuggestionChip({
  label, selected = false, onClick,
}: { label: string; selected?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 active:scale-95
        ${selected
          ? "border-accent text-accent bg-white"
          : "border-border text-[#5c4a2a] bg-white hover:border-accent/50"
        }`}
    >
      {label}
    </button>
  );
}

export function PrefChip({
  label, selected = false, onClick,
}: { label: string; selected?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-150 active:scale-95
        ${selected
          ? "border-accent text-accent bg-white"
          : "border-[#e5ddd0] text-foreground bg-white hover:border-accent/40"
        }`}
    >
      {label}
    </button>
  );
}
