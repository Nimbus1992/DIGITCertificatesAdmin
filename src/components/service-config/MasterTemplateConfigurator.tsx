import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, FileSpreadsheet, X, Lock, FileCheck, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding, type ServiceItem, type TemplateSetup } from "@/contexts/OnboardingContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceItem;
}

const YesNo: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div className="inline-flex rounded-md border border-input p-0.5 bg-background">
    {[
      { v: true, label: "Yes" },
      { v: false, label: "No" },
    ].map((o) => (
      <button
        key={o.label}
        type="button"
        onClick={() => onChange(o.v)}
        className={cn(
          "px-4 py-1 text-sm rounded-sm transition-colors",
          value === o.v ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const FilePicker: React.FC<{
  id: string;
  fileName?: string;
  onChange: (name?: string) => void;
}> = ({ id, fileName, onChange }) => (
  <div>
    {fileName ? (
      <div className="flex items-center gap-3 p-3 rounded-md border border-accent/30 bg-accent/5">
        <FileSpreadsheet className="h-4 w-4 text-accent shrink-0" />
        <div className="text-sm font-medium text-foreground truncate flex-1">{fileName}</div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange(undefined)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    ) : (
      <label
        htmlFor={id}
        className="flex items-center justify-center gap-2 p-4 rounded-md border-2 border-dashed border-input hover:border-accent/50 hover:bg-muted/30 cursor-pointer transition-colors text-sm"
      >
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-accent font-medium">Upload file</span>
        <span className="text-muted-foreground">CSV or Excel</span>
        <input
          id={id}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0]?.name)}
        />
      </label>
    )}
  </div>
);

const MasterTemplateConfigurator: React.FC<Props> = ({ open, onOpenChange, service }) => {
  const { updateService } = useOnboarding();

  const initialSetup: TemplateSetup = service.templateSetup ?? { hasCategories: false, hasSubcategories: false };
  const initialRenewal = service.customModules.includes("Renewal");

  const [name, setName] = useState(service.name);
  const [renewalEnabled, setRenewalEnabled] = useState(initialRenewal);
  const [setup, setSetup] = useState<TemplateSetup>(initialSetup);

  useEffect(() => {
    if (open) {
      setName(service.name);
      setRenewalEnabled(service.customModules.includes("Renewal"));
      setSetup(service.templateSetup ?? { hasCategories: false, hasSubcategories: false });
    }
  }, [open, service]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const customModules = ["Issuance", ...(renewalEnabled ? ["Renewal"] : [])];
    const cleanSetup: TemplateSetup = {
      hasCategories: setup.hasCategories,
      hasSubcategories: setup.hasCategories ? setup.hasSubcategories : false,
      categoriesFileName: setup.hasCategories ? setup.categoriesFileName : undefined,
      subcategoriesFileName: setup.hasCategories && setup.hasSubcategories ? setup.subcategoriesFileName : undefined,
    };
    updateService(service.id, { name: trimmed, customModules, templateSetup: cleanSetup });
    toast({ title: "Template setup updated", description: "Service architecture changes saved." });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Master Template Configuration</SheetTitle>
          <SheetDescription>
            Edit the foundational architecture and initialization settings of this service.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="svc-name">Service name</Label>
            <Input id="svc-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Modules */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Modules</h3>
              <p className="text-xs text-muted-foreground mt-0.5">System-supported journeys for this service.</p>
            </div>
            <div className="rounded-md border border-border divide-y">
              <div className="flex items-center gap-3 p-3 bg-muted/30">
                <FileCheck className="h-4 w-4 text-accent" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground flex items-center gap-2">
                    Issuance
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide bg-background border px-1.5 py-0.5 rounded text-muted-foreground">
                      <Lock className="h-3 w-3" /> Default
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Always enabled.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3">
                <RefreshCw className={cn("h-4 w-4", renewalEnabled ? "text-accent" : "text-muted-foreground")} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">Renewal</div>
                  <p className="text-xs text-muted-foreground">Allow citizens to renew existing licenses.</p>
                </div>
                <Switch checked={renewalEnabled} onCheckedChange={setRenewalEnabled} />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Structure</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Categories and subcategories for license classification.</p>
            </div>
            <div className="rounded-md border border-border divide-y">
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-foreground">Categories enabled</div>
                  <YesNo
                    value={setup.hasCategories}
                    onChange={(v) =>
                      setSetup((s) => ({
                        ...s,
                        hasCategories: v,
                        hasSubcategories: v ? s.hasSubcategories : false,
                      }))
                    }
                  />
                </div>
                {setup.hasCategories && (
                  <FilePicker
                    id="cat-upload-edit"
                    fileName={setup.categoriesFileName}
                    onChange={(n) => setSetup((s) => ({ ...s, categoriesFileName: n }))}
                  />
                )}
              </div>
              {setup.hasCategories && (
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-medium text-foreground">Subcategories enabled</div>
                    <YesNo
                      value={setup.hasSubcategories}
                      onChange={(v) => setSetup((s) => ({ ...s, hasSubcategories: v }))}
                    />
                  </div>
                  {setup.hasSubcategories && (
                    <FilePicker
                      id="sub-upload-edit"
                      fileName={setup.subcategoriesFileName}
                      onChange={(n) => setSetup((s) => ({ ...s, subcategoriesFileName: n }))}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MasterTemplateConfigurator;