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

interface PersonaContextType {
  persona: PersonaState;
  signIn: (email: string) => void;
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
    const seed = PERSONA_SEEDS.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (seed) {
      setPersona((prev) => ({
        ...initial,
        ...prev,
        email: seed.email,
        role: seed.role,
        name: seed.name,
        assignedTemplates: seed.assignedTemplates,
      }));
    } else {
      // Unknown emails default to Administrator (safer than service_owner for demos)
      setPersona({
        ...initial,
        email,
        role: "administrator",
        name: email.split("@")[0],
        assignedTemplates: [],
      });
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY);
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
    <Ctx.Provider value={{ persona, signIn, signOut, update, addInvitedUser, removeInvitedUser }}>
      {children}
    </Ctx.Provider>
  );
};

export const usePersona = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePersona must be inside PersonaProvider");
  return c;
};
