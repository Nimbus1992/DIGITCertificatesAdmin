import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import RoleChoice from "@/components/onboarding/RoleChoice";
import SignIn from "@/components/onboarding/SignIn";
import ResetPassword from "@/components/onboarding/ResetPassword";
import ConfirmOrganization from "@/components/onboarding/ConfirmOrganization";

const Onboarding: React.FC = () => {
  const { state, updateState } = useOnboarding();
  const navigate = useNavigate();
  const orgMembers = state.orgMembers ?? [];
  const services = state.services ?? [];

  useEffect(() => {
    if (state.currentUserRole !== "service_owner" || !state.isLoggedIn) return;
    if (!state.isOnboardingComplete) {
      updateState({ isOnboardingComplete: true });
    }
    navigate("/home", { replace: true });
  }, [navigate, state.currentUserRole, state.isLoggedIn, state.isOnboardingComplete, updateState]);

  // 1. Choose role
  if (!state.currentUserRole) {
    return <RoleChoice onPick={() => { /* updateState happens inside */ }} />;
  }

  // 2. Sign in
  if (!state.isLoggedIn) {
    return <SignIn onComplete={() => updateState({ isLoggedIn: true })} />;
  }

  // Service Owner: skip the rest, go to their home
  if (state.currentUserRole === "service_owner") {
    return null;
  }

  // Super Admin: reset password + confirm org
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
        // If first-time, walk through the setup steps. Otherwise dashboard.
        if (orgMembers.length === 0 && services.length === 0) {
          navigate("/setup/invite-admins");
        } else {
          navigate("/home");
        }
      }}
    />
  );
};

export default Onboarding;
