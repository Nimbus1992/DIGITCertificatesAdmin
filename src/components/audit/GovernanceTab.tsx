import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
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

  if (rows.length === 0) return <div className="p-4"><EmptyState /></div>;

  return (
    <div>
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b">
            <SortableHead label="Timestamp" k="timestamp" sort={sort} onClick={toggleSort} className="pl-4 w-[160px]" />
            <SortableHead label="User" k="user" sort={sort} onClick={toggleSort} />
            <SortableHead label="Action" k="action" sort={sort} onClick={toggleSort} />
            <Th>Entity</Th>
            <Th>Scope</Th>
            <Th>Result</Th>
            <Th>Environment</Th>
            <Th className="text-right pr-4">Audit ID</Th>
            <TableHead className="w-[110px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((r, idx) => {
            const isOpen = !!expanded[r.id];
            const severityBorder =
              r.result === "failed"
                ? "border-l-2 border-l-destructive"
                : r.result === "warning"
                ? "border-l-2 border-l-warning"
                : "border-l-2 border-l-transparent";
            const severityTint =
              r.result === "warning" ? "bg-warning/[0.04]" : "";
            return (
              <React.Fragment key={r.id}>
                <TableRow
                  className={cn(
                    "group cursor-pointer border-b transition-colors",
                    severityBorder,
                    severityTint,
                    idx % 2 === 1 && r.result === "success" && "bg-muted/[0.18]",
                    "hover:bg-muted/40",
                    isOpen && "bg-muted/40",
                  )}
                  onClick={() => setExpanded((e) => ({ ...e, [r.id]: !e[r.id] }))}
                >
                  <TableCell className="py-3 pl-4 align-top">
                    <RelativeTime ts={r.timestamp} stacked />
                  </TableCell>
                  <TableCell className="py-3 align-top text-sm font-medium text-foreground">{r.user}</TableCell>
                  <TableCell className="py-3 align-top text-sm">{r.action}</TableCell>
                  <TableCell className="py-3 align-top text-sm text-muted-foreground">{r.entity}</TableCell>
                  <TableCell className="py-3 align-top text-xs text-muted-foreground">{r.scope}</TableCell>
                  <TableCell className="py-3 align-top"><ResultBadge result={r.result} /></TableCell>
                  <TableCell className="py-3 align-top"><EnvBadge env={r.environment} /></TableCell>
                  <TableCell className="py-3 align-top text-right pr-4 font-mono text-xs text-muted-foreground">
                    {r.id}
                  </TableCell>
                  <TableCell className="py-3 pr-4 align-top text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity",
                        "group-hover:opacity-100",
                        isOpen && "opacity-100",
                      )}
                    >
                      {isOpen ? "Hide" : "View details"}
                      <ChevronDown
                        className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
                      />
                    </span>
                  </TableCell>
                </TableRow>
                {isOpen && (
                  <TableRow className="bg-muted/20 hover:bg-muted/20 border-b">
                    <TableCell colSpan={9} className="p-0">
                      <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4 border-t">
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
      <div className="px-4 py-3 border-t bg-muted/20">
        <LoadMore shown={Math.min(shown, rows.length)} total={rows.length} onMore={() => setShown((s) => s + 20)} />
      </div>
    </div>
  );
};

const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <TableHead className={cn("h-10 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", className)}>
    {children}
  </TableHead>
);

const SortableHead: React.FC<{
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onClick: (k: SortKey) => void;
  className?: string;
}> = ({ label, k, sort, onClick, className }) => (
  <TableHead
    onClick={() => onClick(k)}
    className={cn(
      "h-10 cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground",
      className,
    )}
  >
    <span className="inline-flex items-center gap-1">
      {label}
      <ArrowUpDown className={cn("h-3 w-3", sort.key === k ? "text-foreground" : "text-muted-foreground/50")} />
    </span>
  </TableHead>
);

const DetailRow: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-start gap-3 text-xs">
    <span className="w-32 shrink-0 text-muted-foreground uppercase tracking-wider text-[10px] pt-0.5">{label}</span>
    <span className={cn("text-foreground", mono && "font-mono")}>{value}</span>
  </div>
);
