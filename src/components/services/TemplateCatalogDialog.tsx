import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { allTemplates, type ServiceTemplate } from "@/data/serviceTemplates";
import TemplateCard from "./TemplateCard";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onActivate: (t: ServiceTemplate) => void;
  onPreview: (t: ServiceTemplate) => void;
  onDetails: (t: ServiceTemplate) => void;
  usageByTemplate: Map<string, number>;
}

const TemplateCatalogDialog: React.FC<Props> = ({ open, onOpenChange, onActivate, onPreview, onDetails, usageByTemplate }) => {
  const ready = allTemplates.filter((t) => !t.comingSoon);
  const soon = allTemplates.filter((t) => t.comingSoon);

  const handleActivate = (t: ServiceTemplate) => {
    onOpenChange(false);
    onActivate(t);
  };
  const handlePreview = (t: ServiceTemplate) => {
    onOpenChange(false);
    onPreview(t);
  };
  const handleDetails = (t: ServiceTemplate) => {
    onOpenChange(false);
    onDetails(t);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-5 border-b border-border">
          <DialogTitle className="text-base">Create a new service</DialogTitle>
          <DialogDescription className="text-xs">
            Pick a template to get started. Each template can be used to create multiple services.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 py-5 space-y-8">
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Live on SaaS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ready.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  usedBy={usageByTemplate.get(t.id) ?? 0}
                  onPreview={() => handlePreview(t)}
                  onDetails={() => handleDetails(t)}
                  onActivate={() => handleActivate(t)}
                  variant="catalog"
                />
              ))}
            </div>
          </section>

          {soon.length > 0 && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Coming soon
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {soon.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    usedBy={usageByTemplate.get(t.id) ?? 0}
                    onPreview={() => handlePreview(t)}
                    onDetails={() => handleDetails(t)}
                    onActivate={() => handleActivate(t)}
                    variant="catalog"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateCatalogDialog;
