import React, { useState } from "react";
import { ChevronDown, ChevronRight, ArrowUpRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRuntime } from "./AuditContext";
import { RuntimeStatusBadge, RelativeTime, EmptyState, LoadMore } from "./shared";

const labelize = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const RuntimeActivityTab: React.FC = () => {
  const events = useRuntime();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [shown, setShown] = useState(20);

  if (events.length === 0) return <EmptyState />;
  const visible = events.slice(0, shown);

  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
      <div className="space-y-2">
        {visible.map((e) => {
          const isOpen = !!open[e.id];
          return (
            <div key={e.id} className="relative">
              <div className="absolute -left-[14px] top-4 h-3 w-3 rounded-full bg-primary/30 border-2 border-background" />
              <div className="rounded-lg border bg-card overflow-hidden">
                <button
                  onClick={() => setOpen((o) => ({ ...o, [e.id]: !o[e.id] }))}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors",
                    isOpen && "bg-muted/30 border-b",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{labelize(e.eventType)}</span>
                        <RuntimeStatusBadge status={e.status} />
                        <span className="text-xs text-muted-foreground">
                          · {e.serviceName} · <span className="font-medium text-foreground/80">{e.stage}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="font-mono text-[11px] text-primary">{e.applicationId}</span>
                        <span className="text-border">·</span>
                        <span className="text-foreground/80">{e.applicant}</span>
                        <span className="text-border">·</span>
                        <span>by {e.actor}</span>
                        <span className="text-border">·</span>
                        <RelativeTime ts={e.timestamp} />
                      </div>
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 py-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <Meta label="Application" value={<span className="font-mono">{e.applicationId}</span>} />
                      <Meta label="Applicant" value={e.applicant} />
                      <Meta label="Current stage" value={e.stage} />
                      <Meta label="Assigned to" value={e.actor} />
                      <Meta label="Documents" value={e.documents.length ? e.documents.join(", ") : "—"} />
                      <Meta label="Payments" value={e.payments.length ? e.payments.join(", ") : "—"} />
                      <Meta label="Notifications" value={e.notifications.length ? e.notifications.join(", ") : "—"} />
                      <Meta label="Event ID" value={<span className="font-mono">{e.id}</span>} />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        Open Application <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <LoadMore shown={Math.min(shown, events.length)} total={events.length} onMore={() => setShown((s) => s + 20)} />
    </div>
  );
};

const Meta: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="text-foreground mt-0.5">{value}</div>
  </div>
);
