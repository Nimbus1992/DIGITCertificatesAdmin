import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Workflow, Bell, Receipt } from "lucide-react";
import type { ServiceTemplate } from "@/data/serviceTemplates";

interface Props {
  template: ServiceTemplate | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onActivate: (t: ServiceTemplate) => void;
}

const Section: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({
  icon: Icon,
  title,
  children,
}) => (
  <section>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
    </div>
    <div className="text-sm text-foreground">{children}</div>
  </section>
);

const TemplatePreviewSheet: React.FC<Props> = ({ template, open, onOpenChange, onActivate }) => {
  if (!template) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-base">{template.name} — preview</SheetTitle>
          <SheetDescription className="text-xs">
            What citizens and employees experience when this template is activated.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-6 py-5 space-y-6">
          {template.howItWorks && (
            <Section icon={Workflow} title="Citizen journey">
              <ol className="flex flex-wrap gap-2">
                {template.howItWorks.map((step, i) => (
                  <li
                    key={step.label}
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-muted text-xs"
                  >
                    <span className="text-[10px] text-muted-foreground tabular-nums">{i + 1}</span>
                    <step.icon className="h-3 w-3 text-muted-foreground" />
                    {step.label}
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {template.flows && (
            <Section icon={Workflow} title="Workflows">
              <div className="space-y-3">
                {template.flows.map((f) => (
                  <div key={f.name}>
                    <p className="text-xs font-medium text-foreground mb-1">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.steps.join(" → ")}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {template.forms && (
            <Section icon={FileText} title="Forms">
              <ul className="space-y-2">
                {template.forms.map((form) => (
                  <li key={form.name} className="text-xs">
                    <span className="font-medium text-foreground">{form.name}</span>
                    <span className="text-muted-foreground"> — {form.groups.join(", ")}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {template.notifications && template.notifications.length > 0 && (
            <Section icon={Bell} title="Notifications">
              <div className="flex flex-wrap gap-1.5">
                {template.notifications.map((n) => (
                  <span key={n} className="inline-flex h-6 px-2 items-center rounded text-[11px] bg-muted text-muted-foreground">
                    {n}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {template.payments && template.payments.length > 0 && (
            <Section icon={Receipt} title="Payments">
              <ul className="space-y-1.5">
                {template.payments.map((p) => (
                  <li key={p.stage} className="text-xs">
                    <span className="font-medium text-foreground">{p.stage}</span>
                    <span className="text-muted-foreground"> — {p.fees.join(", ")}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
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

export default TemplatePreviewSheet;
