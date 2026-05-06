import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShieldCheck, Palette, Plug, Languages, Rocket, Check, KeyRound, Globe } from "lucide-react";
import DeploymentSetup from "@/components/go-live/DeploymentSetup";
import RoleAccessSetup from "@/components/go-live/RoleAccessSetup";
import LicenseKeySetup from "@/components/go-live/LicenseKeySetup";
import SubdomainSetup from "@/components/go-live/SubdomainSetup";
import IntegrationsDialog from "@/components/go-live/IntegrationsDialog";
import GoLiveSuccess from "@/components/go-live/GoLiveSuccess";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: typeof MapPin;
  required: boolean;
  component: React.FC<{ onComplete: () => void; onBack: () => void }>;
}

const GoLive: React.FC = () => {
  const { state, updateService } = useOnboarding();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);

  const activeService = state.services.find((s) => s.id === state.activeServiceId);

  const checklist: ChecklistItem[] = [
    { id: "deployment", label: "Deployment Setup", description: "Configure where your application will be available", icon: MapPin, required: true, component: DeploymentSetup },
    { id: "subdomain", label: "Customize your subdomain", description: "Set the URL users use to access the app", icon: Globe, required: true, component: SubdomainSetup },
    { id: "access", label: "User Access & Authentication", description: "Set access type and sign-in method per role", icon: ShieldCheck, required: true, component: RoleAccessSetup },
    { id: "license", label: "License Key", description: "Enter your application license key to activate", icon: KeyRound, required: true, component: LicenseKeySetup },
  ];

  const requiredComplete = checklist.filter((item) => item.required).every((item) => completedItems.includes(item.id));

  const handleItemComplete = (id: string) => {
    setCompletedItems((prev) => [...prev, id]);
    setActiveStep(null);
  };

  const handleGoLive = () => {
    if (activeService) {
      updateService(activeService.id, { isLive: true, status: "live" });
    }
    setShowSuccess(true);
  };

  if (showSuccess) return <GoLiveSuccess />;

  if (activeStep) {
    const item = checklist.find((c) => c.id === activeStep);
    if (item) {
      const Comp = item.component;
      return <Comp onComplete={() => handleItemComplete(item.id)} onBack={() => setActiveStep(null)} />;
    }
  }

  return (
    <div className="bg-background px-4 py-12">
      <div className="max-w-lg mx-auto">
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
          {checklist.filter((c) => c.required).map((item) => {
            const Icon = item.icon;
            const isComplete = completedItems.includes(item.id);
            return (
              <Card key={item.id} className={`cursor-pointer transition-all hover:shadow-md ${isComplete ? "border-accent/30 bg-accent/5" : ""}`} onClick={() => !isComplete && setActiveStep(item.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isComplete ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isComplete ? "text-accent" : "text-foreground"}`}>{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  {isComplete ? (
                    <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30 text-xs">Done</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-4">Optional</p>
          {[
            { icon: Palette, label: "Customize Theme", description: "Brand colors and appearance", onClick: () => navigate("/config/branding") },
            { icon: Plug, label: "Integrations", description: "Connect external applications", onClick: () => setIntegrationsOpen(true) },
            { icon: Languages, label: "Additional Languages", description: "Add more language support", onClick: () => {} },
          ].map((item) => (
            <Card key={item.label} className="opacity-70 cursor-pointer hover:opacity-100 transition-all" onClick={item.onClick}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">Optional</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <IntegrationsDialog open={integrationsOpen} onOpenChange={setIntegrationsOpen} />

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
