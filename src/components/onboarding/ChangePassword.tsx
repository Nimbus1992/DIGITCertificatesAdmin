import React, { useState } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import AuthShell from "./AuthShell";

interface Props {
  onComplete: () => void;
  step?: string;
}

const ChangePassword: React.FC<Props> = ({ onComplete, step = "Step 1 · Change Password" }) => {
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [conf, setConf] = useState("");
  const [error, setError] = useState("");

  const canSubmit = cur.length > 0 && pw.length >= 6 && pw === conf;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== conf) {
      setError("Passwords do not match.");
      return;
    }
    if (pw.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    onComplete();
  };

  return (
    <AuthShell step={step} showSidePanel sidePanelPosition="left">
      <Card className="border-border shadow-sm">
        <form onSubmit={submit} className="px-7 py-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold text-foreground tracking-tight">Set your password</h1>
              <p className="text-xs text-muted-foreground">Replace your temporary password to activate your account.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cur" className="text-xs font-medium">Current Password</Label>
              <Input id="cur" type="password" value={cur} onChange={(e) => { setCur(e.target.value); setError(""); }} className="h-10" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw" className="text-xs font-medium">New Password</Label>
              <Input id="pw" type="password" value={pw} onChange={(e) => { setPw(e.target.value); setError(""); }} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="conf" className="text-xs font-medium">Confirm Password</Label>
              <Input id="conf" type="password" value={conf} onChange={(e) => { setConf(e.target.value); setError(""); }} className="h-10" />
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" disabled={!canSubmit} className="w-full h-10 gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </AuthShell>
  );
};

export default ChangePassword;
