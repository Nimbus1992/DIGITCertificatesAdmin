import React, { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { allTemplates } from "@/data/serviceTemplates";
import { useOnboarding, type ServiceItem } from "@/contexts/OnboardingContext";
import NotFound from "./NotFound";

/**
 * Spins up an ephemeral service from a template, redirects to /service/:id/preview,
 * and cleans it up on unmount. The ephemeral service is hidden from dashboards
 * via the `isEphemeralPreview` flag.
 */
const TemplatePreview: React.FC = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { addService, deleteService } = useOnboarding();
  const createdIdRef = useRef<string | null>(null);

  const template = allTemplates.find((t) => t.id === templateId);

  useEffect(() => {
    if (!template) return;
    const id = `preview-${template.id}-${Date.now()}`;
    createdIdRef.current = id;
    const ephemeral: ServiceItem = {
      id,
      name: `${template.name} (Preview)`,
      templateId: template.id,
      status: "draft",
      customModules: template.modules ?? ["Issuance"],
      isPublished: false,
      isLive: false,
      deployment: { availabilityScope: "entire_state", selectedItems: [] },
      teamMembers: [],
      authMethod: "email",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isEphemeralPreview: true,
    };
    addService(ephemeral);
    navigate(`/service/${id}/preview`, { replace: true, state: { fromTemplatePreview: template.id } });

    return () => {
      if (createdIdRef.current) deleteService(createdIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id]);

  if (!template) return <NotFound />;
  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
      Loading preview…
    </div>
  );
};

export default TemplatePreview;
