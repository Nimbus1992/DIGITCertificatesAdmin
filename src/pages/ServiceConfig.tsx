import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Rocket, Check, AlertCircle, Plus, ArrowRight, Circle, Eye, UserCog, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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

type TileStatus = "not_started" | "in_progress" | "completed";

const statusConfig: Record<TileStatus, { label: string; className: string }> = {
  not_started: { label: "Not Started", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

const ServiceConfig: React.FC = () => {
  const { id } = useParams();
  const { state, updateService, setActiveService } = useOnboarding();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"configure" | "preview">("configure");

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

  const coreTiles = configTiles.filter((t) => t.group === "core");
  const additionalTiles = configTiles.filter((t) => t.group === "additional");

  // Readiness — required tiles only, scoped to active module
  const requiredTiles = configTiles.filter((t) => t.required);
  const requiredCompleted = requiredTiles.filter((t) => currentStatuses[t.id] === "completed");
  const readiness = Math.round((requiredCompleted.length / Math.max(requiredTiles.length, 1)) * 100);
  const remainingRequired = requiredTiles.filter((t) => currentStatuses[t.id] !== "completed");
  const isReady = readiness === 100;
  // First non-completed core tile = "next"
  const nextCoreId = coreTiles.find((t) => currentStatuses[t.id] !== "completed")?.id;

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

  // Main hub view
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground text-lg">{serviceName}</h1>
              <p className="text-xs text-muted-foreground">Configure flows, experiences, and operational setup</p>
            </div>
          </div>
          <Tabs value={mode} onValueChange={(v) => setMode(v as "configure" | "preview")} className="mt-4">
            <TabsList>
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {mode === "configure" ? (
        <main className="max-w-4xl mx-auto px-6 py-8 space-y-10">
          {/* Modules row — quiet */}
          <div className="flex items-center gap-1 flex-wrap text-sm border-b border-border/60 pb-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-3">Modules</span>
            {modules.map((m) => {
              const isActive = m.id === selectedModule;
              const glyph = moduleStatusGlyph(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => { setSelectedModule(m.id); setActiveTile(null); }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                    isActive
                      ? "text-foreground font-medium bg-muted"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {glyph === "complete" ? (
                    <Check className="h-3.5 w-3.5 text-foreground/60" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground/50" />
                  )}
                  {m.name}
                </button>
              );
            })}
            <button
              onClick={() => toast({ title: "Add Module", description: "Module creation coming soon." })}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          {/* Service Readiness */}
          <section className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Service Readiness</span>
              <span className="text-muted-foreground tabular-nums">{readiness}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${isReady ? "bg-accent" : "bg-foreground/40"}`}
                style={{ width: `${readiness}%` }}
              />
            </div>
            {!isReady && remainingRequired.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Remaining: {remainingRequired.map((t) => t.title).join(", ")}
              </p>
            )}
          </section>

          {/* Setup Journey */}
          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Setup Journey</h2>
              <p className="text-sm text-muted-foreground">Complete each step to make this service operational.</p>
            </div>
            <ol className="divide-y divide-border/60">
              {coreTiles.map((tile) => {
                const status = currentStatuses[tile.id] || "not_started";
                const isNext = tile.id === nextCoreId;
                const cta =
                  status === "completed" ? "Edit" : isNext ? "Continue" : "Start";
                return (
                  <li key={tile.id}>
                    <button
                      onClick={() => setActiveTile(tile.id)}
                      className="w-full flex items-center gap-4 py-4 text-left group hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors"
                    >
                      <span className="shrink-0 w-6 flex items-center justify-center">
                        {status === "completed" ? (
                          <Check className="h-4 w-4 text-foreground/60" />
                        ) : isNext ? (
                          <ArrowRight className="h-4 w-4 text-accent" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${isNext ? "text-accent" : "text-foreground"}`}>
                          {tile.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {tile.description}
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 text-sm ${isNext ? "text-accent font-medium" : "text-muted-foreground group-hover:text-foreground"}`}>
                        {cta}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Supporting Setup */}
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Supporting Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
              {additionalTiles.map((tile) => {
                const status = currentStatuses[tile.id] || "not_started";
                const dotClass =
                  status === "completed"
                    ? "bg-foreground/50"
                    : status === "in_progress"
                      ? "bg-accent"
                      : "bg-muted-foreground/25";
                return (
                  <button
                    key={tile.id}
                    onClick={() => setActiveTile(tile.id)}
                    className="flex items-center gap-3 py-2.5 text-left hover:text-accent transition-colors group"
                  >
                    <tile.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent shrink-0" />
                    <span className="flex-1 text-sm text-foreground">{tile.title}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} title={statusConfig[status].label} />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Preview Service */}
          <section className="border-t border-border/60 pt-8 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Preview Service</h2>
              <p className="text-sm text-muted-foreground">
                Experience how citizens and employees will interact with your service.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setMode("preview")} className="gap-2">
                <Eye className="h-4 w-4" /> Citizen Preview
              </Button>
              <Button onClick={() => setMode("preview")} variant="outline" className="gap-2">
                <UserCog className="h-4 w-4" /> Employee Preview
              </Button>
            </div>
          </section>

          {/* Go Live — readiness gated */}
          {isReady ? (
            <section className="border-t border-border/60 pt-8 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-base font-semibold text-foreground">Your service is ready to go live</h2>
                <p className="text-sm text-muted-foreground">All required setup steps are complete.</p>
              </div>
              <Button
                onClick={() => { if (service) setActiveService(service.id); navigate("/go-live"); }}
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
              >
                <Rocket className="h-4 w-4" /> Go Live
              </Button>
            </section>
          ) : (
            <p className="text-xs text-muted-foreground border-t border-border/60 pt-6">
              Complete required setup to enable Go Live.
            </p>
          )}
        </main>
      ) : (
        <main className="max-w-6xl mx-auto px-6 py-4">
          {!service?.isLive && isReady && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Experience your generated service end-to-end.</p>
              <Button
                onClick={() => { if (service) setActiveService(service.id); navigate("/go-live"); }}
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
              >
                <Rocket className="h-4 w-4" /> Go Live
              </Button>
            </div>
          )}
          <div className="rounded-xl border border-border overflow-hidden bg-background" style={{ height: "calc(100vh - 220px)" }}>
            <ServicePreviewWorkspace />
          </div>
        </main>
      )}
    </div>
  );
};

export default ServiceConfig;
