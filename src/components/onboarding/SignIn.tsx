import React, { useState } from "react";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboarding } from "@/contexts/OnboardingContext";

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto animate-slide-up">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
          <Shield className="h-6 w-6 text-accent" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Sign in to your workspace
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Use the temporary password shared by your platform team to activate your account.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@organization.gov"
              className="h-11"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Temporary password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter temporary password"
              className="h-11"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 mt-2"
          >
            Sign in <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-1">
            First time signing in? Use the temporary password from your activation email.
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignIn;