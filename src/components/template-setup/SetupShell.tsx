import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SetupStepKey = "identity" | "modules" | "structure" | "initialize";

const STEPS: { key: SetupStepKey; label: string }[] = [
  { key: "identity", label: "Identity" },
  { key: "modules", label: "Modules" },
  { key: "structure", label: "Structure" },
  { key: "initialize", label: "Initializing" },
];

interface Props {
  current: SetupStepKey;
  onBack?: () => void;
  backLabel?: string;
  children: React.ReactNode;
}

const SetupShell: React.FC<Props> = ({ current, onBack, backLabel = "Back", children }) => {
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="gap-1 mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </Button>
        )}

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <React.Fragment key={s.key}>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      done && "bg-accent",
                      active && "bg-accent ring-4 ring-accent/15",
                      !done && !active && "bg-muted",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs",
                      active ? "text-foreground font-medium" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-border" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div key={current} className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SetupShell;