import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOnboarding, type ServiceItem } from "@/contexts/OnboardingContext";
import { usePersona } from "@/contexts/PersonaContext";
import { allTemplates, type ServiceTemplate } from "@/data/serviceTemplates";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Settings,
  UserPlus,
  Trash2,
  ArrowRight,
  Eye,
  LayoutTemplate,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AssignOwnerSheet from "@/components/templates/AssignOwnerSheet";
import { toast } from "sonner";

const formatRelative = (ts?: number) => {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
};

type ServiceStatusKind = "draft" | "live" | "archived";

const statusOf = (s: ServiceItem): ServiceStatusKind =>
  s.isLive ? "live" : "draft";

const StatusChip: React.FC<{ kind: ServiceStatusKind }> = ({ kind }) => {
  const map: Record<ServiceStatusKind, string> = {
    live: "bg-success/10 text-success ring-1 ring-success/20",
    draft: "bg-warning/10 text-warning ring-1 ring-warning/20",
    archived: "bg-muted text-muted-foreground ring-1 ring-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-1.5 rounded text-[10px] font-semibold uppercase tracking-wider",
        map[kind],
      )}
    >
      {kind}
    </span>
  );
};

const TemplatesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state, deleteService } = useOnboarding();
  const { persona } = usePersona();
  const [params, setParams] = useSearchParams();
  const recentId = params.get("recent");

  const [assignTarget, setAssignTarget] = useState<ServiceItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServiceItem | null>(null);
  const templatesRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);

  const isServiceOwner = persona.role === "service_owner";
  const canManage = !isServiceOwner;

  const visibleServices = useMemo(() => {
    if (!isServiceOwner) return state.services;
    return state.services.filter((s) =>
      (s.assignedOwners ?? []).includes(persona.email.toLowerCase()),
    );
  }, [state.services, isServiceOwner, persona.email]);

  // Sort: recent first, then drafts, then live; within each by updatedAt desc
  const sortedServices = useMemo(() => {
    const copy = [...visibleServices];
    copy.sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0));
    if (recentId) {
      const idx = copy.findIndex((s) => s.id === recentId);
      if (idx > 0) {
        const [item] = copy.splice(idx, 1);
        copy.unshift(item);
      }
    }
    return copy;
  }, [visibleServices, recentId]);

  const templateById = useMemo(() => {
    const map = new Map<string, ServiceTemplate>();
    allTemplates.forEach((t) => map.set(t.id, t));
    return map;
  }, []);

  const usageByTemplate = useMemo(() => {
    const m = new Map<string, number>();
    state.services.forEach((s) => m.set(s.templateId, (m.get(s.templateId) ?? 0) + 1));
    return m;
  }, [state.services]);

  useEffect(() => {
    if (recentId && recentRef.current) {
      recentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [recentId]);

  const goConfigure = (s: ServiceItem) =>
    navigate(`/service/${s.id}/configure`, { state: { mode: "configure" } });
  const goWorkspace = (s: ServiceItem) =>
    navigate(`/service/${s.id}/configure`, { state: { mode: "overview" } });
  const goOperations = (s: ServiceItem) =>
    navigate(`/service/${s.id}/configure`, { state: { mode: "operate" } });

  const goCreate = (t: ServiceTemplate) => {
    if (t.comingSoon) {
      toast.info(`${t.name} is coming soon`);
      return;
    }
    navigate(`/templates/${t.id}/setup`);
  };

  const scrollToTemplates = () =>
    templatesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isServiceOwner ? "My services" : "Services"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            {isServiceOwner
              ? "Services assigned to you. Continue configuration or open the live workspace."
              : "Manage your active services and create new ones from templates."}
          </p>
        </header>

        {/* My Services */}
        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-semibold text-foreground">My services</h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {sortedServices.length}
              </span>
            </div>
          </div>

          {sortedServices.length === 0 ? (
            <EmptyServicesCard
              isServiceOwner={isServiceOwner}
              onBrowse={scrollToTemplates}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedServices.map((s) => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  template={templateById.get(s.templateId)}
                  recent={s.id === recentId}
                  recentRef={s.id === recentId ? recentRef : undefined}
                  canManage={canManage}
                  onOpen={() => goWorkspace(s)}
                  onConfigure={() => goConfigure(s)}
                  onOperations={() => goOperations(s)}
                  onAssign={() => setAssignTarget(s)}
                  onDelete={() => setPendingDelete(s)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Templates */}
        {!isServiceOwner && (
          <section ref={templatesRef} className="scroll-mt-8">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Start a new service</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Create a new service using a pre-built template. Each template can be used for
                multiple services.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTemplates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  usedBy={usageByTemplate.get(t.id) ?? 0}
                  onCreate={() => goCreate(t)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <AssignOwnerSheet
        service={assignTarget}
        open={!!assignTarget}
        onOpenChange={(o) => !o && setAssignTarget(null)}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the service and its configuration. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingDelete) return;
                const name = pendingDelete.name;
                deleteService(pendingDelete.id);
                setPendingDelete(null);
                if (recentId === pendingDelete.id) {
                  params.delete("recent");
                  setParams(params, { replace: true });
                }
                toast.success(`"${name}" deleted`);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ----------------------------- Service card ----------------------------- */

const Avatar: React.FC<{ name: string }> = ({ name }) => (
  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0">
    {name[0]?.toUpperCase()}
  </span>
);

const ServiceCard: React.FC<{
  service: ServiceItem;
  template?: ServiceTemplate;
  recent?: boolean;
  recentRef?: React.RefObject<HTMLDivElement>;
  canManage: boolean;
  onOpen: () => void;
  onConfigure: () => void;
  onOperations: () => void;
  onAssign: () => void;
  onDelete: () => void;
}> = ({
  service,
  template,
  recent,
  recentRef,
  canManage,
  onOpen,
  onConfigure,
  onOperations,
  onAssign,
  onDelete,
}) => {
  const kind = statusOf(service);
  const owners = service.assignedOwners ?? [];
  const Icon = template?.icon ?? LayoutTemplate;

  return (
    <div
      ref={recentRef}
      className={cn(
        "group relative rounded-lg border bg-card p-5 transition-all",
        "hover:shadow-sm hover:border-foreground/15",
        recent ? "border-primary/40 ring-1 ring-primary/20" : "border-border",
      )}
    >
      {recent && (
        <span className="absolute -top-2 left-4 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground">
          Just created
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <button
          onClick={onOpen}
          className="flex items-start gap-3 text-left min-w-0 flex-1"
        >
          <span className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {service.name}
              </h3>
            </div>
            {template && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                from {template.name} Template
              </p>
            )}
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <StatusChip kind={kind} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 -mr-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onOpen}>
                <Eye className="h-3.5 w-3.5 mr-2" /> Open workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onConfigure}>
                <Settings className="h-3.5 w-3.5 mr-2" />
                {kind === "live" ? "Manage configuration" : "Continue configuration"}
              </DropdownMenuItem>
              {canManage && (
                <DropdownMenuItem onClick={onAssign}>
                  <UserPlus className="h-3.5 w-3.5 mr-2" /> Assign owners
                </DropdownMenuItem>
              )}
              {canManage && kind === "draft" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete service
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 min-w-0">
          {owners.length > 0 ? (
            <>
              <Avatar name={owners[0]} />
              <span className="text-xs text-foreground truncate">{owners[0]}</span>
              {owners.length > 1 && (
                <span className="text-[11px] text-muted-foreground">+{owners.length - 1}</span>
              )}
            </>
          ) : canManage ? (
            <button
              onClick={onAssign}
              className="inline-flex items-center gap-1 text-xs text-warning hover:underline"
            >
              <UserPlus className="h-3 w-3" /> Unassigned · assign owner
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground">
          Updated {formatRelative(service.updatedAt ?? service.createdAt)}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
        {kind === "live" ? (
          <>
            <Button size="sm" className="h-8 text-xs flex-1" onClick={onOpen}>
              Open service
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={onOperations}
            >
              View operations
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" className="h-8 text-xs flex-1" onClick={onConfigure}>
              Continue configuration
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={onOpen}
            >
              Open
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

/* ----------------------------- Template card ----------------------------- */

const TemplateCard: React.FC<{
  template: ServiceTemplate;
  usedBy: number;
  onCreate: () => void;
}> = ({ template, usedBy, onCreate }) => {
  const Icon = template.icon;
  const capabilities = template.features?.length
    ? template.features
    : template.modules ?? [];
  const visible = capabilities.slice(0, 4);
  const extra = capabilities.length - visible.length;

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-card p-5 transition-all",
        "hover:shadow-sm hover:border-foreground/15",
        template.comingSoon && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {template.name}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Template</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center h-5 px-1.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0",
            template.comingSoon
              ? "bg-muted text-muted-foreground ring-1 ring-border"
              : "bg-success/10 text-success ring-1 ring-success/20",
          )}
        >
          {template.comingSoon ? "Coming soon" : "Ready"}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">
        {template.description}
      </p>

      {visible.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {visible.map((c) => (
            <span
              key={c}
              className="inline-flex items-center h-5 px-2 rounded text-[11px] bg-muted text-muted-foreground"
            >
              {c}
            </span>
          ))}
          {extra > 0 && (
            <span className="inline-flex items-center h-5 px-2 rounded text-[11px] bg-muted text-muted-foreground">
              +{extra}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
        <span className="text-[11px] text-muted-foreground">
          {template.comingSoon
            ? "Not yet available"
            : `Used by ${usedBy} service${usedBy === 1 ? "" : "s"}`}
        </span>
        <Button
          size="sm"
          variant={template.comingSoon ? "ghost" : "default"}
          onClick={onCreate}
          disabled={template.comingSoon}
          className="h-8 text-xs"
        >
          {template.comingSoon ? "Coming soon" : "Create service"}
          {!template.comingSoon && <ArrowRight className="h-3 w-3 ml-1" />}
        </Button>
      </div>
    </div>
  );
};

/* ----------------------------- Empty state ----------------------------- */

const EmptyServicesCard: React.FC<{
  isServiceOwner: boolean;
  onBrowse: () => void;
}> = ({ isServiceOwner, onBrowse }) => (
  <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
    <div className="h-10 w-10 mx-auto rounded-md bg-muted flex items-center justify-center mb-3">
      <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
    </div>
    {isServiceOwner ? (
      <>
        <h3 className="text-sm font-semibold text-foreground">No services assigned</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Your administrator will give you access once a service is activated. Check back shortly.
        </p>
      </>
    ) : (
      <>
        <h3 className="text-sm font-semibold text-foreground">No services yet</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Create your first service from a template below. You can spin up multiple services from
          the same template.
        </p>
        <Button size="sm" variant="outline" className="mt-4 h-8 text-xs" onClick={onBrowse}>
          Browse templates <ArrowDown className="h-3 w-3 ml-1" />
        </Button>
      </>
    )}
  </div>
);

export default TemplatesDashboard;
