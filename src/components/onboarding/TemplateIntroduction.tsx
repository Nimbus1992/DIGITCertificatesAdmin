import React from "react";
import { ArrowLeft, ArrowRight, Eye, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ServiceTemplate } from "@/data/serviceTemplates";

interface TemplateIntroductionProps {
  template: ServiceTemplate;
  onUseTemplate?: () => void;
  onPreview?: () => void;
  onBack: () => void;
}

const TemplateIntroduction: React.FC<TemplateIntroductionProps> = ({
  template,
  onUseTemplate,
  onPreview,
  onBack,
}) => {
  const Icon = template.icon;
  const disabled = !!template.comingSoon;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="gap-1 mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
            <Icon className="h-7 w-7 text-accent" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">{template.name}</h1>
              {disabled && (
                <span className="text-[10px] uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                  Coming soon
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">{template.description}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Setup: {template.estimatedSetupTime}
              </span>
            </div>
          </div>
        </div>

        <Card className="p-5 mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Modules included</h2>
          <div className="flex flex-wrap gap-2">
            {template.modules.map((m) => (
              <span
                key={m}
                className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
              >
                {m}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-5 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">What's included</h2>
          <ul className="space-y-2">
            {template.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex items-center gap-2 justify-end">
          {onPreview && (
            <Button variant="outline" onClick={onPreview} disabled={disabled}>
              <Eye className="h-4 w-4 mr-1" /> Preview
            </Button>
          )}
          {onUseTemplate && (
            <Button
              onClick={onUseTemplate}
              disabled={disabled}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
            >
              Use this template <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateIntroduction;
