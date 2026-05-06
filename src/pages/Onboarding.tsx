import React from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import SSOSignIn from "@/components/onboarding/SSOSignIn";
import OrgSetup from "@/components/onboarding/OrgSetup";
import OrgSetupComplete from "@/components/onboarding/OrgSetupComplete";
import TemplateSelection from "@/components/onboarding/TemplateSelection";
import ServiceDetails from "@/components/onboarding/ServiceDetails";
import AutoSetup from "@/components/onboarding/AutoSetup";
import { useNavigate } from "react-router-dom";

const Onboarding: React.FC = () => {
  const { state, updateState } = useOnboarding();
  const navigate = useNavigate();

  const steps = [
    <WelcomeScreen key="welcome" onStart={() => updateState({ currentStep: 1 })} />,
    <SSOSignIn key="sso" onComplete={() => updateState({ currentStep: 2 })} onBack={() => updateState({ currentStep: 0 })} />,
    <OrgSetup key="org" onComplete={() => updateState({ currentStep: 3 })} onBack={() => updateState({ currentStep: 1 })} />,
    <OrgSetupComplete key="org-done" onComplete={() => { updateState({ isOnboardingComplete: true }); navigate("/dashboard"); }} />,
  ];

  return <>{steps[state.currentStep] || steps[0]}</>;
};

export default Onboarding;
