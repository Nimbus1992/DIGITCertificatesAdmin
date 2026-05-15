import { useModuleState } from "./moduleStorage";
import { TRADE_ROLES } from "@/data/tradeLicenseTemplate";
import { RENEWAL_ROLES, isRenewalModule } from "@/data/renewalTemplate";

export interface ServiceRoleRecord {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  permissions: string[];
}

export const PERMISSIONS: { id: string; label: string }[] = [
  { id: "create_application", label: "Create Application" },
  { id: "edit_application",   label: "Edit Application" },
  { id: "view_application",   label: "View Application" },
  { id: "fill_checklist",     label: "Fill Checklist" },
  { id: "edit_checklist",     label: "Edit Checklist" },
  { id: "view_checklist",     label: "View Checklist" },
];

export const permissionLabel = (id: string) =>
  PERMISSIONS.find((p) => p.id === id)?.label ?? id;

export const buildDefaultRoles = (moduleName = "Issuance"): ServiceRoleRecord[] => {
  const src = isRenewalModule(moduleName) ? RENEWAL_ROLES : TRADE_ROLES;
  return src.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isDefault: r.isDefault,
    permissions: [...r.permissions],
  }));
};

/** Roles are shared across all modules of a service. */
export function useServiceRoles(serviceId: string, moduleName = "Issuance") {
  return useModuleState<ServiceRoleRecord[]>(
    "roles", serviceId, "__shared__", () => buildDefaultRoles(moduleName),
  );
}

/** Map legacy / camelCase role ids to current canonical ids. */
const LEGACY_ROLE_ID_MAP: Record<string, string> = {
  documentVerifier: "document_verifier",
  fieldInspector: "field_inspector",
};
export const canonicalRoleId = (id: string) => LEGACY_ROLE_ID_MAP[id] ?? id;
