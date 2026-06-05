import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AuthShell from "./AuthShell";
import { usePersona } from "@/contexts/PersonaContext";

const OnboardingComplete: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { persona } = usePersona();
  const admins = persona.invitedUsers.filter((u) => u.role === "administrator").length;

  return (
    <AuthShell step="Step 4 · Setup complete" contentMaxWidth="max-w-[520px]">
      <Card className="border-border shadow-sm">
        <div className="px-7 py-9 space-y-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-md bg-success/15 text-success flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight leading-tight">
                Your organization is ready
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Next, activate a template to create your first service.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Administrators invited</div>
              <div className="text-2xl font-semibold mt-0.5">{admins}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Next step</div>
              <div className="text-sm font-medium mt-0.5">Activate a template</div>
            </div>
          </div>

          <Button onClick={onComplete} className="w-full gap-2 h-10">
            Go to Templates <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </AuthShell>
  );
};

export default OnboardingComplete;
