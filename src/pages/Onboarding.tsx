import React from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import SignIn from "@/components/onboarding/SignIn";
import ResetPassword from "@/components/onboarding/ResetPassword";
import ConfirmOrganization from "@/components/onboarding/ConfirmOrganization";

const Onboarding: React.FC = () => {
  const { state, updateState } = useOnboarding();
  const navigate = useNavigate();

  if (!state.isLoggedIn) {
    return <SignIn onComplete={() => updateState({ isLoggedIn: true })} />;
  }

  if (!state.isPasswordReset) {
    return (
      <ResetPassword
        onComplete={() => updateState({ isPasswordReset: true, isActivated: true, currentStep: 1 })}
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
