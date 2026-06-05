import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { usePersona } from "@/contexts/PersonaContext";
import type { PersonaRole } from "@/data/personaSeeds";

interface Props {
  allow: PersonaRole[];
  redirect?: string;
}

const RoleGuard: React.FC<Props> = ({ allow, redirect = "/templates" }) => {
  const { persona } = usePersona();
  if (!persona.role) return <Navigate to="/onboarding" replace />;
  if (!allow.includes(persona.role)) return <Navigate to={redirect} replace />;
  return <Outlet />;
};

export default RoleGuard;
