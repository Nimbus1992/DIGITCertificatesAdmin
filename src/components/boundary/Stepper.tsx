import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  current: number; // 0-indexed; steps before are completed
}

export default function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-0 max-w-2xl mx-auto">
      {steps.map((label, i) => {
        const completed = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "h-9 w-9 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors",
                  completed && "bg-accent border-accent text-accent-foreground",
                  active && !completed && "border-accent text-accent bg-background",
                  !active && !completed && "border-muted-foreground/30 text-muted-foreground bg-background"
                )}
              >
                {completed ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("text-xs font-medium whitespace-nowrap", (active || completed) ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-0.5 flex-1 mx-2 -mt-6", i < current ? "bg-accent" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
