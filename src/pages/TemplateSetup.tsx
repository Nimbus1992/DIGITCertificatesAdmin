import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import SetupShell, { type SetupStepKey } from "@/components/template-setup/SetupShell";
import Step1Identity from "@/components/template-setup/Step1Identity";
import Step2Modules from "@/components/template-setup/Step2Modules";
import Step3Structure from "@/components/template-setup/Step3Structure";
import Step4RenewalPolicy, {
  type RenewalPolicyState,
} from "@/components/template-setup/Step4RenewalPolicy";
import Step5WorkflowScope from "@/components/template-setup/Step5WorkflowScope";
import Step4Initializing from "@/components/template-setup/Step4Initializing";
import { allTemplates } from "@/data/serviceTemplates";
import { useOnboarding, type ServiceItem, type WorkflowScope } from "@/contexts/OnboardingContext";

const TemplateSetup: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [params] = useSearchParams();
  const serviceId = params.get("serviceId");
  const navigate = useNavigate();
  const { state, addService, updateService } = useOnboarding();

  const template = useMemo(
    () => allTemplates.find((t) => t.id === templateId),
    [templateId],
  );

  const existing = useMemo(
    () => (serviceId ? state.services.find((s) => s.id === serviceId) : undefined),
    [serviceId, state.services],
  );

  useEffect(() => {
    if (!template || template.comingSoon) {
      navigate("/templates", { replace: true });
    }
  }, [template, navigate]);

  const [step, setStep] = useState<SetupStepKey>("identity");
  const [name, setName] = useState(existing?.name ?? template?.name ?? "");
  const [renewalEnabled, setRenewalEnabled] = useState(
    existing ? (existing.customModules ?? []).includes("Renewal") : true,
  );
  const [hasCategories, setHasCategories] = useState<boolean | null>(
    existing?.templateSetup ? existing.templateSetup.hasCategories : null,
  );
  const [categoriesFile, setCategoriesFile] = useState<File | null>(null);
  const [hasSubcategories, setHasSubcategories] = useState<boolean | null>(
    existing?.templateSetup ? existing.templateSetup.hasSubcategories : null,
  );
  const [subcategoriesFile, setSubcategoriesFile] = useState<File | null>(null);
  const [categoriesList, setCategoriesList] = useState<string[]>(
    existing?.templateSetup?.categoriesList ?? [],
  );
  const [subcategoriesList, setSubcategoriesList] = useState<
    { name: string; parent: string }[]
  >(existing?.templateSetup?.subcategoriesList ?? []);
  const [renewalPolicy, setRenewalPolicy] = useState<RenewalPolicyState>(
    existing?.renewalPolicy ?? {
      mode: "global",
      globalMonths: 12,
      perCategory: {},
      perSubcategory: {},
    },
  );
  const [workflowScope, setWorkflowScope] = useState<WorkflowScope>(
    existing?.workflowScope ?? "shared",
  );

  if (!template) return null;

  const trimmed = name.trim();
  const duplicate = state.services.some(
    (s) =>
      s.id !== existing?.id &&
      s.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );

  const visibleSteps: SetupStepKey[] = useMemo(() => {
    const base: SetupStepKey[] = ["identity", "structure", "modules"];
    if (renewalEnabled) base.push("renewal");
    if (hasCategories === true) base.push("workflow_scope");
    base.push("initialize");
    return base;
  }, [renewalEnabled, hasCategories]);

  const handleBack = () => {
    if (step === "identity") navigate("/templates");
    else if (step === "structure") setStep("identity");
    else if (step === "modules") setStep("structure");
    else if (step === "renewal") setStep("modules");
    else if (step === "workflow_scope") setStep(renewalEnabled ? "renewal" : "modules");
    // initializing has no back
  };

  const goAfterModules = () => {
    if (renewalEnabled) setStep("renewal");
    else if (hasCategories === true) setStep("workflow_scope");
    else setStep("initialize");
  };

  const goAfterRenewal = () => {
    if (hasCategories === true) setStep("workflow_scope");
    else setStep("initialize");
  };

  const finalize = () => {
    const customModules = ["Issuance", ...(renewalEnabled ? ["Renewal"] : [])];
    const templateSetup = {
      hasCategories: hasCategories === true,
      hasSubcategories: hasSubcategories === true,
      categoriesFileName: categoriesFile?.name,
      subcategoriesFileName: subcategoriesFile?.name,
      categoriesList,
      subcategoriesList,
    };
    const patch = {
      name: trimmed,
      customModules,
      templateSetup,
      renewalPolicy: renewalEnabled ? renewalPolicy : undefined,
      workflowScope: hasCategories === true ? workflowScope : ("shared" as WorkflowScope),
    };

    if (existing) {
      updateService(existing.id, patch);
      navigate(`/templates?recent=${encodeURIComponent(existing.id)}`);
      return;
    }

    const newService: ServiceItem = {
      id: `${template.id}-${Date.now().toString(36)}`,
      templateId: template.id,
      status: "draft",
      isPublished: false,
      isLive: false,
      deployment: { availabilityScope: "entire_state", selectedItems: [] },
      teamMembers: [],
      authMethod: "email",
      ...patch,
    };
    addService(newService);
    navigate(`/templates?recent=${encodeURIComponent(newService.id)}`);
  };

  return (
    <SetupShell
      current={step}
      onBack={step === "initialize" ? undefined : handleBack}
      backLabel={step === "identity" ? "Back to services" : "Back"}
      visibleSteps={visibleSteps}
    >
      {step === "identity" && (
        <Step1Identity
          templateName={template.name}
          value={name}
          onChange={setName}
          duplicate={duplicate}
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
          setCategoriesList={setCategoriesList}
          setSubcategoriesList={setSubcategoriesList}
          onContinue={() => setStep("modules")}
        />
      )}
      {step === "modules" && (
        <Step2Modules
          renewalEnabled={renewalEnabled}
          onRenewalChange={setRenewalEnabled}
          onContinue={goAfterModules}
        />
      )}
      {step === "renewal" && (
        <Step4RenewalPolicy
          categories={categoriesList}
          subcategories={subcategoriesList}
          policy={renewalPolicy}
          setPolicy={setRenewalPolicy}
          onContinue={goAfterRenewal}
        />
      )}
      {step === "workflow_scope" && (
        <Step5WorkflowScope
          value={workflowScope}
          onChange={setWorkflowScope}
          categoryCount={categoriesList.length}
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
