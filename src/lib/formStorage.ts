/**
 * Canonical, per-service-per-module form schema storage.
 * Both the FormBuilder and the citizen-facing Preview form read/write
 * through these helpers so changes propagate immediately.
 */
import { cloneSteps, type WizardStep } from "@/data/wizardForm";
import { ISSUANCE_FORM_STEPS } from "@/data/issuanceFormTemplate";

export const FORM_UPDATED_EVENT = "formbuilder:updated";

export const formStorageKey = (serviceId: string, moduleName: string) =>
  `formbuilder:${serviceId || "service"}:${moduleName}`;

export const seedFormSteps = (): WizardStep[] => cloneSteps(ISSUANCE_FORM_STEPS);

export const loadFormSteps = (
  serviceId: string,
  moduleName: string,
): WizardStep[] => {
  try {
    const raw = localStorage.getItem(formStorageKey(serviceId, moduleName));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as WizardStep[];
    }
  } catch { /* ignore */ }
  return seedFormSteps();
};

export const saveFormSteps = (
  serviceId: string,
  moduleName: string,
  steps: WizardStep[],
) => {
  try {
    const key = formStorageKey(serviceId, moduleName);
    localStorage.setItem(key, JSON.stringify(steps));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(FORM_UPDATED_EVENT, {
          detail: { serviceId, moduleName, key },
        }),
      );
    }
  } catch { /* ignore */ }
};
