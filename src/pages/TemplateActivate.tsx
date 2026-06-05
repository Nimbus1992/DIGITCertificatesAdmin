import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Briefcase, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { allTemplates } from "@/data/serviceTemplates";
import { useOnboarding, type ServiceItem } from "@/contexts/OnboardingContext";
import { usePersona } from "@/contexts/PersonaContext";
import { PERSONA_SEEDS } from "@/data/personaSeeds";

const TemplateActivate: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { addService } = useOnboarding();
  const { persona } = usePersona();

  const template = useMemo(
    () => allTemplates.find((t) => t.id === templateId),
    [templateId],
  );

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!template || template.comingSoon) navigate("/templates", { replace: true });
  }, [template, navigate]);

  const suggestions = useMemo(() => {
    const seeded = PERSONA_SEEDS.filter((p) => p.role === "service_owner").map((p) => p.email);
    const invited = persona.invitedUsers
      .filter((u) => u.role === "service_owner")
      .map((u) => u.email.toLowerCase());
    return Array.from(new Set([...seeded, ...invited]));
  }, [persona.invitedUsers]);

  if (!template) return null;

  const Icon = template.icon;
  const trimmed = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

  const createDraft = (owner?: string) => {
    if (submitting) return;
    setSubmitting(true);
    const id = `${template.id}-${Date.now().toString(36)}`;
    const draft: ServiceItem = {
      id,
      name: template.name,
      templateId: template.id,
      status: "draft",
      customModules: ["Issuance"],
      isPublished: false,
      isLive: false,
      deployment: { availabilityScope: "entire_state", selectedItems: [] },
      teamMembers: [],
      authMethod: "email",
      assignedOwners: owner ? [owner] : [],
    };
    addService(draft);

    if (owner) {
      toast.success(`Owner invited`, {
        description: `${owner} will receive an invite to complete setup.`,
      });
    } else {
      toast.success("Draft created", {
        description: "Continue setup from your services workspace.",
      });
    }

    navigate(`/templates?recent=${encodeURIComponent(id)}`);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/templates")}
          className="gap-1 mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Button>

        {/* Template chip */}
        <div className="flex items-center gap-3 mb-8 p-4 rounded-lg border border-border bg-card">
          <span className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Activating template
            </p>
            <h2 className="text-sm font-semibold text-foreground">{template.name}</h2>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Assign a service owner
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          The service owner names the service, configures modules, sets renewal rules, and
          designs the workflow. You can skip this step and set things up yourself — you'll
          be able to assign an owner later.
        </p>

        <div className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Owner email
            </Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@city.gov"
                className="h-10 pl-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && valid) createDraft(trimmed);
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              They'll get an invite to continue setup. Optional — you can skip.
            </p>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Suggestions
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEmail(s)}
                    className="text-xs px-2.5 py-1 rounded-md border border-border bg-card hover:border-primary/40 hover:bg-muted/40 transition-colors flex items-center gap-1.5"
                  >
                    <Briefcase className="h-3 w-3 text-muted-foreground" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => createDraft()}
            disabled={submitting}
            className="h-10"
          >
            Skip — I'll set it up
          </Button>
          <Button
            onClick={() => createDraft(trimmed)}
            disabled={!valid || submitting}
            className="h-10 px-5 gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            Assign and create draft
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateActivate;
