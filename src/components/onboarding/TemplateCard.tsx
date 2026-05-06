import React from "react";
import { Clock, Eye, Layers, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ServiceTemplate } from "@/data/serviceTemplates";

interface Props {
  template: ServiceTemplate;
  onSelect?: () => void;
  onPreview?: () => void;
  onViewDetails?: () => void;
}

const TemplateCard: React.FC<Props> = ({ template, onSelect, onPreview, onViewDetails }) => {
  const Icon = template.icon;
  const disabled = !!template.comingSoon;

  return (
    <Card className={`p-6 space-y-4 ${disabled ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground">{template.name}</h3>
            {disabled && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide border-accent/40 text-accent">
                Coming Soon
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {template.estimatedSetupTime}
        </span>
        <span className="flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" /> {template.modules.length} Modules
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {template.modules.map((m) => (
          <Badge key={m} variant="secondary" className="text-xs">
            {m}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {!disabled && onSelect && (
          <Button onClick={onSelect} className="flex-1 min-w-[120px]">
            Select
          </Button>
        )}
        {!disabled && onPreview && (
          <Button variant="outline" onClick={onPreview} className="flex-1 min-w-[120px] gap-1.5">
            <PlayCircle className="h-4 w-4" /> Preview
          </Button>
        )}
        {onViewDetails && (
          <Button variant="ghost" onClick={onViewDetails} className="flex-1 min-w-[120px] gap-1.5">
            <Eye className="h-4 w-4" /> View Details
          </Button>
        )}
      </div>
    </Card>
  );
};

export default TemplateCard;
