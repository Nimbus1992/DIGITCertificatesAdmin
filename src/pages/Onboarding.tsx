import React from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import ActivateAccount from "@/components/onboarding/ActivateAccount";
import ConfirmOrganization from "@/components/onboarding/ConfirmOrganization";

const Onboarding: React.FC = () => {
  const { state, updateState } = useOnboarding();
  const navigate = useNavigate();

  const steps = [
    <ActivateAccount key="activate" onComplete={() => updateState({ currentStep: 1 })} />,
    <ConfirmOrganization
      key="confirm"
      onComplete={() => {
        updateState({ isOnboardingComplete: true });
        navigate("/dashboard");
      }}
    />,
  ];

  return <>{steps[state.currentStep] || steps[0]}</>;
};

export default Onboarding;
