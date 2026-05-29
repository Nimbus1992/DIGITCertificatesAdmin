import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings2, Eye, BarChart3, Rocket, CheckCircle2 } from "lucide-react";
import type { ServiceItem } from "@/contexts/OnboardingContext";

type Mode = "overview" | "configure" | "preview" | "operations" | "deployment";

interface Props {
  service: ServiceItem;
  isLive: boolean;
  onNavigate: (mode: Mode) => void;
}

const Chips: React.FC<{ items: string[]; emptyLabel?: string; max?: number }> = ({
  items,
  emptyLabel = "None",
  max = 8,
}) => {
  if (!items || items.length === 0) {
    return <span className="text-sm text-muted-foreground">{emptyLabel}</span>;
  }
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {visible.map((it) => (
        <Badge key={it} variant="secondary" className="font-normal">
          {it}
        </Badge>
      ))}
      {overflow > 0 && (
        <Badge variant="outline" className="font-normal">
          +{overflow} more
        </Badge>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-6 py-3 border-b border-border/60 last:border-b-0">
    <span className="text-sm font-medium text-foreground shrink-0">{label}</span>
    <div className="text-sm text-muted-foreground text-right min-w-0">{children}</div>
  </div>
);

const CheckChip: React.FC<{ label: string }> = ({ label }) => (
  <Badge variant="secondary" className="gap-1 font-normal bg-accent/10 text-accent border-accent/20">
    <CheckCircle2 className="h-3 w-3" /> {label}
  </Badge>
);

const renewalLabel = (service: ServiceItem): string => {
  const rp = service.renewalPolicy;
  if (!rp) return "Not enabled";
  if (rp.mode === "global") return `Global (${rp.globalMonths} months)`;
  if (rp.mode === "category") return "Category Based";
  if (rp.mode === "subcategory") return "Subcategory Based";
  return "Configured";
};

const OverviewWorkspace: React.FC<Props> = ({ service, isLive, onNavigate }) => {
  const modules = service.customModules ?? [];
  const categories = service.templateSetup?.categoriesList ?? [];
  const subcategories = (service.templateSetup?.subcategoriesList ?? []).map((s) => s.name);
  const rolesGenerated = 3;

  const actions: {
    id: Mode;
    title: string;
    description: string;
    cta: string;
    icon: React.ElementType;
    disabled?: boolean;
    hint?: string;
  }[] = [
    {
      id: "configure",
      title: "Configure Service",
      description: "Forms, workflows, notifications, payments, roles.",
      cta: "Open Configuration",
      icon: Settings2,
    },
    {
      id: "preview",
      title: "Preview Applications",
      description: "Preview generated Citizen and Employee experiences.",
      cta: "Open Preview",
      icon: Eye,
    },
    {
      id: "operations",
      title: "Monitor",
      description: "Monitor application volume, SLA performance, approvals.",
      cta: "Open Reports",
      icon: BarChart3,
    },
    {
      id: "deployment",
      title: "Manage",
      description: "Authentication, domains, environments, publishing settings.",
      cta: "Manage Deployment",
      icon: Rocket,
      disabled: !isLive,
      hint: !isLive ? "Available after Go Live" : undefined,
    },
  ];

  return (
    <main className="max-w-6xl w-full mx-auto px-6 py-8 space-y-10 flex-1 min-h-0 overflow-auto">
      <section>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Your service has been initialized and is ready for configuration, preview, deployment, and monitoring.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Setup Summary</h2>
        <Card>
          <CardContent className="p-5">
            <Row label="Modules">
              <Chips items={modules} />
            </Row>
            <Row label="Categories">
              <Chips items={categories} />
            </Row>
            <Row label="Subcategories">
              <Chips items={subcategories} />
            </Row>
            <Row label="Renewal Configuration">
              <span className="text-foreground">{renewalLabel(service)}</span>
            </Row>
            <Row label="Employee Roles Generated">
              <span className="text-foreground">{rolesGenerated}</span>
            </Row>
            <Row label="Citizen Portal">
              <CheckChip label="Generated" />
            </Row>
            <Row label="Employee Workspace">
              <CheckChip label="Generated" />
            </Row>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Card
                key={a.id}
                className={`flex flex-col ${a.disabled ? "opacity-60" : "hover:shadow-md hover:border-accent/40 transition-all"}`}
              >
                <CardContent className="p-5 flex flex-col gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-base">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                  </div>
                  <div className="pt-2 space-y-1.5">
                    <Button
                      variant={a.disabled ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      disabled={a.disabled}
                      onClick={() => !a.disabled && onNavigate(a.id)}
                    >
                      {a.cta}
                    </Button>
                    {a.hint && (
                      <p className="text-[11px] text-muted-foreground text-center">{a.hint}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default OverviewWorkspace;
