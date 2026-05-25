import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  governanceEvents,
  configActivityEvents,
  deployments,
  runtimeEvents,
  SERVICES,
  USERS,
  type Environment,
  type Result,
} from "@/data/auditLogs";

export type QuickFilter = "all" | "governance" | "config" | "deployments" | "runtime" | "security";

export type AuditFilters = {
  search: string;
  service: string; // "all" | service name
  user: string; // "all" | user
  environment: "all" | Environment;
  eventType: string; // free
  severity: "all" | Result;
  status: string; // "all" | status
  pill: QuickFilter;
  serviceScopeId?: string; // when used inside a service page
};

const defaultFilters: AuditFilters = {
  search: "",
  service: "all",
  user: "all",
  environment: "all",
  eventType: "all",
  severity: "all",
  status: "all",
  pill: "all",
};

type Ctx = {
  filters: AuditFilters;
  setFilters: React.Dispatch<React.SetStateAction<AuditFilters>>;
  debouncedSearch: string;
};

const AuditCtx = createContext<Ctx | null>(null);

export const AuditProvider: React.FC<{ children: React.ReactNode; serviceScopeId?: string }> = ({
  children,
  serviceScopeId,
}) => {
  const [filters, setFilters] = useState<AuditFilters>({ ...defaultFilters, serviceScopeId });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [filters.search]);

  return (
    <AuditCtx.Provider value={{ filters, setFilters, debouncedSearch }}>{children}</AuditCtx.Provider>
  );
};

export function useAudit() {
  const ctx = useContext(AuditCtx);
  if (!ctx) throw new Error("useAudit must be used within AuditProvider");
  return ctx;
}

export const SERVICE_OPTIONS = ["all", ...SERVICES] as const;
export const USER_OPTIONS = ["all", ...USERS] as const;

function matchSearch(haystacks: (string | undefined | null)[], q: string) {
  if (!q) return true;
  return haystacks.some((h) => (h ?? "").toLowerCase().includes(q));
}

export function useGovernance() {
  const { filters, debouncedSearch } = useAudit();
  return useMemo(() => {
    return governanceEvents.filter((e) => {
      if (filters.serviceScopeId) return false; // governance is workspace-level
      if (filters.pill !== "all" && filters.pill !== "governance" && filters.pill !== "security") return false;
      if (filters.pill === "security" && e.category !== "security") return false;
      if (filters.pill === "governance" && e.category !== "governance") return false;
      if (filters.user !== "all" && e.user !== filters.user) return false;
      if (filters.environment !== "all" && e.environment !== filters.environment) return false;
      if (filters.severity !== "all" && e.result !== filters.severity) return false;
      if (filters.service !== "all" && !e.affectedServices.includes(filters.service)) return false;
      return matchSearch([e.id, e.user, e.action, e.entity, e.scope, ...e.affectedServices], debouncedSearch);
    });
  }, [filters, debouncedSearch]);
}

export function useConfigActivity() {
  const { filters, debouncedSearch } = useAudit();
  return useMemo(() => {
    return configActivityEvents.filter((e) => {
      if (filters.serviceScopeId && e.serviceId !== filters.serviceScopeId) return false;
      if (filters.pill !== "all" && filters.pill !== "config") return false;
      if (filters.service !== "all" && e.serviceName !== filters.service) return false;
      if (filters.user !== "all" && e.actor !== filters.user) return false;
      if (filters.environment !== "all" && e.environment !== filters.environment) return false;
      return matchSearch(
        [e.id, e.actor, e.serviceName, e.module, e.summary, e.version, ...e.affected],
        debouncedSearch,
      );
    });
  }, [filters, debouncedSearch]);
}

export function useDeployments() {
  const { filters, debouncedSearch } = useAudit();
  return useMemo(() => {
    return deployments.filter((d) => {
      if (filters.serviceScopeId && d.serviceId !== filters.serviceScopeId) return false;
      if (filters.pill !== "all" && filters.pill !== "deployments") return false;
      if (filters.service !== "all" && d.serviceName !== filters.service) return false;
      if (filters.user !== "all" && d.publishedBy !== filters.user) return false;
      if (filters.environment !== "all" && d.environment !== filters.environment) return false;
      if (filters.status !== "all" && d.status !== filters.status) return false;
      return matchSearch(
        [d.id, d.version, d.publishedBy, d.serviceName, ...d.changedModules, ...d.notes],
        debouncedSearch,
      );
    });
  }, [filters, debouncedSearch]);
}

export function useRuntime() {
  const { filters, debouncedSearch } = useAudit();
  return useMemo(() => {
    return runtimeEvents.filter((e) => {
      if (filters.serviceScopeId && e.serviceId !== filters.serviceScopeId) return false;
      if (filters.pill !== "all" && filters.pill !== "runtime") return false;
      if (filters.service !== "all" && e.serviceName !== filters.service) return false;
      if (filters.user !== "all" && e.actor !== filters.user) return false;
      if (filters.status !== "all" && e.status !== filters.status) return false;
      return matchSearch(
        [e.id, e.applicationId, e.applicant, e.serviceName, e.stage, e.actor, e.eventType],
        debouncedSearch,
      );
    });
  }, [filters, debouncedSearch]);
}
