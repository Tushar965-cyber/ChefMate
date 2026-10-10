import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export function Button({
  children, variant = "primary", size = "md",
  disabled = false, loading = false, onClick, className = "",
}: {
  children: ReactNode; variant?: ButtonVariant; size?: ButtonSize;
  disabled?: boolean; loading?: boolean; onClick?: () => void; className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring select-none";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-[#234821] active:scale-95",
    secondary: "bg-accent text-accent-foreground hover:bg-[#d45c18] active:scale-95",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-95",
    ghost: "text-primary hover:bg-primary/10 active:scale-95",
    danger: "bg-destructive text-destructive-foreground hover:bg-red-600 active:scale-95",
  };
  const sizes: Record<ButtonSize, string> = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      } ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Badge({ label, color = "green" }: { label: string; color?: "green" | "orange" | "yellow" | "sky" }) {
  const colors = {
    green: "bg-primary/10 text-primary",
    orange: "bg-accent/10 text-accent",
    yellow: "bg-amber-100 text-amber-700",
    sky: "bg-sky-100 text-sky-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[color]}`}>
      {label}
    </span>
  );
}

export function CheckboxItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150
          ${checked ? "bg-primary border-primary" : "border-border group-hover:border-primary"}`}
      >
        {checked && <span className="text-white text-[10px] font-black">✓</span>}
      </button>
      <span className={`text-sm transition-colors ${checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
        {label}
      </span>
    </label>
  );
}
