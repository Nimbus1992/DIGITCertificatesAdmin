import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { allTemplates } from "@/data/serviceTemplates";
import TemplateIntroduction from "@/components/onboarding/TemplateIntroduction";
import NotFound from "./NotFound";

const TemplateDetailsPage: React.FC = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const template = allTemplates.find((t) => t.id === templateId);
  if (!template) return <NotFound />;

  return (
    <TemplateIntroduction
      template={template}
      onBack={() => navigate("/templates")}
      onUseTemplate={() => navigate(`/templates/${template.id}/activate`)}
      onPreview={() => navigate(`/templates/${template.id}/preview`)}
    />
  );
};

export default TemplateDetailsPage;
