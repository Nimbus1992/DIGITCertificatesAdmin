import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowRight, Settings, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "@/contexts/OnboardingContext";

const OwnerHome: React.FC = () => {
  const navigate = useNavigate();
  const { state, setActiveService } = useOnboarding();
  const services = state.services ?? [];
  const serviceOwners = state.serviceOwners ?? [];

  // For demo: an owner sees every service they were assigned. Without real auth, show all assigned services.
  const myServices = services.filter((s) =>
    serviceOwners.some((o) => o.serviceId === s.id),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Services</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Services assigned to you. Start setup to configure forms, workflow, team, and go live.
          </p>
        </div>

        {myServices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium">No services assigned yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your administrator hasn't assigned a service to you yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myServices.map((s) => (
              <Card key={s.id} className="hover:shadow-md hover:border-accent/40 transition-all">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/15 border border-accent/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground">{s.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={s.isLive ? "bg-green-100 text-green-700 border-green-300" : "bg-warning/15 text-warning border-warning/30"}>
                        {s.isLive ? "Live" : "Draft"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{(s.customModules ?? []).length} module{(s.customModules ?? []).length > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  {s.isLive ? (
                    <Button variant="outline" onClick={() => { setActiveService(s.id); navigate(`/service/${s.id}/manage`); }} className="gap-2">
                      <Settings className="h-4 w-4" /> Manage
                    </Button>
                  ) : (
                    <Button onClick={() => { setActiveService(s.id); navigate(`/service/${s.id}/configure`); }} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                      <Rocket className="h-4 w-4" /> Start Setup <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerHome;
