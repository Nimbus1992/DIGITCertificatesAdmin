import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceTemplate } from "@/data/serviceTemplates";

interface Props {
  template: ServiceTemplate;
  usedBy: number;
  onPreview: () => void;
  onDetails: () => void;
  onActivate: () => void;
  variant?: "default" | "catalog";
}

const TemplateCard: React.FC<Props> = ({ template, usedBy, onPreview, onDetails, onActivate, variant = "default" }) => {
  const Icon = template.icon;
  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-card p-4 transition-all",
        "hover:shadow-sm hover:border-foreground/15",
        template.comingSoon && "opacity-75",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground truncate">{template.name}</h3>
            <span
              className={cn(
                "inline-flex items-center h-5 px-1.5 rounded text-[11px] font-semibold uppercase tracking-wider shrink-0",
                template.comingSoon
                  ? "bg-muted text-muted-foreground ring-1 ring-border"
                  : "bg-success/10 text-success ring-1 ring-success/20",
              )}
            >
              {template.comingSoon ? "Soon" : "Ready"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {template.modules.slice(0, 3).map((m) => (
          <span key={m} className="inline-flex h-5 px-1.5 items-center rounded text-[11px] bg-muted text-muted-foreground">
            {m}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {template.comingSoon ? "Not available yet" : `${usedBy} service${usedBy === 1 ? "" : "s"}`}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onPreview}>
            <Eye className="h-3 w-3 mr-1" /> Preview
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onDetails}>
            <Info className="h-3 w-3 mr-1" /> Details
          </Button>
          <Button
            size="sm"
            disabled={template.comingSoon}
            onClick={onActivate}
            className="h-7 px-2.5 text-xs"
          >
            Activate
            {!template.comingSoon && <ArrowRight className="h-3 w-3 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
