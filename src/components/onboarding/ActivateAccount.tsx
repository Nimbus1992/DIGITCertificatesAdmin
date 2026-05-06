import React, { useState } from "react";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboarding } from "@/contexts/OnboardingContext";

function deriveOrgFromEmail(email: string): string {
  const domain = email.split("@")[1] || "";
  const root = domain.split(".")[0] || email.split("@")[0] || "";
  if (!root) return "";
  return root.charAt(0).toUpperCase() + root.slice(1);
}

const ActivateAccount: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { state, updateState } = useOnboarding();
  const [email, setEmail] = useState(state.email);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const passwordValid = password.length >= 8;
  const matches = password === confirm && confirm.length > 0;
  const canContinue = emailValid && passwordValid && matches;

  const error =
    password && !passwordValid
      ? "Password must be at least 8 characters."
      : confirm && !matches
        ? "Passwords do not match."
        : "";

  const handleContinue = () => {
    if (!canContinue) return;
    const orgName = state.orgName || deriveOrgFromEmail(email);
    updateState({ email, orgName });
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full mx-auto animate-slide-up">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
          <Shield className="h-6 w-6 text-accent" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Activate your account
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Your organization workspace has already been created. Set your password to get started.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.gov"
              className="h-11"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-xs">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="h-11"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 mt-2"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;