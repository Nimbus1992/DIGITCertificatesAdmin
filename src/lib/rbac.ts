import { useOnboarding, UserRole, OnboardingState, ServiceItem } from "@/contexts/OnboardingContext";

export type Permission =
  | "services.viewAll"
  | "services.activate"
  | "services.assignOwners"
  | "services.configure"
  | "services.goLive"
  | "org.manage"
  | "users.manage"
  | "branding.manage"
  | "audit.view"
  | "setup.manage";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "services.viewAll",
    "services.activate",
    "services.assignOwners",
    "services.configure",
    "services.goLive",
    "org.manage",
    "users.manage",
    "branding.manage",
    "audit.view",
    "setup.manage",
  ],
  service_owner: [
    "services.configure",
    "services.goLive",
    "branding.manage",
  ],
};

export function getRole(state: OnboardingState): UserRole {
  return state.currentUserRole ?? "super_admin";
}

export function can(state: OnboardingState, permission: Permission): boolean {
  return ROLE_PERMISSIONS[getRole(state)].includes(permission);
}

export function useCan(permission: Permission): boolean {
  const { state } = useOnboarding();
  return can(state, permission);
}

export function useRole(): UserRole {
  const { state } = useOnboarding();
  return getRole(state);
}

/** Services visible to the current user. Admins see all; owners see only those they're assigned to. */
export function scopedServices(state: OnboardingState): ServiceItem[] {
  const services = state.services ?? [];
  if (can(state, "services.viewAll")) return services;
  const owners = state.serviceOwners ?? [];
  // Without real auth we treat any service that has any owner assignment as visible to the owner persona.
  const assignedIds = new Set(owners.map((o) => o.serviceId));
  return services.filter((s) => assignedIds.has(s.id));
}

export function useScopedServices(): ServiceItem[] {
  const { state } = useOnboarding();
  return scopedServices(state);
}

/** Can the current user access a specific service? */
export function hasServiceAccess(state: OnboardingState, serviceId: string): boolean {
  if (can(state, "services.viewAll")) return true;
  return (state.serviceOwners ?? []).some((o) => o.serviceId === serviceId);
}
