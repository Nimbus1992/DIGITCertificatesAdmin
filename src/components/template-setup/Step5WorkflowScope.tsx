import React from "react";
import { ArrowRight, GitBranch, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkflowScope } from "@/contexts/OnboardingContext";

interface Props {
  value: WorkflowScope;
  onChange: (next: WorkflowScope) => void;
  categoryCount: number;
  onContinue: () => void;
}

const Option: React.FC<{
  active: boolean;
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ active, icon: Icon, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "text-left p-5 rounded-md border transition-all w-full flex gap-4",
      active
        ? "border-accent bg-accent/5 ring-1 ring-accent"
        : "border-input hover:border-accent/40 hover:bg-muted/20",
    )}
  >
    <div className={cn(
      "h-10 w-10 rounded-md flex items-center justify-center shrink-0",
      active ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground",
    )}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
    </div>
  </button>
);

const Step5WorkflowScope: React.FC<Props> = ({ value, onChange, categoryCount, onContinue }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Approval process</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Do different categories require different approval processes? You can always change this later
        — workflows for each category are pre-filled and ready to customize.
      </p>
    </div>

    <div className="space-y-3">
      <Option
        active={value === "shared"}
        icon={Layers}
        title="Same approval process for all categories"
        description="One workflow handles every license, regardless of category."
        onClick={() => onChange("shared")}
      />
      <Option
        active={value === "by_category"}
        icon={GitBranch}
        title="Different approval processes by category"
        description={`We'll create a starting workflow for each of your ${categoryCount} categor${categoryCount === 1 ? "y" : "ies"} — edit each one independently.`}
        onClick={() => onChange("by_category")}
      />
    </div>

    <div className="pt-2">
      <Button onClick={onContinue} className="gap-2">
        Continue <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export default Step5WorkflowScope;