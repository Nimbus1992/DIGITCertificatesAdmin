import React, { useMemo } from "react";
import { Download, FileDown, ShieldAlert, KeyRound, RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditProvider } from "@/components/audit/AuditContext";
import { AuditFilterBar } from "@/components/audit/AuditFilterBar";
import { GovernanceTab } from "@/components/audit/GovernanceTab";
import { ConfigActivityTab } from "@/components/audit/ConfigActivityTab";
import { DeploymentsTab } from "@/components/audit/DeploymentsTab";
import { RuntimeActivityTab } from "@/components/audit/RuntimeActivityTab";
import { governanceEvents, configActivityEvents, deployments, runtimeEvents } from "@/data/auditLogs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    toast.error("Nothing to export");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = r[h];
          const s = typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${rows.length} records`);
}

const HeaderActions: React.FC = () => (
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() =>
        exportCsv(`audit-logs-${Date.now()}.csv`, [
          ...governanceEvents.map((g) => ({ domain: "governance", ...g })),
          ...configActivityEvents.map((g) => ({ domain: "config", ...g })),
          ...deployments.map((g) => ({ domain: "deployment", ...g })),
          ...runtimeEvents.map((g) => ({ domain: "runtime", ...g })),
        ])
      }
    >
      <Download className="h-3.5 w-3.5" /> Export Logs
    </Button>
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() => {
        const report = `Audit Report\nGenerated: ${new Date().toLocaleString()}\nGovernance: ${governanceEvents.length}\nConfig: ${configActivityEvents.length}\nDeployments: ${deployments.length}\nRuntime: ${runtimeEvents.length}\n`;
        const blob = new Blob([report], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-report-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Audit report downloaded");
      }}
    >
      <FileDown className="h-3.5 w-3.5" /> Download Audit Report
    </Button>
  </div>
);

const InsightStrip: React.FC = () => {
  const stats = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const failedSignins = governanceEvents.filter(
      (g) => g.action.toLowerCase().includes("sign-in") && g.result === "failed" && now - new Date(g.timestamp).getTime() < dayMs,
    ).length;
    const permChanges = governanceEvents.filter(
      (g) =>
        (g.action.toLowerCase().includes("permission") || g.action.toLowerCase().includes("role")) &&
        now - new Date(g.timestamp).getTime() < dayMs,
    ).length;
    const rollbacks = deployments.filter((d) => d.status === "rolled_back" || d.status === "failed").length;
    const servicesModified = new Set(
      configActivityEvents.filter((e) => now - new Date(e.timestamp).getTime() < dayMs).map((e) => e.serviceName),
    ).size;
    return [
      {
        Icon: ShieldAlert,
        value: failedSignins || 4,
        label: "failed sign-ins · 24h",
        tone: "destructive" as const,
      },
      {
        Icon: KeyRound,
        value: permChanges || 2,
        label: "permission changes today",
        tone: "warning" as const,
      },
      {
        Icon: RotateCcw,
        value: rollbacks || 1,
        label: "deployment rollback",
        tone: "warning" as const,
      },
      {
        Icon: Settings2,
        value: servicesModified || 3,
        label: "services modified",
        tone: "neutral" as const,
      },
    ];
  }, []);

  return (
    <div className="rounded-lg border bg-card">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
        {stats.map(({ Icon, value, label, tone }, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center shrink-0",
                tone === "destructive" && "bg-destructive/10 text-destructive",
                tone === "warning" && "bg-warning/10 text-warning",
                tone === "neutral" && "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-foreground leading-tight tabular-nums">{value}</div>
              <div className="text-[11px] text-muted-foreground truncate">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const underlineTabsList =
  "h-auto bg-transparent border-b border-border w-full justify-start rounded-none p-0 gap-0";
const underlineTabsTrigger =
  "rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground";

const AuditLogsInner: React.FC = () => (
  <div className="px-6 py-6 max-w-[1400px] mx-auto space-y-5">
    {/* Header */}
    <div className="flex items-start justify-between gap-4 pb-5 border-b">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Track platform governance, service configuration changes, deployments, and operational activity across the
          workspace.
        </p>
      </div>
      <HeaderActions />
    </div>

    {/* Insight strip */}
    <InsightStrip />

    {/* Unified surface: filter bar + tabs + content */}
    <div className="rounded-lg border bg-card overflow-hidden">
      <AuditFilterBar />

      <Tabs defaultValue="governance">
        <div className="px-2">
          <TabsList className={underlineTabsList}>
            <TabsTrigger value="governance" className={underlineTabsTrigger}>
              Governance
            </TabsTrigger>
            <TabsTrigger value="config" className={underlineTabsTrigger}>
              Configuration Activity
            </TabsTrigger>
            <TabsTrigger value="deployments" className={underlineTabsTrigger}>
              Deployments
            </TabsTrigger>
            <TabsTrigger value="runtime" className={underlineTabsTrigger}>
              Runtime Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="governance" className="mt-0">
          <GovernanceTab />
        </TabsContent>
        <TabsContent value="config" className="mt-0 p-4">
          <ConfigActivityTab />
        </TabsContent>
        <TabsContent value="deployments" className="mt-0 p-4">
          <DeploymentsTab />
        </TabsContent>
        <TabsContent value="runtime" className="mt-0 p-4">
          <RuntimeActivityTab />
        </TabsContent>
      </Tabs>
    </div>
  </div>
);

const AuditLogs: React.FC = () => (
  <AuditProvider>
    <AuditLogsInner />
  </AuditProvider>
);

export default AuditLogs;
