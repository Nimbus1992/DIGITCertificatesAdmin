import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import HelperText from "./HelperText";
import TemplateIntroduction from "./TemplateIntroduction";
import TemplateCard from "./TemplateCard";
import { onboardingGuidance } from "@/data/onboardingGuidance";
import { allTemplates, tradeTemplate, type ServiceTemplate } from "@/data/serviceTemplates";

const TemplateSelection: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { updateState } = useOnboarding();
  const [introTemplate, setIntroTemplate] = useState<ServiceTemplate | null>(null);
  const guidance = onboardingGuidance.templateSelection;

  const handleUse = () => {
    updateState({ selectedTemplateId: tradeTemplate.id, serviceName: tradeTemplate.name });
    setTimeout(onComplete, 300);
  };

  const handlePreview = () => {
    window.open(`/service/${tradeTemplate.id}/preview`, "_blank");
  };

  if (introTemplate) {
    return (
      <TemplateIntroduction
        template={introTemplate}
        onUseTemplate={introTemplate.comingSoon ? undefined : handleUse}
        onPreview={introTemplate.comingSoon ? undefined : handlePreview}
        onBack={() => setIntroTemplate(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center animate-slide-up">
          <h2 className="text-2xl font-bold text-foreground mb-2">Choose a Template</h2>
          <HelperText text={guidance.helperText} reassurance={guidance.reassurance} className="justify-center" />
        </div>

        <div className="space-y-4 animate-fade-in">
          {allTemplates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onSelect={t.comingSoon ? undefined : handleUse}
              onPreview={t.comingSoon ? undefined : handlePreview}
              onViewDetails={() => setIntroTemplate(t)}
            />
          ))}
        </div>

        <div className="flex justify-start">
          <Button variant="ghost" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;
