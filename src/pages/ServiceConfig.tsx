import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Rocket, Check, AlertCircle, Settings2 } from "lucide-react";
import { defaultModules, configTiles } from "@/data/serviceModules";
import RolesDesigner from "@/components/service-config/RolesDesigner";
import NotificationsManager from "@/components/service-config/NotificationsManager";
import ChecklistBuilder from "@/components/service-config/ChecklistBuilder";
import FormBuilder from "@/components/service-config/FormBuilder";
import DocumentDesigner from "@/components/service-config/DocumentDesigner";
import WorkflowDesigner from "@/components/service-config/WorkflowDesigner";
import FeesConfigurator from "@/components/service-config/FeesConfigurator";
import PaymentsConfigurator from "@/components/service-config/PaymentsConfigurator";
import { ServicePreviewWorkspace } from "@/components/preview/ServicePreview";
import MasterTemplateConfigurator from "@/components/service-config/MasterTemplateConfigurator";

type TileStatus = "not_started" | "in_progress" | "completed";

const deploymentSections: { title: string; description: string }[] = [
  { title: "Production Status", description: "Real-time health, uptime, and recent incidents." },
  { title: "Active Modules", description: "Modules currently serving live traffic." },
  { title: "Published Versions", description: "Released versions and rollback history." },
  { title: "Operational Settings", description: "Runtime configuration for the live service." },
  { title: "Monitoring", description: "Metrics, alerts, and performance signals." },
  { title: "Integrations", description: "Connected systems and outbound services." },
  { title: "Audit Logs", description: "Activity trail across operators and applicants." },
  { title: "Environment Management", description: "Manage staging, production, and secrets." },
];

const DeploymentWorkspace: React.FC<{ serviceUrl?: string }> = ({ serviceUrl }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-xl font-semibold text-foreground">Deployment</h2>
      <p className="text-sm text-muted-foreground mt-1">Operate and manage your live service.</p>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      <span className="font-medium text-foreground">Live</span>
      {serviceUrl && (
        <a href={serviceUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline ml-2">
          {serviceUrl}
        </a>
      )}
    </div>
    <div className="border-t border-border/60">
      {deploymentSections.map((s) => (
        <div key={s.title} className="flex items-center justify-between py-4 border-b border-border/60">
          <div>
            <h3 className="text-sm font-medium text-foreground">{s.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Coming soon</span>
        </div>
      ))}
    </div>
  </div>
);

const statusConfig: Record<TileStatus, { label: string; className: string }> = {
  not_started: { label: "Not Started", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

const ServiceConfig: React.FC = () => {
  const { id } = useParams();
  const { state, updateService, setActiveService } = useOnboarding();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"configure" | "preview" | "deployment">("configure");
  const [setupOpen, setSetupOpen] = useState(false);

  useEffect(() => {
    if (id && state.activeServiceId !== id) setActiveService(id);
  }, [id, state.activeServiceId, setActiveService]);

  // Find the active service from the services array
  const service = state.services.find((s) => s.id === id);
  const serviceName = service?.name || state.serviceName || "Application Configuration";

  // Derive modules from the service's customModules, falling back to defaultModules
  const modules: { id: string; name: string }[] =
    service?.customModules && service.customModules.length > 0
      ? service.customModules.map((name) => ({ id: name.toLowerCase().replace(/\s+/g, "-"), name }))
      : defaultModules;

  const [selectedModule, setSelectedModule] = useState(modules[0].id);
  const [activeTile, setActiveTile] = useState<string | null>(null);
  const [tileStatuses, setTileStatuses] = useState<Record<string, Record<string, TileStatus>>>(() => {
    const initial: Record<string, Record<string, TileStatus>> = {};
    // Business License template ships fully pre-configured: every required tile is
    // already wired up with seed data that matches what the preview runs on.
    const isTradeLicense = id === "trade-license" || service?.templateId === "trade-license";
    modules.forEach((m) => {
      initial[m.id] = {};
      configTiles.forEach((t) => {
        if (isTradeLicense && t.id !== "plugins") {
          initial[m.id][t.id] = "completed";
        } else {
          initial[m.id][t.id] = "not_started";
        }
      });
    });
    return initial;
  });

  const currentModule = modules.find((m) => m.id === selectedModule) || modules[0];
  const currentStatuses = tileStatuses[selectedModule] || {};
  const completedCount = Object.values(currentStatuses).filter((s) => s === "completed").length;

  const activeTileData = activeTile ? configTiles.find((t) => t.id === activeTile) : null;

  const isPublished = service?.isPublished || state.isPublished;
  const isLive = service?.isLive || state.isLive;

  const coreTiles = configTiles.filter((t) => t.group === "core");
  const additionalTiles = configTiles.filter((t) => t.group === "additional");

  const moduleStatusGlyph = (modId: string) => {
    const statuses = tileStatuses[modId] || {};
    const allRequiredComplete = configTiles
      .filter((t) => t.required)
      .every((t) => statuses[t.id] === "completed");
    return allRequiredComplete ? "complete" : "incomplete";
  };

  // Specialized config screens
  if (activeTile === "forms") return <FormBuilder moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  if (activeTile === "roles") return <RolesDesigner moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  if (activeTile === "notifications") return <NotificationsManager moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  if (activeTile === "checklists") return <ChecklistBuilder moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  if (activeTile === "documents") return <DocumentDesigner moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  if (activeTile === "billing") return <FeesConfigurator moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  if (activeTile === "workflow") return <WorkflowDesigner moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  if (activeTile === "payments") return <PaymentsConfigurator moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;

  // Generic tile placeholder
  if (activeTileData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setActiveTile(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground">{currentModule.name} — {activeTileData.title}</h1>
              <p className="text-xs text-muted-foreground">Flow configuration</p>
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
              <activeTileData.icon className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{activeTileData.title}</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              This is where you configure {activeTileData.title.toLowerCase()} for the{" "}
              <span className="font-medium text-foreground">{currentModule.name}</span> flow.
            </p>
            <Button variant="outline" onClick={() => setActiveTile(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Module Configuration
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const workspaceTabs: { id: typeof mode; label: string; disabled?: boolean; tooltip?: string }[] = [
    { id: "configure", label: "Configure" },
    { id: "preview", label: "Preview" },
    {
      id: "deployment",
      label: "Deployment",
      disabled: !isLive,
      tooltip: !isLive ? "Available after publishing the service" : undefined,
    },
  ];

  // Main hub view
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card shrink-0">
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-foreground text-lg truncate">{serviceName}</h1>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 ${isLive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}
                >
                  {isLive ? "Live" : "Draft"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Configure, preview, and operate your service</p>
            </div>
            {!isLive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { if (service) setActiveService(service.id); navigate("/go-live"); }}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Rocket className="h-4 w-4" /> Go Live
              </Button>
            )}
          </div>

          {/* Master Template Configuration metadata strip */}
          {service && (
            <div className="mt-4 flex items-center gap-x-6 gap-y-1 flex-wrap text-xs text-muted-foreground border-t border-border/60 pt-3">
              <span className="font-medium text-foreground uppercase tracking-wide text-[10px]">Template Setup</span>
              <span>
                <span className="text-foreground/70">Modules:</span>{" "}
                <span className="text-foreground">{service.customModules.join(", ") || "Issuance"}</span>
              </span>
              <span>
                <span className="text-foreground/70">Categories:</span>{" "}
                <span className="text-foreground">{service.templateSetup?.hasCategories ? "Enabled" : "Disabled"}</span>
              </span>
              <span>
                <span className="text-foreground/70">Subcategories:</span>{" "}
                <span className="text-foreground">{service.templateSetup?.hasSubcategories ? "Enabled" : "Disabled"}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSetupOpen(true)}
                className="ml-auto h-7 gap-1.5 text-xs"
              >
                <Settings2 className="h-3.5 w-3.5" /> Edit Setup
              </Button>
            </div>
          )}

          <TooltipProvider delayDuration={200}>
            <nav className="mt-5 flex items-center gap-1 -mb-px">
              {workspaceTabs.map((t) => {
                const active = mode === t.id;
                const btn = (
                  <button
                    key={t.id}
                    onClick={() => !t.disabled && setMode(t.id)}
                    disabled={t.disabled}
                    className={`relative px-5 h-12 text-sm font-medium transition-colors border-b-2 ${
                      active
                        ? "border-accent text-foreground"
                        : t.disabled
                          ? "border-transparent text-muted-foreground/50 cursor-not-allowed"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                );
                return t.tooltip ? (
                  <Tooltip key={t.id}>
                    <TooltipTrigger asChild><span>{btn}</span></TooltipTrigger>
                    <TooltipContent>{t.tooltip}</TooltipContent>
                  </Tooltip>
                ) : btn;
              })}
            </nav>
          </TooltipProvider>
        </div>
      </header>

      {mode === "configure" ? (
        <main className="max-w-6xl w-full mx-auto px-6 py-8 space-y-10 flex-1 min-h-0 overflow-auto">
          {/* Modules row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-2">Modules</span>
            {modules.map((m) => {
                const isActive = m.id === selectedModule;
                const glyph = moduleStatusGlyph(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModule(m.id); setActiveTile(null); }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-foreground hover:bg-muted/70"
                    }`}
                  >
                    {glyph === "complete" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5" />
                    )}
                    {m.name}
                  </button>
                );
              })}
          </div>

          {/* Setup Journey */}
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Setup Journey</h2>
                <p className="text-sm text-muted-foreground">Complete the foundational setup for your service journey.</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {completedCount} of {configTiles.length} configured
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coreTiles.map((tile) => {
                const status = currentStatuses[tile.id] || "not_started";
                const cfg = statusConfig[status];
                return (
                  <Card
                    key={tile.id}
                    className="relative group hover:shadow-md hover:border-accent/40 transition-all cursor-pointer"
                    onClick={() => setActiveTile(tile.id)}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <tile.icon className="h-6 w-6 text-accent" />
                        </div>
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${cfg.className}`}>{cfg.label}</Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-base">{tile.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{tile.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Additional Setup */}
          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Additional Setup</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {additionalTiles.map((tile) => {
                const status = currentStatuses[tile.id] || "not_started";
                const dotClass =
                  status === "completed"
                    ? "bg-green-500"
                    : status === "in_progress"
                      ? "bg-yellow-500"
                      : "bg-muted-foreground/30";
                return (
                  <button
                    key={tile.id}
                    onClick={() => setActiveTile(tile.id)}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left hover:border-accent/40 hover:bg-accent/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <tile.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground">{tile.title}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} title={statusConfig[status].label} />
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      ) : mode === "preview" ? (
        <main className="flex-1 min-h-0">
          <ServicePreviewWorkspace />
        </main>
      ) : (
        <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-1 min-h-0 overflow-auto">
          <DeploymentWorkspace serviceUrl={(service as any)?.liveUrl} />
        </main>
      )}
      {service && (
        <MasterTemplateConfigurator open={setupOpen} onOpenChange={setSetupOpen} service={service} />
      )}
    </div>
  );
};

export default ServiceConfig;
