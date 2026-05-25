import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudit, SERVICE_OPTIONS, USER_OPTIONS } from "./AuditContext";

const ENV_OPTIONS = ["all", "production", "staging", "sandbox"] as const;
const SEVERITY_OPTIONS = ["all", "success", "warning", "failed"] as const;
const STATUS_OPTIONS = ["all", "published", "draft", "failed", "rolled_back", "approved", "pending", "in_progress"] as const;
const EVENT_TYPE_OPTIONS = ["all", "submitted", "approved", "rejected", "sent_back", "payment_completed", "document_verified", "certificate_generated"] as const;

const labelize = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const AuditFilterBar: React.FC<{ scoped?: boolean }> = ({ scoped }) => {
  const { filters, setFilters } = useAudit();

  const reset = () =>
    setFilters((f) => ({
      ...f,
      search: "",
      service: "all",
      user: "all",
      environment: "all",
      eventType: "all",
      severity: "all",
      status: "all",
    }));

  const hasActive =
    filters.search ||
    filters.service !== "all" ||
    filters.user !== "all" ||
    filters.environment !== "all" ||
    filters.eventType !== "all" ||
    filters.severity !== "all" ||
    filters.status !== "all";

  return (
    <div className="sticky top-0 z-20 -mx-6 px-6 bg-background/95 backdrop-blur border-b">
      <div className="py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search audit ID, user, service, action, version…"
              className="h-9 pl-8 text-sm"
            />
          </div>

          {!scoped && (
            <Select value={filters.service} onValueChange={(v) => setFilters((f) => ({ ...f, service: v }))}>
              <SelectTrigger className="h-9 w-[160px] text-sm">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s === "all" ? "All services" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={filters.user} onValueChange={(v) => setFilters((f) => ({ ...f, user: v }))}>
            <SelectTrigger className="h-9 w-[150px] text-sm">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              {USER_OPTIONS.map((u) => (
                <SelectItem key={u} value={u}>{u === "all" ? "All users" : u}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.environment} onValueChange={(v: string) => setFilters((f) => ({ ...f, environment: v as typeof filters.environment }))}>
            <SelectTrigger className="h-9 w-[130px] text-sm">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              {ENV_OPTIONS.map((e) => (
                <SelectItem key={e} value={e}>{e === "all" ? "All envs" : labelize(e)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.eventType} onValueChange={(v) => setFilters((f) => ({ ...f, eventType: v }))}>
            <SelectTrigger className="h-9 w-[150px] text-sm">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPE_OPTIONS.map((e) => (
                <SelectItem key={e} value={e}>{e === "all" ? "All events" : labelize(e)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.severity} onValueChange={(v: string) => setFilters((f) => ({ ...f, severity: v as typeof filters.severity }))}>
            <SelectTrigger className="h-9 w-[130px] text-sm">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s === "all" ? "All severities" : labelize(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : labelize(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActive && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-9 gap-1 text-xs">
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
