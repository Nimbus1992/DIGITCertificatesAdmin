import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePersona } from "@/contexts/PersonaContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import PersonaLogin from "@/components/onboarding/PersonaLogin";
import ChangePassword from "@/components/onboarding/ChangePassword";
import ConfirmOrganization from "@/components/onboarding/ConfirmOrganization";
import InviteTeam from "@/components/onboarding/InviteTeam";
import OnboardingComplete from "@/components/onboarding/OnboardingComplete";

type Step = "password" | "org" | "invite" | "done";

const Onboarding: React.FC = () => {
  const { persona, update } = usePersona();
  const { updateState } = useOnboarding();
  const navigate = useNavigate();
  const [step, setStep] = React.useState<Step>("password");

  // Redirect if already onboarded
  useEffect(() => {
    if (!persona.role) return;
    if (persona.hasCompletedOnboarding) {
      if (persona.role === "service_owner") navigate("/services", { replace: true });
      else navigate("/dashboard", { replace: true });
    }
  }, [persona.role, persona.hasCompletedOnboarding, navigate]);

  if (!persona.role) {
    return <PersonaLogin />;
  }

  // Service Owner: change password only, then to /services
  if (persona.role === "service_owner") {
    return (
      <ChangePassword
        step="Welcome · Set your password"
        onComplete={() => {
          update({ hasChangedPassword: true, hasCompletedOnboarding: true });
          navigate("/services");
        }}
      />
    );
  }

  // Super Admin flow
  if (step === "password") {
    return (
      <ChangePassword
        step="Step 1 of 4 · Change Password"
        onComplete={() => {
          update({ hasChangedPassword: true });
          updateState({ isLoggedIn: true, isPasswordReset: true, isActivated: true });
          setStep("org");
        }}
      />
    );
  }

  if (step === "org") {
    return <ConfirmOrganization onComplete={() => setStep("invite")} />;
  }

  if (step === "invite") {
    return <InviteTeam onBack={() => setStep("org")} onComplete={() => setStep("done")} />;
  }

  return (
    <OnboardingComplete
      onComplete={() => {
        update({ hasCompletedOnboarding: true });
        updateState({ isOnboardingComplete: true });
        navigate("/dashboard");
      }}
    />
  );
};

export default Onboarding;
