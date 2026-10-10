import { useState } from "react";
import {
  ChefHat,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { AppNavbar } from "@/app/components/AppNavbar";
import type { Screen } from "@/app/types";

export function SignInScreen({
  onSuccess,
  onNav,
}: {
  onSuccess: (user: { name: string; email: string }) => void;
  onNav: (s: Screen) => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.trim()) return "Please enter your email.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (!password || password.length < 4) return "Password must be at least 4 characters.";
    if (mode === "signup" && !name.trim()) return "Please enter your name.";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setLoading(true);
    // 100% Local auth simulation
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        name: mode === "signup" ? name.trim() : email.split("@")[0],
        email: email.trim(),
      });
    }, 800);
  };

  const handleGuest = () => {
    onSuccess({ name: "Guest Chef", email: "guest@chefmate.local" });
  };

  return (
    <div className="min-h-full flex flex-col bg-background">
      <AppNavbar variant="landing" onNav={onNav} />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-card rounded-3xl shadow-lg border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/90 to-[#1e3d1a] px-6 pt-8 pb-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                <ChefHat size={30} className="text-white" />
              </div>
              <h1 className="text-xl font-black text-white font-display">
                {mode === "signin" ? "Welcome back!" : "Join ChefMate"}
              </h1>
              <p className="text-sm text-white/70 mt-1">
                {mode === "signin" ? "Sign in to your account" : "Create your free account"}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex border-b border-border">
              <button
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  mode === "signin"
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  mode === "signup"
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Full Name</label>
                  <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:border-primary transition-colors">
                    <User size={15} className="text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Email Address</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:border-primary transition-colors">
                  <Mail size={15} className="text-muted-foreground flex-shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Password</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:border-primary transition-colors">
                  <Lock size={15} className="text-muted-foreground flex-shrink-0" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} className="text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold text-sm py-3 rounded-xl hover:bg-[#234821] disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    {mode === "signin" ? "Sign In" : "Create Account"} <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="relative flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                type="button"
                onClick={handleGuest}
                className="w-full flex items-center justify-center gap-2 bg-muted/60 text-foreground font-semibold text-sm py-3 rounded-xl hover:bg-muted transition-all active:scale-95 border border-border"
              >
                <PlayCircle size={15} className="text-accent" />
                Continue as Guest
              </button>
            </form>

            {/* Footer */}
            <div className="px-6 pb-5 text-center">
              <p className="text-xs text-muted-foreground">
                {mode === "signin" ? (
                  <>
                    No account?{" "}
                    <button
                      onClick={() => {
                        setMode("signup");
                        setError("");
                      }}
                      className="text-primary font-bold hover:underline"
                    >
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setMode("signin");
                        setError("");
                      }}
                      className="text-primary font-bold hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Demo hint */}
          <div className="mt-4 flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3">
            <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
            <p className="text-xs text-primary font-medium">
              <span className="font-black">Presentation mode:</span> All auth is local — no server needed. Use any email + password (min 4 chars).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
