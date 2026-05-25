import React from "react";
import { Download, FileDown } from "lucide-react";
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

const HeaderActions: React.FC = () => {
  return (
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
};

const AuditLogsInner: React.FC = () => (
  <div className="px-6 py-6 max-w-[1400px] mx-auto">
    {/* Header */}
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Track platform governance, service configuration changes, deployments, and operational activity across the
          workspace.
        </p>
      </div>
      <HeaderActions />
    </div>

    <AuditFilterBar />

    <Tabs defaultValue="governance" className="mt-4">
      <TabsList className="grid w-full grid-cols-4 max-w-2xl">
        <TabsTrigger value="governance">Governance</TabsTrigger>
        <TabsTrigger value="config">Configuration Activity</TabsTrigger>
        <TabsTrigger value="deployments">Deployments</TabsTrigger>
        <TabsTrigger value="runtime">Runtime Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="governance" className="mt-4">
        <GovernanceTab />
      </TabsContent>
      <TabsContent value="config" className="mt-4">
        <ConfigActivityTab />
      </TabsContent>
      <TabsContent value="deployments" className="mt-4">
        <DeploymentsTab />
      </TabsContent>
      <TabsContent value="runtime" className="mt-4">
        <RuntimeActivityTab />
      </TabsContent>
    </Tabs>
  </div>
);

const AuditLogs: React.FC = () => (
  <AuditProvider>
    <AuditLogsInner />
  </AuditProvider>
);

export default AuditLogs;
