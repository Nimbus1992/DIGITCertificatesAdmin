import type { ServiceItem } from "@/contexts/OnboardingContext";

export interface SetupStep {
  key: string;
  label: string;
  done: boolean;
}

export function computeSetupSteps(s: ServiceItem): SetupStep[] {
  return [
    { key: "name", label: "Service name", done: Boolean(s.name) },
    { key: "modules", label: "Modules selected", done: (s.customModules?.length ?? 0) > 0 },
    {
      key: "structure",
      label: "Categories & structure",
      done: Boolean(s.templateSetup),
    },
    {
      key: "owner",
      label: "Service owner assigned",
      done: (s.assignedOwners?.length ?? 0) > 0,
    },
    { key: "branding", label: "Branding configured", done: Boolean(s.branding) },
    {
      key: "deployment",
      label: "Deployment scope",
      done: (s.deployment?.selectedItems?.length ?? 0) > 0,
    },
    { key: "golive", label: "Go live", done: Boolean(s.isLive) },
  ];
}

export function setupProgress(s: ServiceItem): { done: number; total: number; pct: number } {
  const steps = computeSetupSteps(s);
  const done = steps.filter((x) => x.done).length;
  const total = steps.length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

/** Deterministic mock application volume keyed off service id. */
export function mockApplicationVolume(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 120 + (h % 880);
}
