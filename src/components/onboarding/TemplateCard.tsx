import React from "react";
import { ArrowRight, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ServiceTemplate } from "@/data/serviceTemplates";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: ServiceTemplate;
  onSelect?: () => void;
  onPreview?: () => void;
  onViewDetails?: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, onPreview, onViewDetails }) => {
  const Icon = template.icon;
  const disabled = !!template.comingSoon;

  return (
    <Card
      className={cn(
        "p-5 transition-all hover:shadow-md hover:border-accent/40",
        disabled && "opacity-70",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
            {disabled && (
              <span className="text-[10px] uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                Coming soon
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
          {template.aka && template.aka.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide mr-0.5">Also called:</span>
              {template.aka.map((a) => (
                <span
                  key={a}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {template.estimatedSetupTime}
            </span>
            <span>{template.modules.length} modules</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onViewDetails}
        >
          Details
        </Button>
        {onPreview && (
          <Button variant="outline" size="sm" onClick={onPreview} disabled={disabled}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Preview
          </Button>
        )}
        {onSelect && (
          <Button
            size="sm"
            onClick={onSelect}
            disabled={disabled}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Use <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default TemplateCard;
