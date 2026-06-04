import React from "react";
import { Navigate } from "react-router-dom";
import { useOnboarding, UserRole } from "@/contexts/OnboardingContext";

interface Props {
  role: UserRole;
  children: React.ReactNode;
}

const RoleGate: React.FC<Props> = ({ role, children }) => {
  const { state } = useOnboarding();
  const current = state.currentUserRole ?? "super_admin";
  if (current !== role) {
    return <Navigate to={current === "service_owner" ? "/owner" : "/dashboard"} replace />;
  }
  return <>{children}</>;
};

export default RoleGate;
