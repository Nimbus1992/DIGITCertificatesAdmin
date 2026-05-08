import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOnboarding, ServiceItem } from "@/contexts/OnboardingContext";
import type { ServiceTemplate } from "@/data/serviceTemplates";

interface Props {
  template: ServiceTemplate | null;
  onClose: () => void;
}

// Display the first ("Application") module as "Issuance" — it's the locked default.
function normalizeModules(template: ServiceTemplate): string[] {
  const [first, ...rest] = template.modules;
  const firstLabel = first ? "Issuance" : "Issuance";
  return [firstLabel, ...rest.filter((m) => m.toLowerCase() !== "application")];
}

const UseTemplateDialog: React.FC<Props> = ({ template, onClose }) => {
  const navigate = useNavigate();
  const { addService, state } = useOnboarding();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(template?.name ?? "");
  const allModules = useMemo(() => (template ? normalizeModules(template) : []), [template]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (!template) return;
    setStep(1);
    setName(template.name);
    const init: Record<string, boolean> = {};
    normalizeModules(template).forEach((m, i) => {
      // Issuance always on; Renewal default on; others off
      if (i === 0) init[m] = true;
      else if (m.toLowerCase() === "renewal") init[m] = true;
      else init[m] = false;
    });
    setSelected(init);
  }, [template]);

  if (!template) return null;

  const trimmed = name.trim();
  const duplicate = state.services.some(
    (s) => s.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  const nameInvalid = trimmed.length === 0 || duplicate;

  const handleCreate = () => {
    const issuance = allModules[0];
    const picked = [issuance, ...allModules.slice(1).filter((m) => selected[m])];
    const newService: ServiceItem = {
      id: `${template.id}-${Date.now().toString(36)}`,
      name: trimmed,
      templateId: template.id,
      status: "draft",
      customModules: picked,
      isPublished: false,
      isLive: false,
      deployment: { availabilityScope: "entire_state", selectedItems: [] },
      teamMembers: [],
      authMethod: "email",
    };
    addService(newService);
    onClose();
    navigate(`/service/${newService.id}/configure`);
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Name your service" : "Choose modules"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? `Based on the ${template.name} template. You can rename this later.`
              : "Pick the flows you want to include. You can change these from the configuration screen."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-2">
            <Label htmlFor="svc-name">Service name</Label>
            <Input
              id="svc-name"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Business License"
            />
            {duplicate && (
              <p className="text-xs text-destructive">A service with this name already exists.</p>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {allModules.map((m, i) => {
              const isIssuance = i === 0;
              return (
                <label
                  key={m}
                  className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 ${
                    isIssuance ? "bg-muted/40" : "hover:bg-muted/30 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={!!selected[m] || isIssuance}
                      disabled={isIssuance}
                      onCheckedChange={(v) =>
                        setSelected((prev) => ({ ...prev, [m]: !!v }))
                      }
                    />
                    <span className="text-sm font-medium text-foreground">{m}</span>
                  </div>
                  {isIssuance && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <Lock className="h-3 w-3" /> Default
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {step === 2 && (
            <Button variant="ghost" onClick={() => setStep(1)} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={nameInvalid}
              className="gap-1"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleCreate} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Create draft
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UseTemplateDialog;