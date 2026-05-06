import React from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import ActivateAccount from "@/components/onboarding/ActivateAccount";
import ConfirmOrganization from "@/components/onboarding/ConfirmOrganization";

const Onboarding: React.FC = () => {
  const { state, updateState } = useOnboarding();
  const navigate = useNavigate();

  if (!state.isActivated) {
    return (
      <ActivateAccount
        onComplete={() => updateState({ isActivated: true, currentStep: 1 })}
      />
    );
  }

  return (
    <ConfirmOrganization
      onComplete={() => {
        updateState({ isOnboardingComplete: true });
        navigate("/dashboard");
      }}
    />
  );
};

export default Onboarding;
