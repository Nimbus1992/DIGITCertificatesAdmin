export type PersonaRole = "super_admin" | "administrator" | "service_owner";

export interface PersonaSeed {
  email: string;
  role: PersonaRole;
  name: string;
  /** Used only as a migration hint for legacy demo state. New services use ServiceItem.assignedOwners. */
  assignedTemplates: string[];
}

export const TEMPLATE_OPTIONS: { value: string; label: string; active: boolean }[] = [
  { value: "Business License", label: "Business License", active: true },
  { value: "Building Permit", label: "Building Permit", active: false },
  { value: "Fire NOC", label: "Fire NOC", active: false },
  { value: "Occupancy Certificate", label: "Occupancy Certificate", active: false },
  { value: "Road Digging Permit", label: "Road Digging Permit", active: false },
  { value: "Birth & Death Certificate", label: "Birth & Death Certificate", active: false },
  { value: "Pet License", label: "Pet License", active: false },
];

export const PERSONA_SEEDS: PersonaSeed[] = [
  {
    email: "superadmin@egov.demo",
    role: "super_admin",
    name: "Super Admin",
    assignedTemplates: [],
  },
  {
    email: "admin@egov.demo",
    role: "administrator",
    name: "Administrator",
    assignedTemplates: [],
  },
  {
    email: "trade.owner@egov.demo",
    role: "service_owner",
    name: "Trade Owner",
    assignedTemplates: ["Business License"],
  },
  {
    email: "building.owner@egov.demo",
    role: "service_owner",
    name: "Building Owner",
    assignedTemplates: ["Building Permit"],
  },
];

// Map a Service Owner template name to an existing template ID in the codebase
export const TEMPLATE_NAME_TO_ID: Record<string, string> = {
  "Business License": "trade-license",
  "Building Permit": "building-permits",
  "Fire NOC": "fire-noc",
};

export const ROLE_DESCRIPTIONS: Record<PersonaRole | "administrator", { title: string; can: string[]; cannot?: string[] }> = {
  super_admin: {
    title: "Super Admin",
    can: [
      "Manage organization profile and platform settings",
      "Invite administrators",
      "Activate templates and assign service owners",
      "Access every service workspace",
    ],
  },
  administrator: {
    title: "Administrator",
    can: [
      "Activate templates and create services",
      "Assign service owners and manage service-level users",
      "Manage authentication, boundaries, branding",
      "View platform audit logs",
    ],
    cannot: ["Modify the organization profile"],
  },
  service_owner: {
    title: "Service Owner",
    can: [
      "Configure assigned services",
      "Manage service teams and service-specific users",
      "Publish services",
      "View service-specific audit logs",
    ],
    cannot: ["Activate new templates", "Access services they are not assigned to", "Manage organization settings"],
  },
};

export const SERVICE_USER_ROLES: { value: string; label: string; description: string }[] = [
  { value: "service_owner", label: "Service Owner", description: "Full control over this service" },
  { value: "document_verifier", label: "Document Verifier", description: "Reviews submitted documents" },
  { value: "field_inspector", label: "Field Inspector", description: "Conducts on-site inspections" },
  { value: "approver", label: "Approver", description: "Approves or rejects applications" },
  { value: "counter_operator", label: "Counter Operator", description: "Files applications on behalf of citizens" },
];
