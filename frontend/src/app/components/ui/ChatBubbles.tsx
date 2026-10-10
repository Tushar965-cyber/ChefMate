import { ChefHat, UserRound } from "lucide-react";

export function BotMessage({ text }: { text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0 shadow-sm">
        <ChefHat size={16} className="text-white" />
      </div>
      <div className="flex flex-col gap-1 max-w-[75%] sm:max-w-[65%]">
        <span className="text-[10px] font-black tracking-widest text-accent uppercase">ChefMate</span>
        <div className="bg-[#f2ede3] text-foreground text-sm leading-relaxed px-4 py-3 rounded-2xl rounded-tl-sm whitespace-pre-line">
          {text}
        </div>
      </div>
    </div>
  );
}

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex gap-3 items-start justify-end">
      <div className="bg-primary text-white text-sm leading-relaxed px-4 py-3 rounded-2xl rounded-tr-sm max-w-[75%] sm:max-w-[65%]">
        {text}
      </div>
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <UserRound size={16} className="text-white" />
      </div>
    </div>
  );
}

export function TypingDots() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
        <ChefHat size={16} className="text-white" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black tracking-widest text-accent uppercase">ChefMate</span>
        <div className="bg-[#f2ede3] px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
