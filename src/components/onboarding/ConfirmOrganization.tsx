import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "@/contexts/OnboardingContext";
import {
  countries,
  currencies,
  phoneCodes,
  getCountryDefaults,
} from "@/data/countryDefaults";
import { cn } from "@/lib/utils";

const departments = [
  "Revenue",
  "Urban Development",
  "Public Works",
  "Health",
  "Education",
  "Transport",
  "Housing",
  "Environment",
];

const ConfirmOrganization: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { state, updateState } = useOnboarding();
  const [highlightAuto, setHighlightAuto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updates: Record<string, string> = {};
    if (!state.country) {
      updates.country = "United States";
      const d = getCountryDefaults("United States")!;
      updates.currency = d.currency;
      updates.currencySymbol = d.currencySymbol;
      updates.phoneCountryCode = d.phoneCode;
    }
    if (!state.department) updates.department = "Revenue";
    if (!state.language) updates.language = "English";
    if (Object.keys(updates).length) updateState(updates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!highlightAuto) return;
    const t = setTimeout(() => setHighlightAuto(false), 1400);
    return () => clearTimeout(t);
  }, [highlightAuto]);

  const handleCountryChange = (name: string) => {
    const d = getCountryDefaults(name);
    updateState({
      country: name,
      currency: d?.currency ?? state.currency,
      currencySymbol: d?.currencySymbol ?? state.currencySymbol,
      phoneCountryCode: d?.phoneCode ?? state.phoneCountryCode,
    });
    setHighlightAuto(true);
  };

  const handleCurrencyChange = (code: string) => {
    const c = currencies.find((x) => x.code === code);
    updateState({ currency: code, currencySymbol: c?.symbol ?? "" });
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateState({ logoUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const orgName = state.orgName || "there";
  const initial = (state.orgName?.trim()?.[0] || "?").toUpperCase();
  const canContinue = !!state.country && !!state.department;

  const highlightRing =
    "transition-all rounded-md " +
    (highlightAuto ? "ring-2 ring-accent/50 ring-offset-2 ring-offset-background" : "");

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto animate-slide-up">
        {/* Header with logo */}
        <div className="mb-5 flex items-start gap-4">
          <div className="flex flex-col items-center shrink-0">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden hover:border-accent/50 transition-colors group"
              aria-label="Upload organization logo"
            >
              {state.logoUrl ? (
                <img src={state.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-semibold text-muted-foreground">{initial}</span>
              )}
              <span className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-4 w-4 text-background" />
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogo}
              />
            </button>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center leading-tight">
              Used on licenses<br />and certificates.
            </p>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              Welcome, {orgName} <span aria-hidden>👋</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Your workspace is already prepared — review and personalize it before continuing.
            </p>
          </div>
        </div>

        {/* Form card */}
        <Card className="overflow-hidden">
          <div className="p-6 space-y-5">
            {/* Department section */}
            <section className="space-y-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Department
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Department</Label>
                  <Select value={state.department} onValueChange={(v) => updateState({ department: v })}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Regional settings */}
            <section className="space-y-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Regional settings
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Country auto-fills currency and dialing code.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Country</Label>
                  <Select value={state.country} onValueChange={handleCountryChange}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Currency</Label>
                  <div className={cn(highlightRing)}>
                    <Select value={state.currency} onValueChange={handleCurrencyChange}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select currency" /></SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="mr-1">{c.symbol}</span>{c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Country code</Label>
                  <div className={cn(highlightRing)}>
                    <Select value={state.phoneCountryCode} onValueChange={(v) => updateState({ phoneCountryCode: v })}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select code" /></SelectTrigger>
                      <SelectContent>
                        {phoneCodes.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Default language</Label>
                  <Select value={state.language} onValueChange={(v) => updateState({ language: v })}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t bg-muted/30">
            <p className="text-[11px] text-muted-foreground">
              You can update these anytime from Workspace Settings.
            </p>
            <Button
              onClick={onComplete}
              disabled={!canContinue}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-10 px-5"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmOrganization;