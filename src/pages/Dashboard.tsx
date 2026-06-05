import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Briefcase, Building2, Rocket, UserPlus, Settings2, LayoutTemplate, ClipboardList, ArrowRight } from "lucide-react";
import { usePersona } from "@/contexts/PersonaContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { cn } from "@/lib/utils";
import LegacyDashboard from "./Dashboard.legacy";

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { persona } = usePersona();
  const { state } = useOnboarding();

  const stats = useMemo(() => {
    const admins = persona.invitedUsers.filter((u) => u.role === "administrator").length;
    const owners = persona.invitedUsers.filter((u) => u.role === "service_owner").length;
    const active = new Set(
      persona.invitedUsers
        .filter((u) => u.role === "service_owner" && u.assignedTemplate)
        .map((u) => u.assignedTemplate!)
    ).size + state.services.length;
    const live = state.services.filter((s) => s.isLive).length;
    return { admins, owners, active, live };
  }, [persona.invitedUsers, state.services]);

  const cards = [
    { label: "Administrators", value: stats.admins, icon: Shield, color: "text-primary", bg: "bg-primary/10" },
    { label: "Service Owners", value: stats.owners, icon: Briefcase, color: "text-accent", bg: "bg-accent/15" },
    { label: "Active Services", value: stats.active, icon: Building2, color: "text-warning", bg: "bg-warning/15" },
    { label: "Services Live", value: stats.live, icon: Rocket, color: "text-success", bg: "bg-success/15" },
  ];

  const actions = [
    { label: "Add User", icon: UserPlus, to: "/setup/users" },
    { label: "Manage Roles", icon: Settings2, to: "/setup/users?tab=roles" },
    { label: "Activate Template", icon: LayoutTemplate, to: "/services" },
    { label: "View Audit Logs", icon: ClipboardList, to: "/audit-log" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Platform Governance</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Oversee users, roles, and services across your organization.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", c.bg)}>
                    <Icon className={cn("h-5 w-5", c.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-none">{c.value}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{c.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-3">
          <h2 className="text-base font-semibold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => navigate(a.to)}
                className="group text-left rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-medium mt-3">{a.label}</p>
              </button>
            );
          })}
        </div>

        {persona.invitedUsers.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Recent invitations</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/setup/users")} className="gap-1.5 h-7 text-xs">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1.5">
                {persona.invitedUsers.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                    <span>{u.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {u.role === "administrator" ? "Administrator" : `Service Owner · ${u.assignedTemplate}`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { persona } = usePersona();
  if (persona.role === "super_admin") return <SuperAdminDashboard />;
  return <LegacyDashboard />;
};

export default Dashboard;
