import { Building2, Hammer, Flame } from "lucide-react";

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof Building2;
  modules: string[];
  features: string[];
  estimatedSetupTime: string;
  comingSoon?: boolean;
}

export const tradeTemplate: ServiceTemplate = {
  id: "trade-license",
  name: "Business License",
  description:
    "Set up a complete Business License system to accept applications, review requests, issue licenses, and manage renewals.",
  icon: Building2,
  modules: ["Application", "Renewal"],
  features: ["Application form", "Document upload", "Fee collection", "Inspection scheduling"],
  estimatedSetupTime: "5 min",
};

export const buildingPermitsTemplate: ServiceTemplate = {
  id: "building-permits",
  name: "Building Permits",
  description:
    "Manage building permit applications, plan reviews, inspections, and approvals end-to-end.",
  icon: Hammer,
  modules: ["Application", "Plan Review", "Inspection"],
  features: ["Plan upload", "Inspection scheduling", "Multi-stage approval"],
  estimatedSetupTime: "Coming soon",
  comingSoon: true,
};

export const fireNocTemplate: ServiceTemplate = {
  id: "fire-noc",
  name: "Fire NOC",
  description:
    "Issue and renew Fire No Objection Certificates with inspections, compliance checks, and digital certificates.",
  icon: Flame,
  modules: ["Application", "Inspection", "Renewal"],
  features: ["Compliance checklist", "Site inspection", "Digital NOC"],
  estimatedSetupTime: "Coming soon",
  comingSoon: true,
};

export const allTemplates: ServiceTemplate[] = [
  tradeTemplate,
  buildingPermitsTemplate,
  fireNocTemplate,
];
