import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { PERSONA_SEEDS, PersonaRole } from "@/data/personaSeeds";

export interface InvitedUser {
  id: string;
  email: string;
  role: "administrator" | "service_owner";
  assignedTemplate?: string;
  status: "Invited";
}

export interface PersonaState {
  email: string;
  role: PersonaRole | null;
  name: string;
  assignedTemplates: string[];
  hasChangedPassword: boolean;
  hasCompletedOnboarding: boolean;
  invitedUsers: InvitedUser[];
}

const initial: PersonaState = {
  email: "",
  role: null,
  name: "",
  assignedTemplates: [],
  hasChangedPassword: false,
  hasCompletedOnboarding: false,
  invitedUsers: [],
};

const KEY = "persona:v1";
const SESSION_KEY = "persona:session";

const clearDrafts = () => {
  try {
    const raw = localStorage.getItem("lnp-onboarding-state");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const services = Array.isArray(parsed.services) ? parsed.services : [];
    const removedIds: string[] = services
      .filter((s: any) => !(s.isLive || s.status === "live"))
      .map((s: any) => s.id);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (removedIds.some((id) => k.includes(`:${id}:`) || k.endsWith(`:${id}`))) {
        localStorage.removeItem(k);
      }
    }
    parsed.services = services.filter((s: any) => s.isLive || s.status === "live");
    parsed.activeServiceId = "";
    localStorage.setItem("lnp-onboarding-state", JSON.stringify(parsed));
  } catch {}
};

// Run once per browser session (tab) BEFORE any provider mounts.
// Guarantees every fresh login/reload starts with zero pre-existing drafts,
// even when the persona was hydrated from localStorage and signIn() is skipped.
if (typeof window !== "undefined") {
  try {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      clearDrafts();
      sessionStorage.setItem(SESSION_KEY, String(Date.now()));
    }
  } catch {}
}

interface PersonaContextType {
  persona: PersonaState;
  signIn: (email: string) => void;
  switchPersona: (email: string) => void;
  signOut: () => void;
  update: (u: Partial<PersonaState>) => void;
  addInvitedUser: (u: Omit<InvitedUser, "id" | "status">) => void;
  removeInvitedUser: (id: string) => void;
}

const Ctx = createContext<PersonaContextType | undefined>(undefined);

export const PersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<PersonaState>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...initial, ...JSON.parse(raw) };
    } catch {}
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(persona));
  }, [persona]);

  const signIn = useCallback((email: string) => {
    // Treat this as a fresh session: drop the marker, purge drafts, re-set marker.
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    clearDrafts();
    try {
      sessionStorage.setItem(SESSION_KEY, String(Date.now()));
    } catch {}
    const seed = PERSONA_SEEDS.find((p) => p.email.toLowerCase() === email.toLowerCase());
    const base: PersonaState = seed
      ? {
          ...initial,
          email: seed.email,
          role: seed.role,
          name: seed.name,
          assignedTemplates: seed.assignedTemplates,
        }
      : {
          ...initial,
          email,
          role: "administrator",
          name: email.split("@")[0],
          assignedTemplates: [],
        };
    localStorage.setItem(KEY, JSON.stringify(base));
    setPersona(base);
    // Reload so OnboardingProvider re-reads cleaned storage as a fresh session.
    setTimeout(() => window.location.reload(), 0);
  }, []);

  const switchPersona = useCallback((email: string) => {
    const seed = PERSONA_SEEDS.find((p) => p.email.toLowerCase() === email.toLowerCase());
    const base: PersonaState = seed
      ? {
          ...initial,
          email: seed.email,
          role: seed.role,
          name: seed.name,
          assignedTemplates: seed.assignedTemplates,
          hasChangedPassword: true,
          hasCompletedOnboarding: true,
        }
      : {
          ...initial,
          email,
          role: "administrator",
          name: email.split("@")[0],
          assignedTemplates: [],
          hasChangedPassword: true,
          hasCompletedOnboarding: true,
        };
    localStorage.setItem(KEY, JSON.stringify(base));
    setPersona(base);
    setTimeout(() => window.location.reload(), 0);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    setPersona(initial);
  }, []);

  const update = useCallback((u: Partial<PersonaState>) => {
    setPersona((p) => ({ ...p, ...u }));
  }, []);

  const addInvitedUser = useCallback((u: Omit<InvitedUser, "id" | "status">) => {
    setPersona((p) => ({
      ...p,
      invitedUsers: [
        ...p.invitedUsers,
        { ...u, id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, status: "Invited" },
      ],
    }));
  }, []);

  const removeInvitedUser = useCallback((id: string) => {
    setPersona((p) => ({ ...p, invitedUsers: p.invitedUsers.filter((x) => x.id !== id) }));
  }, []);

  return (
    <Ctx.Provider value={{ persona, signIn, switchPersona, signOut, update, addInvitedUser, removeInvitedUser }}>
      {children}
    </Ctx.Provider>
  );
};

export const usePersona = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePersona must be inside PersonaProvider");
  return c;
};
