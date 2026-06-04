import React from "react";
import { Shield, UserCog, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useOnboarding, UserRole } from "@/contexts/OnboardingContext";
import AuthShell from "./AuthShell";

const options: { role: UserRole; title: string; icon: React.ComponentType<{ className?: string }>; description: string; bullets: string[] }[] = [
  {
    role: "super_admin",
    title: "Super Admin",
    icon: Shield,
    description: "Set up the organization, invite teammates, activate services, and delegate ownership.",
    bullets: ["Organization profile", "Users & roles", "Service activation", "Billing & boundaries"],
  },
  {
    role: "service_owner",
    title: "Service Owner",
    icon: UserCog,
    description: "Configure and launch services your administrator has assigned to you.",
    bullets: ["Forms & workflow", "Notifications", "Team management", "Go live"],
  },
];

const RoleChoice: React.FC<{ onPick: (role: UserRole) => void }> = ({ onPick }) => {
  const { updateState } = useOnboarding();

  const handlePick = (role: UserRole) => {
    updateState({ currentUserRole: role });
    onPick(role);
  };

  return (
    <AuthShell step="Step 1 of 3 · Choose role" contentMaxWidth="max-w-[760px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Who is signing in?</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Tell us your role so we can take you to the right workspace.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {options.map((o) => {
          const Icon = o.icon;
          return (
            <button
              key={o.role}
              type="button"
              onClick={() => handlePick(o.role)}
              className="text-left group"
            >
              <Card className="p-5 h-full transition-all hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground">{o.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{o.description}</p>
                  </div>
                </div>
                <ul className="space-y-1 mb-4">
                  {o.bullets.map((b) => (
                    <li key={b} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-accent" /> {b}
                    </li>
                  ))}
                </ul>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-accent group-hover:gap-2 transition-all">
                  Continue <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </AuthShell>
  );
};

export default RoleChoice;
