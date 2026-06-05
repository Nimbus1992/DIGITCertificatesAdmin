import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TemplateIntroduction from "@/components/onboarding/TemplateIntroduction";
import TemplateCard from "@/components/onboarding/TemplateCard";
import { allTemplates, type ServiceTemplate } from "@/data/serviceTemplates";
import { usePersona } from "@/contexts/PersonaContext";
import { TEMPLATE_NAME_TO_ID } from "@/data/personaSeeds";
import { Badge } from "@/components/ui/badge";

const Services: React.FC = () => {
  const navigate = useNavigate();
  const { persona } = usePersona();
  const [introTemplate, setIntroTemplate] = useState<ServiceTemplate | null>(null);

  const visibleTemplates = useMemo(() => {
    if (persona.role !== "service_owner") return allTemplates;
    const allowed = new Set(persona.assignedTemplates.map((n) => TEMPLATE_NAME_TO_ID[n]).filter(Boolean));
    const filtered = allTemplates.filter((t) => allowed.has(t.id));
    return filtered.length > 0 ? filtered : [];
  }, [persona]);

  const handleUse = (t: ServiceTemplate) => navigate(`/templates/${t.id}/setup`);
  const handlePreview = (t: ServiceTemplate) => navigate(`/service/${t.id}/preview`);

  if (introTemplate) {
    return (
      <TemplateIntroduction
        template={introTemplate}
        onUseTemplate={introTemplate.comingSoon ? undefined : () => handleUse(introTemplate)}
        onPreview={introTemplate.comingSoon ? undefined : () => handlePreview(introTemplate)}
        onBack={() => setIntroTemplate(null)}
      />
    );
  }

  const isServiceOwner = persona.role === "service_owner";

  return (
    <div className="p-6 max-w-xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            {isServiceOwner ? "Your Assigned Templates" : "Templates"}
          </h1>
          {isServiceOwner && (
            <Badge variant="outline" className="text-[10px]">Service Owner</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {isServiceOwner
            ? "These templates are assigned to you. Continue configuration and publish when ready."
            : "Choose a ready-to-use application template to get started quickly."}
        </p>
      </div>

      {visibleTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No templates have been assigned to you yet. Contact your administrator.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleTemplates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onSelect={t.comingSoon ? undefined : () => handleUse(t)}
              onPreview={t.comingSoon ? undefined : () => handlePreview(t)}
              onViewDetails={() => setIntroTemplate(t)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
