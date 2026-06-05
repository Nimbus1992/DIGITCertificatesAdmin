import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePersona } from "@/contexts/PersonaContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import PersonaLogin from "@/components/onboarding/PersonaLogin";
import ChangePassword from "@/components/onboarding/ChangePassword";
import ConfirmOrganization from "@/components/onboarding/ConfirmOrganization";
import AddAdministrators from "@/components/onboarding/AddAdministrators";
import OnboardingComplete from "@/components/onboarding/OnboardingComplete";

type Step = "password" | "org" | "admins" | "done";

const Onboarding: React.FC = () => {
  const { persona, update } = usePersona();
  const { updateState } = useOnboarding();
  const navigate = useNavigate();
  const [step, setStep] = React.useState<Step>("password");

  useEffect(() => {
    if (!persona.role) return;
    if (persona.hasCompletedOnboarding) {
      navigate("/templates", { replace: true });
    }
  }, [persona.role, persona.hasCompletedOnboarding, navigate]);

  if (!persona.role) {
    return <PersonaLogin />;
  }

  // Administrator and Service Owner: password reset only, then Templates
  if (persona.role === "administrator" || persona.role === "service_owner") {
    return (
      <ChangePassword
        step={persona.role === "administrator" ? "Welcome · Set your password" : "Welcome · Set your password"}
        onComplete={() => {
          update({ hasChangedPassword: true, hasCompletedOnboarding: true });
          navigate("/templates");
        }}
      />
    );
  }

  // Super Admin flow
  if (step === "password") {
    return (
      <ChangePassword
        step="Step 1 of 3 · Change password"
        onComplete={() => {
          update({ hasChangedPassword: true });
          updateState({ isLoggedIn: true, isPasswordReset: true, isActivated: true });
          setStep("org");
        }}
      />
    );
  }

  if (step === "org") {
    return <ConfirmOrganization onComplete={() => setStep("admins")} />;
  }

  if (step === "admins") {
    return <AddAdministrators onBack={() => setStep("org")} onComplete={() => setStep("done")} />;
  }

  return (
    <OnboardingComplete
      onComplete={() => {
        update({ hasCompletedOnboarding: true });
        updateState({ isOnboardingComplete: true });
        navigate("/templates");
      }}
    />
  );
};

export default Onboarding;
