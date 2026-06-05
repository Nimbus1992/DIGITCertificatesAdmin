import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { allTemplates, type ServiceTemplate } from "@/data/serviceTemplates";
import TemplateCard from "@/components/services/TemplateCard";
import { LayoutTemplate } from "lucide-react";
import { toast } from "sonner";

const TemplatesCatalog: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useOnboarding();

  const usageByTemplate = useMemo(() => {
    const m = new Map<string, number>();
    state.services.forEach((s) => m.set(s.templateId, (m.get(s.templateId) ?? 0) + 1));
    return m;
  }, [state.services]);

  const openDetails = (t: ServiceTemplate) => navigate(`/templates/${t.id}`);
  const openPreview = (t: ServiceTemplate) => {
    if (t.comingSoon) { toast.info(`${t.name} is coming soon`); return; }
    navigate(`/templates/${t.id}/preview`);
  };
  const activate = (t: ServiceTemplate) => {
    if (t.comingSoon) { toast.info(`${t.name} is coming soon`); return; }
    navigate(`/templates/${t.id}/activate`);
  };

  const live = allTemplates.filter((t) => !t.comingSoon);
  const soon = allTemplates.filter((t) => t.comingSoon);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-8 py-8 text-base">
        <header className="flex items-start justify-between gap-6 mb-8 pb-6 border-b border-border">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Available templates
              </h1>
              <span className="text-sm text-muted-foreground tabular-nums">{allTemplates.length}</span>
            </div>
            <p className="text-base text-muted-foreground mt-1 max-w-2xl">
              Browse ready-to-use service templates. Activate one to create a new service.
            </p>
          </div>
        </header>

        <div className="space-y-8">
          {live.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Live on SaaS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {live.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    usedBy={usageByTemplate.get(t.id) ?? 0}
                    onPreview={() => openPreview(t)}
                    onDetails={() => openDetails(t)}
                    onActivate={() => activate(t)}
                  />
                ))}
              </div>
            </section>
          )}

          {soon.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Coming soon
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {soon.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    usedBy={usageByTemplate.get(t.id) ?? 0}
                    onPreview={() => openPreview(t)}
                    onDetails={() => openDetails(t)}
                    onActivate={() => activate(t)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesCatalog;
