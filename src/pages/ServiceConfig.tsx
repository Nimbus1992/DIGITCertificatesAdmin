import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Eye, Rocket, Check, Info } from "lucide-react";
import { defaultModules, configTiles } from "@/data/serviceModules";
import RolesDesigner from "@/components/service-config/RolesDesigner";
import NotificationsManager from "@/components/service-config/NotificationsManager";
import ChecklistBuilder from "@/components/service-config/ChecklistBuilder";
import FormBuilder from "@/components/service-config/FormBuilder";
import DocumentDesigner from "@/components/service-config/DocumentDesigner";
import WorkflowDesigner from "@/components/service-config/WorkflowDesigner";
import FeesConfigurator from "@/components/service-config/FeesConfigurator";
import PaymentsConfigurator from "@/components/service-config/PaymentsConfigurator";

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
  const progressPercent = (completedCount / configTiles.length) * 100;

  const activeTileData = activeTile ? configTiles.find((t) => t.id === activeTile) : null;

  const isPublished = service?.isPublished || state.isPublished;

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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground text-lg">{serviceName}</h1>
              <p className="text-xs text-muted-foreground">Configure flows and settings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedModule} onValueChange={(v) => { setSelectedModule(v); setActiveTile(null); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modules.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(`/service/${id}/preview`)}>
              <Eye className="h-4 w-4" /> Preview
            </Button>
            {!service?.isLive && (
              <Button onClick={() => { if (service) setActiveService(service.id); navigate("/go-live"); }} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
                <Rocket className="h-4 w-4" /> Go Live
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-foreground">
              You're configuring the <span className="font-semibold">{currentModule.name}</span> module. Switch modules using the dropdown above.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Each module has its own configuration. Complete these steps for each module before going live.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Progress value={progressPercent} className="h-2 flex-1" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {completedCount} of {configTiles.length} configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configTiles.map((tile) => {
            const status = currentStatuses[tile.id] || "not_started";
            const cfg = statusConfig[status];
            return (
              <Card key={tile.id} className="relative group hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTile(tile.id)}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <tile.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {tile.required && <span className="w-1.5 h-1.5 rounded-full bg-destructive" title="Required" />}
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${cfg.className}`}>{cfg.label}</Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{tile.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tile.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors"
                    onClick={(e) => { e.stopPropagation(); setActiveTile(tile.id); }}
                  >
                    {tile.ctaLabel}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ServiceConfig;
