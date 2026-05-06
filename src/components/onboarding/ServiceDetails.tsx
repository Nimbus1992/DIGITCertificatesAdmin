import React from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/contexts/OnboardingContext";
import HelperText from "./HelperText";
import { onboardingGuidance } from "@/data/onboardingGuidance";

const ServiceDetails: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { state, updateState } = useOnboarding();
  const nameGuidance = onboardingGuidance.serviceName;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full mx-auto animate-slide-up">
        <h2 className="text-xl font-semibold text-foreground mb-2">What would you like to call this application?</h2>
        <HelperText text={nameGuidance.helperText} reassurance={nameGuidance.reassurance} />

        <div className="mt-6">
          <Input
            value={state.serviceName}
            onChange={(e) => updateState({ serviceName: e.target.value })}
            placeholder="e.g., Business License"
            className="text-lg h-12"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && state.serviceName.trim() && onComplete()}
          />
        </div>

        <div className="flex justify-between pt-8">
          <Button variant="ghost" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            onClick={onComplete}
            disabled={!state.serviceName.trim()}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
