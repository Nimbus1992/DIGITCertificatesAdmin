import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { allTemplates } from "@/data/serviceTemplates";
import { useOnboarding, ServiceItem } from "@/contexts/OnboardingContext";

const ActivateServices: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateState, addService } = useOnboarding();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleActivate = () => {
    if (selected.size === 0) {
      toast.error("Select at least one service template");
      return;
    }
    const newIds: string[] = [];
    selected.forEach((tid) => {
      const t = allTemplates.find((x) => x.id === tid);
      if (!t) return;
      const id = `${tid}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const service: ServiceItem = {
        id,
        name: t.name,
        templateId: tid,
        status: "draft",
        customModules: t.modules,
        isPublished: false,
        isLive: false,
        deployment: { availabilityScope: "entire_state", selectedItems: [] },
        teamMembers: [],
        authMethod: "email",
      };
      addService(service);
      newIds.push(id);
    });
    updateState({ pendingActivatedServiceIds: newIds });
    toast.success(`Activated ${newIds.length} service${newIds.length > 1 ? "s" : ""}`);
    navigate("/setup/assign-owners");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Step 3 of 4</p>
        <h1 className="text-2xl font-bold text-foreground mt-1">Select services your organization will offer</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Choose one or more service templates to activate. You can always add more later from Services.
        </p>
      </div>

      <div className="rounded-md bg-accent/5 border border-accent/15 px-3 py-2 flex items-start gap-2">
        <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        <p className="text-xs text-foreground">
          Activating creates a draft service. Configuration happens later, by the Service Owner you assign.
        </p>
      </div>

      <div className="space-y-3">
        {allTemplates.map((t) => {
          const Icon = t.icon;
          const isSelected = selected.has(t.id);
          const disabled = !!t.comingSoon;
          return (
            <button
              key={t.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(t.id)}
              className={cn(
                "w-full text-left transition-all",
                disabled && "opacity-60 cursor-not-allowed",
              )}
            >
              <Card className={cn(
                "p-5 transition-all",
                isSelected ? "border-accent ring-2 ring-accent/30 bg-accent/5" : "hover:border-accent/40 hover:shadow-md",
              )}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-foreground">{t.name}</h3>
                      {disabled && (
                        <Badge variant="outline" className="text-[10px] uppercase">Coming soon</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                    <div className="flex items-center gap-4 mt-2.5 text-[11px] text-muted-foreground">
                      <span>{t.modules.length} module{t.modules.length > 1 ? "s" : ""}</span>
                      <span>{t.flows?.length ?? t.modules.length} workflow stage{(t.flows?.length ?? t.modules.length) > 1 ? "s" : ""}</span>
                      <span>{(t.notifications?.length ?? 0) + (t.payments?.length ?? 0)} touchpoints</span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0",
                    isSelected ? "bg-accent border-accent" : "border-border",
                  )}>
                    {isSelected && <Check className="h-3.5 w-3.5 text-accent-foreground" />}
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={() => navigate("/setup/invite-admins")}>Back</Button>
        <Button onClick={handleActivate} disabled={selected.size === 0} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          Activate Selected Services <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ActivateServices;
