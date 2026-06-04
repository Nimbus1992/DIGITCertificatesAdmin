import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, ArrowRight, Building2, Rocket, Sparkles, Users, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useCan, useScopedServices } from "@/lib/rbac";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state, setActiveService } = useOnboarding();
  const services = useScopedServices();
  const owners = state.serviceOwners ?? [];
  const canManageSetup = useCan("setup.manage");
  const canActivate = useCan("services.activate");
  const canAssignOwners = useCan("services.assignOwners");

  const checklist = useMemo(() => {
    const allServices = state.services ?? [];
    const draftServices = allServices.filter((s) => s.status === "draft");
    const firstDraft = draftServices[0];
    const allOwned = allServices.length > 0 && allServices.every((s) =>
      owners.some((o) => o.serviceId === s.id),
    );
    const anyConfigured = allServices.some((s) =>
      s.customModules.length > 0 && (s.branding || s.teamMembers.length > 0),
    );
    const anyLive = allServices.some((s) => s.isLive);

    return [
      { key: "org", label: "Organization Confirmed", done: state.isOnboardingComplete, route: "/setup/organization" },
      { key: "templates", label: "Service Templates Activated", done: allServices.length > 0, route: "/setup/activate-services" },
      { key: "owners", label: "Service Owners Assigned", done: allOwned, route: "/setup/assign-owners" },
      { key: "configured", label: "First Service Configured", done: anyConfigured, route: firstDraft ? `/service/${firstDraft.id}/configure` : "/services" },
      { key: "published", label: "First Service Published", done: anyLive, route: "/go-live" },
    ];
  }, [owners, state.services, state.isOnboardingComplete]);

  const completedCount = checklist.filter((c) => c.done).length;

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.08) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {canManageSetup ? (
          <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-background to-primary/5 p-8">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
            <div className="relative flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">Your government workspace is ready</h1>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
                  Complete the remaining setup activities before services can go live.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="bg-background/60">{completedCount} of {checklist.length} complete</Badge>
                  {completedCount === checklist.length && (
                    <Badge className="bg-green-100 text-green-700 border-green-300">All set</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Services</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Services assigned to you. Start setup to configure forms, workflow, team, and go live.
            </p>
          </div>
        )}

        {canManageSetup && (
          <Card>
            <CardContent className="p-0">
              {checklist.map((item, idx) => (
                <button
                  key={item.key}
                  onClick={() => navigate(item.route)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40",
                    idx !== checklist.length - 1 && "border-b border-border",
                  )}
                >
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <span className={cn("flex-1 text-sm", item.done ? "text-muted-foreground line-through" : "text-foreground font-medium")}>
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {canManageSetup ? null : services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium">
                {canManageSetup ? "No services activated yet" : "No services assigned yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {canManageSetup
                  ? "Activate a service template to get started."
                  : "Your administrator hasn't assigned a service to you yet."}
              </p>
              {canActivate && (
                <Button className="mt-4" onClick={() => navigate("/setup/activate-services")}>
                  Activate a service
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">
                {canManageSetup ? "Activated Services" : "My Services"}
              </h2>
              {canActivate && (
                <Button variant="outline" size="sm" onClick={() => navigate("/setup/activate-services")}>
                  Activate more
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {services.map((s) => {
                const owner = owners.find((o) => o.serviceId === s.id);
                return (
                  <Card key={s.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/15 border border-accent/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{s.name}</p>
                        {canAssignOwners && (
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {owner ? <span className="truncate">Owner: {owner.ownerEmail}</span> : <span className="italic text-warning">No owner assigned</span>}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className={s.isLive ? "bg-green-100 text-green-700 border-green-300" : "bg-warning/15 text-warning border-warning/30"}>
                        {s.isLive ? "Live" : "Draft"}
                      </Badge>
                      {s.isLive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setActiveService(s.id); navigate(`/service/${s.id}/manage`); }}
                          className="gap-1.5"
                        >
                          <Settings className="h-3.5 w-3.5" /> Manage
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => { setActiveService(s.id); navigate(`/service/${s.id}/configure`); }}
                          className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          <Rocket className="h-3.5 w-3.5" /> Start Setup
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
