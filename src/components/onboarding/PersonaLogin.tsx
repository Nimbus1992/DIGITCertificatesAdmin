import React, { useState } from "react";
import { ArrowRight, Shield, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import AuthShell from "./AuthShell";
import { PERSONA_SEEDS } from "@/data/personaSeeds";
import { usePersona } from "@/contexts/PersonaContext";
import { cn } from "@/lib/utils";

const ICON: Record<string, React.ComponentType<any>> = {
  super_admin: Shield,
  service_owner: Briefcase,
};

const PersonaLogin: React.FC = () => {
  const { signIn } = usePersona();
  const [email, setEmail] = useState("");

  const pick = (e: string) => {
    setEmail(e);
    signIn(e);
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!email) return;
    signIn(email);
  };

  return (
    <AuthShell step="Demo Login · Choose a persona" showSidePanel sidePanelPosition="left" contentMaxWidth="max-w-[560px]">
      <Card className="border-border shadow-sm">
        <div className="px-7 py-7 space-y-6">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Prototype Sign-In
            </p>
            <h1 className="text-[22px] font-semibold text-foreground tracking-tight leading-tight">
              Choose a persona to continue
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No password required. The selected email determines which experience you see.
            </p>
          </div>

          <div className="grid gap-2">
            {PERSONA_SEEDS.map((p) => {
              const Icon = ICON[p.role] || User;
              return (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => pick(p.email)}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-lg border border-border bg-card px-3.5 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                  )}
                >
                  <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">
                      {p.role === "super_admin" ? "Super Admin" : "Service Owner"}
                      {p.assignedTemplates[0] && (
                        <span className="ml-2 text-[11px] font-medium text-muted-foreground">
                          · {p.assignedTemplates[0]}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>

          <div className="border-t border-border pt-4">
            <form onSubmit={submit} className="space-y-2">
              <Label htmlFor="custom-email" className="text-xs font-medium text-foreground">
                Or enter any email
              </Label>
              <div className="flex gap-2">
                <Input
                  id="custom-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@org.demo"
                  className="h-10"
                />
                <Button type="submit" disabled={!email} className="h-10 gap-1.5">
                  Sign in <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Unknown emails default to a Service Owner persona.
              </p>
            </form>
          </div>
        </div>
      </Card>
    </AuthShell>
  );
};

export default PersonaLogin;
