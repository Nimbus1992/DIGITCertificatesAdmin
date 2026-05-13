import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SetupShell, { type SetupStepKey } from "@/components/template-setup/SetupShell";
import Step1Identity from "@/components/template-setup/Step1Identity";
import Step2Modules from "@/components/template-setup/Step2Modules";
import Step3Structure from "@/components/template-setup/Step3Structure";
import Step4Initializing from "@/components/template-setup/Step4Initializing";
import { allTemplates } from "@/data/serviceTemplates";
import { useOnboarding, type ServiceItem } from "@/contexts/OnboardingContext";

const TemplateSetup: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { state, addService } = useOnboarding();

  const template = useMemo(
    () => allTemplates.find((t) => t.id === templateId),
    [templateId],
  );

  useEffect(() => {
    if (!template || template.comingSoon) {
      navigate("/services", { replace: true });
    }
  }, [template, navigate]);

  const [step, setStep] = useState<SetupStepKey>("identity");
  const [name, setName] = useState(template?.name ?? "");
  const [renewalEnabled, setRenewalEnabled] = useState(true);
  const [hasCategories, setHasCategories] = useState<boolean | null>(null);
  const [categoriesFile, setCategoriesFile] = useState<File | null>(null);
  const [hasSubcategories, setHasSubcategories] = useState<boolean | null>(null);
  const [subcategoriesFile, setSubcategoriesFile] = useState<File | null>(null);

  if (!template) return null;

  const trimmed = name.trim();
  const duplicate = state.services.some(
    (s) => s.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );

  const handleBack = () => {
    if (step === "identity") navigate("/services");
    else if (step === "modules") setStep("identity");
    else if (step === "structure") setStep("modules");
    // initializing has no back
  };

  const finalize = () => {
    const customModules = ["Issuance", ...(renewalEnabled ? ["Renewal"] : [])];
    const newService: ServiceItem = {
      id: `${template.id}-${Date.now().toString(36)}`,
      name: trimmed,
      templateId: template.id,
      status: "draft",
      customModules,
      isPublished: false,
      isLive: false,
      deployment: { availabilityScope: "entire_state", selectedItems: [] },
      teamMembers: [],
      authMethod: "email",
      templateSetup: {
        hasCategories: hasCategories === true,
        hasSubcategories: hasSubcategories === true,
        categoriesFileName: categoriesFile?.name,
        subcategoriesFileName: subcategoriesFile?.name,
      },
    };
    addService(newService);
    navigate(`/service/${newService.id}/configure`);
  };

  return (
    <SetupShell
      current={step}
      onBack={step === "initialize" ? undefined : handleBack}
      backLabel={step === "identity" ? "Back to templates" : "Back"}
    >
      {step === "identity" && (
        <Step1Identity
          templateName={template.name}
          value={name}
          onChange={setName}
          duplicate={duplicate}
          onContinue={() => setStep("modules")}
        />
      )}
      {step === "modules" && (
        <Step2Modules
          renewalEnabled={renewalEnabled}
          onRenewalChange={setRenewalEnabled}
          onContinue={() => setStep("structure")}
        />
      )}
      {step === "structure" && (
        <Step3Structure
          hasCategories={hasCategories}
          setHasCategories={setHasCategories}
          categoriesFile={categoriesFile}
          setCategoriesFile={setCategoriesFile}
          hasSubcategories={hasSubcategories}
          setHasSubcategories={setHasSubcategories}
          subcategoriesFile={subcategoriesFile}
          setSubcategoriesFile={setSubcategoriesFile}
          onContinue={() => setStep("initialize")}
        />
      )}
      {step === "initialize" && (
        <Step4Initializing
          serviceName={trimmed}
          renewalEnabled={renewalEnabled}
          hasCategories={hasCategories === true}
          onComplete={finalize}
        />
      )}
    </SetupShell>
  );
};

export default TemplateSetup;