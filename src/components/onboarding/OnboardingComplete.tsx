import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AuthShell from "./AuthShell";
import { usePersona } from "@/contexts/PersonaContext";

const OnboardingComplete: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { persona } = usePersona();
  const admins = persona.invitedUsers.filter((u) => u.role === "administrator").length;
  const owners = persona.invitedUsers.filter((u) => u.role === "service_owner").length;
  const templates = new Set(
    persona.invitedUsers
      .filter((u) => u.role === "service_owner" && u.assignedTemplate)
      .map((u) => u.assignedTemplate!)
  ).size;

  return (
    <AuthShell step="Step 4 · Setup Complete" contentMaxWidth="max-w-[560px]">
      <Card className="border-border shadow-sm">
        <div className="px-7 py-10 text-center space-y-6">
          <div className="mx-auto h-14 w-14 rounded-full bg-success/15 text-success flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Organization setup complete</h1>
            <p className="text-sm text-muted-foreground">Your workspace is ready. Here's a quick summary.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Administrators", value: admins },
              { label: "Service Owners", value: owners },
              { label: "Templates Activated", value: templates },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-semibold">{s.value}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <Button onClick={onComplete} className="gap-2 h-10 px-6">
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </AuthShell>
  );
};

export default OnboardingComplete;
