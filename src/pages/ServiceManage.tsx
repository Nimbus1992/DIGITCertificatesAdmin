import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, ExternalLink, Eye, Users, Languages, Globe, Monitor } from "lucide-react";
import { toast } from "sonner";

const ServiceManage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useOnboarding();

  const service = state.services.find((s) => s.id === id);

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Application not found.</p>
      </div>
    );
  }

  const serviceSlug = service.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const citizenUrl = `https://${serviceSlug}.citizen.lovable.app`;
  const employeeUrl = `https://${serviceSlug}.employee.lovable.app`;

  const handleCopy = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`${label} URL copied to clipboard`);
  };

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{service.name}</h1>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                Live
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Manage your live application</p>
          </div>
        </div>

        {/* App Links */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Application Links</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Citizen App */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4 text-accent" /> Citizen App
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px]">Public</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">For citizens to apply, track, and manage their applications.</p>
                  <div className="flex items-center gap-1.5 bg-muted rounded-md px-3 py-2">
                    <span className="text-xs text-foreground truncate flex-1 font-mono">{citizenUrl}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(citizenUrl, "Citizen App")}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => window.open(citizenUrl, "_blank")}>
                    <ExternalLink className="h-3.5 w-3.5" /> Open Citizen App
                  </Button>
                </CardContent>
              </Card>

              {/* Employee App */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-accent" /> Employee App
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px]">Internal</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">For employees to review, approve, and manage applications.</p>
                  <div className="flex items-center gap-1.5 bg-muted rounded-md px-3 py-2">
                    <span className="text-xs text-foreground truncate flex-1 font-mono">{employeeUrl}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(employeeUrl, "Employee App")}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => window.open(employeeUrl, "_blank")}>
                    <ExternalLink className="h-3.5 w-3.5" /> Open Employee App
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Go Live Setup */}
          <div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Go Live Setup</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/setup/users")}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Manage Users</p>
                    <p className="text-xs text-muted-foreground">Add or remove team members and roles</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/config/languages")}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Languages className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Localization</p>
                    <p className="text-xs text-muted-foreground">Add languages and manage translations</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Preview</h2>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/service/${id}/preview`)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Application Preview</p>
                  <p className="text-xs text-muted-foreground">Preview citizen and employee experiences</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceManage;
