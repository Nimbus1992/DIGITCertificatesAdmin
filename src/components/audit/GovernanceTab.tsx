import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGovernance } from "./AuditContext";
import { ResultBadge, EnvBadge, RelativeTime, JsonPanel, EmptyState, LoadMore } from "./shared";

type SortKey = "timestamp" | "user" | "action";

export const GovernanceTab: React.FC = () => {
  const rows = useGovernance();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [shown, setShown] = useState(20);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "timestamp", dir: "desc" });

  const sorted = [...rows].sort((a, b) => {
    const av = a[sort.key];
    const bv = b[sort.key];
    if (av === bv) return 0;
    const cmp = String(av) < String(bv) ? -1 : 1;
    return sort.dir === "asc" ? cmp : -cmp;
  });
  const visible = sorted.slice(0, shown);

  const toggleSort = (k: SortKey) =>
    setSort((s) => ({ key: k, dir: s.key === k && s.dir === "desc" ? "asc" : "desc" }));

  if (rows.length === 0) return <EmptyState />;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-8" />
            <TableHead className="h-9 cursor-pointer select-none" onClick={() => toggleSort("timestamp")}>
              <span className="inline-flex items-center gap-1 text-xs">Timestamp <ArrowUpDown className="h-3 w-3" /></span>
            </TableHead>
            <TableHead className="h-9 cursor-pointer select-none" onClick={() => toggleSort("user")}>
              <span className="inline-flex items-center gap-1 text-xs">User <ArrowUpDown className="h-3 w-3" /></span>
            </TableHead>
            <TableHead className="h-9 cursor-pointer select-none" onClick={() => toggleSort("action")}>
              <span className="inline-flex items-center gap-1 text-xs">Action <ArrowUpDown className="h-3 w-3" /></span>
            </TableHead>
            <TableHead className="h-9 text-xs">Entity</TableHead>
            <TableHead className="h-9 text-xs">Scope</TableHead>
            <TableHead className="h-9 text-xs">Result</TableHead>
            <TableHead className="h-9 text-xs">Environment</TableHead>
            <TableHead className="h-9 text-xs text-right pr-4">Audit ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((r) => {
            const isOpen = !!expanded[r.id];
            return (
              <React.Fragment key={r.id}>
                <TableRow
                  className={cn("cursor-pointer", isOpen && "bg-muted/40")}
                  onClick={() => setExpanded((e) => ({ ...e, [r.id]: !e[r.id] }))}
                >
                  <TableCell className="py-2 pl-4">
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="py-2"><RelativeTime ts={r.timestamp} /></TableCell>
                  <TableCell className="py-2 text-sm font-medium text-foreground">{r.user}</TableCell>
                  <TableCell className="py-2 text-sm">{r.action}</TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">{r.entity}</TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{r.scope}</TableCell>
                  <TableCell className="py-2"><ResultBadge result={r.result} /></TableCell>
                  <TableCell className="py-2"><EnvBadge env={r.environment} /></TableCell>
                  <TableCell className="py-2 text-right pr-4 font-mono text-xs text-muted-foreground">{r.id}</TableCell>
                </TableRow>
                {isOpen && (
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableCell colSpan={9} className="p-0">
                      <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-1 space-y-2">
                          <DetailRow label="Performed by" value={r.user} />
                          <DetailRow label="Timestamp" value={new Date(r.timestamp).toLocaleString()} />
                          <DetailRow label="Audit ID" mono value={r.id} />
                          <DetailRow label="IP address" mono value={r.ip} />
                          <DetailRow label="Environment" value={<EnvBadge env={r.environment} />} />
                          <DetailRow
                            label="Affected services"
                            value={r.affectedServices.length ? r.affectedServices.join(", ") : "—"}
                          />
                          {r.related.length > 0 && (
                            <DetailRow
                              label="Related"
                              value={
                                <span className="font-mono text-xs text-primary">{r.related.join(", ")}</span>
                              }
                            />
                          )}
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <JsonPanel label="Before" value={r.before} tone="before" />
                          <JsonPanel label="After" value={r.after} tone="after" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
      <div className="px-4 py-2 border-t">
        <LoadMore shown={Math.min(shown, rows.length)} total={rows.length} onMore={() => setShown((s) => s + 20)} />
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-start gap-3 text-xs">
    <span className="w-32 shrink-0 text-muted-foreground uppercase tracking-wider text-[10px] pt-0.5">{label}</span>
    <span className={cn("text-foreground", mono && "font-mono")}>{value}</span>
  </div>
);
