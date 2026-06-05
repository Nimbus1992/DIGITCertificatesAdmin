import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { ServiceTemplate } from "@/data/serviceTemplates";

interface Props {
  template: ServiceTemplate | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onActivate: (t: ServiceTemplate) => void;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[120px_1fr] gap-3 py-2.5 border-b border-border last:border-0">
    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
    <dd className="text-sm text-foreground">{children}</dd>
  </div>
);

const TemplateDetailsSheet: React.FC<Props> = ({ template, open, onOpenChange, onActivate }) => {
  if (!template) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-base">{template.name}</SheetTitle>
          <SheetDescription className="text-xs">{template.description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-6 py-2">
          <dl>
            {template.aka && template.aka.length > 0 && (
              <Row label="Also known as">
                <span className="text-xs text-muted-foreground">{template.aka.join(" · ")}</span>
              </Row>
            )}
            <Row label="Modules">
              <div className="flex flex-wrap gap-1.5">
                {template.modules.map((m) => (
                  <span key={m} className="inline-flex h-5 px-2 items-center rounded text-[11px] bg-muted text-muted-foreground">
                    {m}
                  </span>
                ))}
              </div>
            </Row>
            <Row label="Roles generated">
              <span className="text-xs text-muted-foreground">
                Service Owner, Document Verifier, Field Inspector, Approver, Counter Operator
              </span>
            </Row>
            <Row label="Workflow">
              <span className="text-xs text-muted-foreground">
                {template.flows?.map((f) => f.name).join(", ") || "Standard approval flow"}
              </span>
            </Row>
            <Row label="Configuration scope">
              <span className="text-xs text-muted-foreground">
                Forms, workflow, fees, documents, notifications, deployment
              </span>
            </Row>
            <Row label="Documents">
              <span className="text-xs text-muted-foreground">
                Application acknowledgement, demand notice, invoice, license certificate
              </span>
            </Row>
            <Row label="Setup time">
              <span className="text-xs text-muted-foreground">{template.estimatedSetupTime}</span>
            </Row>
          </dl>
        </div>

        <SheetFooter className="px-6 py-3 border-t border-border bg-muted/20">
          <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-9">
              Close
            </Button>
            <Button
              size="sm"
              disabled={template.comingSoon}
              onClick={() => onActivate(template)}
              className="h-9 px-4"
            >
              {template.comingSoon ? "Coming soon" : "Activate template"}
              {!template.comingSoon && <ArrowRight className="h-3.5 w-3.5 ml-1" />}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateDetailsSheet;
