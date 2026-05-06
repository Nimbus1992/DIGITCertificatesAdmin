import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useOnboarding } from "@/contexts/OnboardingContext";
import AuthShell from "./AuthShell";

const TEMP_PASSWORD = "12345678";

function deriveOrgFromEmail(email: string): string {
  const domain = email.split("@")[1] || "";
  const root = domain.split(".")[0] || email.split("@")[0] || "";
  if (!root) return "";
  return root.charAt(0).toUpperCase() + root.slice(1);
}

const SignIn: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { state, updateState } = useOnboarding();
  const [email, setEmail] = useState(state.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailValid && password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (password !== TEMP_PASSWORD) {
      setError("Incorrect password. Use the temporary password shared with you.");
      return;
    }
    const orgName = state.orgName || deriveOrgFromEmail(email);
    updateState({ email, orgName });
    onComplete();
  };

  return (
    <AuthShell step="Step 1 of 3 · Sign in" showSidePanel>
      <Card className="border-border shadow-sm">
        <form onSubmit={handleSubmit} className="px-7 py-8 space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Workspace Access
            </p>
            <h1 className="text-[22px] font-semibold text-foreground tracking-tight leading-tight">
              Sign in to your workspace
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your work email and the temporary password shared by your platform team to activate your account.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@organization.gov"
                className="h-10"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">
                Temporary password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter temporary password"
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                Use the temporary password shared by your platform team.
              </p>
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center pt-1 border-t border-border pt-4">
            Need help? Contact your platform administrator.
          </p>
        </form>
      </Card>
    </AuthShell>
  );
};

export default SignIn;
