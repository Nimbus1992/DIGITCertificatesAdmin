import React, { useState } from "react";
import { KeyRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TEMP_PASSWORD = "12345678";

const ResetPassword: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const currentValid = current === TEMP_PASSWORD;
  const nextValid = next.length >= 8 && next !== current;
  const matches = next === confirm && confirm.length > 0;
  const canContinue = currentValid && nextValid && matches;

  let error = "";
  if (submitted || current) {
    if (current && !currentValid) error = "Current password is incorrect.";
    else if (next && next.length < 8) error = "New password must be at least 8 characters.";
    else if (next && next === current) error = "New password must be different from your current password.";
    else if (confirm && !matches) error = "Passwords do not match.";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canContinue) return;
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto animate-slide-up">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
          <KeyRound className="h-6 w-6 text-accent" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          For security, set a new password before accessing your workspace.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current" className="text-xs">Current password</Label>
            <Input
              id="current"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Enter temporary password"
              className="h-11"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new" className="text-xs">New password</Label>
            <Input
              id="new"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="At least 8 characters"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-xs">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              className="h-11"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={!canContinue}
            className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 mt-2"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;