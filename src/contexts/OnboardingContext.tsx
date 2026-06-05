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

export interface BrandingConfig {
  presetId?: string;
  primaryColor: string;
  accentColor?: string;
  font: string;
  buttonRadius: string;
  cardRadius: string;
  logoDataUrl?: string;
  portalName: string;
  copyright: string;
}

export interface TemplateSetup {
  hasCategories: boolean;
  hasSubcategories: boolean;
  categoriesFileName?: string;
  subcategoriesFileName?: string;
  categoriesList?: string[];
  subcategoriesList?: { name: string; parent: string }[];
}

export type RenewalMode = "global" | "by_category" | "by_subcategory";

export interface RenewalPolicy {
  mode: RenewalMode;
  globalMonths: number;
  perCategory: Record<string, number>;
  perSubcategory: Record<string, number>;
}

export type WorkflowScope = "shared" | "by_category" | "by_subcategory";

export type ServiceUserRole =
  | "service_owner"
  | "document_verifier"
  | "field_inspector"
  | "approver"
  | "counter_operator";

export interface ServiceUser {
  id: string;
  email: string;
  name?: string;
  role: ServiceUserRole;
  status: "Invited" | "Active";
  invitedAt: number;
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
  branding?: BrandingConfig;
  templateSetup?: TemplateSetup;
  renewalPolicy?: RenewalPolicy;
  workflowScope?: WorkflowScope;
  /** Emails of service owners with access to this service. */
  assignedOwners?: string[];
  /** Service-scoped users (verifiers, inspectors, approvers, counter operators, additional owners). */
  serviceUsers?: ServiceUser[];
  createdAt?: number;
  updatedAt?: number;
}

export interface OnboardingState {
  currentStep: number;
  email: string;
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
  isActivated: boolean;
  isLoggedIn: boolean;
  isPasswordReset: boolean;
  isPublished: boolean;
  isLive: boolean;
  services: ServiceItem[];
  activeServiceId: string;
  platformBranding?: BrandingConfig;
}

const initialState: OnboardingState = {
  currentStep: 0,
  email: "",
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
  isActivated: false,
  isLoggedIn: false,
  isPasswordReset: false,
  isPublished: false,
  isLive: false,
  services: [],
  activeServiceId: "",
  platformBranding: undefined,
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
  deleteService: (id: string) => void;
  setActiveService: (id: string) => void;
  getActiveService: () => ServiceItem | undefined;
  updateActiveServiceBranding: (branding: BrandingConfig) => void;
  updatePlatformBranding: (branding: BrandingConfig) => void;
  setServiceOwners: (serviceId: string, owners: string[]) => void;
  addServiceUser: (serviceId: string, user: Omit<ServiceUser, "id" | "invitedAt" | "status">) => void;
  removeServiceUser: (serviceId: string, userId: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = "lnp-onboarding-state";

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = { ...initialState, ...JSON.parse(saved) };
        // Legacy migration: serviceName -> services[]
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
        // Migration: backfill assignedOwners + timestamps for existing services
        // and seed legacy owner personas onto services that match their template.
        const TEMPLATE_OWNER_HINTS: Record<string, string[]> = {
          "trade-license": ["trade.owner@egov.demo"],
          "building-permits": ["building.owner@egov.demo"],
        };
        if (Array.isArray(parsed.services)) {
          parsed.services = parsed.services.map((s: ServiceItem) => {
            const hints = TEMPLATE_OWNER_HINTS[s.templateId] || [];
            const existing = s.assignedOwners ?? [];
            const merged = Array.from(new Set([...existing, ...hints]));
            return {
              ...s,
              assignedOwners: merged,
              serviceUsers: s.serviceUsers ?? [],
              createdAt: s.createdAt ?? Date.now(),
              updatedAt: s.updatedAt ?? Date.now(),
            };
          });
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
    const now = Date.now();
    setState((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          ...service,
          assignedOwners: service.assignedOwners ?? [],
          serviceUsers: service.serviceUsers ?? [],
          createdAt: service.createdAt ?? now,
          updatedAt: service.updatedAt ?? now,
        },
      ],
      activeServiceId: service.id,
    }));
  }, []);

  const updateService = useCallback((id: string, updates: Partial<ServiceItem>) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s)),
    }));
  }, []);

  const deleteService = useCallback((id: string) => {
    // Best-effort cleanup of per-service localStorage entries (formbuilder:{id}:..., {prefix}:{id}:{module})
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k.includes(`:${id}:`) || k.endsWith(`:${id}`)) toRemove.push(k);
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore storage errors
    }
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
      activeServiceId: prev.activeServiceId === id ? "" : prev.activeServiceId,
    }));
  }, []);

  const setActiveService = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeServiceId: id }));
  }, []);

  const getActiveService = useCallback(() => {
    return state.services.find((s) => s.id === state.activeServiceId);
  }, [state.services, state.activeServiceId]);

  const updateActiveServiceBranding = useCallback((branding: BrandingConfig) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === prev.activeServiceId ? { ...s, branding } : s
      ),
    }));
  }, []);

  const updatePlatformBranding = useCallback((branding: BrandingConfig) => {
    setState((prev) => ({ ...prev, platformBranding: branding }));
  }, []);

  const setServiceOwners = useCallback((serviceId: string, owners: string[]) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === serviceId
          ? { ...s, assignedOwners: Array.from(new Set(owners.map((e) => e.trim().toLowerCase()).filter(Boolean))), updatedAt: Date.now() }
          : s,
      ),
    }));
  }, []);

  const addServiceUser = useCallback(
    (serviceId: string, user: Omit<ServiceUser, "id" | "invitedAt" | "status">) => {
      setState((prev) => ({
        ...prev,
        services: prev.services.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                serviceUsers: [
                  ...(s.serviceUsers ?? []),
                  {
                    ...user,
                    email: user.email.trim().toLowerCase(),
                    id: `su_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                    invitedAt: Date.now(),
                    status: "Invited",
                  },
                ],
                updatedAt: Date.now(),
              }
            : s,
        ),
      }));
    },
    [],
  );

  const removeServiceUser = useCallback((serviceId: string, userId: string) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === serviceId
          ? { ...s, serviceUsers: (s.serviceUsers ?? []).filter((u) => u.id !== userId), updatedAt: Date.now() }
          : s,
      ),
    }));
  }, []);

  return (
    <OnboardingContext.Provider value={{
      state, updateState, nextStep, prevStep, goToStep, resetOnboarding,
      addService, updateService, deleteService, setActiveService, getActiveService,
      updateActiveServiceBranding, updatePlatformBranding,
      setServiceOwners, addServiceUser, removeServiceUser,
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
