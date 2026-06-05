import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding, ServiceItem } from "@/contexts/OnboardingContext";
import { usePersona } from "@/contexts/PersonaContext";
import { TEMPLATE_NAME_TO_ID } from "@/data/personaSeeds";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Settings, Eye, Rocket, PenLine, ArrowRight, LayoutTemplate, Building2, Sparkles, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "draft" | "live";

const LegacyDashboard: React.FC = () => {
  const { state, setActiveService, deleteService } = useOnboarding();
  const { persona } = usePersona();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterKey>("all");
  const [pendingDelete, setPendingDelete] = useState<ServiceItem | null>(null);
  const [confirmText, setConfirmText] = useState("");

  // Scope for service owners
  const allowedTemplateIds = useMemo(
    () => new Set(persona.assignedTemplates.map((n) => TEMPLATE_NAME_TO_ID[n]).filter(Boolean)),
    [persona.assignedTemplates]
  );

  const visibleServices = useMemo(() => {
    if (persona.role !== "service_owner") return state.services;
    return state.services.filter((s) => allowedTemplateIds.has(s.templateId));
  }, [state.services, persona.role, allowedTemplateIds]);

  const statusConfig: Record<string, { label: string; className: string; stripe: string }> = {
    draft: { label: "Draft", className: "bg-warning/15 text-warning border-warning/30", stripe: "bg-warning" },
    live: {
      label: "Live",
      className: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
      stripe: "bg-green-500",
    },
  };

  const stats = useMemo(() => {
    const total = visibleServices.length;
    const drafts = visibleServices.filter((s) => s.status === "draft").length;
    const live = visibleServices.filter((s) => s.isLive).length;
    return { total, drafts, live };
  }, [visibleServices]);

  const filteredServices = useMemo(() => {
    if (filter === "all") return visibleServices;
    if (filter === "live") return visibleServices.filter((s) => s.isLive);
    return visibleServices.filter((s) => s.status === filter);
  }, [visibleServices, filter]);

  const handleConfigure = (service: ServiceItem) => {
    setActiveService(service.id);
    navigate(`/service/${service.id}/configure`);
  };
  const handleGoLive = (service: ServiceItem) => {
    setActiveService(service.id);
    navigate("/go-live");
  };
  const handleView = (service: ServiceItem) => {
    setActiveService(service.id);
    navigate(`/service/${service.id}/manage`);
  };
  const handleEdit = (service: ServiceItem) => {
    setActiveService(service.id);
    navigate(`/service/${service.id}/configure`);
  };

  const statCards = [
    { key: "total", label: "Total Applications", value: stats.total, icon: Building2, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { key: "drafts", label: "Drafts", value: stats.drafts, icon: PenLine, iconBg: "bg-warning/15", iconColor: "text-warning" },
    { key: "live", label: "Live", value: stats.live, icon: Rocket, iconBg: "bg-green-500/10", iconColor: "text-green-600 dark:text-green-400", pulse: stats.live > 0 },
  ];

  const filterPills: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "draft", label: "Drafts" },
    { key: "live", label: "Live" },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="max-w-6xl mx-auto px-6 py-8 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight max-w-2xl">
            {persona.role === "service_owner" ? "Your Services" : "Configure and Launch Licenses and Permits"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            {persona.role === "service_owner"
              ? "Configure and publish the services assigned to you."
              : "Configure Licenses and Permits applications to manage end-to-end delivery of service to the citizen."}
          </p>
        </div>

        {visibleServices.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.key} className="hover:-translate-y-0.5 transition-all hover:shadow-md">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", s.iconBg)}>
                      <Icon className={cn("h-5 w-5", s.iconColor)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-2xl font-bold leading-none">{s.value}</p>
                        {s.pulse && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {visibleServices.length === 0 && (
          <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-background to-primary/5 p-8 md:p-10">
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-semibold">Set up your first application</h2>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                  Choose from a ready-made template to launch in minutes.
                </p>
              </div>
              <Button size="lg" onClick={() => navigate("/services")} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                <LayoutTemplate className="h-4 w-4" /> Choose Template <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {visibleServices.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold">Your Applications</h2>
                <Badge variant="secondary" className="rounded-full">{visibleServices.length}</Badge>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border">
                {filterPills.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setFilter(p.key)}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                      filter === p.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-12 text-center">
                <p className="text-sm text-muted-foreground">No applications match this filter.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => {
                  const cfg = statusConfig[service.status] || statusConfig.draft;
                  return (
                    <Card key={service.id} className="relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                      <div className={cn("absolute top-0 left-0 right-0 h-1", cfg.stripe)} />
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-5">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-primary/15 border border-accent/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{service.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {service.customModules.length > 0 ? `${service.customModules.length} flow${service.customModules.length > 1 ? "s" : ""}` : "From template"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
                          {persona.role !== "service_owner" && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setConfirmText(""); setPendingDelete(service); }}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          {service.isLive ? (
                            <>
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleView(service)}>
                                <Eye className="h-3.5 w-3.5 mr-1" /> View
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(service)}>
                                <Settings className="h-3.5 w-3.5 mr-1" /> Edit
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleConfigure(service)}>
                                <Settings className="h-3.5 w-3.5 mr-1" /> Configure
                              </Button>
                              <Button size="sm" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleGoLive(service)}>
                                <Rocket className="h-3.5 w-3.5 mr-1" /> Go Live
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the service and its configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingDelete?.isLive && (
            <div className="space-y-2">
              <Label htmlFor="confirm-name" className="text-xs">
                Type <span className="font-mono font-semibold">{pendingDelete.name}</span> to confirm
              </Label>
              <Input id="confirm-name" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={pendingDelete.name} autoFocus />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pendingDelete?.isLive ? confirmText !== pendingDelete.name : false}
              onClick={() => {
                if (!pendingDelete) return;
                const name = pendingDelete.name;
                deleteService(pendingDelete.id);
                setPendingDelete(null);
                setConfirmText("");
                toast.success(`"${name}" deleted`);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LegacyDashboard;
