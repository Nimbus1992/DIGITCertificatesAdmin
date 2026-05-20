import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TemplateIntroduction from "@/components/onboarding/TemplateIntroduction";
import TemplateCard from "@/components/onboarding/TemplateCard";
import { allTemplates, type ServiceTemplate } from "@/data/serviceTemplates";

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [introTemplate, setIntroTemplate] = useState<ServiceTemplate | null>(null);

  const handleUse = (t: ServiceTemplate) => {
    navigate(`/templates/${t.id}/setup`);
  };

  const handlePreview = (t: ServiceTemplate) => {
    navigate(`/service/${t.id}/preview`);
  };

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

  return (
    <div className="p-6 max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a ready-to-use application template to get started quickly.
        </p>
      </div>

      <div className="space-y-4">
        {allTemplates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onSelect={t.comingSoon ? undefined : () => handleUse(t)}
            onPreview={t.comingSoon ? undefined : () => handlePreview(t)}
            onViewDetails={() => setIntroTemplate(t)}
          />
        ))}
      </div>
    </div>
  );
};

export default Services;
