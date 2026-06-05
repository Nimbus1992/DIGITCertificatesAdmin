import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShieldCheck, Users, MapPin, Palette, Languages, Bell, Server, Rocket, Check, Sparkles, Clock } from "lucide-react";
import RoleAccessSetup from "@/components/go-live/RoleAccessSetup";
import GoLiveSuccess from "@/components/go-live/GoLiveSuccess";

type Status = "not-started" | "in-progress" | "completed";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: typeof ShieldCheck;
  required: boolean;
  /** If provided, navigates instead of opening inline component */
  navigateTo?: string;
  /** Inline component (e.g. authentication). */
  component?: React.FC<{ onComplete: () => void; onBack: () => void }>;
}

const STORAGE_KEY = "go-live-checklist-status";

const GoLive: React.FC = () => {
  const { state, updateService } = useOnboarding();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, Status>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [comingSoonFor, setComingSoonFor] = useState<string | null>(null);

  const activeService = state.services.find((s) => s.id === state.activeServiceId);

  const checklist: ChecklistItem[] = [
    { id: "auth", label: "Authentication", description: "Set access type and sign-in method per role", icon: ShieldCheck, required: true, component: RoleAccessSetup },
    { id: "users", label: "Users & Roles", description: "Invite users and assign roles", icon: Users, required: false, navigateTo: "/setup/users" },
    { id: "boundary", label: "Boundary Configuration", description: "Configure geographic or administrative boundaries", icon: MapPin, required: true, navigateTo: "/boundary?from=go-live" },
    { id: "branding", label: "Branding & Theme", description: "Logo, colors and portal name", icon: Palette, required: false, navigateTo: "/config/branding" },
    { id: "languages", label: "Languages", description: "Add language support", icon: Languages, required: false },
    { id: "notifications", label: "Notifications", description: "Configure email and SMS templates", icon: Bell, required: false },
    { id: "deployment", label: "Deployment", description: "Subdomain and license key", icon: Server, required: false },
  ];

  const requiredItems = checklist.filter((c) => c.required);
  const optionalItems = checklist.filter((c) => !c.required);
  const requiredComplete = requiredItems.every((item) => statuses[item.id] === "completed");

  const persist = (next: Record<string, Status>) => {
    setStatuses(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const setStatus = (id: string, s: Status) => persist({ ...statuses, [id]: s });

  const handleItemComplete = (id: string) => {
    setStatus(id, "completed");
    setActiveStep(null);
  };

  const handleOpen = (item: ChecklistItem) => {
    setStatus(item.id, statuses[item.id] === "completed" ? "completed" : "in-progress");
    if (item.navigateTo) {
      navigate(item.navigateTo);
      return;
    }
    if (item.component) {
      setActiveStep(item.id);
      return;
    }
    setComingSoonFor(item.label);
  };

  const handleGoLive = () => {
    if (activeService) updateService(activeService.id, { isLive: true, status: "live" });
    setShowSuccess(true);
  };

  if (showSuccess) return <GoLiveSuccess />;

  if (activeStep) {
    const item = checklist.find((c) => c.id === activeStep);
    if (item?.component) {
      const Comp = item.component;
      return <Comp onComplete={() => handleItemComplete(item.id)} onBack={() => setActiveStep(null)} />;
    }
  }

  const renderRow = (item: ChecklistItem) => {
    const Icon = item.icon;
    const status: Status = statuses[item.id] ?? "not-started";
    const isComplete = status === "completed";
    const isProgress = status === "in-progress";

    return (
      <Card
        key={item.id}
        className={`cursor-pointer transition-all hover:shadow-md ${isComplete ? "border-accent/30 bg-accent/5" : ""}`}
        onClick={() => handleOpen(item)}
      >
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isComplete ? "bg-accent text-accent-foreground" : isProgress ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : "bg-secondary text-muted-foreground"}`}>
              {isComplete ? <Check className="h-4 w-4" /> : isProgress ? <Clock className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-medium truncate ${isComplete ? "text-accent" : "text-foreground"}`}>{item.label}</p>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
          </div>
          {isComplete ? (
            <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30 text-xs">Completed</Badge>
          ) : isProgress ? (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-xs">In progress</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">{item.required ? "Required" : "Not started"}</Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="bg-background px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Button
          variant="ghost"
          onClick={() => {
            const sid = activeService?.id ?? state.activeServiceId;
            if (sid) navigate(`/service/${sid}/configure`);
            else navigate("/templates");
          }}
          className="gap-1 mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Rocket className="h-7 w-7 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Ready to go live?</h2>
          <p className="text-sm text-muted-foreground">
            {activeService ? `Launch "${activeService.name}" by completing the steps below.` : "Complete the required steps below, then launch your application."}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Required</p>
          {requiredItems.map(renderRow)}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-4">Optional</p>
          {optionalItems.map(renderRow)}
        </div>

        <Dialog open={!!comingSoonFor} onOpenChange={(o) => !o && setComingSoonFor(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-2">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <DialogTitle>Coming soon</DialogTitle>
              <DialogDescription>
                {comingSoonFor} will be available in an upcoming release. Stay tuned!
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <div className="mt-8">
          <Button onClick={handleGoLive} disabled={!requiredComplete} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-12 text-base">
            <Rocket className="h-5 w-5" /> Go Live
          </Button>
          {!requiredComplete && (
            <p className="text-xs text-center text-muted-foreground mt-2">Complete all required steps to enable Go Live</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoLive;
