import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { allTemplates, type ServiceTemplate } from "@/data/serviceTemplates";
import TemplateCard from "./TemplateCard";
import TemplatePreviewSheet from "./TemplatePreviewSheet";
import TemplateDetailsSheet from "./TemplateDetailsSheet";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onActivate: (t: ServiceTemplate) => void;
  usageByTemplate: Map<string, number>;
}

const TemplateCatalogDialog: React.FC<Props> = ({ open, onOpenChange, onActivate, usageByTemplate }) => {
  const [preview, setPreview] = useState<ServiceTemplate | null>(null);
  const [details, setDetails] = useState<ServiceTemplate | null>(null);

  const ready = allTemplates.filter((t) => !t.comingSoon);
  const soon = allTemplates.filter((t) => t.comingSoon);

  const handleActivate = (t: ServiceTemplate) => {
    onActivate(t);
    onOpenChange(false);
    setPreview(null);
    setDetails(null);
  };

  return (
    <>
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
                    onPreview={() => setPreview(t)}
                    onDetails={() => setDetails(t)}
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
                      onPreview={() => setPreview(t)}
                      onDetails={() => setDetails(t)}
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

      <TemplatePreviewSheet
        template={preview}
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
        onActivate={handleActivate}
      />
      <TemplateDetailsSheet
        template={details}
        open={!!details}
        onOpenChange={(o) => !o && setDetails(null)}
        onActivate={handleActivate}
      />
    </>
  );
};

export default TemplateCatalogDialog;
