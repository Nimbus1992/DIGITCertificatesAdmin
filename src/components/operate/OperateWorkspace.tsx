import React, { useMemo, useState } from "react";
import {
  BarChart3,
  Gauge,
  ListChecks,
  ClipboardList,
  FileSpreadsheet,
  Activity,
  Circle,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useOperationsMetadata } from "@/components/operations/useOperationsMetadata";
import { buildOperationsData } from "@/components/operations/mockData";
import {
  OperationsFilterBar,
  DEFAULT_FILTERS,
  type OpsFilters,
} from "@/components/operations/shared/FilterBar";
import { AnalyticsView } from "@/components/operations/views/AnalyticsView";
import { SlaView } from "@/components/operations/views/SlaView";
import { QueuesView } from "@/components/operations/views/QueuesView";
import { AuditView } from "@/components/operations/views/AuditView";
import { ReportsView } from "@/components/operations/views/ReportsView";

type Section = "analytics" | "sla" | "queues" | "audit" | "reports" | "manage";

const SECTIONS: { id: Section; label: string; icon: React.ElementType; description: string }[] = [
  { id: "analytics", label: "Analytics", icon: BarChart3, description: "Operational dashboards" },
  { id: "sla", label: "SLA Monitoring", icon: Gauge, description: "Compliance & breaches" },
  { id: "queues", label: "Workflow Queues", icon: ListChecks, description: "Live work assignment" },
  { id: "audit", label: "Audit Logs", icon: ClipboardList, description: "System activity trail" },
  { id: "reports", label: "Reports & Exports", icon: FileSpreadsheet, description: "Prebuilt exports" },
  { id: "manage", label: "Manage", icon: Settings, description: "Runtime & deployment" },
];

const manageSections: { title: string; description: string }[] = [
  { title: "Production Status", description: "Real-time health, uptime, and recent incidents." },
  { title: "Active Modules", description: "Modules currently serving live traffic." },
  { title: "Published Versions", description: "Released versions and rollback history." },
  { title: "Operational Settings", description: "Runtime configuration for the live service." },
  { title: "Monitoring", description: "Metrics, alerts, and performance signals." },
  { title: "Integrations", description: "Connected systems and outbound services." },
  { title: "Audit Logs", description: "Activity trail across operators and applicants." },
  { title: "Environment Management", description: "Manage staging, production, and secrets." },
];

const ManageView: React.FC<{ serviceUrl?: string; isLive: boolean }> = ({ serviceUrl, isLive }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-foreground">Manage</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Operational controls for your live service.
      </p>
    </div>
    {isLive && (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="font-medium text-foreground">Live</span>
        {serviceUrl && (
          <a
            href={serviceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline ml-2"
          >
            {serviceUrl}
          </a>
        )}
      </div>
    )}
    <div className="border-t border-border/60">
      {manageSections.map((s) => (
        <div
          key={s.title}
          className="flex items-center justify-between py-4 border-b border-border/60"
        >
          <div>
            <h3 className="text-sm font-medium text-foreground">{s.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Coming soon
          </span>
        </div>
      ))}
    </div>
  </div>
);

interface Props {
  serviceId: string;
  serviceUrl?: string;
}

export const OperateWorkspace: React.FC<Props> = ({ serviceId, serviceUrl }) => {
  const { state } = useOnboarding();
  const service = state.services.find((s) => s.id === serviceId);
  const isLive = !!service?.isLive;
  const meta = useOperationsMetadata(service);
  const [section, setSection] = useState<Section>("analytics");
  const [filters, setFilters] = useState<OpsFilters>(DEFAULT_FILTERS);
  const [syncStamp, setSyncStamp] = useState(() => new Date());

  const data = useMemo(() => buildOperationsData(meta), [meta]);
  const lastSynced = useMemo(() => {
    return syncStamp.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [syncStamp]);

  const handleExport = () => {
    toast.success(`${SECTIONS.find((s) => s.id === section)?.label} export queued`);
  };

  const showFilterBar = section !== "manage";

  return (
    <div className="flex h-full min-h-0 bg-muted/30 flex-col">
      {!isLive && (
        <div className="shrink-0 border-b border-warning/30 bg-warning/10 px-6 py-2.5 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <div className="text-xs text-foreground">
            <span className="font-medium">Preview with sample data.</span>{" "}
            <span className="text-muted-foreground">
              You'll see real data here once the service goes live.
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-1 min-h-0">
        {/* Left secondary nav */}
        <aside className="w-60 shrink-0 border-r bg-card flex flex-col">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Operate
              </h2>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Circle
                className={cn(
                  "h-1.5 w-1.5 fill-current",
                  isLive ? "text-success" : "text-muted-foreground",
                )}
              />
              <span className="capitalize">{isLive ? "live" : "draft"}</span>
              <span>·</span>
              <span className="truncate">{meta.serviceName}</span>
            </div>
          </div>
          <nav className="flex-1 p-2 space-y-0.5">
            {SECTIONS.map((s) => {
              const active = section === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={cn(
                    "w-full flex items-start gap-2.5 px-2.5 py-2 rounded text-left transition-colors",
                    active
                      ? "bg-primary/8 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <s.icon
                    className={cn("h-4 w-4 mt-0.5 shrink-0", active && "text-primary")}
                  />
                  <div className="min-w-0">
                    <div className={cn("text-[13px] font-medium", active && "text-foreground")}>
                      {s.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {s.description}
                    </div>
                  </div>
                  {active && (
                    <span className="ml-auto w-0.5 self-stretch bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
          <div className="px-3 py-2.5 border-t text-[10px] text-muted-foreground leading-relaxed">
            Sections appear based on enabled modules. Analytics is auto-generated from your service
            configuration.
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          {showFilterBar && (
            <div className="sticky top-0 z-10">
              <OperationsFilterBar
                filters={filters}
                onChange={setFilters}
                meta={meta}
                lastSynced={lastSynced}
                onRefresh={() => {
                  setSyncStamp(new Date());
                  toast.success("Data refreshed");
                }}
                onExport={handleExport}
              />
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <div className="max-w-[1400px] mx-auto px-6 py-6">
              {section === "analytics" && <AnalyticsView meta={meta} data={data} />}
              {section === "sla" && <SlaView meta={meta} data={data} />}
              {section === "queues" && <QueuesView meta={meta} data={data} />}
              {section === "audit" && <AuditView scopeId={serviceId} />}
              {section === "reports" && <ReportsView />}
              {section === "manage" && (
                <ManageView serviceUrl={serviceUrl} isLive={isLive} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
