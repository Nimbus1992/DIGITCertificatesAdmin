/**
 * Renewal form seed — initially identical to Issuance, but stored separately
 * so the user can edit/restructure independently.
 */
import type { WizardStep } from "./wizardForm";
import { cloneSteps } from "./wizardForm";
import { ISSUANCE_FORM_STEPS } from "./issuanceFormTemplate";

export const RENEWAL_FORM_STEPS: WizardStep[] = cloneSteps(ISSUANCE_FORM_STEPS);