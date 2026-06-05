export type PersonaRole = "super_admin" | "service_owner";

export interface PersonaSeed {
  email: string;
  role: PersonaRole;
  name: string;
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

export const ROLE_DESCRIPTIONS: Record<"administrator" | "service_owner", { title: string; can: string[]; cannot?: string[] }> = {
  administrator: {
    title: "Administrator",
    can: [
      "Manage Organization Profile",
      "Manage Users & Roles",
      "Manage Authentication",
      "Manage Boundaries",
      "View Audit Logs",
      "Configure applications (cannot apply, approve, or reject)",
    ],
  },
  service_owner: {
    title: "Service Owner",
    can: [
      "Configure assigned services",
      "Manage service teams and service-specific users",
      "View service-specific audit logs",
      "Publish services",
    ],
    cannot: ["Manage organization settings", "Manage other services"],
  },
};
