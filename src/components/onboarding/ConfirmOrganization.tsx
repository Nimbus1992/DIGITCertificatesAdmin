import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Camera, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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

  const workspaceUrl = useMemo(() => {
    const slug = (state.orgName || "your-org")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "your-org";
    return `${slug}.digit.org`;
  }, [state.orgName]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(workspaceUrl);
      toast.success("Workspace URL copied");
    } catch {
      toast.error("Unable to copy");
    }
  };

  const highlightRing =
    "transition-all rounded-md " +
    (highlightAuto ? "ring-2 ring-accent/50 ring-offset-2 ring-offset-background" : "");

  return (
    <div className="min-h-screen bg-background px-4 py-6 flex items-start justify-center">
      <div className="max-w-xl w-full mx-auto animate-slide-up">
        {/* Header with logo */}
        <div className="mb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden hover:border-accent/50 transition-colors group shrink-0"
            aria-label="Upload organization logo"
          >
            {state.logoUrl ? (
              <img src={state.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">{initial}</span>
            )}
            <span className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-3.5 w-3.5 text-background" />
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogo}
            />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight leading-tight">
              Welcome, {orgName} <span aria-hidden>👋</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="font-medium text-[10px] bg-muted text-muted-foreground hover:bg-muted px-1.5 py-0">
                Licenses & Permits Workspace
              </Badge>
              <span className="text-xs text-muted-foreground">
                Review and personalize before continuing.
              </span>
            </div>
          </div>
        </div>

        {/* Form card */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 space-y-3.5">
            {/* Department section */}
            <section className="space-y-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Department
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Department</Label>
                  <Select value={state.department} onValueChange={(v) => updateState({ department: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Regional settings */}
            <section className="space-y-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Regional settings
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Country</Label>
                  <Select value={state.country} onValueChange={handleCountryChange}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Currency</Label>
                  <div className={cn(highlightRing)}>
                    <Select value={state.currency} onValueChange={handleCurrencyChange}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select currency" /></SelectTrigger>
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

                <div className="space-y-1">
                  <Label className="text-xs">Country code</Label>
                  <div className={cn(highlightRing)}>
                    <Select value={state.phoneCountryCode} onValueChange={(v) => updateState({ phoneCountryCode: v })}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select code" /></SelectTrigger>
                      <SelectContent>
                        {phoneCodes.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Default language</Label>
                  <Select value={state.language} onValueChange={(v) => updateState({ language: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Workspace URL</Label>
                  <div className="relative">
                    <Input
                      readOnly
                      value={workspaceUrl}
                      className="h-9 pr-9 bg-muted/40 text-muted-foreground cursor-not-allowed focus-visible:ring-0"
                    />
                    <button
                      type="button"
                      onClick={copyUrl}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Copy workspace URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Applicants and employees will access services using this URL.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-2.5 border-t bg-muted/30">
            <p className="text-[11px] text-muted-foreground">
              You can update these anytime from Workspace Settings.
            </p>
            <Button
              onClick={onComplete}
              disabled={!canContinue}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-9 px-4"
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