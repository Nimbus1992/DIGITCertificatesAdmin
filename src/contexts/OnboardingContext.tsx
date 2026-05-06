import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type ApprovalLevel = "single" | "two-level" | "multi-level";
export type AvailabilityScope = "entire_state" | "cities" | "districts" | "departments" | "custom";
export type AuthMethod = "email" | "sso" | "otp";
export type ServiceStatus = "draft" | "published" | "live";
export type AccessType = "self_registration" | "pre_registered";
export type RoleAuthMethod = "mobile_otp" | "email_otp" | "email_password";

export interface RoleUser {
  id: string;
  name: string;
  email: string;
}

export interface RoleAccessConfig {
  roleId: string;
  roleName: string;
  accessType: AccessType;
  authMethod: RoleAuthMethod;
  users: RoleUser[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operator" | "approver";
}

export interface ServiceItem {
  id: string;
  name: string;
  templateId: string;
  status: ServiceStatus;
  customModules: string[];
  isPublished: boolean;
  isLive: boolean;
  deployment: {
    availabilityScope: AvailabilityScope;
    selectedItems: string[];
  };
  teamMembers: TeamMember[];
  authMethod: AuthMethod;
  roleAccess?: RoleAccessConfig[];
  subdomain?: string;
}

export interface OnboardingState {
  currentStep: number;
  orgName: string;
  country: string;
  department: string;
  currency: string;
  currencySymbol: string;
  phoneCountryCode: string;
  language: string;
  logoUrl: string;
  themeColor: string;
  selectedTemplateId: string;
  serviceName: string;
  approvalLevel: ApprovalLevel;
  customModules: string[];
  serviceStatus: ServiceStatus;
  deployment: {
    availabilityScope: AvailabilityScope;
    selectedItems: string[];
  };
  teamMembers: TeamMember[];
  authMethod: AuthMethod;
  goLiveStep: number;
  isOnboardingComplete: boolean;
  isPublished: boolean;
  isLive: boolean;
  services: ServiceItem[];
  activeServiceId: string;
}

const initialState: OnboardingState = {
  currentStep: 0,
  orgName: "",
  country: "",
  department: "",
  currency: "",
  currencySymbol: "",
  phoneCountryCode: "",
  language: "English",
  logoUrl: "",
  themeColor: "",
  selectedTemplateId: "",
  serviceName: "",
  approvalLevel: "single",
  customModules: [],
  serviceStatus: "draft",
  deployment: {
    availabilityScope: "entire_state",
    selectedItems: [],
  },
  teamMembers: [],
  authMethod: "email",
  goLiveStep: 0,
  isOnboardingComplete: false,
  isPublished: false,
  isLive: false,
  services: [],
  activeServiceId: "",
};

interface OnboardingContextType {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetOnboarding: () => void;
  addService: (service: ServiceItem) => void;
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  setActiveService: (id: string) => void;
  getActiveService: () => ServiceItem | undefined;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = "lnp-onboarding-state";

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = { ...initialState, ...JSON.parse(saved) };
        // Migrate: if there's a serviceName but no applications array, create one
        if (parsed.serviceName && (!parsed.services || parsed.services.length === 0)) {
          const migratedService: ServiceItem = {
            id: parsed.selectedTemplateId || "application-1",
            name: parsed.serviceName,
            templateId: parsed.selectedTemplateId || "",
            status: parsed.serviceStatus || "draft",
            customModules: parsed.customModules || [],
            isPublished: parsed.isPublished || false,
            isLive: parsed.isLive || false,
            deployment: parsed.deployment || { availabilityScope: "entire_state", selectedItems: [] },
            teamMembers: parsed.teamMembers || [],
            authMethod: parsed.authMethod || "email",
          };
          parsed.services = [migratedService];
          parsed.activeServiceId = migratedService.id;
        }
        return parsed;
      }
      return initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  }, []);

  const addService = useCallback((service: ServiceItem) => {
    setState((prev) => ({
      ...prev,
      services: [...prev.services, service],
      activeServiceId: service.id,
    }));
  }, []);

  const updateService = useCallback((id: string, updates: Partial<ServiceItem>) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const setActiveService = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeServiceId: id }));
  }, []);

  const getActiveService = useCallback(() => {
    return state.services.find((s) => s.id === state.activeServiceId);
  }, [state.services, state.activeServiceId]);

  return (
    <OnboardingContext.Provider value={{
      state, updateState, nextStep, prevStep, goToStep, resetOnboarding,
      addService, updateService, setActiveService, getActiveService,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
};
