import React, { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { countries, currencies, phoneCodes, getCountryDefaults } from "@/data/countryDefaults";
import { cn } from "@/lib/utils";

const departments = ["Revenue", "Urban Development", "Public Works", "Health", "Education", "Transport", "Housing", "Environment"];
const languages = ["English", "Hindi", "Spanish", "French", "Arabic", "Chinese", "Portuguese", "German"];

const TOTAL_STEPS = 6;

interface ShellProps {
  step: number;
  question: string;
  helper: string;
  canContinue: boolean;
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
}

const Shell: React.FC<ShellProps> = ({ step, question, helper, canContinue, onNext, onBack, children }) => (
  <div className="min-h-screen bg-background px-4 py-10 flex flex-col">
    <div className="max-w-xl w-full mx-auto flex-1 flex flex-col">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Step {step} of {TOTAL_STEPS}
        </p>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i < step ? "bg-accent" : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-2">
        <p className="text-sm text-muted-foreground">Let's set up your organization</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">{question}</h1>
      </div>

      <div key={step} className="animate-fade-in space-y-4 mt-6">
        {children}
        <p className="text-xs text-muted-foreground">{helper}</p>
      </div>

      <div className="flex justify-between pt-10 mt-auto">
        <Button variant="ghost" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

const OrgSetup: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { state, updateState } = useOnboarding();
  const [step, setStep] = useState(1);
  const [highlightAuto, setHighlightAuto] = useState(false);

  useEffect(() => {
    if (highlightAuto) {
      const t = setTimeout(() => setHighlightAuto(false), 1400);
      return () => clearTimeout(t);
    }
  }, [highlightAuto, step]);

  const next = () => setStep((s) => (s < TOTAL_STEPS ? s + 1 : s));
  const back = () => (step === 1 ? onBack() : setStep((s) => s - 1));

  const handleCountryChange = (name: string) => {
    const defaults = getCountryDefaults(name);
    updateState({
      country: name,
      currency: defaults?.currency ?? state.currency,
      currencySymbol: defaults?.currencySymbol ?? state.currencySymbol,
      phoneCountryCode: defaults?.phoneCode ?? state.phoneCountryCode,
    });
    setHighlightAuto(true);
  };

  const handleCurrencyChange = (code: string) => {
    const c = currencies.find((x) => x.code === code);
    updateState({ currency: code, currencySymbol: c?.symbol ?? "" });
  };

  const finish = () => {
    if (step === TOTAL_STEPS) onComplete();
    else next();
  };

  if (step === 1) {
    return (
      <Shell
        step={1}
        question="What is your organization called?"
        helper="This will appear on licenses and official documents."
        canContinue={state.orgName.trim().length > 0}
        onNext={finish}
        onBack={back}
      >
        <Label className="sr-only">Organization name</Label>
        <Input
          autoFocus
          value={state.orgName}
          onChange={(e) => updateState({ orgName: e.target.value })}
          placeholder="e.g., City of Springfield"
          className="h-12 text-base"
        />
      </Shell>
    );
  }

  if (step === 2) {
    return (
      <Shell
        step={2}
        question="Which department manages these services?"
        helper="This helps route applications to the right team."
        canContinue={state.department.length > 0}
        onNext={finish}
        onBack={back}
      >
        <Select value={state.department} onValueChange={(v) => updateState({ department: v })}>
          <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select a department" /></SelectTrigger>
          <SelectContent>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </Shell>
    );
  }

  if (step === 3) {
    return (
      <Shell
        step={3}
        question="Where are you operating?"
        helper="We'll set defaults like currency and phone codes based on this."
        canContinue={state.country.length > 0}
        onNext={finish}
        onBack={back}
      >
        <Select value={state.country} onValueChange={handleCountryChange}>
          <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select your country" /></SelectTrigger>
          <SelectContent>
            {countries.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {state.country && (
          <div className="flex items-center gap-2 text-xs text-accent animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            We pre-filled your currency ({state.currency}) and phone code ({state.phoneCountryCode}).
          </div>
        )}
      </Shell>
    );
  }

  if (step === 4) {
    return (
      <Shell
        step={4}
        question="Confirm your currency"
        helper="Used for fees, invoices, and payments."
        canContinue={state.currency.length > 0}
        onNext={finish}
        onBack={back}
      >
        <div className={cn("rounded-lg transition-all", highlightAuto && "ring-2 ring-accent/50 ring-offset-2 ring-offset-background")}>
          <Select value={state.currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select currency" /></SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="mr-1">{c.symbol}</span>{c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Shell>
    );
  }

  if (step === 5) {
    return (
      <Shell
        step={5}
        question="Confirm your phone country code"
        helper="Used for applicant contact and notifications."
        canContinue={state.phoneCountryCode.length > 0}
        onNext={finish}
        onBack={back}
      >
        <div className={cn("rounded-lg transition-all", highlightAuto && "ring-2 ring-accent/50 ring-offset-2 ring-offset-background")}>
          <Select value={state.phoneCountryCode} onValueChange={(v) => updateState({ phoneCountryCode: v })}>
            <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Select code" /></SelectTrigger>
            <SelectContent>
              {phoneCodes.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Shell>
    );
  }

  // Step 6
  return (
    <Shell
      step={6}
      question="What language should your platform use?"
      helper="This will be the default for applicants and staff."
      canContinue={state.language.length > 0}
      onNext={finish}
      onBack={back}
    >
      <div className="grid grid-cols-2 gap-2">
        {languages.map((option) => {
          const isDisabled = option !== "English";
          const selected = state.language === option;
          return (
            <button
              key={option}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && updateState({ language: option })}
              className={cn(
                "px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left flex items-center justify-between gap-2",
                isDisabled
                  ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60"
                  : selected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-card text-foreground hover:border-accent/50 hover:bg-accent/5",
              )}
            >
              <span>{option}</span>
              {isDisabled && (
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded">
                  Coming soon
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Shell>
  );
};

export default OrgSetup;
